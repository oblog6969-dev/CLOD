<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## LifeOS project agreement

LifeOS helps people reflect for a day and practice small actions afterward. The person writes their own answers; never invent achievements, identities, or personal goals. Keep the interface calm, plain-spoken, accessible, and usable on phones.

Read `README.md`, `docs/DECISIONS.md`, and `LifeOS-Vault/Frameworks/Dan Koe Principles.md` before changing the product flow. The vault is a human-readable project index, not a runtime database.

### Collaboration between development agents

- Establish a bounded task and file ownership before parallel editing. Use isolated worktrees when multiple agents would touch the same files.
- Roles may include product/protocol review, domain and storage engineering, interface/accessibility work, and independent verification. Roles are development responsibilities, not AI personas shown to users.
- Handoffs must state the objective, files changed, data/schema implications, commands run with their results, and remaining limitations. Never claim testing that was not performed.
- Preserve existing user changes. Do not commit, publish, reset history, or send user reflections to a model/service unless explicitly authorized.
- Record consequential decisions in `docs/DECISIONS.md`. Keep vault status aligned with actual verification.

### Invariants and verification

- Progress is derived from dated completion records. Undo reverses rewards; daily actions never complete monthly project steps.
- Use local calendar dates for daily records and ISO timestamps for individual reflections. Preserve historical records when archiving tasks.
- Validate imported/persisted data at runtime. Keep legacy storage untouched and back up the current workspace before replacement.
- Failed saves must remain visible. Never overwrite corrupt storage with a default state automatically.
- Use semantic buttons, associated labels, native modal dialogs, visible focus, and reduced-motion support.
- Before handoff: `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e` for affected interactive flows. Report failures or environment blockers accurately.
- Completion means the implementation exists, relevant checks pass, and limitations are documented. A checkbox alone is not evidence.
