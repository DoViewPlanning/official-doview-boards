# DoView Board Collection GitHub Upload Prompt

Use this prompt when you want an AI assistant to prepare a DoView Board collection folder for the GitHub repository:

`https://github.com/doviewplanning/official-doview-board-collection/tree/main/boards`

The assistant should create or amend a subfolder collection under `/boards/`, prepare an `index.html`, prepare or update the subfolder `collection.json`, and, where appropriate, prepare an amended main `/boards/collections.json`.

---

## What the user should upload

Ask the user to upload:

1. The current main `/boards/collections.json` file from GitHub.
2. If the overall collections page itself is being created or changed, the current `/boards/index.html` file from GitHub. Use `templates/00-main-boards-index-template.html` if it is missing or if the user wants to rebuild it from the standard template.
3. If amending an existing subfolder collection, the existing subfolder `collection.json` and, if the layout is being changed, the existing subfolder `index.html`.
4. The DoView Board `.html` files to be placed in the subfolder.
5. Any list of intended board titles, agencies, departments, domains, initiatives, or placeholder boxes.
6. Any preferred folder name, title, subtitle, ordering, and count wording.

If the user is creating a new subfolder collection, return an amended main `/boards/collections.json`. If the user is only changing the design of an existing subfolder and the main collection entry does not change, say whether the main `/boards/collections.json` is unchanged. If the count, title, href, or ordering changes, return an amended main `/boards/collections.json`.

Always return the finished subfolder as a ZIP that the user can unzip and upload to GitHub. Also provide separate download links for the generated `index.html`, subfolder `collection.json`, and amended main `/boards/collections.json` when applicable.

---

## Overall `/boards/index.html` template

This package also includes `templates/00-main-boards-index-template.html`. Use it only for the top-level collection-of-collections page that lives at:

`/boards/index.html`

This file should load:

`./collections.json`

and render each entry in the `collections` array as a collection card. It is not a subfolder collection index, and it should not load `./collection.json`.

When the user asks to create or repair the main collections overview page, return an updated `/boards/index.html` as well as the updated `/boards/collections.json`. When the user is only adding a new subfolder collection and the existing `/boards/index.html` already works, do not change it unless the user asks.

---

## First question to ask the user

Before generating files, ask the user which index template they want:

**Option 1 — Simple live-board collection**

Use this when every box is a live DoView Board. There is no top apex board and no placeholder boxes. Example: an International Development collection containing five live boards.

**Option 2 — Apex board plus live-board collection**

Use this when there is one centered top apex / high-level board, followed by a collection of live DoView Boards. Do not include the yellow/orange instruction strip unless there are placeholders.

**Option 3 — Live boards plus placeholders**

Use this when some boxes are live DoView Boards and other boxes are illustrative placeholders. This option may be used with or without a centered top apex board. Only this option should include the yellow/orange instruction strip:

`White boxes link to live DoView Boards. Gray boxes are illustrative placeholders.`

Use US spelling in all text: `gray`, `centered`, `organization`, `program`, `behavior`, etc.

---

## Design rules for all templates

Use the templates in the `templates/` folder in this package as the starting point.

General rules:

- Use the orange DoView header and the same collection-page visual style as the existing collection pages.
- Use US spelling throughout.
- Do not put board numbers in the pill labels.
- For live board boxes, the pill should normally say: `DoView Board`.
- For placeholder boxes, the pill should say: `Placeholder`.
- Do not add extra descriptive text inside board boxes unless the user explicitly asks for it.
- Board boxes should normally contain only the board/agency/title text and a pill.
- Do not include the yellow/orange instruction strip except for Option 3, where there are placeholders.
- If there are no placeholders, remove any text such as “White boxes link…” or “Just click on white boxes.”
- Use `v1.3.6` in the collection page chrome unless the user supplies a newer collection-index standard.
- Preserve uploaded DoView Board `.html` files as standalone board files. Do not rewrite the embedded DoView Board engine unless the user specifically asks.
- Remove duplicate-upload suffixes from filenames such as `(1)` when building the GitHub folder, unless doing so would break a link already specified by the user.
- Use relative links from `index.html` to board files, e.g. `./example-board.html`.

