# DoView Board Developer Integration Guide

**DoView Boards version:** V1.3.4  
**Release date:** 2026-06-16  
**Document status:** Developer integration guide for the V1.3.4 DoView Boards prompt package release

This guide explains how developers can use, inspect, embed, adapt, or build on the V1.3.4 DoView Board reference package.

It should be read with:

- [`000-START-HERE-RUN-FIRST.md`](../000-START-HERE-RUN-FIRST.md) for opening interaction and standard setup flow;
- [`doview-board-minimum-spec.md`](../spec/doview-board-minimum-spec.md) for the DoView-compatible standard;
- [`this-then-page-rules.md`](../spec/this-then-page-rules.md) for the expanded This-Then Page modelling rules;
- [`config-reference.md`](config-reference.md) for the technical config format;
- [`security-and-read-only-notes.md`](security-and-read-only-notes.md) for security, deployment, Board Chat, and read-only limitations;
- [`trademark-and-attribution.md`](trademark-and-attribution.md) for trademark, attribution, and Official DoView® Badge guidance.

## 1. What is in the reference package

The V1.3.4 release includes:

- [`000-START-HERE-RUN-FIRST.md`](../000-START-HERE-RUN-FIRST.md) — the source of truth for the opening interaction, standard 10 board setup choices, setup-choice changes, and single-board/multiple-board intake;
- [`doview-board-building-prompt.md`](../doview-board-building-prompt.md) — the prompt package for creating DoView Board configs and standalone boards with AI systems;
- [`doview-board-engine.js`](../doview-board-engine.js) — the canonical JavaScript reference engine for this release;
- [`doview-board-builder.js`](../doview-board-builder.js) — a plain Node.js builder that assembles a pure JSON config and the reference engine into a standalone HTML board;
- [`examples/simple-example.html`](../examples/simple-example.html) — a simple standalone board example;
- [`examples/complex-example.html`](../examples/complex-example.html) — a more substantial standalone board example;
- [`docs/walkthrough/`](walkthrough/) — package/developer copy of the standalone walkthrough HTML;
- [`docs/collection-index/`](collection-index/) — developer templates for DoView Board collection index pages;
- [`spec/doview-board-minimum-spec.md`](../spec/doview-board-minimum-spec.md) — the minimum DoView-compatible standard;
- this developer guide and related documentation.

The package is designed around one canonical reference engine. Do not treat the prompt package, examples, or builder as separate standards. The minimum specification defines the standard; the reference engine demonstrates one working implementation of it.

## 2. Main developer use cases

Developers may use this package to:

- inspect how DoView Boards work;
- generate standalone board HTML files;
- embed a board in another website or app;
- create tools that output reference-engine-compatible configs;
- build DoView-compatible apps, platforms, plugins, AI tools, integrations, or systems;
- adapt the reference engine under the applicable open-source licence;
- use the minimum specification to implement DoView-compatible boards in a different stack.

Developers are encouraged to build on, adapt, extend, and integrate DoView-compatible boards into other products and workflows, provided they preserve the core DoView Board semantics and follow the trademark and attribution guidance.

## 3. Ordinary users vs developers

Ordinary users usually interact with the prompt package and generated boards:

```text
DoView prompt package
        ↓
AI system creates board config or board file
        ↓
user opens or shares a standalone board
```

Developers usually work with the reference engine, builder, examples, config reference, and minimum specification:

```text
pure JSON config
        ↓
doview-board-builder.js + doview-board-engine.js
        ↓
standalone HTML board
```

A developer can also implement the DoView-compatible standard without using the JavaScript reference engine, provided the resulting system preserves the required page types, box types, link meanings, display fields, measures, evaluation questions, sources, navigation expectations, and read-only limitations.

## 4. Reference engine status

[`doview-board-engine.js`](../doview-board-engine.js) is the canonical reference implementation for V1.3.4.

It is intended to:

