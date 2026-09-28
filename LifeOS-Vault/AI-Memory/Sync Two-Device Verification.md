---
title: "Sync Two-Device Verification"
created: 2026-09-28
updated: 2026-09-28
author_agent: Cursor
author_model: Composer
type: runbook
status: active
priority: high
tags:
  - project/lifeos
  - type/verification
  - sync
aliases:
  - TwoDeviceSync
  - LiveSyncCheck
---

# Live two-device sync verification

Automated coverage: `npm test` (simulated two-device server in `tests/sync.test.mjs`), `supabase/tests/sync_push_contract.sql` on live DB (rolled back). **This runbook is the manual sign-off** the vault still owes.

## Prerequisites (owner)

1. **`.env.local`** in `life-os/` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`). Rebuild after changing: `cmd.exe /c npm run build`.
2. **Supabase dashboard** → Authentication → URL Configuration:
   - **Site URL:** production origin (and `http://localhost:3000` for local dev).
   - **Redirect URLs:** same origins (magic link lands on `window.location.origin`).
3. Email inbox you can open on two devices (or one device + one browser profile).

## Device A — first link

1. Open LifeOS (production or `npm start` after build with env).
2. Settings → **Sync across devices** → enter email → **Send magic link**.
3. Click the link in email → confirm signed-in status (email shown, “Synced” or “Changes waiting…”).
4. Make a visible edit: Today → add a daily step titled `Device A ping`.
5. Wait ~30s or switch tabs and return (focus triggers sync).

## Device B — pull

1. Open LifeOS in a **different browser or device** (same email).
2. Magic-link sign-in with the **same** account.
3. Confirm **Device A ping** appears on Today without re-entering.
4. Add step `Device B ping`. Wait for sync.

## Device A — round trip

1. Return to Device A, refresh or wait for poll.
2. Confirm **Device B ping** appears.

## Offline edit (Device B)

1. On Device B, open DevTools → Network → **Offline**.
2. Add step `Offline B`.
3. Go online. Confirm step remains and syncs.
4. On Device A, confirm **Offline B** arrives.

## Restore from history

1. On either device: Settings → Sync → **Show saved days** → pick yesterday or today → **Restore**.
2. Confirm merge notice if both devices had diverged edits earlier.
3. Confirm a local recovery backup still exists (`lifeos_backup_before_replace` in devtools Application tab) after restore.

## Sign-out flush

1. With pending edits, sign out → confirm warning if unsynced.
2. Sign in again → workspace matches cloud.

## Record results

Add a line to [[AI-Memory/Sessions/Session Log|Session Log]]:

`Live two-device sync: PASS/FAIL · date · browser/device notes`

Mark [[Future Tasks#Cloud sync & history|Real-account verification]] `[x]` only after PASS.

## E2E smoke (CI, no Supabase)

`tests/e2e/sync.spec.ts` checks the local-only deployment message and expired-link URL handling when sync is configured in a custom build.
