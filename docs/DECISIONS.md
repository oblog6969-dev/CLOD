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

## 2026-09-20: article-led questionnaire direction

- The product owner selected Dan Koe's article at https://x.com/thedankoe/article/2010751592346030461 as the foundation for the questionnaire and AI assistance. Use the author's newsletter already referenced by this repository as the accessible working reference; exact X text equivalence remains unverified because direct access returned HTTP 403.
- Replace the proposed psychological screening roadmap with source-mapped, tap-based reflection. WHO-5, COM-B, and PHQ-4 are outside the current scope. Later modifications should follow user feedback and an explicit product decision.
- Preserve the source's reflection-to-action structure and the person's authorship of their plan. Multiple-choice wording and AI follow-ups are app adaptations, not validated psychological measurements.
- Questionnaire implementation remains pending. See docs/QUESTIONNAIRE-DESIGN.md for the revised design and acceptance criteria; no runtime behavior changes accompany this decision.

## 2026-09-20: guidance for users new to the article

- Implement a welcome and an expandable journey map across Your reset, My direction, Today, and Reflections. Explain the optional AI guide and backup settings too. No prior knowledge of the article is assumed.
- Derive next-step suggestions and saved-item counts from the existing workspace. Counts describe actual saved content, not completion of personal growth. No new data schema or invented user goals are introduced.
- Explain each reset phase and all six plan fields where they are used. Give direct controls to open the relevant form or focus the next section; restore main-content focus on section navigation.
- Keep guidance optional to expand for returning users. These are authored app-use recommendations, not automatic AI analysis or psychological screening. The multiple-choice questionnaire remains a separately documented, unimplemented feature.

## 2026-09-20: expanded AI providers and conversation

- Add Groq, Hugging Face Inference Providers, and OpenRouter presets alongside OpenAI, DeepSeek, and NVIDIA NIM. They use fixed public HTTPS endpoints and the existing provider-neutral Chat Completions adapter; custom endpoints remain available for other compatible services.
- Treat free access as provider-controlled rather than guaranteed by LifeOS. Free credits, free model routing, quotas, pricing, model availability, and data retention can change and must be disclosed in the UI/documentation.
- Report provider connection health after the server-side `/models` validation: green/working for responsive checks, yellow/slow at 3 seconds or more, and red/down for validation or reachability errors.
- Add a user-triggered follow-up chat after analysis. Send only selected context and bounded recent messages, keep the transcript in component memory for the page session, apply the existing server-side session-key protection and rate limits, and never persist chat content in LifeOS data.

## Remaining constraints

Browser storage offers no cross-device sync or transactional multi-tab edits. Reflection-day calendar reminders require calendar import. V1 logs used human-readable timestamps, so missing timestamps cannot be recovered accurately. Keep original exports for archival access.
