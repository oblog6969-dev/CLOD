---
title: "Dan Koe Principles"
created: 2026-09-16
updated: 2026-09-25
type: framework
status: complete
priority: high
progress: 100
tags:
  - project/lifeos
  - framework/psychology
  - framework/questionnaire
aliases:
  - DK-Principles
  - QuestionnaireDesign
---

# Dan Koe Principles

> [!summary]
> Based on Dan Koe's [How to fix your entire life in 1 day](https://letters.thedankoe.com/p/how-to-fix-your-entire-life-in-1). These are product interpretations for reflection, not clinical claims or guarantees.

- **Back to:** [[00 - Start Here]] | [[Frameworks/Human Development Frameworks]] | [[Decisions/Decisions Log]]

---

## 1. Identity-Based Change
You aren't where you want to be because you aren't the person who would be there. You must adopt the lifestyle and identity of the person who has achieved your goal *before* you can reach it.
- **App Feature:** The reset journey invites users to write their own answers, skip questions, and review a proposed plan. Never force an identity or invent answers for them.

## 2. Teleology (Goal-Oriented Behavior)
All behavior serves a goal, even if it's unconscious (e.g., procrastinating to protect oneself from the fear of failure).
- **App Feature:** Six adjustable reflection times can be exported to a calendar. Reminders require calendar import; the app itself does not send background notifications.

## 3. The Game of Life
To reach a state of flow and extreme focus, life must be structured like a video game.
- **Anti-vision (Stakes):** What happens if you lose or give up.
- **Vision (Win Condition):** How you win the game.
- **1-Year Goal (Mission):** The overarching quest.
- **1-Month Project (Boss Fight):** How you gain XP and level up.
- **Daily Levers (Quests):** Daily needle-moving tasks.
- **Constraints (Rules):** Boundaries that encourage creativity.
- **App Feature:** My direction contains the plan; Today surfaces a few actions and boundaries. Monthly progress is based on monthly steps, not arbitrary damage from daily clicks.

## Source fidelity

The article's morning list skips the number 12, leaving 14 actual questions. The evening has seven questions. The app uses original, gentler wording around these themes, six daytime prompts, and explicit user review before saving a plan. Reflection remains the user's work; AI does not supply personal answers.

## Guided journey implementation

LifeOS now assumes the person may not have read the article. The app explains the three source phases in plain language: morning reflection becomes "Explore what you want to change," daytime interrupts become "Notice your day as it happens," and evening synthesis becomes "Turn what you noticed into a direction." A separate walkthrough connects these phases to the app sections: Notice → Choose → Practice → Learn.

The guidance is authored orientation, not a psychological assessment. Recommendations are based on saved workspace activity and always lead to an editable user action. The person can skip questions, revise a direction, use the AI guide optionally, or continue without AI.

---

## Questionnaire Design

> [!note] Status: Implemented (2026-09-20) — this section is a historical design record.

### Source and scope

The product owner selected [Dan Koe's X article](https://x.com/thedankoe/article/2010751592346030461) as the foundation for the questionnaire and AI assistance. Direct access returned HTTP 403 during research. The accessible [newsletter](https://letters.thedankoe.com/p/how-to-fix-your-entire-life-in-1) is the working reference. Exact equivalence between the X and newsletter text has not been verified.

WHO-5, COM-B, and PHQ-4 are removed from the roadmap. Broader framework changes are deferred until user feedback supports them and the product owner chooses them.

> [!warning] Not a validated assessment
> This is an adaptation for reflection and planning. Do not present the article or the multiple-choice version as a validated psychological assessment.

### Product objective

Reduce time spent entering answers while helping people articulate their own direction. Tap-based choices with optional writing — it must preserve the meaning of each source prompt and leave room for an answer outside the supplied choices.

### Source mapping

Every question and AI follow-up must map to a source prompt or article concept. Record:
- Stable question ID and version (`m1`–`m14`, `e1`–`e7`)
- Source URL and section or prompt identifier
- The purpose retained from the source
- App-authored wording and selectable options
- Single-select or multi-select behavior
- Optional personal detail and skip handling
- The plan field it may help draft, if any

Choice wording is a LifeOS adaptation, not text authored or endorsed by Dan Koe. Avoid a personality score, mental-health score, inferred developmental stage, or psychological label.

### Proposed interaction

1. **Morning:** guide the person through the mapped prompts with choices, optional detail, and save/resume.
2. **Daytime:** offer brief source-linked reflection prompts. Let the person choose timing and skip them.
3. **Evening:** use confirmed answers to propose an editable direction and practical next actions.
4. **Ongoing use:** surface the accepted daily actions and allow the person to revisit their direction.

Display one question at a time with clear progress, Previous, Skip, and Save and exit. Use native radio buttons or checkboxes with visible labels. Offer "Something else," "Not sure," and an optional text field. Never force a predefined choice to stand in for a person's identity, motivation, or goals.

### AI role

AI helps interpret and organize what the person actually supplies. It can:
- Summarize selected answers and invite correction.
- Ask a short contextual follow-up linked to the current source concept.
- Help clarify a difference between a stated direction and a reported action.
- Draft plan wording and suggest practical actions for explicit acceptance.

The core flow must work without an AI connection. Keep existing explicit sharing consent and explicit acceptance before adding actions or replacing plan content.

### Implementation completed (2026-09-20)

- **Baseline Assessment (`src/lib/assessment.ts`)**: 8 situational psychometric questions calibrated across MatchWise frameworks.
- **MSQ Catalog (`src/lib/questionnaire.ts`)**: All 14 morning and 7 evening prompts with tap-selectable cards, multi-select, and personal nuance fields.
- **Dynamic AI Generation (`/api/ai/questions`)**: Generates 3–4 tailored contextual choices using active goals and archetype profile when connected.
- **Auto-Plan Synthesis (`synthesizePlanFromAnswers`)**: Synthesizes chosen options directly into the Direction Draft.
- **Interactive UI (`WorkspaceForms.tsx` & `BaselineAssessmentModal.tsx`)**: Responsive option cards, badges, checks, and theme persistence.

---

## 🔗 Vault Navigation

- **Back:** [[00 - Start Here]]
- **Human Development Frameworks:** [[Frameworks/Human Development Frameworks]]
- **Tech Stack:** [[Frameworks/Tech Stack]]
- **Decisions:** [[Decisions/Decisions Log]]
