# DoView Boards

**DoView Boards package version:** V1.3.6  
**Release date:** 2026-06-19  
**Release status:** Public DoView Boards V1.3.6 release. It adds safe Node.js runtime-check guidance for AI coding assistants and preserves runtime behaviour, builder validation, saved-state/schema, and generated-board causal structure.

## Official DoView Boards repository

This is the official DoView Boards repository maintained by Dr Paul Duignan / DoView Planning.

Our trademark use policy is very permissive. You can create DoView-compatible tools, boards, apps, plugins, integrations, repositories, training, consulting and resources. You just cannot imply that your work is official, endorsed, certified, approved, quality-assured, affiliated with, or produced by Dr Paul Duignan / DoView Planning unless this has been agreed in writing.

For the full trademark-use policy, see <https://doviewplanning.org/trademarkuse>.

To discuss official endorsement, certification, approval, quality assurance, affiliation, production, collaboration, or other official status, contact us at <https://doviewplanning.org/contact>.

## What are DoView Boards?

DoView Boards are drill-down visual planning and coordination boards based on This→Then causal logic. They represent what needs to happen for action in the world to produce desired outcomes. They use two novel approaches to planning. First they are based around a This-Then diagram showing the outcomes being sought and the steps it is believed will lead to them. Most planning apps start from the point of view of what you are going to do, rather than from the point of view of the outcomes you are seeking. In this sense DoView Boards can be seen as sitting 'above' traditional project planning apps and platforms, enabling you to see why you are doing projects or activities. Second, they have been designed to enable the one DoView Board to cover all of the things that are needed to plan, draw on previous evidence, prioritize, delegate or contract, measure, evaluate, hold parties to account, improve and report on any organization or any other type of initiative. 

The current iteration of DoView Boards is a prototype for use in piloting, proof of concept and for use in situations where confidentiality and security risks are low. Anyone is free to develop other DoView Board apps and extend the minimum specification that is provided in this repository.  

The DoView Boards prompt package lets you ask an AI system such as ChatGPT, Claude, or another suitable model to create a DoView Board on a topic. The AI generates a standalone DoView Board web app: a single `.html` file that opens in a browser and contains both the DoView Board interface and the topic-specific board content. There is no separate installed app required for use.

