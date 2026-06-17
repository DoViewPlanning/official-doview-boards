# DoView Collection Index Prompt Package

This folder contains developer templates for preparing DoView Board collection folders for the DoView Board collection repository. They are copied from the supplied collection-index prompt package and adapted for the DoView Board V1.3.4 release.

These files are developer resources, not runtime dependencies for generated DoView Board HTML files.

## Files

- `DoView-collection-upload-prompt.md` - prompt to give to an AI assistant.
- `templates/00-main-boards-index-template.html` - overall collection-of-collections index template for `/boards/index.html`.
- `templates/01-simple-live-boards-index-template.html` - use when all boxes are live boards.
- `templates/02-apex-plus-live-boards-index-template.html` - use when there is a centered top apex board and all lower boxes are live boards.
- `templates/03-live-and-placeholder-boards-index-template.html` - use when there are live boards and gray placeholder boxes.
- `templates/01-simple-live-boards-collection-template.json` - matching subfolder `collection.json` template for option 1.
- `templates/02-apex-plus-live-boards-collection-template.json` - matching subfolder `collection.json` template for option 2.
- `templates/03-live-and-placeholder-boards-collection-template.json` - matching subfolder `collection.json` template for option 3.
- `templates/main-boards-collections-template.json` - minimal structure for the main `/boards/collections.json` file.

## How the templates relate

The main collection-of-collections page lives at `/boards/index.html`, uses `templates/00-main-boards-index-template.html`, and loads `collections.json`.

Each subfolder collection page lives at `/boards/<folder-name>/index.html`, uses one of the three subfolder index templates, and loads `collection.json`.

Use `collections.json` for the main list of collections. Use `collection.json` inside each subfolder for that collection's boards.

## Important style rule

Only the live-plus-placeholder template should display the instruction strip:

`White boxes link to live DoView Boards. Gray boxes are illustrative placeholders.`

Use US spelling throughout.
