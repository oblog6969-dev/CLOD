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

## Remaining constraints

Browser storage offers no cross-device sync or transactional multi-tab edits. Reflection-day calendar reminders require calendar import. V1 logs used human-readable timestamps, so missing timestamps cannot be recovered accurately. Keep original exports for archival access.
