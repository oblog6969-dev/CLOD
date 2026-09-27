---
title: "Database Rules for AI Agents"
created: 2026-09-28
updated: 2026-09-28
type: framework
status: active
priority: critical
tags:
  - project/lifeos
  - framework/database
  - type/rules
aliases:
  - DB Rules
  - Database Roles
---

# 🗄️ Database Rules for AI Agents

> [!danger] Mandatory for every agent (Claude, Cursor, Codex, Gemini, Antigravity, or any other tool)
> The Supabase database holds real people's reflections, test results, and AI insights, synced across their devices. A careless change can wipe or leak someone's inner life. Read this note before touching **anything** under `supabase/`, `src/lib/sync*.ts`, `src/lib/store.ts`, `src/lib/domain.ts` (the `State` shape), `src/lib/history.ts`, `src/lib/ai-context.ts`, or the AI routes. `AGENTS.md` makes this binding.

- **Back to:** [[00 - Start Here]] | [[Decisions/Decisions Log|Decisions Log]] | [[AI-Memory/Agent Handoff|Agent Handoff]]

---

## 1. What exists (the contract)

| Item | Value |
|---|---|
| Supabase org / project | `LIFE-OS` / `lifeos`, ref **`inzddqrbrboldaomarhz`**, region `ap-southeast-1` |
| **Never touch** | Org `personal-cfo` and project `bbtghnqavqndldlnizpi` belong to an unrelated finance app. Don't read, migrate, or create anything there. |
| `public.workspaces` | One row per account: `user_id` (PK → `auth.users`, cascade), `state jsonb` (object, < 5 MB), `revision bigint` (server-assigned), `updated_at` (server clock), `client_edited_at` |
| `public.workspace_snapshots` | One row per account per day: `(user_id, day)` PK, `state`, `revision`, `saved_at`. **Kept forever** (owner decision 2026-09-28). |
| `public.sync_push(p_state, p_base_revision, p_local_day, p_client_edited_at)` | **The only write path.** `security definer`, `search_path = ''`, acts only on `auth.uid()`, row lock, returns `ok` or `conflict` + current state. It also upserts the day's snapshot. |
| RLS | Enabled on both tables. The only policies are `select` of your own rows via `(select auth.uid()) = user_id`. There are no insert/update/delete policies. |
| Client keys | Only the publishable/anon key, via `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the gitignored `.env.local`. |
| Migrations (source of truth) | `supabase/migrations/<version>_<name>.sql`, matching the live `list_migrations` output exactly |
| Contract test | `supabase/tests/sync_push_contract.sql` (self-rolling-back; must print `RESULT PASS`) |

The workspace JSON (`State` in `src/lib/domain.ts`) is the **data model**. The database stores it opaquely, so changing `State` is a database change too (see §4).

---

## 2. Roles

Roles describe development responsibilities, not personas. One agent may hold several roles in a session, but **the author of a database change never signs off as its own Verifier**. Declare your roles in [[AI-Memory/Agent Handoff|Agent Handoff]] when you start.

### 🧑‍⚖️ Product Owner (human, `oblog6969-dev`)
- The only one who may approve anything in §5 "Needs owner approval".
- Handles dashboard-only settings that no tool can reach: Auth Site URL and redirect allow-list, email templates, billing, project deletion, key rotation.

### 🔐 Database Steward (one agent at a time)
- The **only** role allowed to run `apply_migration` against the live project, and only while holding the DB lock (§3).
- Writes each migration as a new file in `supabase/migrations/` **in the same session** it's applied, with the exact SQL and the version from `list_migrations`.
- Runs `get_advisors` (security and performance) after every migration and records the result.
- Keeps §1 of this note accurate.

### 🔄 Sync Engineer
- Owns `src/lib/sync-engine.ts`, `src/lib/sync-logic.ts`, `src/lib/sync.ts`, and `src/lib/store.ts`.
- May change client sync behavior but **not** the RPC contract. Anything needing a schema or `sync_push` change goes to the Steward as proposed SQL.
- Must keep every invariant in §4, with tests in `tests/sync.test.mjs`.

### 📐 Data Model Engineer
- Owns the `State` shape and `decode()` in `src/lib/domain.ts`.
- Must follow the State-change checklist in §4.

### 🧠 Analysis & AI Engineer
- Owns `src/lib/history.ts`, `src/lib/ai-context.ts`, `src/app/api/ai/*`, `AiAssistant.tsx`, and `SavedInsights.tsx`.
- Reads data only through the synced `State` on the device. Adding **server-side** reads of user data, or any new category of data sent to an AI provider, needs owner approval and a Decisions Log entry.

### ✅ Verifier
- An independent agent from the author.
- Runs `npm run lint`, `npm test`, `npm run build`, `npx playwright test`, the SQL contract test, and `get_advisors`, then confirms migrations and repo files match.
- Reports actual counts. Never reports a check that wasn't run.

---

## 3. Coordination: the DB lock

Only one agent may change the live database or the `State` shape at a time.

1. Before any migration or `State` change, check the **DB lock** line in [[AI-Memory/Agent Handoff|Agent Handoff]]. If another agent holds it, don't proceed; coordinate through the handoff.
2. Take it: `DB lock: <agent> · <YYYY-MM-DD> · <task>`.
3. Release it at the end of the session (`DB lock: free`) after the migration file, contract test, advisors, and vault updates are done.
4. **At the start of every session touching the DB**, detect drift: compare Supabase `list_migrations` with the files in `supabase/migrations/`. If they differ, stop and report it before doing anything else.

---

## 4. Invariants (never break these)

**Database**
1. Every table in `public` has RLS enabled, with policies scoped to `(select auth.uid()) = user_id`. `anon` is never granted table or function access.
2. Every write to user data goes through `sync_push` (or a future function reviewed the same way). Never add client insert/update/delete policies.
3. `security definer` functions must `set search_path = ''`, derive the user **only** from `auth.uid()` (never accept a user_id parameter), revoke `public`/`anon`, and grant only `authenticated`.
4. The server assigns `revision` (monotonic, +1 per write) and `updated_at` (`now()`). Never trust a client clock for ordering.
5. Snapshots are written only by `sync_push`, one per `(user_id, day)`, and are never deleted except by account deletion (retention is an owner decision).
6. Never put the `service_role` key or database password in the repo, client code, logs, or the vault.

**Migrations**
7. DDL goes only through `apply_migration`, never `execute_sql`.
8. Never edit or delete an applied migration file. Fix forward with a new migration.
9. The repo's `supabase/migrations/` must equal the live migration list at the end of every session.

**Sync and data model**
10. **Never push unreadable local data.** `getLocalState()` returns `null` when storage is blocked, and the engine must return `"blocked"`.
11. Sync-applied states use `restore(state, { backup: false, fromSync: true })`. They must never trigger `onLocalEdit` (this prevents ping-pong) and never overwrite the manual recovery slot.
12. Conflicts are **merged, never replaced** (`mergeStates`, 3-way). A first link on a device merges into the account.
13. **State-change checklist** (additive changes only, `version` stays 2 unless the owner approves a migration plan):
    - Add the field as optional in `State`, and validate it in `decode()` (reject bad shapes and duplicate IDs).
    - Give it a merge rule in `mergeStates` (by id, by key, or per field). The generic fallback only copies whole values so nothing is lost; it is not a real merge.
    - Add tests: `decode` accept and reject, a merge case in `tests/sync.test.mjs`, and extend the "fully populated workspace survives a merge" fixture.
    - If the AI can see it, add it to `ai-context.ts` with server-side bounds, a consent toggle, and a Decisions Log entry.
14. The AI history digest (`historyDigest`) must never contain note, journal, or answer text. That rule is guarded by `tests/history.test.mjs`.
15. AI chat transcripts are never persisted. Saved insights must stay editable and removable by the person.

**Testing against the live project**
16. Never create persistent test users or rows. Use a single `do $$ … raise exception 'RESULT …' $$` block (as in `supabase/tests/sync_push_contract.sql`) so everything rolls back. Afterward, confirm `select count(*) from auth.users where email like '%@lifeos.invalid'` returns 0.
17. Never read real users' rows during development. Aggregate counts are fine; row contents are not.

---

## 5. What needs owner approval

| Needs **owner approval** (ask first, record in the Decisions Log) | Allowed for the **Steward** (while holding the DB lock) |
|---|---|
| Dropping or renaming a table or column; deleting or modifying user rows | New additive columns, indexes, constraints on new data |
| Disabling RLS; new grants to `anon`; new `security definer` functions | Tightening RLS or grants |
| Changing snapshot retention; any bulk delete or backfill of user data | A new migration that fixes forward a bug in the RPC, if the contract test still passes |
| Server-side reading or analysis of user data (e.g. SQL analytics, edge functions over `state`) | Performance-only changes flagged by `get_advisors` |
| New data categories sent to AI providers; persisting chat | |
| Bumping `State.version`; changing the sync protocol or `sync_push` signature | |
| Creating, pausing, or deleting Supabase projects; auth provider changes | |

> [!warning] Supabase free tier
> The account caps active free projects at **2 across all orgs** it owns. Never create a new project without asking. It will fail anyway, and freeing a slot means pausing or deleting someone's project.

---

## 6. Standard workflow for a database change

1. Read this note, [[AI-Memory/Agent Handoff|Agent Handoff]], and [[AI-Memory/Bugs & Issues|Bugs & Issues]]. Check migration drift (§3.4). Take the DB lock.
2. If the change is in §5's approval column, ask the owner first.
3. Write the SQL. Apply it with `apply_migration` (snake_case name). Immediately save it as `supabase/migrations/<version>_<name>.sql`, using the version from `list_migrations`.
4. Run `supabase/tests/sync_push_contract.sql` through `execute_sql` and expect `RESULT PASS`. Extend the test if you changed the contract. Confirm cleanup.
5. Run `get_advisors` for security and performance. Only the two known warnings are acceptable:
   - `0029_authenticated_security_definer_function_executable` on `sync_push`: intentional, since it is the only write path;
   - `auth_leaked_password_protection`: not applicable, since sign-in is passwordless.

   Fix anything new.
6. Update the client (`sync.ts` API adapter, types) and the tests. Run lint, unit, build, and E2E.
7. Record the change: a Decisions Log entry, §1 of this note if the contract changed, Session Log, Agent Handoff (release the lock), Progress Dashboard, and Bugs & Issues if you found or fixed a bug.
8. Hand off to a different agent as Verifier.

---

## 7. Quick reference: how data flows

```text
edit on device → store.update() → onLocalEdit → engine.noteLocalEdit (editSeq++)
   → debounce 1.5s / poll 30s / focus / online → navigator.locks("lifeos-sync")
   → fetch revision → equal+clean: idle | equal+dirty: sync_push(base) |
     remote ahead+clean: fast-forward (restore fromSync) |
     remote ahead+dirty or first link: mergeStates(base, local, remote) → sync_push
   → conflict? merge with returned state and retry (≤3) → ok: base = pushed state, syncedSeq = seq at send
analysis: State → history.ts (on device) → HistoryCard / historyDigest → ai-context.ts (bounded server-side) → AI
```