- provide a working implementation;
- demonstrate expected DoView Board behaviour;
- create and run standalone DoView Boards;
- give developers concrete code to inspect, copy, embed, or adapt;
- stay aligned with the prompt package and generated boards.

It is not intended to be the only possible implementation of DoView Boards. A compatible app can use different code, a different UI framework, a database backend, collaborative editing, stronger security controls, or a different rendering layer.

## 5. Minimum files to copy into a project

For basic reference-engine use, copy:

```text
doview-board-engine.js
doview-board-builder.js
```

For prompt-package use, also copy:

```text
doview-board-building-prompt.md
```

For examples and testing, copy:

```text
examples/simple-example.html
examples/complex-example.html
```

For developer-facing distribution, keep the docs and spec available as well:

```text
spec/doview-board-minimum-spec.md
docs/config-reference.md
docs/developer-integration-guide.md
docs/security-and-read-only-notes.md
docs/trademark-and-attribution.md
docs/walkthrough/
docs/collection-index/
```

## 6. Quick start: build a standalone board

Create a pure JSON board config, for example:

```json
{
  "title": "Example DoView Board",
  "slug": "example-doview-board",
  "subpages": [
    {
      "id": "p1",
      "label": "Main logic",
      "pageType": "this_then",
      "color": {
        "bg": "#eff6ff",
        "bdr": "#bfdbfe",
        "tab": "#2563eb"
      },
      "cols": [
        {
          "h": "Earlier conditions",
          "boxes": [
            "People understand the issue"
          ]
        },
        {
          "h": "Later outcomes",
          "boxes": [
            "Better decisions are made"
          ]
        }
      ]
    }
  ],
  "finalOutcomes": [
    "Better decisions improve outcomes"
  ],
  "sources": [],
  "savedState": {
    "viewSettings": {
      "thisThen": {
        "showCounts": false,
        "showTrafficLights": false,
        "showPriorities": false,
        "showHowCounts": false,
        "showMeasures": false,
        "showEvalQuestions": false,
        "showMainText": false,
        "showLinkInfoOnHover": true,
        "showLateralHow": false,
        "showTags": false
      },
      "how": {
        "showNumbering": false,
        "showTrafficLights": false,
        "showPriorities": false,
        "showWhyCounts": false,
        "showLateralHow": false,
        "showMeasures": false,
        "showEvalQuestions": false,
        "showMainText": false,
        "showTags": false
      },
      "finalOutcomes": {
        "showTrafficLights": false,
        "showPriorities": false,
        "showMeasures": false,
        "showEvalQuestions": false,
        "showMainText": false,
        "showTags": false
      }
    }
  }
}
```

Save it as `doview-board-config.json`.

Then run:

```bash
node doview-board-builder.js \
  --engine doview-board-engine.js \
  --config doview-board-config.json \
  --out example-doview-board_doview-board_v1.3.4_2026-06-16.html
```

No npm install is required. The builder uses plain Node.js built-in modules.

## 7. Builder input rules

The builder expects the config file to be pure JSON.

The config file should not contain:

- full HTML;
- the DoView engine source;
- the builder source;
- prompt text;
- `DoView.init(...)` wrappers;
- temporary validation code;
- copied standalone-board output.

The builder assembles:

```text
doview-board-engine.js
        +
pure JSON config
        ↓
standalone HTML board
```

The builder also appends the package-controlled Documentation Page titled `Using DoView Boards and Disclaimer` to standalone board output and avoids adding a duplicate if that Documentation Page is already present.

For AI-generated configs, include top-level builder-only `generationChecks` metadata. The builder automatically runs strict preflight validation when this metadata is present, reports safe structural auto-fixes, exits non-zero on hard failures, and does not write standalone HTML until the config passes. The metadata is stripped before the config is embedded in final HTML. Older configs without `generationChecks` continue to use compatibility mode, which still runs high-confidence baseline checks. Successful outputs receive a builder-inserted `builderValidation` stamp with the accurate mode.

