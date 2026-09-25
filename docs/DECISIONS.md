# Product and engineering decisions

## 2026-09-16: daily-use redesign

- Replace the default fictional creator persona with an empty workspace. Preserve existing stored content through migration rather than guessing which old values belong to a real person.
- Organize the interface around Today, Your reset, My direction, and Reflections. Use warm neutrals and green, readable typography, restrained feedback, and a mobile bottom navigation.
- Adapt the source into 14 morning and seven evening questions plus six daytime reminders. Let people skip, revisit, and revise; answers remain their own. The generated plan draft is deterministic and requires explicit saving.
- Derive points and levels from completion records. Monthly project steps are independent from daily priorities. There are no repeatable boss rewards and no asymmetric damage/undo logic.
- Store daily records by local calendar date and reflection timestamps in ISO format. Rollover checks run on focus and at a 30-second interval; records are not destroyed at midnight.
- Keep runtime validation and migrations separate from React. Use a single external-store subscription instead of custom events plus duplicate React state. Remove the unused animation dependency and remote font downloads.
- Use native `dialog` for modal focus containment, Escape support, background inertness, and focus restoration. Honor reduced-motion preferences.
- Keep the original v1 key unchanged. Before destructive workspace replacement, create one local recovery copy. Provide portable JSON exports and explicit import validation.
- Development agents coordinate through repository instructions, bounded file ownership, documented decisions, and verifiable handoffs. Runtime AI coaching remains a separate future feature, not an implied capability.

## 2026-09-19: optional AI guide

- Add an OpenAI Responses API guide as an explicit, user-triggered feature. It analyzes a snapshot and returns structured observations, recommendations, and one question. It does not run in the background.
- Keep API keys out of client code and persistent LifeOS data. Validate them server-side and place an AES-256-GCM encrypted value in a scoped HttpOnly, same-site session cookie. A configured `LIFEOS_SESSION_SECRET` supports restarts and multiple instances; local development can use an ephemeral process secret.
- Ask for consent by data category on every analysis screen. Direction and active daily steps begin selected. Private reset answers and journal reflections begin unselected. Empty categories are omitted from requests.
- Send Responses API requests with `store: false`, a strict JSON schema, bounded input sizes, a timeout, and a per-session rate limit. OpenAI organization controls still apply.
- Keep results in component memory only. Suggestions require explicit acceptance before creating a daily step and never overwrite the plan.

## 2026-09-19: provider-neutral AI connections

- Support OpenAI Responses plus DeepSeek, NVIDIA NIM, and custom OpenAI-compatible Chat Completions. User-entered model IDs allow newly released provider models without an application release.
- Keep fixed URLs for provider presets. Require public HTTPS and block resolved private addresses for custom endpoints by default; private/self-hosted endpoints require an explicit server opt-in.
- Validate through the provider models endpoint, disable redirects, retain credentials only in the encrypted scoped cookie, and re-check custom endpoint safety before analysis.
- Use strict JSON Schema output for OpenAI. Compatible providers receive the same schema in the prompt; DeepSeek also receives JSON-object formatting. Every result passes shared runtime validation.

## 2026-09-20: article-led questionnaire direction (design decision)

- The product owner selected Dan Koe's article at https://x.com/thedankoe/article/2010751592346030461 as the foundation for the questionnaire and AI assistance. Use the author's newsletter already referenced by this repository as the accessible working reference; exact X text equivalence remains unverified because direct access returned HTTP 403.
- Replace the proposed psychological screening roadmap with source-mapped, tap-based reflection. WHO-5, COM-B, and PHQ-4 are outside the current scope. Later modifications should follow user feedback and an explicit product decision.
- Preserve the source's reflection-to-action structure and the person's authorship of their plan. Multiple-choice wording and AI follow-ups are app adaptations, not validated psychological measurements.
- At this decision point, questionnaire implementation remained pending and no runtime behavior changed. It was implemented later the same day; see **human development frameworks & AI MSQ reflection** below and `docs/QUESTIONNAIRE-DESIGN.md`.

## 2026-09-20: guidance for users new to the article

- Implement a welcome and an expandable journey map across Your reset, My direction, Today, and Reflections. Explain the optional AI guide and backup settings too. No prior knowledge of the article is assumed.
- Derive next-step suggestions and saved-item counts from the existing workspace. Counts describe actual saved content, not completion of personal growth. No new data schema or invented user goals are introduced.
- Explain each reset phase and all six plan fields where they are used. Give direct controls to open the relevant form or focus the next section; restore main-content focus on section navigation.
- Keep guidance optional to expand for returning users. These are authored app-use recommendations, not automatic AI analysis or psychological screening. At this milestone, the multiple-choice questionnaire was still a separately documented feature; it was implemented later the same day.

## 2026-09-20: expanded AI providers and conversation

