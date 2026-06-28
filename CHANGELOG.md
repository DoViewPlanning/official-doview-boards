# Changelog

## V1.3.7 — 2026-06-26

Conservative template, badge/trademark, acknowledgment, setup-choice, and version-consistency hygiene release based on the accepted V1.3.6 package.

### Included

- Updated public reusable collection and collection-of-collections templates under `docs/collection-index/templates/`.
- Renamed the public collection-of-collections template files to use `collection-of-collections` naming.
- Renamed the option 2 public reusable template files to use `top-board-plus-live-boards` naming and Top Board Plus Live Boards Collection wording.
- Removed collection-level Official DoView Badge markup from public reusable collection templates.
- Added neutral plain-text collection acknowledgment blocks linked to <https://doviewplanning.org/acknowledgment>, with the heading and acknowledgment lines clarified for public reusable templates.
- Clarified editable title, subtitle, maintainer, description/about text, JSON reference, and example data fields in public reusable collection templates.
- Added the `Create a Collection` top navigation link to collection templates, pointing to <https://doviewplanning.org/createacollection>.
- Aligned collection-of-collections card rendering with the current official collection implementation, including collection pill placement, title placement, count/status placement, orange triangle marker placement, layered backing-card treatment, spacing, typography, shadows, and grid behaviour.
- Updated single-collection templates to generic title, subtitle, maintainer line, navigation, and card defaults.
- Updated `000-START-HERE-RUN-FIRST.md` to use the supplied 10 setup choices and `V1.2 Customized Set 2`.
- Tightened Official DoView Badge and trademark wording so board-level badge provenance is preserved while third-party official status, endorsement, certification, approval, affiliation, and badge rights are not implied.
- Updated package, prompt, engine, builder, documentation, specification, test, walkthrough, collection-index, and standalone example version references to `V1.3.7`.

### Preserved behaviours

- Runtime JavaScript behaviour, builder validation logic, CLI behaviour, output assembly, saved-state/schema, Board Chat, security/read-only/API-key warnings, and generated-board causal/content structure are unchanged apart from version text and narrow badge/trademark wording.
- Public reusable collection-template card rendering was conformed to the current reference implementation rather than redesigned.

### Validation

- Release validation covered repository-structure inspection, scoped file review, JavaScript syntax checks, collection-template script syntax checks, JSON parsing, version-reference checks, setup-choice checks, collection badge/acknowledgment/link checks, browser/headless smoke checks of representative collection templates and standalone board examples, package manifest review, and ZIP hygiene checks.

## V1.3.6 — 2026-06-19

Small prompt and documentation cleanup release based on the accepted V1.3.5 package.

### Included

- Added Node.js runtime-check and user-explanation wording to `doview-board-building-prompt.md`.
- Clarified that `doview-board-builder.js` requires Node.js and that Node.js is a separate runtime not bundled with the package.
- Directed AI coding assistants to use only simple PATH checks such as `node --version` and `command -v node` by default.
- Directed assistants not to search broadly through a user's filesystem or run recursive `find` commands outside the working folder to locate Node.js unless the user explicitly approves.
- Directed users to ask their AI assistant how to install Node.js when it is not installed, or to provide the Node command or path when it is installed in a non-standard location.
- Clarified that JSON board config can still be prepared and validated without Node.js, but final standalone HTML assembly requires Node.js.
- Clarified local `./output/` handling, including `mkdir -p ./output` when the folder does not exist.
- Updated package, prompt, engine, builder, documentation, specification, test, walkthrough, and standalone example version references to `V1.3.6`.

### Preserved behaviours

- Runtime JavaScript and CSS behaviour are unchanged apart from V1.3.6 version text.
- Builder CLI, validation logic, and output assembly behaviour are unchanged apart from V1.3.6 version text.
- Saved-state/schema and compatibility behaviour are unchanged.
- Generated-board topic content, causal structure, layout, and saved-state data are unchanged apart from narrow V1.3.6 version text.

## V1.3.5 — 2026-06-19

Conservative repository-naming, documentation, trademark-reference, and link-consistency release based on V1.3.4.

### Included