---

## Folder and file naming

For a new subfolder collection:

- Use the user-provided folder name exactly, unless it contains spaces or unsafe characters.
- The folder path should be `/boards/<folder-name>/`.
- The ZIP should contain a top-level folder named `<folder-name>/`.
- Inside that folder include:
  - `index.html`
  - `collection.json`
  - all live DoView Board `.html` files

For board filenames:

- Prefer the uploaded filename if it is already clean.
- If the uploaded filename contains `(1)`, remove the duplicate suffix in the packaged version and update `collection.json` accordingly.
- If the user requests a naming convention, rename files and update all references.

---

## Subfolder `collection.json` structure

Use JSON like this, adapted for the selected option:

```json
{
  "version": "v1.3.6",
  "title": "Collection Title",
  "subtitle": "A DoView Collection - illustrative boards",
  "currentTitle": "Collection short title",
  "status": "Illustrative only - Not Endorsed",
  "sectionTitle": "Agency Boards",
  "featured": null,
  "boards": [
    {
      "title": "Example Board",
      "file": "example-board.html"
    }
  ]
}
```

For an apex board, use:

```json
"featured": {
  "title": "High-Level Outcomes DoView Board",
  "file": "high-level-outcomes-board.html",
  "eyebrow": "Apex board"
}
```

For placeholders, include board entries with `status: "planned"` and no `file`:

```json
{
  "title": "Example Placeholder Agency",
  "status": "planned"
}
```

---

## Main `/boards/collections.json` rules

When creating a new subfolder collection, amend the uploaded main `/boards/collections.json` by adding a new collection entry. When updating an existing collection, update the existing entry if the count, title, href, or ordering changes.

Use this preferred overall ordering unless the user asks otherwise:

1. NZ Government
2. NZ Local Government
3. UK Government
4. US Washington State Government
5. Australia Queensland Government
6. European Union
7. International Organizations
8. International Development
9. International Cooperation
10. Large Companies
11. Research Domains
12. AI-Agent Building Projects
13. Typical Business Consulting Assignments
14. Generic Initiatives

For new collections not in this list, insert them where they make the most sense for public appeal, keeping similar collections together.

Use concise count text, for example:

- `5 boards`
- `1 apex · 5 live boards · 17 placeholders`
- `5 live boards · 15 placeholders`

Do not invent counts. Count live boards from entries with a `file` and not `status: "planned"`. Count placeholders from entries with `status: "planned"` or no file.

---

## Output checklist

Before responding, verify:

1. The ZIP has the correct folder structure.
2. `index.html` loads `./collection.json`.
3. Every live board in `collection.json` has a matching `.html` file in the ZIP.
4. Placeholder boxes have no broken links.
5. The main `/boards/collections.json` entry uses the correct folder href with trailing slash.
6. Counts in the main `/boards/collections.json` match the subfolder `collection.json`.
7. US spelling is used: especially `gray`, not `grey`.
8. The placeholder instruction strip appears only for Option 3.
9. Live board pills say `DoView Board`, not `Live DoView Board`, unless the user explicitly asks otherwise.
10. If `/boards/index.html` is supplied or generated, it loads `./collections.json`, not `./collection.json`.
11. The response includes download links for the ZIP and key JSON/HTML files.

---

## User-facing response format

After creating the files, respond briefly:

```text
Done. I prepared the <Collection Title> package.

Downloads:
- <ZIP link>
- <index.html link>
- <collection.json link>
- <amended /boards collections.json link, if applicable>

Upload steps:
1. Upload the folder <folder-name> into /boards/.
2. If supplied, upload the amended collections.json into /boards/ replacing the current one.
3. Commit changes on GitHub.
```
