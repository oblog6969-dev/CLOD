---
title: "Bugs & Issues"
created: 2026-09-25
updated: 2026-09-28
type: bugs
status: active
priority: high
tags:
  - project/lifeos
  - type/bugs
aliases:
  - Issues
  - BugLog
---

# 🐛 Bugs & Issues

> [!info] How to use this file
> - **Log every bug** you find here, even if you fix it immediately — the history matters.
> - Mark bugs as `open`, `in-progress`, or `resolved` using the frontmatter status pattern.
> - Include reproduction steps, the session date, and your agent name.
> - Link to the relevant file using `[[wikilinks]]` or inline code paths.

---

## 🔴 Open Bugs

*No open bugs at time of last update (2026-09-25, Antigravity).*

Add new bugs below using this template:

```
### BUG-NNN: Short description
- **Status:** open | in-progress
- **Severity:** critical | high | medium | low
- **Discovered:** YYYY-MM-DD  |  **Agent:** <agent name>
- **Affected Files:** `src/...`
- **Reproduction:**
  1. Step 1
  2. Step 2
- **Expected:** ...
- **Actual:** ...
- **Notes:** ...
```

---

## 🟡 In Progress

*None.*

---

## ✅ Resolved Bugs

> [!note] BUG-004 to BUG-010 were found on 2026-09-28 by Claude, reviewing its own uncommitted first sync pass from 2026-09-27. None of them ever shipped. All are fixed by the rebuild described in [[Decisions/Decisions Log|Decisions Log]] (2026-09-28) and covered by `tests/sync.test.mjs`.

### BUG-004: Sync ping-pong between devices
- **Status:** resolved | **Severity:** high
- **Affected Files:** `src/lib/sync.ts`, `src/lib/store.ts`
- **Cause:** `restore()` emitted to every store listener, including the sync hook, so every pull was pushed straight back with a new `updated_at`. Other devices then saw a "newer" row and repeated the cycle every poll.
- **Fix:** New `onLocalEdit()` in `store.ts` fires only for edits made on the page, never for sync-applied states (`restore(..., { fromSync: true })`), date rollover, or other tabs.
- **Verified:** unit test "repeated polling between two synced devices never ping-pongs".

### BUG-005: Sync (and magic-link sign-in) only started when Settings was opened
- **Status:** resolved | **Severity:** high
- **Cause:** The Supabase client was created lazily inside `SyncCard`. A magic link landing on Today was never processed, and nothing synced in the background.
- **Fix:** `startSync()` runs from `LifeOSApp` on load.
- **Verified:** in-browser, a magic-link redirect is processed on the Today view.

### BUG-006: Offline edits silently overwritten
- **Status:** resolved | **Severity:** high
- **Cause:** There was no record of unsynced local edits. If another device pushed meanwhile, the next poll saw the remote as newer and replaced local work.
- **Fix:** A persisted `editSeq`/`syncedSeq` counter plus a stored merge base; a 3-way merge instead of replacement.
- **Verified:** unit tests "an offline edit survives…" and "an edit made while a push is in flight stays pending".

### BUG-007: Device clocks decided which copy won
- **Status:** resolved | **Severity:** medium
- **Cause:** `updated_at` came from `new Date()` on the client.
- **Fix:** A server-side `revision` with optimistic concurrency in `public.sync_push` (`updated_at = now()`). Client edit time is used only as a tie-break for a true same-field conflict.

### BUG-008: Every sync pull overwrote the manual recovery slot
- **Status:** resolved | **Severity:** medium
- **Cause:** Pulls went through `restore()`, which always rewrote `lifeos_backup_before_replace`, so "Recover previous workspace" usually held the previous sync, not the pre-import/reset state.
- **Fix:** `restore(state, { backup: false })` for sync. Durable history now lives in `workspace_snapshots`.

### BUG-009: Unreadable local data could be pushed over the cloud copy
- **Status:** resolved | **Severity:** critical
- **Cause:** When `lifeos_v2` failed to decode, `store.ts` held `freshState()` with `blocked: true`, but the sync code read `snapshot.state` regardless and could have uploaded an empty workspace over the account.
- **Fix:** `getLocalState()` returns `null` when blocked; the engine returns `"blocked"` and never pushes.
- **Verified:** unit test "unreadable local data is never pushed over the cloud copy".

### BUG-010: Expired magic link gave no feedback and left tokens in the URL
- **Status:** resolved | **Severity:** low
- **Fix:** `startSync()` reads `error_description` from the redirect hash, shows it on the sync card with "Request a new sign-in link", and clears auth parameters from the URL after `INITIAL_SESSION`.
- **Verified:** in-browser with both a bogus token and an `otp_expired` redirect.

### BUG-001: Playwright strict-mode collision on sidebar RTL button
- **Status:** resolved
- **Severity:** medium
- **Discovered:** 2026-09-25 | **Agent:** Antigravity
- **Affected Files:** `tests/e2e/lifeos.spec.ts`
- **Reproduction:** E2E test `Arabic language selection uses RTL and stays selected` failed because `page.getByRole("button", { name: /مساحتك للتغيير/ })` matched multiple elements across sidebar and mobile nav.
- **Fix:** Scoped locator to `.sidebar`: `page.locator(".sidebar").getByRole("button", { name: /مساحتك للتغيير/ })`.
- **Verified:** 2026-09-25 — all 18 E2E tests pass.

### BUG-002: Blanket SVG transform mirroring inverted utility icons in RTL
- **Status:** resolved
- **Severity:** medium
- **Discovered:** 2026-09-25 | **Agent:** Antigravity
- **Affected Files:** `src/app/globals.css`
- **Reproduction:** In Arabic (RTL) mode, non-directional icons (checkmarks ✓, plus signs +, edit pencils, download arrows, calendar icons, leaf/sprout icons) were flipped horizontally by the CSS rule `:root[dir="rtl"] .button svg { transform: scaleX(-1); }`.
- **Fix:** Removed the blanket rule. Added `.rtl-flip` utility class that flips only directional navigation arrows (chevrons, back/forward arrows). Explicitly excluded known utility icon classes from any transform.
- **Verified:** 2026-09-25 — RTL icons render correctly in E2E visual tests.

### BUG-003: PowerShell npm script execution policy blocks `npm` command
- **Status:** resolved (known environment constraint)
- **Severity:** low
- **Discovered:** 2026-09-25 | **Agent:** Antigravity
- **Affected Files:** N/A — environment-level issue.
- **Reproduction:** Running `npm test` directly in PowerShell on Windows fails with an execution policy error because PowerShell refuses to run `npm.ps1`.
- **Fix:** Always invoke npm through cmd: `cmd.exe /c npm test`, `cmd.exe /c npm run build`, `cmd.exe /c npx playwright test`.
- **Note:** This is a permanent environment constraint for this Windows machine. Document in every agent handoff.

---

## 🔗 Vault Navigation

- **Back:** [[00 - AI Agent Memory Index|AI Memory Index]]
- **Future Tasks:** [[Future Tasks]]
- **Agent Handoff:** [[Agent Handoff]]
