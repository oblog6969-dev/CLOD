# LifeOS

A calm, local-first space for a day of reflection and the small daily actions that follow. Built with Next.js 16, React 19, TypeScript, and CSS. Inspired by [Dan Koe's one-day protocol](https://letters.thedankoe.com/p/how-to-fix-your-entire-life-in-1).

The [LifeOS Vault](LifeOS-Vault/00%20-%20Start%20Here.md) lives in this repository. Open `LifeOS-Vault` as an Obsidian vault for the project index, frameworks, and progress notes.

## Run

Use Node.js 24 or newer (unit tests use native TypeScript stripping).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For production, run `npm run build` followed by `npm start`.

## Experience

- **Guided journey:** a first-visit welcome explains LifeOS without requiring background reading. Every section offers a short explanation, a recommendation based on saved activity, and an expandable Notice → Choose → Practice → Learn walkthrough. Reset phases and plan fields include plain-language help. Returning users see the compact guide and can reopen the walkthrough.
- **Baseline assessment & psychometrics:** an 8-question situational calibration derived from clinical & behavioral frameworks in MatchWise (Hartman Color Code motives, Hawkins Map of Consciousness, Abraham Hicks Emotional Continuum, Birkman needs & stress triggers, DISC pace & focus, and Schwartz values) to derive an individualized human development archetype.
- **Today:** recurring priorities, optional time blocks, local-date completion, mood, and a quick reflection.
- **Your reset & MSQ reflections:** 14 morning questions, six customizable calendar reminders, and seven evening questions. Prompts feature tap-selectable Multiple-Choice Questions (MSQs) calibrated to the user's archetype to eliminate typing fatigue, with optional personal nuance notes and dynamic AI option generation (`/api/ai/questions`). Each answer saves immediately. A plan draft synthesizes chosen options for explicit review.
- **My direction:** editable vision, anti-vision, identity, yearly outcome, monthly project, and boundaries. Monthly progress depends only on its own steps.
- **Reflections:** timestamped notes and seven days of completion history. Points and levels are secondary, derived metrics.
- **AI guide:** optional provider-neutral pattern analysis with category-by-category consent. OpenAI, DeepSeek, NVIDIA NIM, Groq, Hugging Face, OpenRouter, and public OpenAI-compatible APIs are supported. Suggestions only change Today after explicit acceptance.
- **Settings:** name, psychometric baseline review & recalibration, validated JSON import/export, archived-step recovery, reset with backup, and restoration of the previous workspace.
- **Arabic interface:** use the `العربية` / `English` control in the top bar. Arabic includes RTL layout, Arabic dates, localized reset MSQs (titles, option labels, and subtexts), the full baseline assessment flow, daytime check-in prompts, settings/reset chrome, and the AI guide UI. Your own saved writing is never auto-translated or overwritten.

## Languages and browser translation

LifeOS ships with English and Arabic for the main workspace. Locale is stored in browser local storage (`lifeos_locale`). Baseline and MSQ Arabic copy lives in `src/lib/locale/`; see `LifeOS-Vault/Frameworks/Human Development Frameworks.md#Framework Policy` for how reflection frameworks are used (educational models, LifeOS-authored questions). Regenerate MSQ Arabic options after edits with `node scripts/gen-msq-ar.mjs` from the `life-os` directory.

The document also identifies English as its source language and explicitly permits browser translation. Chrome users can still use the browser’s Translate control for languages not provided by the native interface. Browser translation is controlled by Chrome and may need to be enabled in the browser’s language settings.

## Optional AI guide

The AI guide uses server-only route handlers. OpenAI uses the Responses API; DeepSeek, NVIDIA NIM, Groq, Hugging Face Inference Providers, OpenRouter, and custom providers use OpenAI-compatible Chat Completions. Enter an API key and model ID in AI guide. The key passes from the browser form to the LifeOS server, so use HTTPS outside local development. The server validates it against the provider's models endpoint, encrypts it with AES-256-GCM, and returns it only as an HttpOnly, same-site session cookie scoped to `/api/ai`. It is never persisted in local storage, application state, exports, logs, or repository files, and the raw value is not returned to the browser after connection.

Set `LIFEOS_SESSION_SECRET` to a long random value for deployed or multi-instance environments (see `.env.example`). Without it, LifeOS creates an in-memory key suitable for local development; AI connection cookies become unreadable after a server restart and the person reconnects. HTTPS sets the cookie's Secure flag.

The person selects which categories to send. My direction, Daily steps, History trends, Baseline profile, and Past saved insights are initially selected; Reset answers and Journal reflections are initially off. Empty categories are omitted. History trends is an aggregate digest computed on the device (`src/lib/history.ts`): active days, streaks, mood counts and trend, weekday pattern, boundaries kept, plan age, and baseline drift, plus plain-language observations. It never includes note or journal text. Both AI routes validate and bound every category server-side (`src/lib/ai-context.ts`) and instruct the model to relate the present to that history, build on earlier insights, and treat insights the person edited as corrections.

Every analysis is saved as an insight in the workspace (`insights` in the state). Under AI guide, **Your saved insights** lets the person edit the summary, patterns, suggested steps, and question (edited items are marked and passed to the AI as the person's correction) or remove them. Saved insights sync, export, and restore like the rest of the workspace. The follow-up conversation stays page-session-only and is never persisted. LifeOS requests `store: false` from OpenAI and asks compatible providers for JSON. Provider data controls, free-tier credits, rate limits, and API charges still apply. Disconnect deletes the session cookie.

## Optional Google Translate

Settings includes an on-demand **Translate your writing** tool. It can translate text you type or explicitly choose from your direction, active steps, or latest reflection; it never modifies the source writing or stores the translation in LifeOS. To enable it, create a restricted Google Cloud Translation Basic (v2) API key, enable Cloud Translation and billing for its project, then set `GOOGLE_TRANSLATE_API_KEY` on the server. The key is never sent to the browser. Google Cloud usage, billing, and data controls apply.

## Optional cloud sync and history (Supabase)

Setting `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` enables **Sync across devices** in Settings. Without them, or without signing in, LifeOS stays local-only and makes no Supabase requests. Sign-in uses an email magic link. In the Supabase dashboard (Authentication → URL Configuration), set the Site URL and allow-list each origin the app runs on, or links will redirect to the wrong place.

- **Storage.** `public.workspaces` holds one JSONB copy of the workspace per account, with a server-assigned `revision`. `public.workspace_snapshots` keeps one snapshot per account per day, indefinitely. Row Level Security allows reading only your own rows. All writes go through `public.sync_push`, a `security definer` function that acts only on `auth.uid()`, locks the row, rejects stale revisions, uses the server clock, and records the day's snapshot. The Supabase advisor flags that signed-in users can call it; that is intended, since it is the only write path.
- **Sync.** `src/lib/sync-engine.ts` (pure, tested with a simulated two-device server) keeps the last synced copy as a merge base and a persisted edit counter, so offline edits are never forgotten. When both devices changed, `src/lib/sync-logic.ts` performs a 3-way merge. Daily records, steps, reflections, insights, and baseline runs combine by date or ID. Plan fields and answers merge per field. Only a true same-field conflict is decided by the most recent edit. A device linking for the first time is merged in, not overwritten. Sync starts on page load, runs every 30 seconds, on focus, on reconnect, and shortly after each edit, and is serialized across tabs. It pauses if local data is unreadable instead of overwriting the cloud copy.
- **History.** Settings → Sync → **Restore from history** restores any saved day; the restore itself syncs to other devices and keeps a local recovery copy. Every baseline run is kept with its answers (`assessments`), and every changed plan is kept (`planHistory`). Removing a saved insight or a past baseline result removes it from the workspace, but copies remain in earlier daily snapshots until those are deleted with the account.
- **Sign-out.** Signing out first tries to push pending changes and warns if some couldn't be sent. It optionally removes the workspace from a shared device.

## Data and recovery

`src/lib/domain.ts` contains pure, tested state transitions, derived progress, validation, and v1 migration. `src/lib/store.ts` supplies the external React store. It checks the local date on focus and every 30 seconds, subscribes to changes from other tabs, and reads the latest persisted state before applying changes.

The current key is `lifeos_v2`. Original `life_os_state_v1` data remains untouched, including legacy fields that are not shown in the redesigned app. Migration brings across the name, plan summaries, recurring tasks, dated completions, project steps, and reflection notes. Old locale-only reflection dates cannot be reliably reconstructed; those receive the migration timestamp. Arbitrary old XP and streak counters are not treated as evidence of activity.

Before an import, reset, or history restore, `lifeos_backup_before_replace` holds the previous raw state (sync never overwrites this slot). This is a single recovery slot, not a permanent archive. Download JSON exports for durable backups. Settings also offers a legacy v1 export, including original fields not shown in the new interface. Invalid data blocks normal writes until the person deliberately restores or resets. Storage is browser-local and not encrypted. Private browsing or clearing site data can remove it.

Calendar export creates six events on the chosen local calendar date. The person must import the `.ics` file in their calendar; the web app does not promise background notifications. Calendar app notification permissions still apply.

## Verification

```sh
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests start a production server on port 3100. After intentional RTL layout changes, refresh visual baselines with `npx playwright test tests/e2e/rtl-visual.spec.ts --update-snapshots`. Unit tests cover reversible points, level boundaries, independent dates/streaks, project progress, archive history, malformed imports, v1 migration, the 3-way merge rules, the sync engine against a simulated two-device server (no ping-pong, offline edits survive, in-flight edits stay pending, deletions propagate, unreadable local data is never pushed), history analysis thresholds, and server-side AI context bounds. Browser tests cover core editing, persistence, keyboard dialogs, the reflection-to-plan flow, recovery, mobile overflow, corrupt storage, midnight rollover, the history card, and saving/editing/removing AI insights. Live magic-link sign-in is not automated.

## Boundaries

Accounts and cloud sync are optional (see above); no background push service is included. Multi-agent collaboration refers to development of this repository; see `AGENTS.md`. The optional AI guide sends only categories selected for a specific request; it is not autonomous and cannot silently edit the plan. Without sync, simultaneous writes from separate tabs are not transactional; use one active editing tab for the same workspace. The app is a reflection tool and does not diagnose or promise treatment.