- Added support for renaming the official repositories under `github.com/doviewplanning` to `official-doview-legacy-app`, `official-doview-boards`, and `official-doview-board-collection`.
- Updated official repository URLs, package version text, release dates, README official-status wording, and trademark-use references.
- Added `github-support/doviewplanning-organization-profile-README.md` as a manual-copy draft for the GitHub organization profile.
- Added `github-support/manual-github-rename-checklist.md` with the three rename mappings and post-rename checks.

### Preserved behaviours

- Runtime JavaScript and CSS behaviour are unchanged apart from approved version, release-date, and official repository URL text.
- Builder CLI, validation logic, and output assembly behaviour are unchanged apart from approved version, release-date, and official repository URL text.
- Saved-state/schema and compatibility behaviour are unchanged.
- Generated-board topic content, causal structure, layout, and saved-state data are unchanged apart from narrow version, release-date, and official repository URL text.

## V1.3.4 — 2026-06-16

Release build following rejected V1.3.3 work. The accepted baseline remains V1.3.2.

### Included

- Fixed the mobile portrait and mobile landscape bottom control bar so it no longer wraps into a tall multi-line block.
- Kept mobile bottom controls reachable through a compact horizontally scrollable toolbar.
- Moved `Chat with board` into the mobile bottom toolbar and hid the floating Chat button on mobile only.
- Preserved desktop/laptop bottom control layout and the desktop/laptop floating Chat button behaviour.
- Added the real supplied standalone walkthrough HTML under `docs/walkthrough/`.
- Added hash deep links to the walkthrough so URLs such as `#tour=1&step=3` can open a specific tour step.
- Added the real supplied collection-index developer templates under `docs/collection-index/`.
- Clarified developer-facing trademark and Official DoView® Badge guidance for forks, substantially modified apps, rebranded platforms, and independently developed DoView-compatible apps.
- Updated package, prompt, engine, builder, documentation, specification, test, walkthrough, collection-index, and standalone example version references to `V1.3.4`.

### Preserved behaviours

- Runtime save/download, copy/paste, read-only copy, print, selected-box details, page navigation, link, Measure, Evaluation Question, tag, Display Text, Documentation Page, Notes, Board Chat settings/API/key/message/storage, saved-state/schema, and builder validation behaviour are unchanged except for the explicit mobile toolbar/chat placement and version/header text.
- The V1.3.1 Walk-Through link, standard 10 board setup choices, setup choice 7d, `showLinkInfoOnHover` generated setup, and canonical Measure/Evaluation Question clone validation are preserved.
- The V1.3.2 Documentation Page link-clone validation and strict failures for runtime-deleted links involving Final Outcome boxes are preserved.

## V1.3.2 — 2026-06-15

Conservative corrective release following V1.3.1.

### Included

- Strengthened builder validation so Documentation Page `link` clones are checked against the effective runtime link set rather than raw saved-state link IDs alone.
- Added strict/generated validation failures for This–Then links that the runtime will remove on load because either endpoint is missing or is not an ordinary This–Then box, including links involving Final Outcome boxes such as `final-b0`.
- Preserved valid Documentation Page link clones for runtime-surviving This–Then links and How links.
- Updated `doview-board-building-prompt.md` and `docs/config-reference.md` so generated Documentation Pages only clone links that survive runtime cleanup, and use text, final-outcome clones, or valid ordinary This–Then link clones when discussing pathways to Final Outcomes.
- Added builder regression coverage for valid link clones, missing link IDs, links to/from Final Outcome boxes, missing endpoints, and non-This–Then endpoints.
- Updated package, prompt, engine, builder, documentation, specification, test, and standalone example version references to `V1.3.2`.

### Preserved behaviours

- Runtime linking, Final Outcome handling, Board Chat, read-only behaviour, save/copy/download behaviour, print behaviour, selected-box details, page navigation, Measures, Evaluation Questions, Documentation Pages, and saved-state/schema behaviour are unchanged except for version/header text.
- The V1.3.1 Walk-Through link, standard 10 board setup choices, setup choice 7d, `showLinkInfoOnHover` generated setup, and canonical Measure/Evaluation Question clone validation are preserved.
- The `[Source deleted]` broken-clone display is preserved for genuinely deleted clone sources.

## V1.3.1 — 2026-06-15

Conservative point release following V1.3.0.

### Included

