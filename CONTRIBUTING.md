# Contributing

**DoView Boards version:** V1.2.0  
**Release date:** 2026-05-22  
**Document status:** Contribution guidance for the V1.2.0 DoView Boards prompt package release

Contributions, suggestions, issue reports, examples, corrections, and implementation feedback are welcome.

Please keep contributions aligned with the DoView Boards minimum specification, security guidance, licence, and trademark guidance in this repository.

## Before contributing

Please read:

- [`README.md`](README.md)
- [`spec/doview-board-minimum-spec.md`](spec/doview-board-minimum-spec.md)
- [`docs/developer-integration-guide.md`](docs/developer-integration-guide.md)
- [`docs/config-reference.md`](docs/config-reference.md)
- [`docs/security-and-read-only-notes.md`](docs/security-and-read-only-notes.md)
- [`docs/trademark-and-attribution.md`](docs/trademark-and-attribution.md)
- [`AGENTS.md`](AGENTS.md), if you are using an AI coding agent to help

## What contributions are useful

Useful contributions may include:

- bug reports;
- documentation corrections;
- clearer examples;
- compatibility feedback;
- accessibility suggestions;
- security and read-only wording improvements;
- implementation notes from developers building DoView-compatible systems;
- config import/export improvements;
- tests or validation suggestions;
- issues found when using the builder or reference engine.

## Do not submit sensitive material

Do not submit confidential, private, client, regulated, personal, commercially sensitive, or security-sensitive board content in issues, examples, pull requests, screenshots, test files, or discussions.

If you need to discuss a sensitive issue, remove the sensitive content first or contact DoView Planning:

<https://doviewplanning.org/contact>

## Security issues

Please do not open a public issue for a security problem that could put users at risk.

For security concerns, contact DoView Planning:

<https://doviewplanning.org/contact>

See [`SECURITY.md`](SECURITY.md).

## Compatibility discipline

When proposing changes, preserve the core DoView-compatible structure:

- This–Then Pages;
- How Pages;
- Documentation Pages;
- Final Outcomes;
- required link types;
- Display text and Notes;
- Measures;
- Evaluation Questions;
- Sources;
- read-only limitations;
- DoView-compatible vs Official DoView® distinction.

Do not turn DoView Boards into a generic drawing canvas, flowchart, mind map, kanban board, or unstructured diagramming system.

## Reference engine discipline

The V1.2.0 reference engine is the canonical reference implementation for this release.

Avoid broad engine rewrites or cosmetic refactors unless they are clearly justified. Small, focused changes are easier to review and less likely to break compatibility.

If a change affects the engine, builder, config format, saved-state behaviour, generated standalone boards, security behaviour, Board Chat, read-only mode, or link semantics, update the relevant documentation and examples.

## Licence

Unless otherwise agreed, contributions to files released under Apache-2.0 are expected to be contributed under Apache-2.0.

See [`LICENSE`](LICENSE) and [`NOTICE.md`](NOTICE.md).

## Trademark and official-status wording

Do not add wording that claims or implies Official DoView® status, certification, approval, quality assurance, endorsement, affiliation, partnership, or badge rights unless written permission has been given by the relevant DoView® rights holder.

DoView-compatible wording is welcome where accurate.

For trademark and attribution guidance, see [`docs/trademark-and-attribution.md`](docs/trademark-and-attribution.md).

To ask about official status, badge use, collaboration, review, quality assurance, endorsement, certification, or permission, contact DoView Planning:

<https://doviewplanning.org/contact>

## Pull requests and issues

When opening an issue or pull request, please describe:

- what problem the change addresses;
- which files are affected;
- whether compatibility, config format, security, read-only behaviour, or trademark wording is affected;
- how the change was tested;
- any remaining uncertainties.

For documentation changes, please check internal Markdown links where practical.

For config examples, please make sure JSON is valid.
