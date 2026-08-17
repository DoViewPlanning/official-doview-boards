# V1.4.3 execution preflight

**This package contains the builder, engine and validation tools required to create the board. Inspect or extract it, author the complete pure JSON configuration, run the included builder, correct ordinary validation errors and return the required files. Do not substitute a prose-only board or ask the user to run the builder.**

Before reporting a technical stop, inspect the package, check Node.js with `node --version`, run the relevant command and state the concrete failure. Strict validation establishes technical consistency only. It does not establish factual, causal or organisational correctness.

# Start Here: DoView Board Master Prompt
Version V1.4.3

## User choices override defaults

Explicit user instructions about board structure, How-page arrangements, mapping rules, sources, display settings or deliverables override package defaults. Apply defaults only where the user is silent.

Once Step 1 has been accepted, Step 2 preserves it. A requested structural change returns deliberately to Step 1. Step 2 must never silently change the accepted Step 1 baseline.

## Two-step Board Build Mode

A clear request to build a board enters Board Build Mode:

1. **Step 1 — Structure:** build the complete bounded proof-of-concept board, including ordinary This–Then links and selected How Pages and How Boxes. Do not create How links. Leave link Display Text, Notes 1–3 and traffic lights blank.
2. **Step 2 — How mapping:** preserve Step 1 exactly and add restrained How links. Leave all link annotations and traffic lights blank.

Each Step produces a usable board. Step 2 completes the V1.4.3 workflow.

If no subject has been supplied, reproduce `OPENING-MENU.md` verbatim and nothing else. If a subject is supplied, apply the defaults plus any user changes and complete Step 1 immediately. Do not add a routine confirmation step.

## Self-review before every delivery

Before saving and presenting each Step, review the actual final board and revise the draft.

- Correct clear technical, structural, causal, mapping, wording and packaging problems that can be fixed confidently within the current Step.
- In Step 1, reconsider causal direction, missing obvious intermediaries, duplication, unclear labels, excessive density and important omissions.
- In Step 2, prune theme-only, generic, quota-driven, duplicated or implausibly broad mappings.
- Do not silently make major strategic or organisational choices where several reasonable alternatives remain.
- Do not produce a mandatory `## Things for the User to check` section.
- Do not claim that no debatable relationships remain. Use: `No further high-confidence corrections were identified during self-review. Remaining strategic and causal judgements require careful human review before operational use.`

Record the self-review in `generationChecks.generatorSelfReview` and in the relevant audit file.

## Files created after every Step

Create these files with one common base stem:

- standalone `.html` board;
- canonical `.json` board;
- `-prompt-used.md`;
- the relevant `-structure-audit.md` or `-mapping-audit.md`.

The user-facing response must link only to:

1. the standalone HTML board;
2. one ZIP containing the exact standalone HTML plus the canonical JSON, prompt-used record and relevant audit.

Do not separately link the JSON, prompt-used record or audit. The HTML bytes inside the ZIP must match the separately supplied HTML exactly. Use `tools/create-delivery-zip.js` and `tools/validate-delivery-zip.js` to enforce the required contents.

The `prompt-used.md` file must record:

- board title and workflow Step;
- generation date, time and timezone;
- AI model when reliably known;
- effort level when explicitly exposed, otherwise `Not exposed`;
- the user-visible prompt that initiated the Step;
- material continuing user instructions from the conversation;
- names of uploaded files actually used;
- files present but explicitly excluded, when relevant;
- package, engine, builder, validation and schema versions.

Do not include hidden system, developer or chain-of-thought content.

## Required delivery filenames

Use lowercase filesystem-safe components, hyphens rather than spaces, no colons, and **Step**, never Stage.

### Step 1 HTML

`[abbreviated-board-name]-1-4-3-step-1-base-doview-board-[AI-model-if-known]-[effort-if-exposed]-[YYYY-MM-DD-HHmm].html`

### Step 2 HTML

`[abbreviated-board-name]-1-4-3-step-2-prototype-doview-board-with-how-links-[AI-model-if-known]-[effort-if-exposed]-[YYYY-MM-DD-HHmm].html`

The bracketed AI-model and effort components are conditional:

- include the AI model only when reliably known;
- include the effort level only when explicitly exposed;
- omit an unavailable component completely;
- never write `model-unknown`, `effort-not-exposed` or a guessed effort level in the filename;
- do not put the timezone in any filename.

Use a filesystem-safe model form such as `gpt-5-6-thinking`. Use an exposed effort form such as `high-effort`.

The ZIP filename must use the exact same stem as its HTML file followed by:

`-plus-additional-files-ai-readible-json-and-prompt-info.zip`

Examples:

- `andy-burnham-gov-1-4-3-step-1-base-doview-board-gpt-5-6-thinking-high-effort-2026-08-14-1118.html`
- `andy-burnham-gov-1-4-3-step-1-base-doview-board-gpt-5-6-thinking-high-effort-2026-08-14-1118-plus-additional-files-ai-readible-json-and-prompt-info.zip`
- `andy-burnham-gov-1-4-3-step-2-prototype-doview-board-with-how-links-gpt-5-6-thinking-2026-08-14-1118.html`
- `andy-burnham-gov-1-4-3-step-2-prototype-doview-board-with-how-links-gpt-5-6-thinking-2026-08-14-1118-plus-additional-files-ai-readible-json-and-prompt-info.zip`
- when model and effort are unavailable: `andy-burnham-gov-1-4-3-step-1-base-doview-board-2026-08-14-1118.html`