- Renamed the top menu `Help` item to `Walk-Through` and changed its target to <https://doviewplanning.org/walkthrough>.
- Updated the canonical generated-board disclaimer section from `Help` to `Walk-Through`.
- Replaced the standard setup flow in `000-START-HERE-RUN-FIRST.md` with the standard 10 board setup choices and lettered subparts.
- Updated `doview-board-building-prompt.md` so standard generated boards request `savedState.viewSettings.thisThen.showLinkInfoOnHover = true` and include `generationChecks.requestedPageViewOptions.thisThen`.
- Strengthened builder validation for Documentation Page clones so strict generated configs reject non-canonical Measure and Evaluation Question clone keys such as `m001` and `q001`, missing clone sources, and inconsistent top-level `subpages` / runtime `savedState.SP` structures.
- Added narrow runtime compatibility for clear older Measure/Evaluation Question ID variants so existing boards can continue to resolve unambiguous references where possible.
- Updated package, prompt, engine, builder, documentation, specification, test, and standalone example version references to `V1.3.1`.

### Preserved behaviours

- Existing saved-state/schema compatibility is preserved.
- The `[Source deleted]` broken-clone display is preserved for genuinely deleted clone sources.
- Board Chat behaviour, read-only behaviour, save/copy/download behaviour, print behaviour, selected-box details, page navigation, link behaviour, Measures, Evaluation Questions, and Documentation Page editing are unchanged except for the narrow link/label, validation, compatibility, and version-text changes above.

## V1.3.0 — 2026-06-11

Start-flow hardening release following V1.2.9.

### Included

- Hardened `000-START-HERE-RUN-FIRST.md` so generic launch commands such as "build a doview board", "start", "run this", "make a board", or "build the board" are not treated as board topics.
- Prevented the AI from inventing a default topic or building a meta-board about DoView Boards when no specific subject is supplied.
- Clarified that the standard setup applies to an organization or initiative, broadly understood as organized work where outcomes are linked to activities, services, projects, workstreams, teams, partners, roles or competencies.
- Reinforced the same generic-launch rule in `doview-board-building-prompt.md` while preserving `000-START-HERE-RUN-FIRST.md` as the setup source of truth.
- Updated package, prompt, engine, builder, documentation, specification, test, and standalone example version references to `V1.3.0`.

### Preserved behaviours

- Runtime behaviour, builder validation logic, saved-state/schema, Board Chat behaviour, read-only behaviour, save/copy/download behaviour, print behaviour, selected-box details, link behaviour, Measures, Evaluation Questions, Documentation Pages, and generated-board causal content are unchanged except for version/header text.

## V1.2.9 — 2026-06-11

Start-flow consolidation and developer-guidance release following V1.2.8.

### Included

- Added/finalised `000-START-HERE-RUN-FIRST.md` as the source of truth for the opening interaction, standard 18-question setup, numbered answer changes, and single-board/multiple-board intake workflow.
- Updated `doview-board-building-prompt.md` so it defers start flow and setup wording to the start file while preserving technical board-building rules.
- Added developer and AI-agent guidance about preserving the DoView Drawing Rules and treating `spec/this-then-page-rules.md` as the authoritative expanded rules file, read with `spec/doview-board-minimum-spec.md`.
- Added developer guidance about social stereotyping, structural stereotyping, repeated hidden structures, and shallow renaming in AI-generated board sets.
- Reinforced canonical filename and package hygiene expectations for release ZIPs.
- Updated package, prompt, engine, builder, documentation, specification, test, and standalone example version references to `V1.2.9`.

### Preserved behaviours

- Runtime behaviour, builder validation logic, saved-state/schema, Board Chat behaviour, read-only behaviour, save/copy/download behaviour, print behaviour, selected-box details, link behaviour, Measures, Evaluation Questions, Documentation Pages, and generated-board causal content are unchanged except for version/header text.

### Validation

- Release validation covered repository structure inspection, start-file content checks, main-prompt start-flow checks, version-reference checks, JavaScript syntax checks, builder regression tests, standalone example embedded-script syntax checks, JSON example builder checks, browser smoke checks of rebuilt standalone examples via a local static server, package manifest review, and ZIP hygiene checks.
- The repository runtime Measure/Evaluation Question fixture skipped its own browser startup path in this environment, so browser coverage was provided by the separate local-server smoke checks.