The design of the current DoView Board app builds on the earlier [legacy DoView app](https://github.com/doviewplanning/official-doview-legacy-app), which was developed to draw DoView Boards and DoView Strategy/Outcomes diagrams. The legacy DoView app was used in over 55 countries and won Gartner Cool Vendor recognition. The Gartner citation described the approach as “Sometimes simplicity and elegance define use.” The current standalone DoView Board web app is therefore not a new idea created from scratch; it is a browser-based prototype that carries forward the design intent and practical experience behind the earlier DoView app.

DoView strategy/outcomes models, now able to be generated as DoView Boards have been used for planning and outcomes work in thousands of instances. Their utility and usability have been progressively optimized by Dr Paul Duignan and others using them for planning, coordination, alignment, implementation, performance measurement, delegation, contracting, and evaluation.

DoView Boards are not just drawing canvases. They represent outcomes, enabling conditions, actions, implementation work, evidence, measures, evaluation questions, sources, assumptions, risks, and supporting documentation in a structured form.

DoView Planning https://doviewplanning.org is a practical application of outcomes theory https://doviewplanning.org/theory, https://doviewplanning.org/book. Outcomes theory theorizes outcomes systems as any system that identifies, prioritizes, delegates or contracts, implements, measures, attributes, or holds parties to account for outcomes of any type undertaken by humans in any context. The same approach is likely to be useful for human/AI agent collaboration and may be useful for inter-AI agent collaboration, planning and implementation.

The DoView Board prototype app is an app for capturing all of the key elements of any outcomes system as they are conceptualized within outcomes theory.

For more information, see <https://doviewplanning.org>.

DoView Boards can be used for ordinary planning, organisational strategy, project coordination, implementation, monitoring, evaluation, delegation, contracting, performance measurement, human-AI coordination, and more.

The value of DoView Boards is not just that they are visual. Their value is that they structure interaction around the relevant underlying This→Then logic: what must happen for actions, activities, resources, information, decisions, or implementation work to contribute to desired outcomes.

Experimentally, DoView Boards may also provide a visual interface for human-AI coordination and agentic systems. They may help people use AI systems through a structured visual artefact rather than relying only on text chat. This is an experimental use, not a security, governance, or control guarantee.

## What this repository contains

This repository is a practical starting point for users, developers, researchers, experimenters, and organisations that want to understand, generate, implement, or extend DoView Boards.

The V1.3.6 full GitHub repository/package release includes the V1.3.6 prompt, reference runtime, builder, documentation, tests, and examples:

- the Start Here master prompt for opening interaction and board setup;
- the DoView Board building prompt;
- the canonical JavaScript reference engine;
- the plain Node.js board builder;
- simple and complex standalone HTML board examples;
- JSON config examples for developers;
- collection JSON configuration examples;
- the standalone walkthrough package/developer copy under `docs/walkthrough/`;
- collection-index developer prompt and templates under `docs/collection-index/`;
- a beginner-friendly guide to publishing DoView Board Collections with GitHub Pages;
- the DoView Board minimum specification;
- developer integration documentation;
- config reference documentation;
- security and read-only notes;
- trademark and attribution guidance;
- Apache-2.0 licence material;
- instructions for AI coding agents working with this repository;
- guidance for humans commissioning AI-built DoView-compatible apps;
- a plain Node.js strict-preflight regression fixture runner;
- contribution guidance for developers and users.

This repository does not currently contain the legacy DoView app, PowerPoint board generator prompt, or PDF board examples. The legacy DoView app and its source code are available separately at <https://github.com/doviewplanning/official-doview-legacy-app>.



## Building apps from this repository with AI coding agents

This repository can be used by human developers and AI coding agents as a starting point for building DoView-compatible apps, platforms, plugins, integrations, or workflows.

If you are using Claude Code, Codex, Cursor, Replit Agent, or another AI coding agent, start with:

- [`AGENTS.md`](AGENTS.md) — instructions for AI coding agents working in this repository.
- [`docs/ai-app-build-guidance.md`](docs/ai-app-build-guidance.md) — guidance for humans commissioning an AI-built DoView Boards app.

Do not simply ask an AI agent to “build the app” without specifying the app requirements. Decide whether the app is local-only or hosted, single-user or multi-user, authenticated or unauthenticated, collaborative or non-collaborative, prototype or production, and whether it should reuse the reference engine or implement the specification in another stack.

If an AI coding agent is asked to build a DoView Boards app from this repository and the app requirements are not specified, it should ask for the missing requirements listed in [`docs/ai-app-build-guidance.md`](docs/ai-app-build-guidance.md) before making major architecture choices.


## For ordinary users

The easiest way to use DoView Boards is to get the full DoView Boards prompt package from:

<https://doviewplanning.org/prompt>

That page is the recommended starting point for ordinary users. It explains how to use the prompt package with ChatGPT, Claude, or another AI system to create a standalone DoView Board.

When using the prompt package, a generic request such as "build a DoView Board" starts the setup flow. It is not treated as the board topic. To build a standard board, provide the name of the organization, initiative or other organized work when asked.

This GitHub repository contains the same public release materials for people who want to inspect the files, download a release package, or work with the reference engine and developer documentation.

Ordinary users usually do not need to work directly with the JavaScript engine, builder, config reference, or developer integration guide.

Generated standalone boards are active `.html` files containing JavaScript. Treat them like executable web content, not passive documents. See [`security-and-read-only-notes.md`](docs/security-and-read-only-notes.md).


## For developers

Developers can use this repository to:

- inspect the canonical V1.3.6 reference engine;
- generate standalone board HTML files;
- create tools that output reference-engine-compatible configs;
- embed DoView Boards in other systems;
- build DoView-compatible apps, platforms, plugins, AI tools, integrations, or workflows;
- implement the DoView-compatible standard in another technical stack.

The package is designed around **one canonical reference engine**. Do not treat the prompt, builder, examples, or engine internals as separate competing standards. The minimum specification defines the DoView-compatible standard; the reference engine demonstrates one working implementation of it.

Developer starting points:

- [`000-START-HERE-RUN-FIRST.md`](000-START-HERE-RUN-FIRST.md)
- [`spec/doview-board-minimum-spec.md`](spec/doview-board-minimum-spec.md)
- [`spec/this-then-page-rules.md`](spec/this-then-page-rules.md)
- [`docs/developer-integration-guide.md`](docs/developer-integration-guide.md)
- [`docs/config-reference.md`](docs/config-reference.md)
- [`doview-board-engine.js`](doview-board-engine.js)
- [`doview-board-builder.js`](doview-board-builder.js)

## Developer note: preserve the DoView Drawing Rules

DoView Boards are built around the DoView Drawing Rules. These rules guide how This-Then pages are drawn and are central to the method.

Developers and AI coding agents should preserve the Drawing Rules when changing prompts, examples, builder behaviour, documentation or specifications. See [`spec/this-then-page-rules.md`](spec/this-then-page-rules.md) for the authoritative This-Then Page modelling rules, read with [`spec/doview-board-minimum-spec.md`](spec/doview-board-minimum-spec.md).

AI-generated boards, especially sets of boards, should also be reviewed for repeated hidden structures, generic causal pathways, and shallow renaming of the same model.

The release package should preserve canonical repository filenames and folder names. Timestamp-suffixed duplicate files or folders should not be included in public release ZIPs.

## Developer quick start

The builder takes a pure JSON board config and the reference engine, then creates a standalone HTML board.

The builder requires Node.js because `doview-board-builder.js` is a Node.js script. Node.js is a separate runtime and is not bundled with this package. Check for it with `node --version` or `command -v node`. If it is not installed, ask your AI assistant how to install Node.js for your computer or environment. If it is installed under a non-standard command or path, provide that command or path rather than searching broadly through the filesystem.

```bash
node doview-board-builder.js \
  --engine doview-board-engine.js \
  --config doview-board-config.json \
  --out doview-board-example.html
```

The config input should be JSON only. It should not include prompt text, builder source, duplicate engine code, or a `DoView.init(...)` JavaScript wrapper.

For AI-generated configs, include top-level builder-only `generationChecks` metadata and run the builder until strict preflight validation passes. The builder strips `generationChecks`, completes the board-level Sources registry for visible board-content URLs while excluding fixed package/help URLs, and inserts a `builderValidation` stamp before embedding the final config in standalone HTML. Older configs without `generationChecks` keep the compatibility path, which still runs high-confidence baseline checks and records the compatibility mode accurately.

The generated output is a standalone `.html` board containing active JavaScript.

See [`docs/developer-integration-guide.md`](docs/developer-integration-guide.md) and [`docs/config-reference.md`](docs/config-reference.md) for details.

## Publishing DoView Board Collections

To put a DoView Board Collection on the internet using GitHub and GitHub Pages, start with [`How to Put a DoView Board Collection Onto the Internet`](docs/how-to-put-a-doview-board-collection-onto-internet.md).

Developer templates for collection index pages are included under [`docs/collection-index/`](docs/collection-index/).

The short distinction is:

```text
collections.json = lists collections
collection.json = lists boards inside one collection
```

When adding a board to an existing collection folder, normally update that folder's `collection.json`. Update the top-level `boards/collections.json` when adding, removing, renaming, or recounting a whole collection.

## DoView-compatible vs Official DoView®

A board, app, platform, tool, or system may be described as **DoView-compatible** when it accurately implements the minimum structure and behaviour described in [`spec/doview-board-minimum-spec.md`](spec/doview-board-minimum-spec.md).

DoView-compatible does **not** mean official, endorsed, certified, approved, quality-assured, affiliated with DoView®, or entitled to use the Official DoView® Badge.

“Official DoView®” status, official endorsement, certification, approval, quality assurance, affiliation, official badge use, and similar claims require written permission from the relevant DoView® rights holder.

The Official DoView® Badge included in boards generated by the official package identifies the official package/source. It does not mean the content of a user-created board has been reviewed, endorsed, certified, approved, or quality-assured.

To ask about official status, badge use, collaboration, review, quality assurance, or permission, contact DoView Planning at <https://doviewplanning.org/contact>.

See [`docs/trademark-and-attribution.md`](docs/trademark-and-attribution.md).

## Attribution

Please acknowledge DoView Planning and Dr Paul Duignan when you use the approach or create DoViews, DoView Boards, or related DoView-based models.

A suitable general acknowledgment is:

> This work uses the DoView Planning approach and DoView Boards developed by Dr Paul Duignan. See DoViewPlanning.org.

For software, apps, platforms, integrations, AI systems, or developer tools, a suitable acknowledgment is:

> This software supports DoView Boards using the DoView Planning approach developed by Dr Paul Duignan. See DoViewPlanning.org. This software is not affiliated with or endorsed by DoView®.

See [`docs/trademark-and-attribution.md`](docs/trademark-and-attribution.md).

## Licence

The code and materials in this repository are released under the Apache License, Version 2.0, unless a file states otherwise.

Apache-2.0 is a permissive open-source licence. It allows broad reuse, including commercial reuse, subject to its terms.

Trademark rights are separate. The Apache-2.0 licence does not grant permission to claim official DoView® endorsement, certification, approval, quality assurance, affiliation, or badge rights.

See [`LICENSE`](LICENSE), [`NOTICE.md`](NOTICE.md), and [`docs/trademark-and-attribution.md`](docs/trademark-and-attribution.md).

## Security and read-only warning

Generated standalone DoView Boards are active HTML/JavaScript files. Treat them like executable web content, not passive documents.

The V1.3.6 prototype is intended for experimentation, learning, proof-of-concept work, and non-confidential information in low-risk environments. For higher-risk, sensitive, confidential, regulated, public, multi-user, enterprise, or production environments, use security, privacy, compliance, hosting, access-control, audit, data-handling, integration, and deployment arrangements appropriate to that environment.

Generated boards from untrusted sources should not be opened casually. Hosted or shared boards should not be served from the same origin/domain as sensitive applications.

Read-only mode is a convenience feature. It is not access control, authentication, authorization, encryption, tamper protection, digital signing, audit logging, version control, a permissions system, or a security boundary.

Board Chat is optional and inactive unless configured and used. The presence of Board Chat code does not by itself mean board content is sent to an AI provider. If no AI endpoint/API key is entered and the user does not use Board Chat, the board does not send board content to an AI provider through Board Chat. If Board Chat is used, board content may be sent to the configured endpoint using the API key or session credential entered for the session. API keys are not saved by the board. For sensitive or higher-risk use, leave Board Chat unconfigured/disabled and do not enter an API key unless appropriate endpoint, privacy, security, compliance, and data-handling arrangements are in place.

See [`docs/security-and-read-only-notes.md`](docs/security-and-read-only-notes.md) and [`SECURITY.md`](SECURITY.md).

## Checksums and release verification

Checksum verification or signed release verification is planned for a future release.

For now, download DoView Boards files only from the official repository at <https://github.com/doviewplanning/official-doview-boards> or another official DoView source.

Future releases may add files such as:

```text
CHECKSUMS.txt
CHECKSUMS.sha256
docs/verifying-downloads.md
```

## Examples

The [`examples`](examples/) folder contains two kinds of examples.

### Standalone HTML board examples

These are complete generated DoView Boards. Open them in a browser to see finished boards.

- [`examples/simple-example.html`](examples/simple-example.html)
- [`examples/complex-example.html`](examples/complex-example.html)

### Developer JSON config examples

These are smaller config examples for developers. They show the structures used by the reference engine and builder. They are not complete standalone boards by themselves.

- [`examples/minimal-config.json`](examples/minimal-config.json)
- [`examples/this-then-page-example.json`](examples/this-then-page-example.json)
- [`examples/how-page-example.json`](examples/how-page-example.json)
- [`examples/documentation-page-example.json`](examples/documentation-page-example.json)
- [`examples/measures-eqs-example.json`](examples/measures-eqs-example.json)
- [`examples/collections.json`](examples/collections.json)
- [`examples/collection.json`](examples/collection.json)

### Read-only example

- [`examples/read-only-example.html`](examples/read-only-example.html)

Use the HTML examples when you want to see a board. Use the JSON examples when you want to understand or test the config format. Use the collection JSON examples when you want to understand collection index configuration.



## Contributing

Contributions, suggestions, issue reports, examples, corrections, and implementation feedback are welcome. Please do not submit confidential, private, client, regulated, personal, commercially sensitive, or security-sensitive board content.

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Contact / Feedback

For questions, bug reports, or suggestions about DoView Boards, please open an issue in this repository.

For general information about DoView Planning, see https://doviewplanning.org.

## Public release history

See [`CHANGELOG.md`](CHANGELOG.md).

V1.3.6 is the current public full GitHub repository/package release. It adds safe Node.js runtime-check and user-explanation guidance for AI coding assistants. Runtime behaviour, builder validation, saved-state/schema, and generated-board causal structure remain unchanged.

## More information

- DoView Planning: <https://doviewplanning.org>
- Contact DoView Planning: <https://doviewplanning.org/contact>
