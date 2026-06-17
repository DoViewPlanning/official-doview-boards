# How to Put a DoView Board Collection Onto the Internet

**DoView Boards package version:** V1.3.4  
**Release date:** 2026-06-16  
**Document status:** Beginner-friendly guide for publishing DoView Board Collections with GitHub Pages

This guide explains one simple way to publish a DoView Board Collection on the internet using GitHub and GitHub Pages.

GitHub Pages is a static site hosting service. It publishes HTML, CSS, and JavaScript files from a GitHub repository. GitHub Pages is available for public repositories with GitHub Free and GitHub Free for organizations. Other GitHub plans may support additional repository types. See GitHub's own documentation for current account and repository details:

- <https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages>
- <https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site>
- <https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>

## Simple Publishing Steps

1. Put the DoView Board Collection files into a GitHub repository.
2. Turn on GitHub Pages for that repository.
3. Open the published `/boards/` page.
4. To add a board to an existing collection, upload the new DoView Board HTML file to the correct collection folder and update that folder's `collection.json`.
5. To add a new collection, create a new collection folder and update `boards/collections.json`.

Generated standalone DoView Board `.html` files are active HTML/JavaScript files. Treat them like executable web content, not passive documents. Do not publish confidential, sensitive, regulated, personal, or client information unless you have appropriate review, hosting, access-control, privacy, and security arrangements outside the board files.

## Usual Folder Structure

A simple DoView Board Collection site can use this structure:

```text
boards/
  index.html
  collections.json

  international-cooperation/
    index.html
    collection.json
    regional-partnership-outcomes_doview-board_v1.2.7_2026-06-10.html
    shared-monitoring-framework_doview-board_v1.2.7_2026-06-10.html
```

The top-level `boards/` folder is the collection-of-collections area.

- `boards/index.html` is the collection-of-collections page.
- `boards/collections.json` lists the collections.
- Each collection folder has its own `index.html`.
- Each collection folder has its own `collection.json`.
- The folder's `collection.json` lists the actual DoView Board HTML files in that collection.

Keep this distinction clear:

```text
collections.json = lists collections
collection.json = lists boards inside one collection
```

## When to Update Each JSON File

When you add a new DoView Board HTML file to an existing collection folder, normally update that collection folder's:

```text
collection.json
```

For example, if you add a board to:

```text
boards/international-cooperation/
```

then update:

```text
boards/international-cooperation/collection.json
```

Do not update the top-level `boards/collections.json` just because you added one board inside an existing collection.

Update the top-level:

```text
boards/collections.json
```

when you add, remove, rename, reorder, or recount a whole collection.

## Example `boards/collections.json`

The top-level `collections.json` file uses a `collections` list:

```json
{
  "version": "v1.2.7",
  "title": "Example DoView Board Collections",
  "description": "Configuration example for a collection-of-collections page.",
  "collections": [
    {
      "name": "International Cooperation",
      "acronym": "IC",
      "description": "Example boards about international cooperation outcomes and implementation.",
      "path": "international-cooperation/",
      "url": "international-cooperation/",
      "count": 2
    }
  ]
}
```

## Example `boards/international-cooperation/collection.json`

A collection folder's `collection.json` file uses a `boards` list:

```json
{
  "version": "v1.2.7",
  "title": "International Cooperation",
  "description": "Configuration example for one DoView Board Collection.",
  "boards": [
    {
      "name": "Regional Partnership Outcomes",
      "acronym": "RPO",
      "description": "Example DoView Board file in this collection.",
      "file": "regional-partnership-outcomes_doview-board_v1.2.7_2026-06-10.html"
    },
    {
      "name": "Shared Monitoring Framework",
      "acronym": "SMF",
      "description": "Example DoView Board file in this collection.",
      "file": "shared-monitoring-framework_doview-board_v1.2.7_2026-06-10.html"
    }
  ]
}
```

These JSON files are configuration examples. They are not complete standalone DoView Boards.

## Beginner GitHub Notes

GitHub is a website where people store and share files, especially software and documentation files. GitHub uses repositories. A repository is a project folder stored on GitHub. It can contain HTML pages, JSON files, images, documentation, and other files.

You can use GitHub without writing code if your task is only to upload files and turn on GitHub Pages. A public repository can be used free on GitHub Free. GitHub Pages can publish public repository content as a website.

The basic beginner workflow is:

1. Create a GitHub account at <https://github.com/>.
2. Create a new repository.
3. Choose public visibility if you are using GitHub Free and want to publish with GitHub Pages.
4. Upload the `boards/` folder and its files.
5. Open the repository's Settings page.
6. Open the Pages settings.
7. Choose the branch and folder GitHub Pages should publish from.
8. Save the Pages settings.
9. Wait for GitHub Pages to publish the site.
10. Use the published site link, then add `/boards/` if your collection files are inside the `boards/` folder.

For a project repository, the published address usually has this shape:

```text
https://<user-or-organization>.github.io/<repository-name>/boards/
```

If you publish from a user or organization site repository named `<owner>.github.io`, the address may be:

```text
https://<owner>.github.io/boards/
```

GitHub Pages sites are public on the internet. Review the boards and any collection metadata before publishing. Read-only DoView Board copies are a convenience feature, not a security boundary, and do not prove that a board is official, unchanged, approved, locked, verified, certified, or protected.

## Common Mistakes

- Do not confuse `collections.json` with `collection.json`.
- Use `international-cooperation/` exactly when that is the intended folder name.
- Do not add a board file to a collection folder without updating that folder's `collection.json`.
- Do not update `boards/collections.json` for an ordinary new board inside an existing collection.
- Do not publish unreviewed or confidential board content to a public GitHub Pages site.
- Do not assume GitHub Pages is a database, login system, workflow approval tool, or security control.
