---
title: "Project Documentation Index"
created: 2026-09-25
updated: 2026-09-25
type: moc
status: active
priority: high
tags:
  - project/lifeos
  - type/docs
  - type/moc
aliases:
  - Docs
  - Documentation
---

# 📄 Project Documentation (`docs/`)

> [!info] What this note is
> The `docs/` folder (at the **repository root**, not inside this vault) contains authoritative design and decision documents for LifeOS. This note is their **bridge into the vault** — it summarizes each file and links to the related vault notes for cross-referencing.
>
> Paths below are relative to the **repository root** (`d:\AI\CLOD\life-os\`).

---

## 📋 docs/ File Index

| File | Purpose | Status | Related Vault Note |
|------|---------|--------|--------------------|
| `docs/DECISIONS.md` | Chronological log of every product & architecture decision made by any agent | Active — update every session | [[AI-Memory/Agent Handoff]] |
| `docs/SESSION-2026-09-25.md` | Per-session notes for the 2026-09-25 full-day work | Complete | [[AI-Memory/Sessions/Session Log]] |
| `docs/FRAMEWORK-MODELS.md` | Policy: what MatchWise supplies vs what LifeOS authors | Reference | [[Frameworks/Human Development Frameworks]] |
| `docs/QUESTIONNAIRE-DESIGN.md` | Original design spec for the Dan Koe MSQ questionnaire and AI role | Implemented | [[Frameworks/Dan Koe Principles]] |

---

## 📖 File Summaries

### `docs/DECISIONS.md`

The single most important doc for any incoming agent. Contains one section per major product/engineering decision in reverse-chronological order, with rationale. **Every consequential decision must be recorded here.** Sections include:

- 2026-09-16: daily-use redesign
- 2026-09-19: optional AI guide; provider-neutral AI
- 2026-09-20: article-led questionnaire, guided journey, expanded AI providers, human development frameworks
- 2026-09-21: optional Google Translate
- 2026-09-25: native Arabic & RTL, Arabic depth & assessment copy, high-impact polish, comprehensive Arabic localization & RTL typography

> [!tip] Agent rule
> When you make any architectural or product decision, add it here **before committing**. Format: `## YYYY-MM-DD: short description` followed by bullet rationale.

---

### `docs/SESSION-2026-09-25.md`

Session notes for the 2026-09-25 work day covering three agent runs (Codex, Cursor, Antigravity). Documents what each agent built, the test counts at each handoff, and key file references. Complementary to [[AI-Memory/Sessions/Session Log]].

> [!note] Naming convention
> New sessions should create a new file: `docs/SESSION-YYYY-MM-DD.md`. Do not overwrite old session notes.

---

### `docs/FRAMEWORK-MODELS.md`

Policy document establishing the boundary between:
- **What MatchWise provides**: conceptual model ideas (Hartman, DISC, Birkman, Hawkins, Schwartz, Hicks, Maslow tiers)
- **What LifeOS owns**: all question wording, MSQ option copy, Arabic translations, archetype labels, and plan synthesis rules

> [!warning] Do not copy MatchWise instruments
> LifeOS uses the *idea* of each framework as an educational lens only. Do not port MatchWise dyadic engines, q86–q95 question bank, or scoring algorithms without explicit product decision and review.

---

### `docs/QUESTIONNAIRE-DESIGN.md`

Original design specification (2026-09-20) for the tap-based MSQ questionnaire. Covers:
- Source mapping from Dan Koe's newsletter to question IDs
- Proposed interaction flow (morning → daytime → evening → ongoing)
- AI role boundaries (interpreting/organizing vs. generating identity claims)
- Data storage requirements and verification checklist
- Implementation completion notes (all items done as of 2026-09-20)

This doc is now largely a historical record since the implementation is complete.

---

## 🔗 Vault Navigation

- **Back:** [[00 - Start Here]]
- **AI Memory:** [[AI-Memory/00 - AI Agent Memory Index|AI Agent Memory]]
- **Decisions & Handoff:** [[AI-Memory/Agent Handoff]]
- **Session Log:** [[AI-Memory/Sessions/Session Log]]
- **Human Development Frameworks:** [[Frameworks/Human Development Frameworks]]
- **Dan Koe Principles:** [[Frameworks/Dan Koe Principles]]