## V1.2.8 — 2026-06-10

Narrow How Page hierarchy validation bugfix release following V1.2.7.

### Included

- Fixed How Page hierarchy validation so generated and built boards cannot contain more than one numbered How Page at the same level.
- The builder now rejects duplicate non-null numeric `howLevel` values while still allowing multiple Cross-Link/no-level How Pages with `howLevel: null`.
- Added prompt guidance requiring AI-generated configs to count numbered How Page levels before finalisation.
- Added builder regression tests for duplicate `howLevel: 1`, duplicate `howLevel: 2`, multiple `howLevel: null` pages, and a valid Level 1 / Level 2 / Level 3 hierarchy with multiple null no-level pages.
- Added narrow runtime/manual-edit guards so new numbered How Pages, changed How Page levels, Board Chat How Page creation, and pasted How Pages do not create duplicate numbered How levels.

### Preserved behaviours

- Existing boards still open; the new rule prevents invalid new builds and manual edits rather than redesigning saved-state/schema.
- Multiple Cross-Link/no-level How Pages with `howLevel: null` remain valid.
- Board Chat behaviour, read-only behaviour, save/copy/download behaviour, print behaviour, selected-box details, link behaviour, Measures, Evaluation Questions, Documentation Pages, and collection documentation/examples from V1.2.7 remain unchanged except for version/release consistency.

## V1.2.7 — 2026-06-10

Collection documentation and examples release following V1.2.6.

### Included

- Added a beginner-friendly guide, `docs/how-to-put-a-doview-board-collection-onto-internet.md`, explaining how to publish a DoView Board Collection on the internet using GitHub and GitHub Pages.
- Added collection configuration examples: `examples/collections.json` for a collection-of-collections `collections` list, and `examples/collection.json` for one collection folder's `boards` list.
- Clarified the difference between `collections.json` and `collection.json`, including when to update the top-level collection list versus an individual collection folder's board list.
- Added narrow README and examples README links to the new collection documentation and examples.

### Preserved behaviours

- The DoView board-building prompt, reference engine, builder, specs, tests, saved-state/schema, Board Chat behaviour, and generated standalone board examples remain unchanged from V1.2.6.
- Runtime JavaScript/CSS behaviour, builder validation, generated board content, and causal structure are unchanged.

### Validation limits

- The collection JSON examples are configuration examples, not complete standalone DoView Boards.
- GitHub Pages publishing is static website hosting. It is not access control, authentication, review workflow, approval, certification, or a security boundary.

## V1.2.6 — 2026-06-02

Targeted runtime/UI consistency and source-registry cleanup release following V1.2.5.

### Included

- Fixed runtime restoration of nested `savedState.B` box records when a generated config does not also include the optional redundant `savedState.SP` copy.
- Centralized box-level Measure/Evaluation Question association lookups so lists, detail panes, and Page View under-box display read the same box-level `measures` / `evalQuestions` source of truth.
- Confirmed the association display path for This-Then Boxes, How Boxes, and Final Outcome boxes while preserving default-off Page View options.
- Refined Sources registry completion so fixed package-controlled help, training, repository, trademark, and support URLs are not auto-added as board evidence sources.
- Preserved genuine board-content URL completion, normalized URL deduplication, explicitly titled Sources entries, builder-created validation stamps, strict-generated mode, no-level Cross-Link How Page checks, link-text checks, and Documentation Page clone checks.
- Added builder regression assertions and a browser-backed Measure/Evaluation Question runtime fixture.

### Preserved behaviours

- The saved-state schema is unchanged. The runtime fix is a narrow compatibility helper for existing box-level association arrays.
- Save / Download Board, Copy HTML Board, Create and Save New Empty Board, Create Read-Only Copy, Board Chat, Print, Documentation clone runtime behaviour, This-Then semantics, How Page numbering, and default Page View settings remain unchanged.

### Validation limits

- Builder validation and the browser-backed fixture are deterministic technical checks. They do not prove content quality, source accuracy, security, approval, endorsement, certification, or Official DoView® status.

## V1.2.5 — 2026-06-02

Targeted reliability and traceability release following the V1.2.4 builder/preflight enforcement release.

### Included

