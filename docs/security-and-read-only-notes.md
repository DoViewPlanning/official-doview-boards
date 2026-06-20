# Security and Read-Only Notes

**DoView Boards version:** V1.3.6  
**Release date:** 2026-06-19  
**Document status:** Developer and deployment guidance for this release

This document explains the main security, deployment, and read-only limitations for the DoView Boards V1.3.6 release. It is intended for people using, sharing, hosting, adapting, or integrating DoView Boards.

## 1. Main security principle

A generated DoView Board is an active standalone HTML/JavaScript file. Treat it like executable web content, not like a passive document.

The standalone walkthrough under `docs/walkthrough/` is also active HTML/JavaScript. Treat it the same way.

Open only board files from sources you trust. Do not run arbitrary third-party DoView Board HTML in a privileged app context, an authenticated admin environment, or the same origin as sensitive cookies, private sessions, or privileged tools.

The Save / Download Board workflow is user-triggered. In browsers that support a file-save picker, a board can write the generated standalone `.html` board to a file the user chooses. The board should not store local file paths, persist file handles, request directory access, read arbitrary local files, or write automatically on load.

## 2. Intended-use level of the prototype

The V1.3.6 DoView Board prototype is intended to make it easy to:

- experiment with DoView Boards;
- learn how they work;
- test ideas;
- explore proof-of-concept uses;
- use DoView Boards with non-confidential information in low-risk environments.

People and organizations are encouraged to build on the prototype and develop DoView Boards into their own apps, platforms, products, workflows, and systems. For higher-risk, sensitive, confidential, regulated, public, multi-user, enterprise, or production environments, put in place security, privacy, compliance, hosting, access-control, audit, data-handling, integration, and deployment arrangements appropriate to that environment.

## 3. Generated board files

Generated `.html` boards are complete board outputs. A saved board may include board content, structure, view settings, embedded state, and the DoView Board engine needed to open the board as a standalone file.

Do not assume that a generated board file is safe merely because it has a `.html` extension or because it looks like a document. Review and handle generated board files as executable web content.

Recommended handling:

- open only trusted board files;
- keep release engine and builder files from official sources;
- avoid manually combining unrelated engine, prompt, builder, or example code into final board HTML;
- review board content before publication or wider sharing;
- avoid including confidential, regulated, legally privileged, personal, or commercially sensitive information unless appropriate controls are in place;
- use version control or external records where auditability matters.

## 4. Hosting and deployment

For production, enterprise, public-sector, regulated, sensitive, or multi-user use, consider controls such as:

- sandboxed iframes;
- isolated origins;
- content-security policy appropriate to the hosting environment;
- restricted viewers;
- approved hosting arrangements;
- content review before publication;
- access control outside the board file;
- audit logging outside the board file;
- version control outside the board file;
- engine and builder version pinning;
- release manifests and file-integrity checks once available;
- disabling or governing Board Chat.

Do not host untrusted generated board HTML on the same origin as sensitive cookies, administrator sessions, private account sessions, or privileged internal tools.

## 5. Read-only copies

Read-only mode is a convenience feature for sharing an agreed board in a less editable form. It hides or disables editing through the board interface.

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

Anyone who has the HTML file may be able to copy, inspect, save, edit, modify, extract, or redistribute an altered version using browser tools, text editors, scripts, or other software.

Use read-only copies for presentation, review, circulation, and convenience. Do not use read-only copies as proof that a board is official, unchanged, approved, locked, verified, certified, or protected.

## 6. Board Chat

Board Chat is optional. A DoView Board can be viewed, edited, saved, copied, printed, presented, and opened in read-only mode without Board Chat.

Avoiding Board Chat is the simplest way to reduce Board Chat-related privacy, confidentiality, API-key, and external-data-sharing risk.

