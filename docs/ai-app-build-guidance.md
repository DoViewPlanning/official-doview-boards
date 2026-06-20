# Guidance for Building DoView Boards Apps with AI Coding Agents

**DoView Boards version:** V1.3.6  
**Release date:** 2026-06-19  
**Document status:** Human guidance for commissioning AI-built DoView-compatible apps

This document is for people who want to point an AI coding agent at this repository and ask it to build a DoView Boards app, platform, plugin, integration, or workflow.

Do not simply say “build the app” unless you are comfortable with the AI agent making major product and architecture assumptions.

Use this document to specify what you want before asking an AI coding agent such as Claude Code, Codex, Cursor, Replit Agent, or another tool to build from this repository.

## Short instruction to give an AI coding agent

You can start with this instruction:

```text
Using this repository, build a DoView-compatible app. Treat spec/doview-board-minimum-spec.md as the compatibility standard, doview-board-engine.js as the canonical V1.3.6 reference implementation, docs/config-reference.md as the reference config format, and AGENTS.md as your repository instructions. Before making major architecture choices, ask me to specify the missing decisions listed in docs/ai-app-build-guidance.md.
```

## If you are an AI coding agent

If you are asked to build a DoView Boards app from this repository and the user has not specified the decisions in this document, ask for clarification before making major architecture choices.

Do not assume whether the app should be local-only, cloud-hosted, single-user, multi-user, collaborative, authenticated, enterprise-ready, production-secure, Board Chat enabled, or based directly on the reference engine unless the user has said so.

## Decisions the human should specify

### 1. App purpose

Specify what the app is mainly for.

Examples:

- ordinary planning;
- organisational strategy;
- project coordination;
- outcomes modelling;
- implementation planning;
- monitoring and evaluation;
- delegation or contracting;
- performance measurement;
- human-AI coordination;
- AI-agent coordination;
- education or training;
- internal prototype;
- production platform.

### 2. Intended users

Specify who will use it.

Examples:

- individual users;
- teams;
- consultants;
- public-sector organisations;
- nonprofits;
- businesses;
- educators;
- researchers;
- developers;
- enterprise users;
- AI agents or automated systems.

### 3. Deployment model

Specify how the app should run.

Options include:

- local-only desktop or browser app;
- static web app;
- hosted web app;
- enterprise-hosted app;
- self-hosted app;
- plugin or embedded component;
- integration inside another product;
- command-line generator;
- API service.

### 4. User model

Specify whether the app is:

- single-user;
- multi-user;
- anonymous;
- account-based;
- organisation-based;
- role-based;
- public-facing;
- private/internal only.

### 5. Security and privacy level

Specify whether the app is for:

- experimentation only;
- non-confidential low-risk work;
- internal business use;
- confidential work;
- regulated work;
- public-sector work;
- enterprise production;
- public multi-user hosting.

For anything beyond experimentation or low-risk non-confidential use, the app should have security, privacy, compliance, hosting, access-control, audit, data-handling, and deployment arrangements appropriate to the context.

### 6. Storage model

Specify how boards should be stored.

Options include:

- local browser storage;
- downloaded standalone HTML files;
- JSON files;
- local database;
- cloud database;
- user-owned storage;
- organisation-owned storage;
- Git-based storage;
- integration with another system.

### 7. Collaboration

Specify whether collaboration is needed.

Options include:

- no collaboration;
- sharing exported files;
- read-only sharing;
- multi-user editing;
- comments;
- review workflows;
- approval workflows;
- real-time collaboration;
- version history.

### 8. Read-only expectations

Read-only copies are a convenience feature, not a security boundary.

If you need protected or controlled access, specify real access-control requirements such as authentication, authorization, permissions, audit logs, digital signatures, or server-side enforcement.

### 9. Reference engine vs reimplementation

Specify whether the app should:

- embed or adapt the V1.3.6 reference engine;
- use the reference engine only for compatibility testing;
- implement the DoView Board minimum specification in another stack;
- support importing/exporting the reference-engine config format;
- generate standalone HTML boards compatible with the reference engine.

### 10. Technology stack

Specify the preferred stack, if any.

Examples:

- plain HTML/CSS/JavaScript;
- React;
- Vue;
- Svelte;
- Next.js;
- Node.js;
- Python;
- Electron;
- Tauri;
- mobile app;
- browser extension;
- no preference.