- Added a builder-created `builderValidation` stamp to successful standalone HTML output. The stamp records builder version, validation version, validation mode, timestamp, checks run, warnings, and reported safe auto-fixes.
- Added a quiet `Builder validation: confirmed` / `Builder validation: not confirmed` line in Board info. Older unstamped boards continue to open normally and show `not confirmed`.
- Added high-confidence baseline checks that run even when `generationChecks` is absent, while preserving the compatibility path for older configs.
- Strengthened baseline detection for repeated This-Then link Display Text, repeated How-link Display Text, known boilerplate phrases, and Documentation Pages that claim clones without real engine-supported `.doc-clone` blocks.
- Added visible-URL Sources registry completion. The builder scans displayed content, deduplicates URL-bearing source entries, safely adds missing URLs using the URL as a fallback title, and reports the changes without inventing URLs.
- Updated the prompt workflow so final standalone HTML is not returned until builder validation passes and the builder-created stamp is present.
- Completed a focused text and version audit for the V1.2.5 public package.

### Preserved behaviours

- Existing saved-state/schema and runtime behaviours are preserved except for additive builder-validation metadata and the unobtrusive Board info status line.
- Save / Download Board, Copy HTML Board, Create and Save New Empty Board, Create Read-Only Copy, Board Chat, Print, Documentation clone runtime behaviour, This-Then semantics, How Page numbering, Measures/Evaluation Questions UI, and Page View behaviour remain unchanged.
- Older configs without `generationChecks` remain supported through compatibility mode. Compatibility stamps do not claim strict-generated validation.

### Validation limits

- Builder validation is deterministic technical validation and traceability metadata. It does not prove content quality, source accuracy, security, approval, endorsement, certification, or Official DoView® status.

## V1.2.4 — 2026-06-02

Public enforcement release following internal V1.2.2 and V1.2.3 validation builds.

Prompt-only validation in V1.2.2 and V1.2.3 was insufficient: generated boards could still assign numbered levels to Cross-Link How Pages and repeat generic link Display Text. V1.2.4 supersedes those internal validation builds and adds deterministic builder/preflight enforcement before standalone HTML output.

### Included

- Added optional top-level builder-only `generationChecks` metadata for generated JSON configs. The builder uses it for strict preflight and strips it before embedding final standalone HTML.
- Added safe normalization of clearly identified Cross-Link, non-hierarchical, non-vertical, and no-level How Pages to `howLevel: null`, with reported auto-fixes.
- Added strict anti-boilerplate validation for requested This-Then `ttLinks[].mainText` and How-link `howLinks[].mainText`, including repeated text, near-repeated wording, known generic frames, endpoint-specificity checks, and relationship-specific URL checks when requested.
- Added Documentation Page clone validation for engine-supported `.doc-clone` blocks, supported `data-clone-type` values, and real `data-clone-key` references.
- Added requested Measure and Evaluation Question box-attachment validation, with explicit standalone-item opt-outs only when requested.
- Added safe Page View auto-fixes for unrequested options and hard failures for unrequested box Display Text, populated Traffic Lights, and populated priorities.
- Added `tests/builder-preflight.test.js` with passing, failing, and safe-auto-fix fixtures.
- Updated the prompt to require builder-first generation: generate JSON, include `generationChecks`, run strict preflight, revise JSON until it passes, then output builder-produced standalone HTML.
- Updated package, engine, builder, prompt, documentation, specification, and standalone example version references to `V1.2.4`.

### Preserved behaviours

- Existing saved-state/schema compatibility is preserved. `generationChecks` is builder-only input metadata, not runtime saved state.
- Runtime engine behaviour is unchanged apart from version labels.
- Save / Download Board, Create and Save New Empty Board, Board Chat, Documentation clone runtime behaviour, This-Then link semantics, How Box IDs such as `H001`, and normal numbered Vertical Link How Pages are unchanged.
- Older configs without `generationChecks` keep the compatibility validation path, plus safe baseline no-level normalization and warnings where applicable.

### Validation

- Release validation covered JavaScript syntax checks, strict preflight passing and failing fixtures, safe auto-fix fixtures, JSON parsing, all JSON example builds, standalone HTML assembly checks, version-reference checks, browser smoke checks, package manifest review, and ZIP hygiene checks.

## V1.2.3 — 2026-06-02

