---
title: "Start Here - LifeOS Project MOC"
created: 2026-09-16
updated: 2026-09-25
type: milestone
status: active
priority: high
progress: 100
tags:
  - project/lifeos
  - status/active
  - type/moc
aliases:
  - MOC
  - LifeOS
---

# LifeOS - A Little More Intentional

> [!info]
> This is the Map of Content (MOC) for the LifeOS project. LifeOS is a web application designed to help users transform their lives based on Dan Koe's philosophy of identity change, teleology, negative visualization, and video game mechanics.

## 🎯 Vision
Help people reflect for a day, choose their own direction, and return to meaningful daily actions. A calm, accessible interface supports this work without promising overnight transformation.

## 📂 Vault Structure
- [[Progress/00 - Dashboard|Progress Dashboard]]
- [[Frameworks/Human Development Frameworks|Human Development Frameworks (MatchWise Psychometrics)]]
- [[Frameworks/Dan Koe Principles|Dan Koe's Principles & Questionnaire Design]]
- [[Frameworks/Tech Stack|Technology Stack]]
- [[Decisions/Decisions Log|📋 Decisions Log]]
- [[AI-Memory/00 - AI Agent Memory Index|🤖 AI Agent Memory (Bugs, Tasks, Handoff, Session Log)]]

## 🕹️ System Architecture
1. **Today:** recurring priorities, local-date progress, mood, boundaries, and quick reflection.
2. **Your reset:** morning questions, calendar reminders, and evening synthesis.
3. **My direction:** a user-approved plan and independent monthly project steps.
4. **Reflections:** dated notes and a seven-day activity view.
5. **Settings:** data export/import, recovery, archives, and a protected reset.

## 🤖 AI Collaboration Guide
This vault acts as the shared knowledge repository for AI agents working on LifeOS:
1. **Read [[AI-Memory/00 - AI Agent Memory Index|AI Agent Memory]] first** — contains [[AI-Memory/Agent Handoff|Agent Handoff]], [[AI-Memory/Bugs & Issues|Bugs & Issues]], [[AI-Memory/Future Tasks|Future Tasks]], and [[AI-Memory/Sessions/Session Log|Session Log]].
2. Update `Progress/00 - Dashboard.md` when introducing new features or completing milestones.
3. Read `Frameworks/Tech Stack.md` and `Frameworks/Dan Koe Principles.md` before altering core abstractions.
4. Follow `AGENTS.md` for file ownership, handoffs, validation, and data invariants. Record decisions in `LifeOS-Vault/Decisions/Decisions Log.md`. Paths are relative to the repository root.
5. Multi-agent collaboration means development cooperation. The runtime includes an optional, user-triggered AI guide when a person connects a supported provider; there is no autonomous coach, background AI activity, or silent plan editing.
