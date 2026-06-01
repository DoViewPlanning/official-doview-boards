# Changelog

## V1.2.1 — 2026-06-02

Conservative prompt/package patch release for the DoView Boards reference package.

### Included

- Strengthened prompt and config guidance so no-level, cross-link, and non-hierarchical How Pages use explicit `howLevel: null`, remain outside the numbered vertical hierarchy, and display `No level`.
- Strengthened link-annotation guidance so requested This–Then rationale, evidence, assumptions, supporting information, or explanations are specific to each exact source/target relationship, without repeated boilerplate or invented evidence.
- Strengthened Documentation Page clone guidance so explicit clone requests create real `.doc-clone` blocks in `savedState.docContent` using supported clone types and valid source keys.
- Strengthened box Display Text guidance so `detailText` stays blank/omitted unless the user asks for box-level supporting text; link rationale stays on links.
- Strengthened Traffic Light and priority guidance so optional overlays, display settings, and underlying fields remain neutral/unset unless explicitly requested.
- Corrected the Overview hint wording to say that How Pages show actions being taken to change outcomes.
- Updated public package, engine, builder, prompt, documentation, specification, and standalone example version references to `V1.2.1`.
- Updated the How Page JSON example so its cross-link page uses explicit `howLevel: null`.

### Preserved behaviours

- Existing saved-state/schema compatibility is preserved.
- Existing numbered vertical How Pages and How Box IDs such as `H001` remain unchanged.
- Builder validation, CLI behaviour, output assembly, and normalization are unchanged apart from version text.
- Existing This–Then, How, Documentation Page, clone, Display Text, Traffic Light, priority, save/copy/read-only, print, presentation, Board Chat, and Page View runtime behaviour is preserved apart from the Overview wording correction and version labels.

### Validation

- Release validation covered JavaScript syntax checks, JSON parsing, builder assembly checks, no-level How Page rendering, relationship-specific link annotations, Documentation Page clone blocks, neutral default Display Text/Traffic Light/priority state, Overview wording checks, version-reference checks, standalone HTML script checks, browser-like load smoke checks, package manifest review, and ZIP hygiene checks.

## V1.2.0 — 2026-05-22

Public release update for the DoView Boards reference package.

### Included

- Updated public package, app, builder, prompt, documentation, specification, and example version references to `V1.2.0`.
- Added Measure and Evaluation Question Traffic Lights using the existing Traffic Light states, including compact under-box display where set.
- Hardened prompt/schema guidance for generated-board assembly, This–Then link tags, Measure/Evaluation Question `trafficLight`, and generated-board safety checks.
- Applied targeted runtime hardening for safe board-title insertion, escaped print output, exported-state JSON escaping, Documentation Page rich-text sanitisation, custom colour sanitisation, and API-key non-persistence.
- Preserved ghost/context source-reference box colour inheritance, including page/column-inherited and custom source colours.
- Corrected Measure/Evaluation Question Display Text editing so titles remain standard fields and Display Text uses the larger Display Text editor pattern.
- Added a narrow data-quality guard so a single box does not retain duplicate references to the same Measure or Evaluation Question.
- Changed Page View Select All so it does not enable code-style Display Text view; code-style Display Text remains manually selectable.
- Fixed Create and Save New Empty Board so the entered board name becomes the board's internal title and slug and persists through later Save HTML Board, Copy HTML Board, and Create Read-Only Copy exports.
- Clarified Board Chat security wording: Board Chat is optional and inactive unless configured and used; provider-transmission risk arises when a user configures an endpoint/API key and sends content through Board Chat.
- Clarified hosted/shared-board guidance for active HTML/JavaScript files, untrusted board sources, isolated origins, CSP, endpoint governance, privacy/security/compliance review, and approved data-handling arrangements.
- Rebuilt the existing standalone HTML examples with the V1.2.0 reference engine.

### Preserved behaviours

- Existing saved-state/schema compatibility is preserved.
- Board Chat remains optional and user-triggered.
- Read-only copies remain a convenience feature, not a security boundary.
- Existing Save HTML Board, Copy HTML Board, Create Read-Only Copy, print, page navigation, link tags, BAU priority, Box/Link Display Text, Measure/Evaluation Question Traffic Lights, and Page View behaviours are preserved except for the corrected new-board title/slug persistence.

### Validation

- Release validation covered JavaScript syntax checks, builder/example rebuild checks, version-reference checks, package hygiene checks, example load smoke checks, save/copy/read-only smoke checks, Board Chat no-unsolicited-provider-call checks, API-key non-persistence checks, and targeted Create and Save New Empty Board title/slug persistence checks.

## V1.1.0 — 2026-05-08

Initial public release of the DoView Boards prompt package.

### Included

- DoView Board building prompt.
- Canonical JavaScript reference engine.
- Plain Node.js board builder.
- Simple standalone HTML example.
- Complex standalone HTML example.
- Developer-facing specification and documentation.
- Apache-2.0 licence.
- Trademark and attribution guidance.

### Security and use notes

- Generated standalone boards are active HTML/JavaScript files, not passive documents.
- The prototype is intended for experimentation, learning, proof-of-concept work, and non-confidential information in low-risk environments.
- Read-only copies are a convenience feature, not a security boundary.
- Board Chat is optional; users with privacy, confidentiality, security, compliance, API-key, or external-data-sharing concerns should avoid using Board Chat unless they have appropriate arrangements in place.
- Checksums or signed release verification are planned for a future release.

### Compatibility note

- This release establishes the first public DoView Boards reference package and minimum standard.
- Earlier internal builds are not part of the public changelog.
