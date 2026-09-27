---
title: "Future Tasks"
created: 2026-09-25
updated: 2026-09-28
type: backlog
status: active
priority: high
tags:
  - project/lifeos
  - type/backlog
  - type/future-tasks
aliases:
  - Backlog
  - Roadmap
---

# 🗓️ Future Tasks & Backlog

> [!info] How to use this file
> - Pick a task from the backlog when starting a session. Move it to `In Progress` in [[Agent Handoff]].
> - When done, mark it `[x]` and add the agent name + date.
> - Add new ideas in **💡 Ideas & Someday** so they don't get lost.
> - Priorities: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low | 💡 Idea

---

## 🔴 Critical / Blocking

*No critical blockers at 2026-09-25.*

---

## 🟠 High Priority

### i18n & RTL

- [ ] **RTL: Verify compound animated transitions** — Some multi-step animated elements (e.g. step-complete confetti, progress bars) may need RTL-aware translate offsets. Manual check on a real Arabic browser needed.
- [x] **RTL: Journey Guide panel slide direction** — Confirmed 2026-09-26 (Cursor): the walkthrough uses `hidden`, not a horizontal slide, so there is no open-direction to flip. The primary CTA arrow now uses `.rtl-flip`.
- [x] **i18n: Calendar export ICS file headers** — Done 2026-09-26 (Cursor). `SUMMARY` and `PRODID` follow locale via `calendar-export.mjs`. Descriptions already used localized check-in text.

### Assessment & MSQ

- [x] **MSQ: Schwartz Values on prompt options** — Done 2026-09-26 (Cursor). Each MSQ option resolves a Schwartz/baseline value (`msq-schwartz.mjs`), shows `valueTag` on cards (EN/AR), highlights aligned options from `profile.topValues`, and sorts options after Hartman/Maslow motive boost.
- [ ] **Baseline: Re-take flow** — After completing baseline assessment, there is no prominent "Retake assessment" CTA in Settings; it exists but is not clearly labeled. Improve discoverability.

### Cloud sync & history

- [x] **Cloud sync (Supabase)**: first pass 2026-09-27 (Claude), rebuilt 2026-09-28 (Claude). Revisioned `sync_push`, 3-way merge, daily snapshots, restore from history. See [[Decisions/Decisions Log|Decisions Log]] 2026-09-28.
- [x] **Saved AI insights, assessment history, plan history, history analysis**: done 2026-09-28 (Claude).
- [ ] 🟠 **Real-account verification**: a live magic-link sign-in on two devices, confirming a change and an offline edit on each arrive on the other. All logic is covered by the simulated two-device tests, but the real Supabase round trip hasn't been exercised with a real session.
- [ ] 🟠 **Owner action in the Supabase dashboard**: set the Site URL and redirect allow-list (Authentication → URL Configuration) for localhost and the production domain. No MCP tool can do this.
- [ ] 🟡 **Delete my cloud account**: a UI to delete the account (cascades to `workspaces` and `workspace_snapshots`). Today, removing an insight doesn't erase it from past daily snapshots.
- [ ] 🟡 **Snapshot pruning policy**: snapshots are kept forever by owner decision. Monitor database size on the free tier (500 MB) and add pruning or thinning if a workspace grows large.
- [ ] 🟢 **Show what changed in a merge**: the notice says changes were combined, but not which ones.
- [ ] 🟢 **History over longer windows**: `summarizeHistory` uses 28 days. Add a 90-day or "since the start of this chapter" view, and plan-evolution diffs from `planHistory`.

### AI Integration

- [ ] **AI Guide: Streaming responses** — Currently the AI guide waits for a full JSON response before rendering. Explore streaming for large providers to reduce perceived latency.
- [ ] **AI Guide: Model picker in UI** — The user must type the model ID manually. A dropdown or searchable list of common models per provider would improve UX.

---

## 🟡 Medium Priority

### Data & Storage

- [ ] **Export: Arabic metadata in ICS/JSON** — When locale is Arabic, backup JSON and calendar exports still use English field labels. Explore dual-language export.
- [ ] **Recovery UX** — The "Recover previous workspace" flow shows a raw JSON preview. A human-readable summary (# of steps, plan fields, last date) before confirming would reduce anxiety.

### Localization

- [ ] **Dates in MSQ archival summaries** — Archived step timestamps show in ISO format in Arabic mode. Render them using `toLocaleDateString('ar-EG')`.
- [ ] **Error messages** — Several caught errors in `domain.ts` and API routes still throw/display English-only strings. Pipe them through the locale system.

### Testing

- [ ] **Visual regression tests** — Add a Playwright screenshot comparison test for the Arabic RTL layout on both mobile (390 px) and desktop (1440 px) viewports to catch future CSS regressions.
- [ ] **AI provider mock tests** — The AI guide E2E tests use mock fetch intercepts. Add edge-case tests: provider returns invalid JSON, rate limit exceeded, streaming timeout.

---

## 🟢 Low Priority / Nice to Have

- [ ] **Dark mode: Arabic typography** — Verify `Cairo` / `Tajawal` font rendering in dark mode on Windows ClearType vs macOS subpixel antialiasing. May need weight adjustments.
- [ ] **Keyboard shortcut help modal** — A `?` shortcut showing all keyboard shortcuts (Escape, Tab, Enter, Arrow navigation) in both EN and AR.
- [ ] **Journey Guide: Progress percentage** — Show a `[███░░] 60%` style indicator of how many morning/evening MSQ prompts are answered for the day.
- [ ] **Settings: Reset chapter date picker** — Currently "start fresh chapter" sets today as the reset date. Allow the user to pick a past date for backdating their fresh start.

---

## 💡 Ideas & Someday (Not Committed)

> [!warning] Exploratory only — not planned features
> These are brainstorm items. They require a **product decision** before any agent works on them.

- **MatchWise dyadic/Kegan/Bowen engines** — Advanced relational psychometrics (q86–q95 question bank). Requires license/permission review.
- **Push notifications / calendar reminders** — Native browser notifications for daytime check-in alerts. Requires permission flow.
- **Community direction templates** — Curated starting Direction drafts (e.g. "Freelance creative", "Deep work scholar") to reduce blank-page anxiety for new users.
- **Progress analytics page** — Charts of streak history, archetype drift over time, and plan field evolution. Would require indexed history data structure.

---

## 🔗 Vault Navigation

- **Back:** [[00 - AI Agent Memory Index|AI Memory Index]]
- **Bugs:** [[Bugs & Issues]]
- **Agent Handoff:** [[Agent Handoff]]
- **Progress:** [[Progress/00 - Dashboard]]