## Required user-facing download links

Use exactly these two labels once each:

`[Download the DoView Board HTML file](...)`

`[Download the DoView Board HTML file plus additional files](...)`

Do not add separate links to the JSON, prompt record or audit. Do not repeat an introductory or download line.

## Exact human-review notice

Use this text exactly in the completion response after the two download links and before the Step-specific completion paragraph:

`The draft was reviewed and revised before these files were produced. This was a self-review, not an independent audit. Before putting the board into operational use for an organisation or initiative, it needs to be carefully checked by humans to make sure that it truly reflects the organisation, policy or other type of initiative being modelled.`

Put the complete Step instruction in a separate fully bold paragraph near the end. Prefer no authored prose after it, but citation definitions or platform-generated material may follow and must not cause validation failure.

## Step 1 requirements

- Use `generationChecks.workflowStep: "step-1-structure"`.
- Build a bounded complete board, normally around 60–100 ordinary This–Then boxes for a substantial subject, but follow the subject rather than a quota.
- Create selected How Pages and How Boxes but no How links.
- Leave every structural-link `mainText`, `notes1`, `notes2`, `notes3` and `light` blank.
- Include exactly three Documentation Pages under the displayed default: combined purpose/scope/assumptions/sources/cautions; illustrative monitoring and evaluation plan; package-controlled disclaimer.
- Complete the self-review and correct clear problems before saving.
- Produce HTML, canonical JSON, prompt-used, structure audit and the additional-files ZIP.
- Populate `generationChecks.generatorSelfReview.chatHandoff.reportedCounts` from the actual final board. The builder rejects incorrect counts.

Use this exact fully bold paragraph after the human-review paragraph:

`**Step 1 is complete. Type 'Do step 2' to add links between the How Boxes, This–Then Boxes and other How Boxes.**`

## Step 2 requirements

- Begin from the exact accepted Step 1 canonical JSON and preserve its `structureDigest`.
- Use `generationChecks.workflowStep: "step-2-how-mapping"`.
- Add only permitted How links and mapping metadata.
- Leave all This–Then and How-link annotation fields and traffic lights blank.
- Under the default arrangement:
  - Level 1 projects/workstreams → ordinary This–Then boxes;
  - Level 2 organisations/functions → Level 1 projects/workstreams;
  - competencies → Level 1 projects/workstreams only.
- A user-selected arrangement may override this default and must be recorded in `competencyMappingReview.targetMode: "user-defined"` with the reason and permitted target set.
- Competency mapping must be selective. Generic usefulness is insufficient. A competency may have zero links. Do not target equal counts or complete representation.
- Density thresholds are diagnostic review indicators, not numerical targets. Do not add or remove links merely to fall below a threshold; decide each link through the pair-specific admission test.
- Internally review competencies mapped to more than half the permitted projects, projects receiving nearly all competencies, unusually uniform degree patterns and broad organisational sources. Prune only relationships that fail the admission test.
- Produce HTML, canonical JSON, prompt-used, mapping audit and the additional-files ZIP.
- Populate `generationChecks.generatorSelfReview.chatHandoff.reportedCounts` from the actual final board. The builder rejects incorrect counts.

Use this exact fully bold paragraph after the human-review paragraph:

`**Step 2 is complete. Download the finished proof-of-concept board using the links above.**`

## Fixed opening menu when no subject is supplied

When the user has not supplied a board subject, read `OPENING-MENU.md` and reproduce its entire contents **verbatim** as the response.

Do not add text before or after it. Do not shorten, summarise, paraphrase, combine or replace it with a single question. All ten numbered choices and both workflow Steps must appear. Then wait for the user to supply the subject or override one or more numbered defaults.

When a subject has already been supplied, do not show the menu. Apply the defaults plus any explicit user changes and complete Step 1 immediately.

## Governing files

- `OPENING-MENU.md` — fixed ten-choice startup menu; reproduce verbatim when no subject is supplied.
- `doview-board-building-prompt.md` — board methodology, JSON fields, execution and delivery requirements.
- `additional-doview-prompt.md` — mandatory Step 2 mapping restraint.
- `doview-board-builder.js` — strict transition and config validator and JSON/HTML builder.
- `doview-board-engine.js` — runtime reference.
- `tools/how-link-metrics.js`, `tools/graph-validation.js`, `tools/shape-metrics.js` — deterministic diagnostics.
- `tools/create-prompt-used.js` — helper for the required prompt-used file.
- `tools/delivery-filenames.js` — validates the final V1.4.3 HTML/ZIP names and shared stem.
- `tools/create-delivery-zip.js` and `tools/validate-delivery-zip.js` — create and verify the four-file Step ZIP, including byte-identical HTML.
- `tools/validate-opening-menu.js` — validates the fixed startup menu and optional captured startup responses.
- `tools/validate-completion-response.js` — validates the two download links, filenames, exact human-review notice and final-line ordering.
- `tools/release-smoke-test.js` — runs the rc3 positive and negative release checks.

If Step 2 starts in a fresh chat, request the exact Step 1 canonical JSON and this package. Do not reconstruct the board from memory.
