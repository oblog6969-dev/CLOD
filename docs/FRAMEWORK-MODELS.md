<!--
  Vault cross-reference: LifeOS-Vault/Docs/Project Documentation Index.md
  Related vault note:    LifeOS-Vault/Frameworks/Human Development Frameworks.md
  Do NOT port MatchWise instruments. See vault note for boundary policy.
-->

# Human development models in LifeOS

LifeOS uses **conceptual models** from personal-development literature (and ideas aligned with the MatchWise vault) to shape reflection—not to replicate MatchWise questionnaires, scoring, or dyadic reports.

## Models we reference (not copied instruments)

| Model | LifeOS use |
|-------|------------|
| Hartman Color Code (motives) | Sort MSQ choices; baseline motive |
| DISC (pace & focus) | Baseline rhythm; daily execution style |
| Birkman (needs & stress) | Baseline needs; stress pattern hints |
| Hawkins Map of Consciousness | Baseline inner posture (educational scale) |
| Schwartz basic values | Baseline values; constraint suggestions |
| Hicks emotional continuum | Morning emotional set-point question |
| Maslow hierarchy (6 tiers) | Heuristic “center of gravity” on profile |
| Dan Koe one-day protocol | MSQ prompt mapping (`msq-meta.ts`) |

## What LifeOS owns

- All **baseline assessment** wording (`assessment.ts` + `locale/assessment-ar.mjs`)
- All **MSQ** options and Arabic copy (`locale/msq-ar-*.mjs`)
- **Archetype names** as reflection labels, not clinical types
- **Plan synthesis** rules (`synthesizePlanFromAnswers`)

MatchWise remains a separate educational project. When its vault adds models (e.g. Maslow v3.0), LifeOS may adopt the **idea** of a tiered need lens while keeping LifeOS-authored questions and results.