Internal validation build following V1.2.2. This build was not published as a GitHub release and is superseded by V1.2.4.

V1.2.2 was also used as an internal validation build and was not published as a GitHub release.

This release includes the V1.2.2 reliability fixes and further strengthens generated-board validation for This–Then link Display Text so requested link rationale/evidence is specific to the linked boxes rather than repeated template text.

### Included

- Strengthened the prompt's final saved-state validation gate so requested `ttLinks[].mainText` values are inspected before output for duplicate text, near-duplicate sentence frames, source-target specificity, relationship-specific mechanisms, and evidence/URL relevance.
- Added explicit rejection of page-level generic rationale/evidence filler, generic dependency wording, minor paraphrases of repeated templates, and generic board-level source lists pasted into many links.
- Added short good/bad examples showing the difference between repeated template text and relationship-specific link Display Text.
- Narrowly aligned the technical config reference with the strengthened anti-template link Display Text gate.
- Preserved the V1.2.2 structural validation gates for no-level Cross-Link How Pages, Documentation Page clones, Measure/Evaluation Question attachments, Page View defaults, box Display Text restraint, Traffic Light/priority restraint, and Vertical Link wording.
- Updated validation package, engine, builder, prompt, documentation, specification, and standalone example version references to `V1.2.3`.

### Preserved behaviours

- Existing runtime behaviour is unchanged apart from version labels.
- Existing saved-state/schema compatibility is preserved; link annotations continue to use `ttLinks[].mainText`.
- Builder validation, CLI behaviour, output assembly, and normalization are unchanged apart from version text.

### Validation

- Release validation covered JavaScript syntax checks, JSON parsing, builder assembly checks, prompt anti-template gate searches, a relationship-specific `ttLinks[].mainText` stress-test config, preserved V1.2.2 prompt-gate searches, version-reference checks, standalone HTML script checks, browser smoke checks, package manifest review, and ZIP hygiene checks.

## V1.2.2 — 2026-06-02

Internal validation build for the targeted prompt/package reliability patch. This build was not published as a GitHub release and is superseded by V1.2.4.

### Included

- Reinforced the V1.2.1 generation rules with a mandatory final saved-state/config validation gate before generated-board output.
- Added hard validation that Cross-Link, non-hierarchical, non-vertical, and no-level How Pages use explicit `howLevel: null`, remain outside the numbered vertical hierarchy, and display `No level`.
- Added hard validation that requested link Display Text is tailored to each exact source/target relationship rather than repeated filler, and that requested evidence or URLs are relevant rather than invented.
- Added hard validation that requested Documentation Page clones use exact engine-supported `.doc-clone` blocks with supported `data-clone-type` values and real `data-clone-key` references.
- Added hard validation that requested Measures and Evaluation Questions are attached to at least one relevant box unless standalone or unattached items were explicitly requested.
- Added hard validation that generated Page View options remain off unless explicitly requested, box Display Text remains blank/omitted unless requested, and Traffic Lights/priorities remain hidden and unpopulated unless requested.
- Removed `adjacent` from the higher-level and lower-level Vertical Link popup title wording without changing Vertical Link behaviour.
- Updated validation package, engine, builder, prompt, documentation, specification, and standalone example version references to `V1.2.2`.

### Preserved behaviours

- Existing saved-state/schema compatibility is preserved.
- Existing numbered vertical How Pages, Cross-Link behaviour, Vertical Link behaviour, and How Box IDs such as `H001` remain unchanged.
- Builder validation, CLI behaviour, output assembly, and normalization are unchanged apart from version text.
- Existing This–Then, Documentation Page clone, Measure/Evaluation Question, Page View, Traffic Light, priority, save/copy/read-only, print, presentation, Board Chat, and navigation runtime behaviour is preserved apart from the two popup title wording changes and version labels.

### Validation

- Release validation covered JavaScript syntax checks, JSON parsing, builder assembly checks, mandatory prompt-gate searches, no-level How Page structure and rendering, tailored link Display Text, Documentation Page clone blocks, Measure/Evaluation Question box associations, Page View off-by-default state, box Display Text restraint, neutral Traffic Light/priority state, Vertical Link wording searches, version-reference checks, standalone HTML script checks, browser-like load checks, package manifest review, and ZIP hygiene checks.

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