The builder also scans visible generated board content for URLs, deduplicates URL-bearing source entries, and auto-adds missing content/evidence URLs to the board-level Sources registry using the URL as a fallback title. Fixed package-controlled help, training, repository, trademark, and support URLs are excluded from auto-addition so they do not inflate a board's evidence Sources list. The builder does not invent URLs.

The generated HTML board should contain:

- one embedded copy of the engine in the HTML head;
- one `DoView.init(...)` call in the HTML body;
- board config/state in that body initialization call, not inside the engine script;
- no embedded prompt package text;
- no embedded builder code;
- no duplicated engine source.

## 8. Output filename convention

The builder expects generated board filenames to follow this pattern:

```text
<board-slug>_doview-board_v<version>_<yyyy-mm-dd>.html
```

Example:

```text
example-doview-board_doview-board_v1.3.4_2026-06-16.html
```

The builder may warn if the output filename does not match this pattern.

## 9. Calling `DoView.init(...)` directly

The reference engine exposes a single public entry point:

```js
DoView.init(config);
```

A minimal direct-use HTML page looks like:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Example DoView Board</title>
<script src="doview-board-engine.js"></script>
</head>
<body>
<script>
DoView.init({
  title: "Example DoView Board",
  slug: "example-doview-board",
  subpages: [],
  finalOutcomes: [],
  sources: [],
  savedState: {}
});
</script>
</body>
</html>
```

For final distributed boards, prefer the builder path so the output is assembled and checked consistently.

## 10. Important direct-embedding note

The V1.3.4 engine takes control of the document body when initialized. It injects the board interface into `document.body`.

For that reason, if you want to place a DoView Board inside a larger app, the safest simple pattern is usually to embed a standalone generated board in a sandboxed iframe, rather than initializing the engine directly inside a page that also contains other application UI.

Example:

```html
<iframe
  src="example-doview-board_doview-board_v1.3.4_2026-06-16.html"
  sandbox="allow-scripts allow-downloads"
  style="width: 100%; height: 800px; border: 1px solid #ddd;">
