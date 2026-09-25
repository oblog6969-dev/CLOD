---
title: "Technology Stack"
created: 2026-09-16
updated: 2026-09-25
type: framework
status: complete
priority: high
progress: 100
tags:
  - project/lifeos
  - framework/tech
aliases:
  - TechStack
---

# Technology Stack

> [!tip] Tech Stack Summary
> LifeOS is built for speed, aesthetics, and modern web standards.

## Frontend
- **Framework:** Next.js (React)
- **Styling:** TailwindCSS with project CSS variables and component styles for warm neutral surfaces, green accents, and an accessible dark theme
- **Motion:** restrained CSS transitions with reduced-motion support; no animation library
- **Icons:** Lucide React

## Data & Storage
- **Local Storage:** validated v2 state, preserved v1 source, a recovery backup, and JSON import/export. React subscribes through `useSyncExternalStore`.
- **Current Scope:** Browser-local storage only. Cloud accounts, authentication, and cross-device sync are deliberately outside this version; Supabase is an uncommitted future idea, not a planned dependency.

## AI Integration
- **Providers:** OpenAI, DeepSeek, NVIDIA NIM, Groq, Hugging Face Inference Providers, OpenRouter, and custom public OpenAI-compatible endpoints.
- **Transport:** OpenAI Responses for OpenAI; Chat Completions for compatible providers.
- **Security:** API keys are validated server-side and sealed in an AES-256-GCM HttpOnly session cookie scoped to `/api/ai`; keys and chat are not persisted in LifeOS local data.
- **Interaction:** User-selected context is analyzed on demand, with a page-session-only follow-up chat.
- **Health:** Provider validation reports working, slow, or down based on response time and errors.
- **Free access:** Some providers offer free credits or free models, but availability, quotas, pricing, and data controls remain provider-specific.

## Translation
- **Provider:** Optional Google Cloud Translation Basic (v2) integration for text the person explicitly chooses.
- **Security:** `GOOGLE_TRANSLATE_API_KEY` is a server-only environment variable; translation requests are bounded, target-language validated, same-origin protected, and rate-limited.
- **Privacy:** Translations are shown in the Settings page session only. Original LifeOS writing is not altered or saved as a translation.

## Design rules
1. Warm light surfaces, green accents, clear focus states, and restrained feedback.
2. System sans-serif for interface text and a system serif for editorial moments. No remote font downloads.
3. Desktop sidebar, mobile bottom navigation, native accessible dialogs, and semantic form labels.

## Checks
Use `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e`. Domain tests use Node's test runner; browser tests use Playwright against a production server.
