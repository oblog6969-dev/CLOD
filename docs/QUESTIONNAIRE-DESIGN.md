# LifeOS questionnaire: Dan Koe foundation

Updated 2026-09-20. Status: product direction confirmed; questionnaire implementation pending.

## Source and scope

The user's selected foundation is [Dan Koe's X article](https://x.com/thedankoe/article/2010751592346030461). Direct access returned HTTP 403 during research. The author's accessible [newsletter with the same title, How to fix your entire life in 1 day](https://letters.thedankoe.com/p/how-to-fix-your-entire-life-in-1) is the working reference already used by this repository. Exact equivalence between the X and newsletter text has not been verified.

The article is the first version's product foundation. Remove the earlier WHO-5, COM-B, and PHQ-4 proposal from the roadmap. Broader framework changes are deferred until user feedback supports them and the product owner chooses them.

The article describes morning reflection, daytime interruptions to habitual behavior, and evening synthesis. Its planning structure includes an anti-vision, vision, yearly goal, monthly project, daily actions, and constraints. Preserve those connections throughout the questionnaire and AI assistance.

This is an adaptation for reflection and planning. Do not present the article or our multiple-choice version as a validated psychological assessment.

## Product objective

Reduce time spent entering answers while helping people articulate their own direction. The proposed interaction change is tap-based choices with optional writing. It must preserve the meaning of each source prompt and leave room for an answer outside the supplied choices.

Keep the existing deeper writing route and historical answers accessible. Reducing typing does not establish that the depth or effect of a full reflection day can be reproduced in a few minutes. Measure completion time and usefulness before making time or outcome claims.

## Source mapping before implementation

Create a versioned question catalog. Every initial question and AI follow-up must map to a source prompt or article concept. Record:

- Stable question ID and version.
- Source URL and section or prompt identifier.
- The purpose retained from the source.
- App-authored wording and selectable options.
- Single-select or multi-select behavior.
- Optional personal detail and skip handling.
- The plan field it may help draft, if any.

Choice wording is a LifeOS adaptation, not text authored or endorsed by Dan Koe. Avoid a personality score, mental-health score, inferred developmental stage, or psychological label.

The existing repository maps 14 morning and seven evening prompts from the newsletter; its morning numbering skips 12. Preserve source identifiers and check the X version before claiming exact X prompt coverage.

## Proposed interaction

1. Morning: guide the person through the mapped prompts with choices, optional detail, and save/resume.
2. Daytime: offer brief source-linked reflection prompts. Let the person choose timing and skip them.
3. Evening: use confirmed answers to propose an editable direction and practical next actions.
4. Ongoing use: surface the accepted daily actions and allow the person to revisit their direction.

This preserves the source structure while adapting input effort. It does not introduce an unrelated daily wellbeing questionnaire.

Display one question at a time with clear progress, Previous, Skip, and Save and exit. Use native radio buttons or checkboxes with visible labels. Offer “Something else,” “Not sure,” and an optional text field where appropriate. Never force a predefined choice to stand in for a person's identity, motivation, or goals.

## AI role

AI helps interpret and organize what the person actually supplies. It can:

- Summarize selected answers and invite correction.
- Ask a short contextual follow-up linked to the current source concept.
- Help clarify a difference between a stated direction and a reported action.
- Draft plan wording and suggest practical actions for explicit acceptance.

Use a bounded follow-up flow, initially up to two optional questions per session, with a visible way to finish. This cap is a product hypothesis to evaluate with users. Store the actual generated question and offered choices so the answer remains interpretable later.

Generated questions need neutral language, distinct options, and an escape from the supplied choices. Prefer a reviewed question bank for the initial release; generated follow-ups must remain within the mapped source concepts.

Describe observations tentatively and show their basis. An apparent contradiction warrants clarification, not a claim that the user is abnormal, dishonest, or ill. Do not invent personal history, hidden motives, diagnoses, or aspirations. The person's corrections take priority over AI interpretation.

The core flow must work without an AI connection. Keep existing explicit sharing consent and explicit acceptance before adding actions or replacing plan content.

## Data and verification

Store question/version, source mapping, selected option IDs, optional text, timestamps, and whether a question was authored or generated. Distinguish skipped, incomplete, and completed responses. Do not derive unsupported psychological scores.

Add runtime validation and safe migration for new records, preserving existing written answers and import/export recovery. Keep questionnaire sharing with AI separately selectable and off by default.

Verify source coverage, neutral choices, save/resume, skipped answers, editable summaries, accepted actions, consent, AI failure fallback, keyboard operation, mobile layout, both themes, and data migration. Run the repository's required lint, unit, build, and browser checks once code changes exist.

## Feedback-led iteration

Start with the agreed article foundation and collect feedback on effort, clarity, whether choices fit, and usefulness of the resulting plan. Evaluate wording and flow changes against that feedback. Broader framework additions require a later explicit product decision.

Current delivery is documentation only. No new questionnaire, data schema, AI behavior, or deployment has been implemented.
