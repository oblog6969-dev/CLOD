---
title: "Decisions Log"
created: 2026-09-16
updated: 2026-09-28
type: decisions
status: active
priority: high
tags:
  - project/lifeos
  - type/decisions
aliases:
  - Decisions
  - DecisionsLog
  - DECISIONS
---

# 📋 Product & Engineering Decisions

> [!important] All agents: record decisions here
> Every consequential product or engineering decision **must** be added here **before committing**. Format: `## YYYY-MM-DD: short description` followed by bullet rationale.

- **Back to:** [[00 - Start Here]] | [[AI-Memory/00 - AI Agent Memory Index|AI Memory]] | [[AI-Memory/Agent Handoff|Agent Handoff]]

---

## 2026-09-16: daily-use redesign

- Replace the default fictional creator persona with an empty workspace. Preserve existing stored content through migration rather than guessing which old values belong to a real person.
- Organize the interface around Today, Your reset, My direction, and Reflections. Use warm neutrals and green, readable typography, restrained feedback, and a mobile bottom navigation.
- Adapt the source into 14 morning and seven evening questions plus six daytime reminders. Let people skip, revisit, and revise; answers remain their own. The generated plan draft is deterministic and requires explicit saving.
- Derive points and levels from completion records. Monthly project steps are independent from daily priorities. There are no repeatable boss rewards and no asymmetric damage/undo logic.
- Store daily records by local calendar date and reflection timestamps in ISO format. Rollover checks run on focus and at a 30-second interval; records are not destroyed at midnight.
- Keep runtime validation and migrations separate from React. Use a single external-store subscription instead of custom events plus duplicate React state. Remove the unused animation dependency and remote font downloads.
- Use native `dialog` for modal focus containment, Escape support, background inertness, and focus restoration. Honor reduced-motion preferences.
- Keep the original v1 key unchanged. Before destructive workspace replacement, create one local recovery copy. Provide portable JSON exports and explicit import validation.
- Development agents coordinate through repository instructions, bounded file ownership, documented decisions, and verifiable handoffs. Runtime AI coaching remains a separate future feature, not an implied capability.

---

## 2026-09-19: optional AI guide

- Add an OpenAI Responses API guide as an explicit, user-triggered feature. It analyzes a snapshot and returns structured observations, recommendations, and one question. It does not run in the background.
- Keep API keys out of client code and persistent LifeOS data. Validate them server-side and place an AES-256-GCM encrypted value in a scoped HttpOnly, same-site session cookie. A configured `LIFEOS_SESSION_SECRET` supports restarts and multiple instances; local development can use an ephemeral process secret.
- Ask for consent by data category on every analysis screen. Direction and active daily steps begin selected. Private reset answers and journal reflections begin unselected. Empty categories are omitted from requests.
- Send Responses API requests with `store: false`, a strict JSON schema, bounded input sizes, a timeout, and a per-session rate limit. OpenAI organization controls still apply.
- Keep results in component memory only. Suggestions require explicit acceptance before creating a daily step and never overwrite the plan.

---

## 2026-09-19: provider-neutral AI connections

- Support OpenAI Responses plus DeepSeek, NVIDIA NIM, and custom OpenAI-compatible Chat Completions. User-entered model IDs allow newly released provider models without an application release.
- Keep fixed URLs for provider presets. Require public HTTPS and block resolved private addresses for custom endpoints by default; private/self-hosted endpoints require an explicit server opt-in.
- Validate through the provider models endpoint, disable redirects, retain credentials only in the encrypted scoped cookie, and re-check custom endpoint safety before analysis.
- Use strict JSON Schema output for OpenAI. Compatible providers receive the same schema in the prompt; DeepSeek also receives JSON-object formatting. Every result passes shared runtime validation.

---

## 2026-09-20: article-led questionnaire direction (design decision)