- Add Groq, Hugging Face Inference Providers, and OpenRouter presets alongside OpenAI, DeepSeek, and NVIDIA NIM. They use fixed public HTTPS endpoints and the existing provider-neutral Chat Completions adapter; custom endpoints remain available for other compatible services.
- Treat free access as provider-controlled rather than guaranteed by LifeOS. Free credits, free model routing, quotas, pricing, model availability, and data retention can change and must be disclosed in the UI/documentation.
- Report provider connection health after the server-side `/models` validation: green/working for responsive checks, yellow/slow at 3 seconds or more, and red/down for validation or reachability errors.
- Add a user-triggered follow-up chat after analysis. Send only selected context and bounded recent messages, keep the transcript in component memory for the page session, apply the existing server-side session-key protection and rate limits, and never persist chat content in LifeOS data.

## 2026-09-20: human development frameworks & AI MSQ reflection

- The product owner instructed to utilize the clinical and consciousness frameworks from the MatchWise project (`D:\AI\MatchWise`) to eliminate manual essay writing in morning and evening reflections.
- Integrated six core frameworks: Hartman Color Code (Core Motives: Red, Blue, White, Yellow), David Hawkins Map of Consciousness (Force <200 vs Power ≥200), Abraham Hicks Emotional Guidance (22 set points), The Birkman Method (Usual, Needs, Stress triggers), DISC Assessment (Pace & Focus), and Schwartz Basic Human Values.
- Implemented an initial 8-question Baseline Assessment (`assessment.ts`) that determines the user's archetype profile and calibrates subsequent prompts.
- Transformed all 14 morning (`m1`–`m14`) and 7 evening (`e1`–`e7`) Dan Koe prompts into tap-selectable MSQ cards (`questionnaire.ts`) with multi-select support, archetype alignment, and optional personal nuance input.
- Added `/api/ai/questions` endpoint to dynamically generate 3–4 tailored contextual choices using active goals and psychometric profile when an AI provider is connected, falling back cleanly to curated framework options when offline.
- Added automated plan drafting from MSQ answers, synthesizing selected choices into the Anti-Vision, Vision, Identity, Daily Levers, and Constraints.
- State migration and backup validation (`domain.ts`) safely support `assessmentProfile` and `selectedOptions` while maintaining strict schema validity and full backward compatibility.

## 2026-09-21: optional Google Translate

- Add an on-demand Settings tool using Cloud Translation Basic (v2). It translates only text that the user types or explicitly selects from their LifeOS writing, leaves source data unchanged, and does not persist translations.
- Keep `GOOGLE_TRANSLATE_API_KEY` server-only. Require the user/operator to enable Google Cloud Translation and billing, disclose Google’s own usage controls, bound requests to 5,000 characters, validate target languages, apply a rate limit, and never expose the key to the browser.

## 2026-09-25: native Arabic workspace and browser translation compatibility

- Add a user-controlled English/Arabic switch in the workspace header. Persist only the locale preference in browser storage; never translate, modify, or send the person's saved writing when they change interface language.
- Apply `lang="ar"` and `dir="rtl"` for Arabic, including an RTL sidebar and controls layout plus Arabic date formatting. Keep English as the default when there is no saved preference, while using an Arabic browser preference as the initial fallback.
- Keep browser translation separate from the optional Cloud Translation writing tool. Declare the page's English source language and explicitly opt it into browser translation so Chrome can translate into other languages without a Google Cloud key.
- Verify locale selection, RTL document attributes, and persistence with end-to-end coverage alongside the existing full browser suite.

## 2026-09-25: Arabic depth and LifeOS-owned assessment copy

- Localize the full baseline assessment (8 questions, options, archetype results) via `assessment-i18n.ts` and `locale/assessment-ar.mjs`. Wording is LifeOS-authored for the one-day reset; framework names are educational labels only (see `docs/FRAMEWORK-MODELS.md`).
- Polish Arabic MSQ headings, labels, and subtexts (`locale/msq-ar-*.mjs`, generator `scripts/gen-msq-ar.mjs`).
- Extend Arabic to daytime check-ins, reset/settings chrome, and AI guide UI (`locale/assistant.ts`, `locale/workspace.ts`).

## 2026-09-25: high-impact product polish (i18n, Maslow, plan review)

- Extend Arabic to reset MSQ flows, baseline assessment chrome, and settings psychometric copy via `src/lib/locale/*` while keeping the person’s saved writing untouched.
- Add educational Maslow need-tier derivation (`src/lib/maslow.ts`) aligned with MatchWise v3.0 concepts; store `maslowCenter`, orientation, and tier shares on the assessment profile as illustrative heuristics, not clinical scores.
- Add MSQ source traceability metadata (`src/lib/msq-meta.ts`) mapping Dan Koe newsletter prompts to plan fields.
- Plan draft review shows per-field status vs saved direction and lets the person revert individual fields to saved text before committing.

## Remaining constraints

Browser storage offers no cross-device sync or transactional multi-tab edits. Reflection-day calendar reminders require calendar import. V1 logs used human-readable timestamps, so missing timestamps cannot be recovered accurately. Keep original exports for archival access.
