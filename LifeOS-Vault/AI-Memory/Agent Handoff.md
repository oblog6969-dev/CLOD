---
title: "Agent Handoff"
created: 2026-09-25
updated: 2026-09-28
type: handoff
status: active
priority: high
tags:
  - project/lifeos
  - type/handoff
aliases:
  - Handoff
  - LastSession
---

# 🤝 Agent Handoff — Current State

> [!important] All incoming agents: Read this before touching any code
> This note describes exactly where the project was left off. It is updated at the **end of every session**. If it is stale, check [[AI-Memory/Sessions/Session Log|Session Log]] for the most recent entry.

---

## 📍 Last Updated

- **Date:** 2026-09-28
- **Agent:** Claude
- **Branch:** `main`
- **Commit:** see [[AI-Memory/Sessions/Session Log|Session Log]] 2026-09-28 (DB governance) for the commit that contains the 2026-09-27 and 2026-09-28 work. The previous commit was `16691aa` (Schwartz values), not `e1e2417` as an earlier version of this note said.

> [!important] 🔒 DB lock: free
> Take it before any migration or `State` change: `DB lock: <agent> · <YYYY-MM-DD> · <task>`. Release it when done. Rules: [[Frameworks/Database Rules|Database Rules]].

---

## ✅ What Was Just Completed

### Database governance for multi-agent work (latest)

- [[Frameworks/Database Rules|Database Rules]] defines the roles, the DB lock, invariants, the owner-approval matrix, and the change workflow. It is binding through `AGENTS.md` and linked from Start Here, the AI Memory index, and Tech Stack.
- `supabase/migrations/` back-fills the 3 live migrations with exact versions; `supabase/tests/sync_push_contract.sql` passed against live and rolled back cleanly.
- `mergeStates` now carries over unknown `State` fields instead of dropping them, with 2 new tests (50 unit tests total).

### Cloud history: reliable sync, saved results and insights, and AI that relates to history

The owner's goal for the database: sync all devices, analyze the person's history, give conclusions, and let the connected AI relate to their situation from that history. Full rationale is in [[Decisions/Decisions Log|Decisions Log]] 2026-09-28.

1. **Review of the 2026-09-27 sync pass** found BUG-004 to BUG-010, including a critical one: unreadable local data could be pushed over the cloud copy. All are fixed; see [[Bugs & Issues]].
2. **Supabase** (project `lifeos`, ref `inzddqrbrboldaomarhz`, org `LIFE-OS`):
   - `workspaces` gained a server `revision` and `client_edited_at`, plus object and size checks.
   - New `workspace_snapshots` table (one per day, kept forever, owner-read-only).
   - All writes go through the `public.sync_push` RPC (security definer, `auth.uid()` only, row lock, stale-revision conflict, server clock, snapshot upsert). Direct insert/update policies were dropped.
3. **Sync engine:**
   - `src/lib/sync-engine.ts`: pure, injectable orchestration.
   - `src/lib/sync-logic.ts`: 3-way `mergeStates`.
   - `src/lib/sync.ts`: browser adapter. `startSync()` runs on app load, sync is serialized across tabs with `navigator.locks`, and expired links give feedback.
   - `store.ts`: new `getLocalState()` (null when blocked), `onLocalEdit()`, and `restore(state, { backup, fromSync })`.
4. **History in the workspace** (`domain.ts`, validated in `decode()`): `assessments` (every baseline run with its answers), `planHistory`, and `insights` (auto-saved AI analyses, editable and removable). Helpers: `savePlan`, `recordAssessment`, `removeAssessment`, `addInsight`, `editInsight`, `removeInsight`.
5. **Analysis:** `src/lib/history.ts` provides `summarizeHistory`, `historyConclusions` (EN/AR, thresholds, non-diagnostic), and `historyDigest` (for the AI, no journal text). The UI is `HistoryCard` on Reflections.
6. **AI:**
   - `src/lib/ai-context.ts` is now the one server-side validator for both AI routes, plus the client builders `profileForAi` and `insightsForAi`.
   - `HISTORY_GUIDANCE` is appended to both system prompts.
   - The AI guide has three new consent toggles, all default on.
   - `SavedInsights` handles editing and removal.
7. **Settings:** the sync card shows statuses, a merge notice, Restore from history, and a sign-out that flushes first, with an optional "remove from this device". The assessment card shows Previous results.
8. **Docs:** the README has a new "Optional cloud sync and history" section, and the AI guide section was updated.

---

## Recent history

- **Claude (2026-09-28):** DB governance + migrations in repo; cloud history rebuild (above). Committed and pushed together.
- **Claude (2026-09-27):** first sync pass, superseded before commit (see BUG-004 to BUG-010).
- **`16691aa`:** Schwartz values on MSQ cards (previous HEAD).
- **Cursor (`e1e2417`):** Arabic calendar export, RTL arrow, aria labels, vault reconciliation.
- **Cursor (`a1340aa`):** Maslow heuristic, MSQ metadata, plan draft review, baseline and MSQ Arabic packs.
- **Gemini/Antigravity (`30e2ca2`):** Settings and Translate Arabic, Journey Guide Arabic, Hartman badge Arabic, `.rtl-flip`, font stack.

