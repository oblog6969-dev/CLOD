---
title: "FIRO-B Reciprocity"
created: 2026-09-08
updated: 2026-09-08
type: framework
status: implemented
tags:
  - framework/interpersonal
  - framework/firo-b
  - psychometrics
aliases:
  - FIRO-B
  - Fundamental Interpersonal Relations Orientation
---

# ⚖️ FIRO-B (Fundamental Interpersonal Relations Orientation)

> [!info] Framework Overview
> **Originator:** Dr. William Schutz  
> **Core Concept:** Interpersonal compatibility hinges on the reciprocity between what you **Express** toward others ($e$) and what you **Want** from others ($w$).  
> **Visualizer:** Comparative Initiation vs. Wanted Reciprocity Balance Scales (`renderFiroExchange`)  
> **Implementation Files:** `traits.js`, `compatibility.js`, `script.js`

---

## 🧭 The 3 Interpersonal Dimensions

| Dimension | Expressed ($e$) — What you do | Wanted ($w$) — What you seek |
| :--- | :--- | :--- |
| **Inclusion (I)** | I initiate social contact, invite others, bring people together. | I want to be included, invited, and welcomed into groups. |
| **Control (C)** | I take charge, direct decisions, organize agendas. | I want guidance, clear direction, and decisive leadership. |
| **Affection (A)** | I express warmth, emotional vulnerability, and closeness. | I want others to initiate deep emotional warmth and validation. |

---

## 🔗 Reciprocal Compatibility Formula
Dyadic friction is minimized when Partner A's Expressed behavior meets Partner B's Wanted expectation:
$$\text{Friction} \propto |e_A - w_B| + |e_B - w_A|$$

Upstream Link: [[00 - Progress Dashboard]]  
Milestone: [[M05 - Interactive Visualizations Engine]]
