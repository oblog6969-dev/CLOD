---
title: "AI Agent Memory — Index"
created: 2026-09-25
updated: 2026-09-28
type: moc
status: active
priority: high
tags:
  - project/lifeos
  - type/ai-memory
  - type/moc
aliases:
  - AgentMemory
  - AIIndex
---

# 🤖 AI Agent Memory — Index

> [!important] READ THIS FIRST — All AI Agents
> This folder is the **project memory** for every AI agent (Claude, Cursor, Codex, Gemini, Antigravity, or any future agent) working on LifeOS. Before writing a single line of code you **must** read this index and the notes it links to. After your session you **must** update the relevant notes here.

---

## 📚 Memory Sections

| Section | Purpose | Link |
|---------|---------|------|
| **Progress Log** | Chronological record of what each session accomplished | [[Progress/00 - Dashboard\|Progress Dashboard]] |
| **Session Log** | Per-agent session notes with files changed and test results | [[AI-Memory/Sessions/Session Log\|Session Log]] |
| **Bugs & Issues** | Open bugs, resolved bugs, and known limitations | [[AI-Memory/Bugs & Issues\|Bugs & Issues]] |
| **Future Tasks** | Planned features, backlog, and ideas | [[AI-Memory/Future Tasks\|Future Tasks]] |
| **Agent Handoff** | Structured handoff notes between sessions | [[AI-Memory/Agent Handoff\|Agent Handoff]] |
| **Decisions Log** | Product and engineering decisions (the former `docs/` content now lives in the vault) | [[Decisions/Decisions Log\|Decisions Log]] |
| **Database Rules** | Roles, DB lock, invariants, and approval rules for the Supabase backend and synced data. **Mandatory before any DB, sync, State, history, or AI-context change** | [[Frameworks/Database Rules\|Database Rules]] |

---

## 🗺️ Where to Navigate Next

- **Starting a new session?** → Read [[AI-Memory/Agent Handoff|Agent Handoff]] first, then [[AI-Memory/Bugs & Issues|Bugs & Issues]] for any blocking issues.
- **Finished a session?** → Update [[AI-Memory/Sessions/Session Log|Session Log]] with **agent name + model**, close resolved bugs in [[AI-Memory/Bugs & Issues|Bugs & Issues]], update [[Progress/00 - Dashboard|Progress Dashboard]] attribution table if needed, and update [[AI-Memory/Agent Handoff|Agent Handoff]].
- **Adding a feature?** → Cross it off [[AI-Memory/Future Tasks|Future Tasks]] when done. Add a session entry.
- **Found a bug?** → Log it in [[AI-Memory/Bugs & Issues|Bugs & Issues]] before touching other code.
- **Touching the database, sync, or the `State` shape?** → Read [[Frameworks/Database Rules|Database Rules]], check the **DB lock** in [[AI-Memory/Agent Handoff|Agent Handoff]], and check migration drift first.

---

## 🔗 Vault Navigation

- **Back to root:** [[00 - Start Here]]
- **Project progress:** [[Progress/00 - Dashboard]]
- **Frameworks:** [[Frameworks/Tech Stack]], [[Frameworks/Database Rules]], [[Frameworks/Human Development Frameworks]]