</iframe>
```

For production use, choose sandbox permissions and hosting arrangements that match your security, privacy, access-control, and integration requirements. Do not host untrusted generated board HTML on the same origin as sensitive cookies, admin sessions, or privileged tools.

## 11. Config structure overview

A reference-engine-compatible config has this root shape:

```json
{
  "title": "Board Title",
  "slug": "board-slug",
  "subpages": [],
  "finalOutcomes": [],
  "sources": [],
  "savedState": {}
}
```

Main page types are:

```text
this_then
a how page using pageType: "how"
a documentation page using pageType: "documentation"
```

Common saved-state areas include:

```text
savedState.B
savedState.SP
savedState.FO
savedState.boardInfo
savedState.pageInfo
savedState.docContent
savedState.ttLinks
savedState.howLinks
savedState.measures
savedState.evalQuestions
savedState.tags
savedState.viewSettings
```

Use [`config-reference.md`](config-reference.md) for the detailed field-by-field reference.

## 12. Public surfaces developers may rely on

For V1.3.4 reference-engine work, developers may rely on these public surfaces:

- the release files named in this repository;
- the `DoView.init(config)` entry point;
- the root config fields documented in [`config-reference.md`](config-reference.md);
- page types `this_then`, `how`, and `documentation`;
- board-level `finalOutcomes`;
- saved-state fields documented in the config reference;
- the builder command-line arguments `--engine`, `--config`, and `--out`;
- the broad output-file shape produced by the builder.

Future releases may add fields. Developers should preserve unknown additive saved-state fields where practical.

## 13. Internal implementation details

Do not rely on these as stable public API unless a future release documents them as public:

- internal function names other than `DoView.init`;
- internal DOM structure;
- CSS class names;
- exact pixel layout;
- internal event handlers;
- internal localStorage key details;
- exact visual styling;
- private helper functions;
- incidental variable names;
- implementation comments;
- the order of non-public functions in the engine file.

You may inspect and adapt the engine under the applicable licence, but compatibility should be judged against the minimum specification and documented config behaviour, not against every private implementation detail.

## 14. Creating configs programmatically

When generating configs from your own app, AI system, script, or backend:

1. generate pure JSON;
2. include a title and stable slug;
3. include explicit page IDs;
4. include explicit `pageType` values;
5. include complete colour objects for generated This–Then Pages;
6. keep This–Then, How, Documentation, and Final Outcomes conceptually separate;
7. store rich state in `savedState`;
8. include `savedState.viewSettings` for generated standalone boards;
9. include builder-only `generationChecks` metadata for AI-generated configs;
10. run the builder, revise failed JSON, and rebuild until strict preflight passes;
11. confirm the final HTML contains the builder-created validation stamp and complete visible-URL Sources registry;
12. review board quality, sources, sensitivity, and confidentiality before publication.

Technical validity does not prove that the board is a good DoView model. For substantive quality, use the checklist in [`doview-board-minimum-spec.md`](../spec/doview-board-minimum-spec.md) and the expanded This–Then Page modelling rules in [`this-then-page-rules.md`](../spec/this-then-page-rules.md).

## 15. Working with This–Then links

This–Then links are directional causal or enabling links between This–Then Boxes.

In the reference config, they are stored in `savedState.ttLinks`.

A simple link object may include:

```json
{
  "id": "L001",
  "from": "p1-c0-b0",
  "to": "p1-c1-b0",
  "polarity": "positive",
  "light": "",
  "mainText": "",
  "notes1": "",
  "notes2": "",
  "notes3": "",
  "measures": [],
  "evalQuestions": [],
  "tagIds": []
}
```

This–Then links should preserve direction and, where used, polarity. `mainText` is the optional link Display Text. `light` is optional and may be empty/absent for unset; `grey` is a deliberate selected Traffic Lights value. `tagIds` is optional and preserves tags applied to the This–Then link. Generated link Display Text should not duplicate link Traffic Light labels, symbols, or status text; the official link Traffic Light belongs in `light`. Links should remain distinct from How links and page-jump navigation. Substantial This–Then Pages should be reviewed as causal networks: avoid isolated boxes, allow many-to-many causal contribution, and document important or non-obvious links where supported.

## 16. Working with How links

How links connect implementation items to outcomes or to other implementation items.

In the reference config, they are stored in `savedState.howLinks`.

How links may represent:

- upward Vertical Links;
- downward Vertical Links;
- same-level Cross-Links;
- skipped-level Cross-Links;
- unlevelled/Cross-Link How Page relationships;
- Level 2-or-deeper How-to-This–Then Cross-Links.

Vertical Links and Cross-Links should remain conceptually and visually distinct where possible. The reference config still uses internal fields such as `showLateralHow` and optional `linkKind: "lateral"` for backward-compatible Cross-Link support; do not rename internal data keys merely to match user-facing terminology.

There is one numbered vertical How Page hierarchy. A generated or built config must not contain more than one How Page with the same non-null numeric `howLevel`; use `howLevel: null` for lateral, Cross-Link, no-level, or non-hierarchical How Pages.

## 17. Measures and Evaluation Questions

Measures and Evaluation Questions are board-level reusable objects.

They may be associated with:

- This–Then Boxes;
- How Boxes;
- Final Outcome boxes;
- This–Then links, where supported by the reference engine.

Do not treat Measures and Evaluation Questions merely as display text. They should keep stable IDs and associations so that they can be reused, shown, hidden, searched, exported, and reviewed.

For a single box, do not attach the same Measure ID or Evaluation Question ID more than once. The V1.3.4 reference engine normalizes duplicate box-level Measure/Evaluation Question references on load/save while preserving the existing saved-state fields.

Box-level `savedState.B[boxId].measures` and `savedState.B[boxId].evalQuestions` arrays are valid associations and are the runtime source of truth for box association display. The runtime recognizes them for This-Then Boxes, How Boxes, and Final Outcome boxes even when a generated config does not include the optional redundant `savedState.SP` copy.

How Boxes, Measures, and Evaluation Questions may also carry an optional `displayId`. This is an editable user-facing identifier only; keep internal links and references on the stable `id`.

Measures and Evaluation Questions may carry optional Traffic Light metadata using `trafficLight`. Allowed values match the package Traffic Light states: `green`, `greenYellow`, `yellow`, `yellowRed`, `red`, `grey`, or empty/absent for unset. Existing items without `trafficLight` have no Traffic Light. The field is metadata for the existing Measure or Evaluation Question item, not a separate display-text field.

## 18. Documentation Pages

Documentation Pages hold longer-form supporting content. They are useful for assumptions, caveats, method notes, evidence summaries, instructions, and narrative explanation.

In the reference engine, Documentation Page content is stored in `savedState.docContent`, keyed by page ID.

If your implementation allows rich HTML or imported formatted content, apply security controls appropriate to the deployment context.

## 19. Saved state and local storage

The reference engine can restore board state from `savedState` and may also use browser localStorage for user edits and settings.

Do not treat localStorage as secure storage, audit storage, version control, or access control.

For generated boards, important board data should be embedded in the board file or stored in your own controlled backend. Where auditability or governance matters, use external version control, logging, review workflows, or database records outside the standalone board file.

## 20. Read-only copies

Read-only mode hides or disables editing through the board interface. It is useful for review, circulation, presentation, and sharing an agreed copy.

Read-only mode is not:

- access control;
- authentication;
- authorization;
- encryption;
- tamper protection;
- digital signing;
- audit logging;
- version control;
- a permissions system;
- a security boundary.

Anyone with the HTML file may be able to inspect, copy, edit, modify, extract, or redistribute an altered version using ordinary tools.

Do not present read-only copies as proof that a board is official, unchanged, certified, approved, locked, verified, or protected.

## 21. Board Chat

Board Chat is optional. DoView Boards can be viewed, edited, saved, copied, printed, presented, and opened in read-only mode without Board Chat.

A DoView-compatible implementation does not need to implement Board Chat.

If you implement or enable Board Chat, remember that board content may be sent to the custom AI endpoint configured by the user, using the API key or session credential entered for that session. API keys are sensitive, session-only, and must not be embedded in exported board files, localStorage, or exported board state. For enterprise, regulated, sensitive, confidential, public, or multi-user deployment, use approved endpoints and appropriate backend/proxy, logging, audit, retention, and data-handling arrangements.

Do not make hidden or unsolicited external network calls, fetch external files, publish files, overwrite local files, or send board content to any endpoint unless the user explicitly requested the action, supplied any needed endpoint or credential, and the host platform permits it. This does not block explicit user-triggered Board Chat, Save / Download Board, Copy HTML Board, or Update Board Changes to Main AI Chat actions.

## 22. Security and deployment checklist

Before deploying or sharing generated boards, check:

- [ ] the board file came from a trusted source;
- [ ] the engine and builder are from the intended release;
- [ ] the final HTML contains one engine and one config initialization;
- [ ] the board does not include confidential or regulated information unless appropriate controls are in place;
- [ ] the board has been reviewed for source accuracy and content quality;
- [ ] untrusted board HTML is not hosted on a sensitive origin;
- [ ] iframe sandboxing or isolated hosting is used where appropriate;
- [ ] Board Chat is disabled or governed appropriately;
- [ ] read-only mode is not being treated as a security boundary;
- [ ] users understand that standalone HTML boards are active JavaScript files.

See [`security-and-read-only-notes.md`](security-and-read-only-notes.md) for more detail.

## 23. DoView-compatible vs Official DoView®

You may accurately describe software as:

- DoView-compatible;
- supporting DoView Boards;
- based on DoView Planning;
- implementing the DoView Boards minimum standard;
- creating DoView-compatible boards.

Do not imply that your product, service, board, app, platform, system, training, consulting, integration, or repository is official, endorsed, certified, approved, quality-assured, affiliated with DoView®, or entitled to use the Official DoView® Badge unless written permission has been given.

Official status, badge use, certification, approval, review, quality assurance, collaboration, or permission questions can be raised through:

<https://doviewplanning.org/contact>

See [`trademark-and-attribution.md`](trademark-and-attribution.md).

## 24. Recommended acknowledgments

A suitable general acknowledgment is:

> This work uses the DoView Planning approach and DoView Boards developed by Dr Paul Duignan. See DoViewPlanning.org.

A suitable software acknowledgment is:

> This software supports DoView Boards using the DoView Planning approach developed by Dr Paul Duignan. See DoViewPlanning.org. This software is not affiliated with or endorsed by DoView®.

Use a location that fits your product, such as a README, About page, documentation, help screen, licence notice, settings screen, or acknowledgments page.

## 25. Apache-2.0 licence and trademark separation

The code and materials in this repository are released under the Apache License, Version 2.0, unless a file says otherwise.

Apache-2.0 permits broad reuse, including commercial reuse, subject to its terms.

Trademark rights are separate. Apache-2.0 does not grant permission to claim official DoView® endorsement, certification, approval, quality assurance, affiliation, or badge rights.

## 26. Versioning and compatibility

This guide targets DoView Boards V1.3.4.

When building on the reference package, state which DoView Boards version and specification version your implementation targets.

Suggested wording:

```text
This tool targets the DoView Boards V1.3.4 minimum specification.
```

If you adapt the reference engine, keep your own release history and clearly identify changes that may affect config compatibility, security, Board Chat behaviour, saved state, or generated-board output.

## 27. Future checksum verification

Checksum or signed release verification is planned for a future release.

Until that is available, users and developers should download DoView files only from the official DoViewPlanning GitHub repository or another official DoView source.

When checksum files are added later, this guide can be updated with verification commands and release-integrity instructions.

## 28. Common mistakes to avoid

Avoid these mistakes:

- putting the whole standalone HTML file into the builder as config input;
- wrapping the config in `DoView.init(...)` before giving it to the builder;
- embedding the prompt package in final board HTML;
- embedding the builder in final board HTML;
- duplicating the engine in the generated board;
- treating localStorage as secure storage;
- treating read-only mode as tamper protection;
- confusing page jumps with structural links;
- confusing How links with This–Then causal links;
- describing an implementation as official without written permission;
- using the Official DoView® Badge without written permission;
- generating boards that are technically valid but shallow, generic, under-linked, or template-shaped;
- generating populated This–Then Pages from a repeated 3x2, 3x3, `4-4-4-4`, or `4-4-4-3` template rather than from the domain logic.

## 29. Relationship to the examples

The examples are reference examples. They demonstrate how the released engine renders standalone boards.

They are not mandatory templates. Developers should not mechanically copy their structure into every board.

Use the examples to inspect:

- standalone HTML structure;
- embedded engine behaviour;
- config and saved-state patterns;
- page types;
- This–Then links;
- How links;
- Measures;
- Evaluation Questions;
- Documentation content;
- view settings.

Substantial boards should be shaped by the domain they represent, not by the geometry of an example file.

## 30. Developer checklist

Before releasing a DoView-compatible tool or generated board, check:

- [ ] It preserves This–Then, How, Documentation, and Final Outcomes distinctions.
- [ ] It preserves link-type meanings.
- [ ] It implements or preserves the This–Then Page modelling rules in the minimum specification and `spec/this-then-page-rules.md`.
- [ ] It preserves Display Text, Notes, Measures, Evaluation Questions, Sources, and Tags where supported.
- [ ] It does not discard unknown additive saved-state fields without reason.
- [ ] It treats generated HTML boards as active JavaScript files.
- [ ] It does not treat read-only mode as a security boundary.
- [ ] It uses DoView-compatible wording accurately.
- [ ] It does not imply official status without written permission.
- [ ] It includes suitable attribution.
- [ ] It states the DoView Boards version or specification version targeted.
