# DoView Board Walkthrough

This folder contains the package/developer copy of the standalone HTML walkthrough for the DoView Board interface.

Open `doview-board-walkthrough.html` directly in a browser to step through the main DoView Board functions. The file is active HTML/JavaScript and should be treated like executable web content, not as a passive document.

Generated boards keep their public Walk-Through menu link pointed at:

https://doviewplanning.org/walkthrough

That public link is intentionally external. This repository copy is included as the package/developer copy of the walkthrough file.

## Deep links to walkthrough steps

The walkthrough supports URL hash deep links to open a particular tour at a particular step.

Use this format:

```text
doview-board-walkthrough.html#tour=1&step=3
```

For the public walkthrough page, use the same hash format after the public URL:

```text
https://doviewplanning.org/walkthrough#tour=1&step=3
```

The `tour` value is the tour number. The `step` value is the step number within that tour, starting at 1.

For example:

```text
https://doviewplanning.org/walkthrough#tour=2&step=5
```

opens Tour 2 at Step 5, provided that tour and step exist.

If the hash is missing, incomplete, or invalid, the walkthrough opens normally rather than forcing a broken step. Moving through the walkthrough may update the hash so that the current tour step can be copied and shared.
