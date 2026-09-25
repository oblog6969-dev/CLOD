---
title: "Bugs & Issues"
created: 2026-09-25
updated: 2026-09-25
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