Board Chat is inactive unless configured and used. The presence of Board Chat code does not by itself mean board content is sent to an AI provider. If no AI endpoint/API key is entered and the user does not use Board Chat, the board does not send board content to an AI provider through Board Chat. The provider-transmission risk arises when a user configures an endpoint/API key and sends content through Board Chat.

If Board Chat is used, it may send board content to the custom AI endpoint configured by the user, using the API key or session credential entered for that session. Users and organizations should understand and approve any endpoint, provider, backend, proxy, logging, retention, and data-handling arrangements before using Board Chat with sensitive or controlled content.

In this release:

- API keys are sensitive;
- API keys should be treated as secrets;
- API keys are not saved by the board;
- users must re-enter API keys when they use Board Chat;
- remembered settings, where supported, are limited to endpoint/model settings and not API keys;
- opening a board should not contact any AI provider;
- Board Chat should only send after the user sends a message with an explicitly configured custom endpoint.

Users who do not configure Board Chat can still use the board manually in a normal Claude chat or another AI chat by putting the board content into that chat.

For enterprise, public-sector, regulated, sensitive, or multi-user deployments, disable Board Chat by default or govern it unless there is an approved custom AI endpoint, an approved backend or proxy, an approved logging and audit policy, an approved retention policy, and organizational approval for the board content being sent to that endpoint.

Do not allow arbitrary user-supplied AI endpoints in managed environments unless the organization has approved that risk.

For sensitive or higher-risk use, leave Board Chat unconfigured/disabled and do not enter an API key unless appropriate endpoint, privacy, security, compliance, and data-handling arrangements are in place.

## 7. Local browser storage

Some DoView Board behaviour may use local browser storage for convenience, such as saving board state or display preferences in the user’s browser.

Local browser storage is not a secure storage system. It should not be treated as encrypted, access-controlled, tamper-proof, centrally audited, or suitable for secrets.

Do not rely on local browser storage for security, compliance, evidence, official records, access control, or long-term preservation.

## 8. Builder and validation limits

The DoView Board Builder is an assembly and technical validation tool. It reads the engine and a pure JSON board config and assembles a final single-file HTML board. For AI-generated configs that include top-level builder-only `generationChecks` metadata, it also runs deterministic strict preflight checks and stops HTML output when those checks fail. Older configs use compatibility mode with high-confidence baseline checks. Successful builder outputs include a validation stamp so the Board info popup can show whether builder validation is confirmed.

Builder validation does not replace:

- human review;
- content-quality review;
- source checking;
- security review;
- legal review;
- privacy review;
- accessibility review;
- deployment review;
- organizational approval.

Before publishing or relying on a board, review the board’s content, sources, assumptions, structure, generated file, and deployment context.

## 9. AI-generated content review

The DoView Board prompt package may be used with AI systems to help create board content. AI-generated outputs should be reviewed before being relied on.

Review is especially important where a board may affect public communication, funding, evaluation, legal obligations, policy, services, health, safety, employment, education, vulnerable groups, or other consequential decisions.

## 10. Future checksum and verification work

Checksum verification or signed release verification is planned for a future release.

For now, users should download DoView Board files only from the official repository at <https://github.com/doviewplanning/official-doview-boards> or another official DoView source. When checksum or signature files are introduced, this document and the README should be updated with verification instructions.

## 11. Trademark and official-status note

Security controls, read-only mode, file checks, or compatibility with the DoView Boards minimum standard do not by themselves make a board, app, platform, product, or system official, endorsed, certified, approved, quality-assured, or affiliated with DoView®.

Use of the DoView® Marks, Official DoView® Badge, logos, certification marks, approval marks, compliance marks, or other official-status wording is governed by the DoView® trademark and attribution guidance. See `docs/trademark-and-attribution.md`.

## 12. No warranty

The DoView Boards V1.3.6 release is provided under the applicable licence terms. Review the Apache-2.0 licence and any accompanying notices. You are responsible for deciding whether the software, board files, AI-generated content, hosting, integrations, and deployment arrangements are appropriate for your use case.