### 11. Board Chat and AI features

Specify whether Board Chat or other AI features should be included.

Options include:

- no Board Chat;
- local-only AI features;
- user-provided API endpoint;
- organisation-approved AI endpoint;
- backend/proxy-managed AI endpoint;
- AI-assisted board generation only;
- AI-assisted editing;
- AI review and suggestions;
- AI-agent task coordination.

If AI endpoints are used, specify data-handling, privacy, logging, retention, API-key, and provider-governance requirements.

### 12. Import and export

Specify required formats.

Examples:

- reference-engine JSON config;
- standalone HTML board;
- read-only HTML copy;
- PDF;
- PowerPoint;
- image export;
- CSV;
- JSON API;
- legacy DoView app formats;
- integration with another planning, project-management, evaluation, or agentic system.

### 13. Compatibility target

Specify which compatibility target is required.

Examples:

- DoView-compatible only;
- reference-engine-compatible config;
- standalone generated HTML compatible with V1.3.6;
- import/export compatibility with this release;
- future-proof custom app based on the minimum specification.

### 14. Official status

Specify whether the app should merely be DoView-compatible or whether the builder wants to seek official DoView® review, approval, certification, quality assurance, affiliation, or badge use.

DoView-compatible wording may be used when accurate. Official DoView® status, badge use, certification, approval, quality assurance, endorsement, or affiliation requires written permission.

To ask about official status, badge use, collaboration, review, quality assurance, endorsement, certification, or permission, contact DoView Planning:

<https://doviewplanning.org/contact>

### 15. Accessibility and usability

Specify accessibility and usability requirements.

Examples:

- keyboard navigation;
- screen-reader support;
- colour contrast;
- low cognitive load;
- print layout;
- presentation mode;
- mobile layout;
- large-board navigation;
- search;
- zooming;
- export-friendly layout.

### 16. MVP scope

Specify what counts as the first usable version.

For example:

- create, edit, save, and reopen boards;
- support This–Then Pages, How Pages, Documentation Pages, and Final Outcomes;
- support required link types;
- support Measures and Evaluation Questions;
- support JSON import/export;
- support standalone HTML export;
- support read-only copies;
- support authentication and storage;
- support Board Chat or deliberately exclude it.

### 17. Acceptance tests

Specify how you will decide whether the app works.

Useful acceptance tests include:

- can load the JSON examples in `examples/`;
- can preserve This–Then, How, Documentation, and Final Outcomes structures;
- can preserve and support the This–Then Page modelling rules in `spec/doview-board-minimum-spec.md` and `spec/this-then-page-rules.md`;
- can distinguish all required link types;
- can save and reload without losing Measures, Evaluation Questions, notes, sources, tags, or view settings;
- can export a reference-engine-compatible config where required;
- does not present read-only mode as a security boundary;
- does not claim Official DoView® status;
- follows the security and trademark guidance in this repository.

## Prompt template for commissioning an app

Copy and adapt this:

```text
I want you to build a DoView-compatible app from this repository.

Purpose:
[describe purpose]

Users:
[describe users]

Deployment:
[local-only / web-hosted / enterprise / plugin / other]

User model:
[single-user / multi-user / accounts / roles / public / private]

Security/privacy level:
[prototype / low-risk / confidential / regulated / enterprise / public]

Storage:
[local storage / files / database / cloud / other]

Collaboration:
[none / sharing / comments / multi-user / real-time / approval workflow]

Reference engine:
[reuse the reference engine / reimplement the spec / import/export compatibility / other]

Technology stack:
[preferred stack]

Board Chat / AI:
[disabled / optional / user endpoint / approved endpoint / backend proxy / other]

Import/export:
[JSON / standalone HTML / read-only HTML / PDF / PowerPoint / API / other]

Compatibility target:
[DoView-compatible / reference-engine-compatible / V1.3.6 standalone HTML / other]

This–Then modelling:
[follow the minimum specification and spec/this-then-page-rules.md / explain any deliberate limits]

Official status:
[DoView-compatible only / seek official review later]

MVP:
[list required features]

Acceptance tests:
[list tests]

Use AGENTS.md as your repository instructions. Treat spec/doview-board-minimum-spec.md as the compatibility standard. Ask me before making major architecture assumptions.
```
