---
title: "TKI Conflict Modes"
created: 2026-09-08
updated: 2026-09-08
type: framework
status: implemented
tags:
  - framework/conflict
  - framework/tki
  - psychometrics
aliases:
  - Thomas-Kilmann Conflict Mode
  - TKI
---

# ⚔️ Thomas-Kilmann Conflict Mode Instrument (TKI)

> [!info] Framework Overview
> **Originators:** Kenneth W. Thomas & Ralph H. Kilmann  
> **Axes:** Assertiveness (satisfying own concerns) vs. Cooperativeness (satisfying other's concerns)  
> **Visualizer:** 5-Step Demand-Withdrawal Flowchart (`renderDyadicConflictLoop`)  
> **Implementation Files:** `traits.js`, `compatibility.js`, `script.js`

---

## 🧭 The 5 Conflict Modes

```text
                  High Assertiveness
                         ▲
           [ Competing ] │       [ Collaborating ]
           (My way)      │       (Our way / Synergy)
                         │
                         │   [ Compromising ]
                         │   (Halfway / Split difference)
                         │
Low Assertiveness ───────┼─────────────────────────── High Cooperativeness
           [ Avoiding ]  │       [ Accommodating ]
           (No way)      │       (Your way)
                         ▼
                  Low Assertiveness
```

---

## 🔗 Dyadic Conflict Resolution
- **Competing vs. Avoiding:** Highest escalation hazard (demand-withdrawal spiral).
- **Collaborating:** Ideal for foundational core issues; high energy requirement.
- **Compromising:** Pragmatic solution for daily operational logistics.

Upstream Link: [[00 - Progress Dashboard]]  
Milestone: [[M05 - Interactive Visualizations Engine]]
