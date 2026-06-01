# DoView Board Examples

**DoView Boards version:** V1.2.1  
**Release date:** 2026-06-02  
**Document status:** Examples guide for the V1.2.1 DoView Boards prompt package release

This folder contains example DoView Board files for users and developers.

## Complete standalone HTML board examples

These files are complete generated DoView Boards. Open them in a browser to see finished boards.

- [`simple-example.html`](simple-example.html) — a small standalone board example.
- [`complex-example.html`](complex-example.html) — a larger standalone board example.

Standalone `.html` boards contain active JavaScript. Treat them like executable web content, not passive documents.

## Developer JSON config examples

These files are smaller config examples for developers. They show structures used by the reference engine and builder. They are not complete standalone boards by themselves.

- [`minimal-config.json`](minimal-config.json) — smallest useful complete board config.
- [`this-then-page-example.json`](this-then-page-example.json) — This–Then Page columns, boxes, many-to-many links, polarity, link Display Text, and link notes.
- [`how-page-example.json`](how-page-example.json) — How Pages, How Boxes, How levels, Vertical Links, and Cross-Links.
- [`documentation-page-example.json`](documentation-page-example.json) — Documentation Page structure, with formatted content stored in `savedState.docContent`.
- [`measures-eqs-example.json`](measures-eqs-example.json) — Measures and Evaluation Questions associated with boxes and This–Then links.

Use the JSON examples with the builder, for example:

```bash
node doview-board-builder.js \
  --engine doview-board-engine.js \
  --config examples/minimal-config.json \
  --out my-board_doview-board_v1.2.1_2026-06-02.html
```

## Read-only example

- [`read-only-example.html`](read-only-example.html) — demonstrates a read-only board copy.

Read-only mode is a convenience feature. It is not access control, authentication, authorization, encryption, tamper protection, digital signing, audit logging, version control, or a security boundary.

## Which example should I use?

Use the HTML examples when you want to see a finished board.

Use the JSON examples when you want to understand, test, or adapt the config format.

Use the read-only example when you want to inspect how a read-only board copy behaves.
