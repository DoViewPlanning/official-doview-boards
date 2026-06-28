# Security Policy

**DoView Boards version:** V1.3.7  
**Release date:** 2026-06-26  
**Document status:** Security policy for this release

## Supported versions

This repository currently supports the V1.3.7 DoView Boards prompt package release:

| Version | Supported |
|---|---|
| V1.3.7 | Yes |

Earlier internal development builds are not supported public releases.

## Reporting security issues

Please do not report security issues by opening a public GitHub issue if the issue could expose users to risk.

To report a security concern, contact DoView Planning:

<https://doviewplanning.org/contact>

Please include:

- the affected file or feature;
- the version number, if known;
- a short description of the issue;
- steps to reproduce the issue, where safe to share;
- any suggested mitigation or fix.

## Scope

Security reports may relate to:

- `doview-board-engine.js`;
- `doview-board-builder.js`;
- generated standalone DoView Board `.html` files;
- Board Chat behaviour;
- API-key handling;
- saved-state or exported-board behaviour;
- read-only copy behaviour;
- documentation that could create unsafe security expectations;
- examples or generated-board patterns that could mislead users about risk.

## Generated board warning

Generated standalone DoView Board `.html` files are active HTML/JavaScript files. They should be treated like executable web content, not passive documents.

Do not open generated boards from untrusted sources in sensitive environments.

For higher-risk, sensitive, confidential, regulated, public, multi-user, enterprise, or production use, deploy boards with security controls appropriate to the context, such as:

- trusted hosting;
- isolated origins;
- sandboxing;
- access controls;
- review of generated content;
- approved AI endpoints where Board Chat is used;
- content-security policy and isolation appropriate to the hosting environment;
- appropriate privacy, compliance, logging, retention, and audit arrangements.

## Read-only copies

Read-only copies are a convenience feature. They hide or disable editing through the board interface.

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

Do not rely on read-only mode to prove that a board is official, unchanged, approved, certified, verified, locked, or protected.

## Board Chat

Board Chat is optional. DoView Boards can be used without Board Chat.

Board Chat is inactive unless configured and used. The presence of Board Chat code does not by itself mean board content is sent to an AI provider. If no AI endpoint/API key is entered and the user does not use Board Chat, the board does not send board content to an AI provider through Board Chat.

If Board Chat is enabled and used, board content may be sent to the custom AI endpoint configured by the user, using the API key or session credential entered for that session. API keys are sensitive, session-only, and should not be embedded in generated board files, localStorage, or exported board state.

For sensitive or higher-risk use, leave Board Chat unconfigured/disabled and do not enter an API key unless appropriate endpoint, privacy, security, compliance, and data-handling arrangements are in place.

## Checksums and signed releases

Checksum or signed release verification is planned for a future release.

Until then, users should obtain DoView Boards release files only from the official repository at <https://github.com/doviewplanning/official-doview-boards> or official DoView Planning sources.

## More security guidance

For more detail, see [`docs/security-and-read-only-notes.md`](docs/security-and-read-only-notes.md).
