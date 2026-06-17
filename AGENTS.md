# Instructions for AI Coding Agents

**DoView Boards version:** V1.3.4  
**Release date:** 2026-06-16  
**Document status:** Instructions for AI coding agents working with this repository

This file is for AI coding agents such as Claude Code, Codex, Cursor, Replit Agent, and similar tools.

If you are an AI coding agent working in this repository, follow these instructions unless the human user gives a more specific instruction that is consistent with the DoView-compatible standard, security guidance, licence, and trademark guidance.

## Read these files first

Before making major changes, read:

1. [`000-START-HERE-RUN-FIRST.md`](000-START-HERE-RUN-FIRST.md), if you are changing prompt intake or setup flow
2. [`README.md`](README.md)
3. [`spec/doview-board-minimum-spec.md`](spec/doview-board-minimum-spec.md)
4. [`spec/this-then-page-rules.md`](spec/this-then-page-rules.md)
5. [`docs/developer-integration-guide.md`](docs/developer-integration-guide.md)
6. [`docs/config-reference.md`](docs/config-reference.md)
7. [`docs/security-and-read-only-notes.md`](docs/security-and-read-only-notes.md)
8. [`docs/trademark-and-attribution.md`](docs/trademark-and-attribution.md)
9. [`docs/ai-app-build-guidance.md`](docs/ai-app-build-guidance.md), if you are being asked to build an app

Use the JSON and HTML examples in [`examples/`](examples/) as reference examples, not as the full standard.

## Source-of-truth order

When interpreting this repository:

1. Treat [`spec/doview-board-minimum-spec.md`](spec/doview-board-minimum-spec.md) as the DoView-compatible standard for this release.
2. Treat [`spec/this-then-page-rules.md`](spec/this-then-page-rules.md) as the expanded This–Then Page modelling guidance. If it appears to conflict with the minimum specification, the minimum specification controls.
3. Treat [`doview-board-engine.js`](doview-board-engine.js) as the canonical V1.3.4 reference implementation.
4. Treat [`docs/config-reference.md`](docs/config-reference.md) as the technical reference for the reference-engine config shape.
5. Treat [`doview-board-builder.js`](doview-board-builder.js) as the reference local builder for assembling standalone HTML boards from JSON config.
6. Treat the files in [`examples/`](examples/) as examples of correct structure, not as limits on what DoView Boards can contain.
7. Treat [`docs/trademark-and-attribution.md`](docs/trademark-and-attribution.md), [`NOTICE.md`](NOTICE.md), and [`LICENSE`](LICENSE) as controlling repository guidance for licence, attribution, and DoView® trademark/status wording.

If these sources appear to conflict, do not silently guess. Flag the conflict and ask the human user.

## Preserve the DoView Drawing Rules

The DoView Drawing Rules are the core method that makes a DoView Board a DoView Board. They are not cosmetic formatting preferences.

Before changing prompts, examples, builder behaviour, documentation or specifications, identify the existing rules file that sets out the DoView Drawing Rules / This-Then Page rules. In this repository, use [`spec/this-then-page-rules.md`](spec/this-then-page-rules.md) as the authoritative expanded rules file, read with [`spec/doview-board-minimum-spec.md`](spec/doview-board-minimum-spec.md).

Do not turn DoView Boards into generic activity plans, generic strategy maps, or repeated AI-generated templates with only names changed.

## AI-generated board stereotyping and repeated-structure risk

AI-generated boards, especially sets of boards, can suffer from social stereotyping and structural stereotyping.

Structural stereotyping means producing boards that look different on the surface but are based on the same repeated hidden structure.

When reviewing generated boards or examples, check for repeated causal pathways, repeated This-Then page structures, repeated How-page structures, generic measures and evaluation questions, shallow renaming of the same model, and missing country, sector, organization or initiative-specific logic.

## Preserve DoView-compatible structure

Do not remove or blur the required DoView Board distinctions.

A DoView-compatible app, generator, importer, exporter, or conversion tool should preserve:

- This–Then Pages;
- How Pages;
- Documentation Pages;
- Final Outcomes;
- This–Then causal links;
- positive and negative This–Then polarity;
- upward How links;
- downward How links;
- non-up-and-down How links;
- page jump / drill navigation as distinct from structural links;
- Display text;
- Notes;
- Measures;
- Evaluation Questions;
- Sources;
- tags where implemented;
- saved-state fields where practical;
- view settings as presentation controls rather than data deletion;
- the distinction between DoView-compatible and Official DoView®.

