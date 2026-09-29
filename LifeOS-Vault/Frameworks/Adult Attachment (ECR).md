---
title: "Adult Attachment (ECR)"
created: 2026-09-08
updated: 2026-09-08
type: framework
status: implemented
tags:
  - framework/attachment
  - framework/ecr
  - psychometrics
aliases:
  - Attachment Theory
  - ECR
---

# ⚓ Adult Attachment (Experiences in Close Relationships)

> [!info] Framework Overview
> **Originators:** John Bowlby, Mary Ainsworth, Brennan, Clark, & Shaver (ECR-R)  
> **Axes:** Attachment Anxiety (Fear of Abandonment) vs. Attachment Avoidance (Fear of Intimacy/Vulnerability)  
> **Visualizer:** 2D Continuous Coordinate Plane (`renderAttachmentCoordinateMap`)  
> **Implementation Files:** `traits.js`, `compatibility.js`, `script.js`

---

## 🧭 The 4 Attachment Quadrants

```text
                  High Attachment Avoidance
                             ▲
              [ Avoidant ]   │   [ Fearful-Avoidant ]
             Dismissing      │      Disorganized
                             │
Low Anxiety ─────────────────┼───────────────── High Anxiety
                             │
               [ Secure ]    │     [ Anxious ]
              Autonomous     │     Preoccupied
                             ▼
                   Low Attachment Avoidance
```

---

## 🔗 The Anxious-Avoidant Dyadic Trap
The most pervasive relationship conflict loop is the **Demand-Withdrawal Escalation**:
1. Anxious partner feels connection fading $\rightarrow$ increases protest behavior, questions, emotional pressure.
2. Avoidant partner feels smothered and criticized $\rightarrow$ shuts down, withdraws, or stonewalls.
3. Avoidant withdrawal intensifies Anxious partner's fear of abandonment $\rightarrow$ escalation continues.
MatchWise provides specific bridge scripts and self-soothing tools to disrupt this loop.

Upstream Link: [[00 - Progress Dashboard]]  
Milestone: [[M05 - Interactive Visualizations Engine]]
