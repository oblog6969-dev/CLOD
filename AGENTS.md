<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## LifeOS project agreement

LifeOS helps people reflect for a day and practice small actions afterward. The person writes their own answers; never invent achievements, identities, or personal goals. Keep the interface calm, plain-spoken, accessible, and usable on phones.

Read `README.md`, `LifeOS-Vault/Decisions/Decisions Log.md`, and `LifeOS-Vault/Frameworks/Dan Koe Principles.md` before changing the product flow. The vault is a human-readable project index, not a runtime database.

### Vault as project memory (mandatory for all agents)

The `LifeOS-Vault/AI-Memory/` folder is the **shared project memory** for every agent (Claude, Cursor, Codex, Gemini, Antigravity, or any future tool). Follow this protocol on every session without exception.

**At the start of every session:**
1. Read `LifeOS-Vault/AI-Memory/Agent Handoff.md` to understand the current project state, environment constraints, and suggested next tasks.
2. Read `LifeOS-Vault/AI-Memory/Bugs & Issues.md` to check for open or in-progress bugs before writing code.
3. Check `LifeOS-Vault/AI-Memory/Future Tasks.md` for your task's context and priority level.
4. If touching design decisions or framework boundaries, also read `LifeOS-Vault/Decisions/Decisions Log.md` and `LifeOS-Vault/Decisions/Decisions Log.md` for relevant context.

**During a session:**
- If you discover a bug (even one you immediately fix), add it to `LifeOS-Vault/AI-Memory/Bugs & Issues.md` with status `resolved`.
- If you find something that should be done later, add it to `LifeOS-Vault/AI-Memory/Future Tasks.md` in the appropriate priority section.

**At the end of every session:**
1. Add a new `## Session YYYY-MM-DD — Agent Name` entry (newest first) to `LifeOS-Vault/AI-Memory/Sessions/Session Log.md` documenting: what was done, files changed, test results (actual counts), git commit hash, and any open items.
2. Rewrite `LifeOS-Vault/AI-Memory/Agent Handoff.md` with the current project state, updated suggestions, and any new environment gotchas discovered.
3. Update `LifeOS-Vault/Progress/00 - Dashboard.md` to add completed items to the Implemented checklist and update verification counts.
4. Update `LifeOS-Vault/Decisions/Decisions Log.md` with any architectural or product decisions made.

**Windows environment constraint (this machine only):**
PowerShell blocks `npm.ps1` due to execution policy. Always invoke npm through cmd:
```
cmd.exe /c npm test
cmd.exe /c npm run build
cmd.exe /c npx playwright test
```

### Collaboration between development agents

- Establish a bounded task and file ownership before parallel editing. Use isolated worktrees when multiple agents would touch the same files.
- Roles may include product/protocol review, domain and storage engineering, interface/accessibility work, and independent verification. Roles are development responsibilities, not AI personas shown to users.
- Handoffs must state the objective, files changed, data/schema implications, commands run with their results, and remaining limitations. Never claim testing that was not performed.
- Preserve existing user changes. Do not commit, publish, reset history, or send user reflections to a model/service unless explicitly authorized.
- Record consequential decisions in `LifeOS-Vault/Decisions/Decisions Log.md`. Keep vault status aligned with actual verification.

### Invariants and verification

- Progress is derived from dated completion records. Undo reverses rewards; daily actions never complete monthly project steps.
- Use local calendar dates for daily records and ISO timestamps for individual reflections. Preserve historical records when archiving tasks.
- Validate imported/persisted data at runtime. Keep legacy storage untouched and back up the current workspace before replacement.
- Failed saves must remain visible. Never overwrite corrupt storage with a default state automatically.
- Use semantic buttons, associated labels, native modal dialogs, visible focus, and reduced-motion support.
- Before handoff: `cmd.exe /c npm run lint`, `cmd.exe /c npm test`, `cmd.exe /c npm run build`, and `cmd.exe /c npx playwright test` for affected interactive flows. Report failures or environment blockers accurately.
- Completion means the implementation exists, relevant checks pass, and limitations are documented. A checkbox alone is not evidence.