Do not treat a DoView Board as just a generic drawing canvas, kanban board, flowchart, mind map, or diagramming surface.

## Do not overfit to examples

The examples are deliberately small and clear. They do not define the maximum complexity of a DoView Board.

Do not assume:

- all boards should have the same number of pages;
- all This–Then Pages should have the same number of columns;
- all pages should use the same visual geometry;
- one-to-one links are enough;
- examples contain all valid fields;
- example topics define the intended domain.

Substantial DoView Boards should be domain-shaped, not template-shaped. Follow the This–Then Page modelling rules in [`spec/doview-board-minimum-spec.md`](spec/doview-board-minimum-spec.md) and [`spec/this-then-page-rules.md`](spec/this-then-page-rules.md), including the page-shape, near-match, terminal-outcome, causal-connectivity, and many-to-many link rules.

## App-building instructions

If you are asked to build a DoView Boards app from this repository, first check whether the human user has specified the major app requirements listed in [`docs/ai-app-build-guidance.md`](docs/ai-app-build-guidance.md).

If the human user has not specified those requirements, ask for clarification before making major architecture choices.

Do not assume whether the app should be:

- local-only or cloud-hosted;
- single-user or multi-user;
- authenticated or unauthenticated;
- collaborative or non-collaborative;
- prototype or production;
- reference-engine-based or a reimplementation of the minimum specification;
- Board Chat enabled or disabled;
- suitable for confidential, regulated, enterprise, or public use.

## Security and read-only limits

Generated standalone DoView Board `.html` files are active HTML/JavaScript files, not passive documents.

Read-only copies are a convenience feature. They are not access control, authentication, authorization, encryption, tamper protection, digital signing, audit logging, version control, or a security boundary.

Do not design or document a system in a way that implies read-only mode proves a board is official, unchanged, approved, certified, verified, locked, or protected.

For production, public, enterprise, regulated, confidential, or multi-user systems, add appropriate security controls outside the prototype, such as authentication, authorization, access control, trusted hosting, audit logging, storage controls, privacy controls, sandboxing, and deployment controls.

## Board Chat and AI endpoints

Board Chat is optional. DoView Boards must remain usable without Board Chat.

If you implement or modify Board Chat:

- do not embed API keys in generated boards;
- do not save API keys in exported board state;
- make endpoint/provider behaviour clear to users;
- avoid sending board content to external AI providers without user awareness and appropriate governance;
- support disabling Board Chat where privacy, confidentiality, compliance, or enterprise policy requires it.

## Licence, attribution, and trademark boundaries

The code and materials in this repository are released under Apache-2.0 unless a file states otherwise.

Apache-2.0 does not grant permission to claim Official DoView® status, endorsement, certification, approval, quality assurance, affiliation, badge rights, or official logo rights.

You may use descriptive wording such as DoView-compatible or supports DoView Boards when accurate.

Do not claim or imply:

- Official DoView® status;
- DoView® certification;
- DoView® approval;
- DoView® quality assurance;
- DoView® endorsement;
- DoView® affiliation;
- Official DoView® Badge rights;
- formal DoView partnership;

unless the human user confirms written permission from the relevant DoView® rights holder.

To ask about official status, badge use, collaboration, review, quality assurance, endorsement, certification, or permission, direct the human user to:

<https://doviewplanning.org/contact>

## Contribution and change discipline

Keep changes focused and explain what changed.

Avoid broad refactors of the reference engine unless explicitly requested. The reference engine is a canonical working implementation for this release.

Preserve the start-flow separation: `000-START-HERE-RUN-FIRST.md` controls intake and setup; `doview-board-building-prompt.md` contains technical board-building rules.

When changing config fields, saved-state behaviour, generated-board behaviour, security wording, read-only behaviour, Board Chat behaviour, trademark wording, or compatibility language, update the relevant docs and examples.

Do not introduce external package dependencies into the builder unless explicitly requested.

Do not add confidential, private, client, or sensitive board content to examples, tests, issues, docs, or commits.

Preserve canonical repository filenames and folder names. Do not create or package timestamp-suffixed duplicate files such as `README 2.31.28 PM.md` or folders such as `docs 2.31.28 PM/`.
