# DoView Board Examples

**DoView Boards package version:** V1.3.7  
**Release date:** 2026-06-26  
**Document status:** Examples guide for the V1.3.7 full GitHub repository/package release

This folder contains example DoView Board files for users and developers.

## Complete standalone HTML board examples

These files are complete generated DoView Boards. Open them in a browser to see finished boards.

- [`simple-example.html`](simple-example.html) — a small standalone board example.
- [`complex-example.html`](complex-example.html) — a larger standalone board example.

Standalone `.html` boards contain active JavaScript. Treat them like executable web content, not passive documents.

The package/developer copy of the standalone walkthrough is in [`../docs/walkthrough/`](../docs/walkthrough/).

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
  --out my-board.html
```

## Collection JSON configuration examples

These files are configuration examples for DoView Board Collections. They are not complete standalone DoView Boards.

- [`collections.json`](collections.json) — example `collections` list for a collection-of-collections page.
- [`collection.json`](collection.json) — example `boards` list for one collection folder.

Use `collections.json` to list collections. Use `collection.json` to list boards inside one collection.

Developer templates for collection index pages are in [`../docs/collection-index/`](../docs/collection-index/).

## Read-only example

- [`read-only-example.html`](read-only-example.html) — demonstrates a read-only board copy.

Read-only mode is a convenience feature. It is not access control, authentication, authorization, encryption, tamper protection, digital signing, audit logging, version control, or a security boundary.

## Which example should I use?

Use the HTML examples when you want to see a finished board.

Use the JSON examples when you want to understand, test, or adapt the config format.

Use the collection JSON examples when you want to understand how collection index pages can list collections and board files.

Use the read-only example when you want to inspect how a read-only board copy behaves.