---

## 🟡 In Progress / Incomplete

> [!note] `.env.local` (real Supabase URL and publishable key) is gitignored and must stay that way. A fresh clone needs its own `.env.local`; see `.env.example`.

- **Live verification still owed:** a real magic-link sign-in on two devices. The logic is covered by simulated two-device tests and the RPC by SQL tests, but no real session has round-tripped.
- **Owner action:** set the Supabase Auth Site URL and redirect allow-list (dashboard only).
- **Suggested next role assignment:** an agent other than Claude acts as **Verifier** for the sync and DB work (Database Rules §2).
- No "delete my cloud account" UI yet, so removed insights persist in past daily snapshots until the account is deleted.

---

## ⚠️ Known Constraints & Gotchas

> [!warning] Windows environment: always use cmd.exe for npm
> PowerShell on this machine has an execution policy that blocks `npm.ps1`. **Always use:**
> ```
> cmd.exe /c npm test
> cmd.exe /c npm run build
> cmd.exe /c npx playwright test
> ```

> [!warning] Playwright E2E requires a production server and a local browser
> `playwright.config.ts` starts `npm run start -- --port 3100`, so run `cmd.exe /c npm run build` first. If Chromium is missing (`Executable doesn't exist`), run `cmd.exe /c npx playwright install chromium` and rerun the suite.

> [!note] TypeScript module resolution in unit tests
> `node --test` runs `.ts` files through Node's own TypeScript stripping, which does **not** use `tsconfig`'s bundler resolution. Extensionless *value* imports (`import { x } from "./store"`) fail there with `ERR_MODULE_NOT_FOUND`, and `import type` is fine because it's erased. Since 2026-09-28, `tsconfig.json` enables `allowImportingTsExtensions`, so pure modules that tests import (`domain.ts` → `sync-logic.ts`, `sync-engine.ts`, `history.ts`, `ai-context.ts`) use explicit `.ts` relative imports, and Next/Turbopack builds them fine. Browser-only modules (`store.ts`, `sync.ts`, components) keep extensionless imports and aren't imported by unit tests.

> [!note] Arabic font availability
> The font stack references `Cairo` and `Tajawal` as fallbacks after system fonts. These are not bundled — they rely on OS-level font availability or the user having installed them. Do not add `@font-face` remote downloads without a product decision.

---

## 🚀 Suggested Next Tasks

In priority order (from [[Future Tasks]]):

1. **Sync: live two-device verification.** Sign in by magic link on two browsers, then confirm an edit on each (and an offline edit) arrives on the other and appears in Restore from history.
2. **Visual regression tests** — Playwright screenshot comparisons for Arabic RTL at 390 px and 1440 px.
3. **Localized error strings** — Pipe English-only errors in `domain.ts` and API routes through the locale packs.
4. **AI Guide streaming and model picker** — Larger UX follow-ups; still on the backlog.

---

## 📂 Key Files Map

| Purpose | Path |
|---------|------|
| App entry | `src/app/page.tsx` |
| Domain logic & validation | `src/lib/domain.ts` |
| Storage & subscriptions | `src/lib/store.ts` |
| Arabic workspace copy | `src/lib/locale/workspace.ts` |
| Calendar `.ics` builder | `src/lib/calendar-export.mjs` |
| Journey guide (AR+EN) | `src/lib/journey.ts` |
| Questionnaire / MSQ | `src/lib/questionnaire.ts` |
| Assessment engine | `src/lib/assessment.ts` |
| RTL styles & icon fixes | `src/app/globals.css` |
| Main form components | `src/components/WorkspaceForms.tsx` |
| Journey Guide UI | `src/components/JourneyGuide.tsx` |
| AI Assistant | `src/components/AiAssistant.tsx` |
| Supabase browser client | `src/lib/supabase-client.ts` |
| Sync browser adapter | `src/lib/sync.ts` |
| Sync orchestration (pure) | `src/lib/sync-engine.ts` |
| 3-way merge (pure) | `src/lib/sync-logic.ts` |
| History analysis (pure) | `src/lib/history.ts` |
| AI context validation and builders | `src/lib/ai-context.ts` |
| Saved insights UI | `src/components/SavedInsights.tsx` |
| History card UI | `src/components/HistoryCard.tsx` |
| Sync/history/AI tests | `tests/sync.test.mjs`, `tests/history.test.mjs`, `tests/e2e/history.spec.ts` |
| Baseline Assessment Modal | `src/components/BaselineAssessmentModal.tsx` |
| Unit tests | `tests/domain.test.mjs` |
| E2E tests | `tests/e2e/lifeos.spec.ts`, `tests/e2e/journey.spec.ts` |
| Decisions log | `LifeOS-Vault/Decisions/Decisions Log.md` |
| Session log | `LifeOS-Vault/AI-Memory/Sessions/2026-09-25 Session Notes.md` |
| Agent rules | `AGENTS.md` |

---

## 🔗 Vault Navigation

- **Back:** [[00 - AI Agent Memory Index|AI Memory Index]]
- **Bugs:** [[Bugs & Issues]]
- **Future Tasks:** [[Future Tasks]]
- **Progress:** [[Progress/00 - Dashboard]]