- The product owner selected Dan Koe's article at https://x.com/thedankoe/article/2010751592346030461 as the foundation for the questionnaire and AI assistance. Use the author's newsletter already referenced by this repository as the accessible working reference; exact X text equivalence remains unverified because direct access returned HTTP 403.
- Replace the proposed psychological screening roadmap with source-mapped, tap-based reflection. WHO-5, COM-B, and PHQ-4 are outside the current scope. Later modifications should follow user feedback and an explicit product decision.
- Preserve the source's reflection-to-action structure and the person's authorship of their plan. Multiple-choice wording and AI follow-ups are app adaptations, not validated psychological measurements.
- At this decision point, questionnaire implementation remained pending. It was implemented later the same day; see **human development frameworks & AI MSQ reflection** below and [[Frameworks/Dan Koe Principles#Questionnaire Design]].

---

## 2026-09-20: guidance for users new to the article

- Implement a welcome and an expandable journey map across Your reset, My direction, Today, and Reflections. Explain the optional AI guide and backup settings too. No prior knowledge of the article is assumed.
- Derive next-step suggestions and saved-item counts from the existing workspace. Counts describe actual saved content, not completion of personal growth. No new data schema or invented user goals are introduced.
- Explain each reset phase and all six plan fields where they are used. Give direct controls to open the relevant form or focus the next section; restore main-content focus on section navigation.
- Keep guidance optional to expand for returning users. These are authored app-use recommendations, not automatic AI analysis or psychological screening.

---

## 2026-09-20: expanded AI providers and conversation

- Add Groq, Hugging Face Inference Providers, and OpenRouter presets alongside OpenAI, DeepSeek, and NVIDIA NIM. They use fixed public HTTPS endpoints and the existing provider-neutral Chat Completions adapter; custom endpoints remain available for other compatible services.
- Treat free access as provider-controlled rather than guaranteed by LifeOS. Free credits, free model routing, quotas, pricing, model availability, and data retention can change and must be disclosed in the UI/documentation.
- Report provider connection health after the server-side `/models` validation: green/working for responsive checks, yellow/slow at 3 seconds or more, and red/down for validation or reachability errors.
- Add a user-triggered follow-up chat after analysis. Send only selected context and bounded recent messages, keep the transcript in component memory for the page session, apply the existing server-side session-key protection and rate limits, and never persist chat content in LifeOS data.

---

## 2026-09-20: human development frameworks & AI MSQ reflection

- The product owner instructed to utilize the clinical and consciousness frameworks from the MatchWise project (`D:\AI\MatchWise`) to eliminate manual essay writing in morning and evening reflections.
- Integrated six core frameworks: Hartman Color Code (Core Motives: Red, Blue, White, Yellow), David Hawkins Map of Consciousness (Force <200 vs Power ≥200), Abraham Hicks Emotional Guidance (22 set points), The Birkman Method (Usual, Needs, Stress triggers), DISC Assessment (Pace & Focus), and Schwartz Basic Human Values.
- Implemented an initial 8-question Baseline Assessment (`assessment.ts`) that determines the user's archetype profile and calibrates subsequent prompts.
- Transformed all 14 morning (`m1`–`m14`) and 7 evening (`e1`–`e7`) Dan Koe prompts into tap-selectable MSQ cards (`questionnaire.ts`) with multi-select support, archetype alignment, and optional personal nuance input.
- Added `/api/ai/questions` endpoint to dynamically generate 3–4 tailored contextual choices using active goals and psychometric profile when an AI provider is connected, falling back cleanly to curated framework options when offline.
- Added automated plan drafting from MSQ answers, synthesizing selected choices into the Anti-Vision, Vision, Identity, Daily Levers, and Constraints.
- State migration and backup validation (`domain.ts`) safely support `assessmentProfile` and `selectedOptions` while maintaining strict schema validity and full backward compatibility.
- See [[Frameworks/Human Development Frameworks]] for the full framework breakdown.

---

## 2026-09-21: optional Google Translate

- Add an on-demand Settings tool using Cloud Translation Basic (v2). It translates only text that the user types or explicitly selects from their LifeOS writing, leaves source data unchanged, and does not persist translations.
- Keep `GOOGLE_TRANSLATE_API_KEY` server-only. Require the user/operator to enable Google Cloud Translation and billing, disclose Google's own usage controls, bound requests to 5,000 characters, validate target languages, apply a rate limit, and never expose the key to the browser.

---

## 2026-09-25: native Arabic workspace and browser translation compatibility

- Add a user-controlled English/Arabic switch in the workspace header. Persist only the locale preference in browser storage; never translate, modify, or send the person's saved writing when they change interface language.
- Apply `lang="ar"` and `dir="rtl"` for Arabic, including an RTL sidebar and controls layout plus Arabic date formatting. Keep English as the default when there is no saved preference, while using an Arabic browser preference as the initial fallback.
- Keep browser translation separate from the optional Cloud Translation writing tool. Declare the page's English source language and explicitly opt it into browser translation so Chrome can translate into other languages without a Google Cloud key.
- Verify locale selection, RTL document attributes, and persistence with end-to-end coverage alongside the existing full browser suite.

---

## 2026-09-25: Arabic depth and LifeOS-owned assessment copy

- Localize the full baseline assessment (8 questions, options, archetype results) via `assessment-i18n.ts` and `locale/assessment-ar.mjs`. Wording is LifeOS-authored for the one-day reset; framework names are educational labels only (see [[Frameworks/Human Development Frameworks#Framework Policy]]).
- Polish Arabic MSQ headings, labels, and subtexts (`locale/msq-ar-*.mjs`, generator `scripts/gen-msq-ar.mjs`).
- Extend Arabic to daytime check-ins, reset/settings chrome, and AI guide UI (`locale/assistant.ts`, `locale/workspace.ts`).

---

## 2026-09-25: high-impact product polish (i18n, Maslow, plan review)

- Extend Arabic to reset MSQ flows, baseline assessment chrome, and settings psychometric copy via `src/lib/locale/*` while keeping the person's saved writing untouched.
- Add educational Maslow need-tier derivation (`src/lib/maslow.ts`) aligned with MatchWise v3.0 concepts; store `maslowCenter`, orientation, and tier shares on the assessment profile as illustrative heuristics, not clinical scores.
- Add MSQ source traceability metadata (`src/lib/msq-meta.ts`) mapping Dan Koe newsletter prompts to plan fields.
- Plan draft review shows per-field status vs saved direction and lets the person revert individual fields to saved text before committing.

---

## 2026-09-25: comprehensive Arabic localization and RTL typography polish

- Complete Arabic localization across Settings Data & Backup cards (export/import, recovery, alerts, confirmations) and the Google Cloud Translate tool (controls, descriptions, status, language labels).
- Localize Hartman motive badges on MSQ cards (Red, Blue, White, Yellow in Arabic), reset phase names, and plan field references on MSQ prompt headers.
- Localize all 6 views of the Journey Guide (`today`, `reset`, `direction`, `journal`, `assistant`, `settings`) with Arabic guidance and next-step recommendations.
- Modernize Arabic typography with system font stack and reset negative letter spacing in RTL so cursive script connects properly.
- Fix directional icon mirroring by scoping flips to `.rtl-flip` for navigation arrows, preventing non-directional utility icons (checkmarks, pluses, pencils, calendars) from reversing incorrectly.
- Maintain full test coverage with 18 unit tests (parity verification) and 18 E2E Playwright tests.

---

## 2026-09-25: migrate docs/ into vault

- Moved all standalone design documents from `docs/` (DECISIONS.md, FRAMEWORK-MODELS.md, QUESTIONNAIRE-DESIGN.md, session notes) into the Obsidian vault (`LifeOS-Vault/`) so a single source of truth exists for both human and AI agent navigation.
- Vault notes use proper YAML frontmatter, Obsidian wikilinks, and callout syntax. The `docs/` folder is removed; all cross-references now point to vault paths.
- Agent protocol updated in `AGENTS.md` to reference vault paths exclusively.

---

## 2026-09-26: Schwartz values on MSQ cards

- Map every MSQ option to a baseline value key (Hartman defaults plus explicit overrides in `src/lib/msq-schwartz.mjs`).
- Show educational `valueTag` on each card; emphasize tags that align with `assessmentProfile.topValues` (including related keys such as mastery/achievement).
- Sort MSQ options using combined motive/Maslow rank and value alignment with `topValues` order from the baseline assessment.

---

## 2026-09-26: calendar export follows the workspace language

- Reflection-day `.ics` files use the active locale for `SUMMARY` and `PRODID`. Event descriptions already came from localized check-in prompts.
- Builder lives in `src/lib/calendar-export.mjs` so unit tests can import it without the Next.js bundler. English export stays `LifeOS - A mindful pause` and `PRODID:-//LifeOS//Reflection day//EN`.

---

## 2026-09-27: optional Supabase cloud sync across devices

- Reverses the prior "out of scope for v2" note on cloud sync ([[AI-Memory/Future Tasks]]). The product owner explicitly requested cross-device sync; this is that product decision.
- **Auth**: Supabase email magic link (passwordless), via the browser `@supabase/supabase-js` client only — no custom API routes, cookies, or middleware. `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are public, RLS-protected values, not secrets.
- **Project isolation**: a brand-new dedicated Supabase project (org `LIFE-OS`, project `lifeos`) — never the account's pre-existing `personal-cfo` trading-app project. Supabase's free tier caps active projects at 2 per account (not per org), which surfaced mid-session; an empty scratch project created in `personal-cfo` before the org existed was deleted to free a slot.
- **Schema**: single `public.workspaces` table (`user_id uuid primary key references auth.users`, `state jsonb`, `updated_at timestamptz`), RLS-scoped so a user can only read/write their own row. Mirrors the existing local `State` blob almost exactly — no relational redesign.
- **Sync model**: cloud is primary once signed in; `localStorage` stays as an offline cache. Last-write-wins by comparing `updated_at`, decided by a pure, unit-tested function (`decideSyncDirection` in `src/lib/sync-logic.ts`). Pulls reuse the existing `restore()` in `store.ts`, so a bad pull still leaves the `lifeos_backup_before_replace` safety net intact. Pushes are debounced (~1.5s) off local change events; a 30s poll (matching the existing focus/interval refresh rhythm) catches changes pushed from other devices, avoiding a websocket/Realtime dependency.
- **Scope**: fully optional and additive. Signed-out users get byte-for-byte the same experience as before. One new "Sync across devices" card in Settings (`src/components/WorkspaceForms.tsx`) is the only new surface; it self-hides with a note if the env vars are unset.
- Verified: `npm run lint`, `npm test` (26 tests, including 5 new `decideSyncDirection` cases in `tests/sync.test.mjs`), `npm run build` all pass. Manually verified in-browser: invalid/placeholder email domains are rejected with Supabase's own error surfaced in the UI; a real address correctly shows "Check your email for a sign-in link." Magic-link completion (actually clicking the emailed link) and multi-device pull/push were not automated — real email delivery isn't practical to automate in CI, so this remains a manual follow-up check.

> [!warning] Superseded 2026-09-28
> A review of this first sync pass found serious defects before it was ever committed. The next entry records the rebuild, and [[AI-Memory/Bugs & Issues|Bugs & Issues]] BUG-004 to BUG-010 list the defects. The claims above about pulls "reusing the backup safety net" and last-write-wins by timestamp no longer describe the code.

---

## 2026-09-28: cloud history as the basis for analysis and AI context

The product owner set the purpose of the database: sync every device, analyze the person's history, produce conclusions, and let a connected AI relate to the person's situation from that history.

- **Persisted AI insights (reverses 2026-09-19 "results stay in component memory only").** Every successful analysis is saved automatically to `state.insights`. The owner chose automatic saving, provided the person can edit, modify, and remove it. Editing marks an insight `edited`, and the AI prompt treats edited insights as the person's correction, which outranks the model's earlier reading. The follow-up chat transcript is still never persisted.
- **Test results and inputs are history.** Every baseline run is kept in `state.assessments` with its answers and computed profile; `assessmentProfile` stays the current one. Each changed plan is appended to `state.planHistory`. Past results can be removed individually.
- **Analysis runs on the device** (`src/lib/history.ts`), deterministic and unit-tested. The database stores history; the app computes conclusions. This keeps analysis available offline and signed-out, and the server never reads private data to analyze it. Conclusions are descriptive, apply minimum-data thresholds (no trend claims under 7 tracked days), and never diagnose.
- **AI context categories.** The new categories are History trends (an aggregate digest, no note or journal text), Baseline profile (current result plus what changed since the previous run), and Past saved insights (last 5, with edits). All three default to **on**, because they are aggregates or the AI's own output. Reset answers and journal entries stay default **off**, as before. `src/lib/ai-context.ts` validates and bounds every category server-side for both `/api/ai/analyze` and `/api/ai/chat`, replacing two diverging copies.
- **Sync model.** The server holds a `revision`, and all writes go through `public.sync_push`, which locks the row, rejects a stale base with the current state, and uses the server clock. Clients keep the last synced copy as a merge base and a persisted edit counter. They merge 3-way (`src/lib/sync-logic.ts`): per date for days, per ID for items, per field for the plan and answers. Most-recent-edit wins only on a true same-field conflict. A first link merges, it doesn't replace.
- **Daily snapshots kept forever.** `public.workspace_snapshots` stores one snapshot per account per day, written only by `sync_push`, readable only by the owner, and restorable from Settings. Storage cost is accepted by the owner; on the Supabase free tier (500 MB), a very large single workspace could eventually need pruning. Deleting a saved insight doesn't remove it from past snapshots until the account is deleted, and this is documented in the README.
- **`sync_push` is `SECURITY DEFINER` by design.** It is the only write path and acts solely on `auth.uid()`; `anon`/`public` execute is revoked. The Supabase advisor warning `0029_authenticated_security_definer_function_executable` is acknowledged, not a defect. The "leaked password protection" advisory does not apply, because sign-in is passwordless.
- **Sync never touches unreadable local data.** If `lifeos_v2` can't be decoded, sync pauses rather than pushing a default state over the cloud copy, in line with the AGENTS.md invariant.
- **Tooling.** `allowImportingTsExtensions` is enabled so pure modules can be tested directly under `node --test` with explicit `.ts` imports.

---

## 2026-09-28: database governance for multi-agent development

- LifeOS is built by several AI agents. The owner asked for explicit database roles that every agent follows. [[Frameworks/Database Rules|Database Rules]] is now mandatory, and `AGENTS.md` makes it binding.
- **Roles:**
  - Product Owner (human; the only approver for destructive, retention, privacy, or AI-scope changes);
  - Database Steward (the only one who applies migrations, one at a time via the DB lock);
  - Sync Engineer;
  - Data Model Engineer;
  - Analysis & AI Engineer;
  - independent Verifier (never the author).
- **DB lock:** a single `DB lock:` line in [[AI-Memory/Agent Handoff|Agent Handoff]] serializes schema and `State` changes across agents.
- **Migrations are code.** The three migrations applied through the MCP (`create_workspaces_table`, `sync_revisions_and_snapshots`, `sync_push_return_client_edited_at`) were back-filled into `supabase/migrations/` with their exact live versions. From now on, applied migrations must be committed in the same session, and drift between `list_migrations` and the folder is checked at session start.
- **Contract test:** `supabase/tests/sync_push_contract.sql` is a self-rolling-back check that must print `RESULT PASS` after any database change.
- **Merge safety:** `mergeStates` now carries over any `State` field that lacks a dedicated rule (whole-value 3-way pick) instead of dropping it. This removes a trap where a new field added by one agent would silently disappear during sync. The State-change checklist still requires a proper rule.

---

## Remaining constraints

Without optional sign-in, browser storage offers no cross-device sync or transactional multi-tab edits. Reflection-day calendar reminders require calendar import. V1 logs used human-readable timestamps, so missing timestamps cannot be recovered accurately. Keep original exports for archival access.
