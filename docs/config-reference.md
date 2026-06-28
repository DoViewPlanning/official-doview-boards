# DoView Board Config Reference

**DoView Boards version:** V1.3.7  
**Release date:** 2026-06-26  
**Document status:** Technical reference for the V1.3.7 DoView Boards prompt package release

This document describes the board configuration structure used by the V1.3.7 DoView Board reference engine and builder.

It should be read with:

- [`doview-board-minimum-spec.md`](../spec/doview-board-minimum-spec.md) for the DoView-compatible standard;
- [`developer-integration-guide.md`](developer-integration-guide.md) for how to use the reference engine and builder;
- [`security-and-read-only-notes.md`](security-and-read-only-notes.md) for security, deployment, and read-only limitations.

## 1. Scope

This reference documents the practical config shape used by:

- `doview-board-engine.js`;
- `doview-board-builder.js`;
- generated standalone DoView Board HTML files;
- the V1.3.7 examples.

The config format is not the same thing as the DoView-compatible conceptual standard. A system can be DoView-compatible while using a different database, API, storage model, rendering layer, or programming language. This document is for developers who want to work with the V1.3.7 JavaScript reference implementation or generate configs that it can load.

## 2. Config-first build model

The preferred build path is:

```text
pure JSON board config
        ↓
doview-board-builder.js
        ↓
standalone HTML board
```

The builder expects a pure JSON config file. It does not expect a full HTML file, engine source, prompt text, builder source, or `DoView.init(...)` wrapper in the config input.

The builder also appends the package-controlled Documentation Page titled `Using DoView Boards and Disclaimer` to standalone board output and avoids adding a duplicate if that Documentation Page is already present.

For AI-generated configs, add top-level builder-only `generationChecks` metadata reflecting the requested output. When this metadata is present, the builder runs strict deterministic preflight checks before HTML assembly. Hard failures stop the build with a non-zero exit status and no standalone HTML output. Explicitly safe structural corrections, such as normalizing an identified Cross-Link How Page to `howLevel: null`, turning off unrequested Page View options, or registering missing visible-content URLs in `sources`, are reported. The builder strips `generationChecks` before embedding the final config in HTML.

Older configs without `generationChecks` remain supported. They use compatibility mode, which still runs high-confidence baseline checks for labelled no-level How Pages, obvious repeated link boilerplate, Documentation clone claims, and Sources registry completeness. Compatibility-mode warnings and safe normalizations are recorded accurately rather than being presented as strict validation.

Basic builder command:

```bash
node doview-board-builder.js \
  --engine doview-board-engine.js \
  --config doview-board-config.json \
  --out example-board_doview-board_v1.3.7_2026-06-26.html
```

Generated standalone boards are active HTML/JavaScript files. Treat them like executable web content, not passive documents.

Generated boards and config-driven integrations should not make unsolicited external network calls, fetch external files, publish files, overwrite local files, or send board content to any endpoint unless the user explicitly requested that action, supplied any needed endpoint or credential, and the host platform permits it. This does not block explicit user-triggered features such as Board Chat, Save / Download Board, Copy HTML Board, or Update Board Changes to Main AI Chat when requested and permitted.

## 3. Root config object

A reference-engine config is a JSON object with this general shape:

```json
{
  "title": "Board Title",
  "slug": "board-slug",
  "subpages": [],
  "finalOutcomes": [],
  "sources": [],
  "generationChecks": {},
  "savedState": {}
}
```

### 3.1 `title`

Required string.

The title appears in the browser title and board header.

```json
{
  "title": "Example DoView Board"
}
```

### 3.2 `slug`

Recommended string.

The slug is used by the reference engine and builder for file naming and browser storage. Use lowercase letters, numbers, and hyphens where possible.

```json
{
  "slug": "example-doview-board"
}
```

If `slug` is missing, the builder can infer a slug-like value for filename checking, but generated release configs should include one explicitly.

### 3.3 `subpages`

Required array.

Each item is a page object. Supported page types are:

- `this_then`;
- `how`;
- `documentation`.

```json
{
  "subpages": [
    {
      "id": "p1",
      "label": "Main logic",
      "pageType": "this_then",
      "color": {
        "bg": "#eff6ff",
        "bdr": "#bfdbfe",
        "tab": "#2563eb"
      },
      "cols": []
    }
  ]
}
```

### 3.4 `finalOutcomes`

Array.

Use this for board-level Final Outcomes. Generated configs should use an array of plain strings.

```json
{
  "finalOutcomes": [
    "Families have better access to support",
    "Services learn and improve over time"
  ]
}
```

The builder defensively accepts object entries with a `label` field and normalises them to strings. Do not generate object-form Final Outcomes as the preferred config shape.

### 3.5 `sources`

Optional array.

Sources may be strings or objects. Object sources should include at least a `title`/`label` or `url`/`href`.

```json
{
  "sources": [
    {
      "title": "Information about DoView Boards",
      "url": "https://doviewplanning.org/doviewboards"
    }
  ]
}
```

Do not put prompt text, internal build notes, scratch notes, or AI commentary in `sources`.

### 3.6 `savedState`

Required for generated standalone boards.

`savedState` contains the richer board state used by the reference engine: box details, notes, links, measures, evaluation questions, tags, view settings, page info, Documentation Page content, and other persisted state.

Generated standalone boards should include explicit `savedState.viewSettings` so the board reopens consistently.

### 3.7 `generationChecks`

Optional top-level builder-only object for generated configs.

```json
{
  "generationChecks": {
    "expectedNoLevelHowPages": ["Competencies Cross-Link"],
    "linkDisplayTextRequested": true,
    "howLinkDisplayTextRequested": true,
    "linkEvidenceUrlsRequested": false,
    "documentationClonesRequested": true,
    "measuresMustAttachToBoxes": true,
    "evalQuestionsMustAttachToBoxes": true,
    "allPageViewOptionsOffUnlessRequested": true,
    "requestedPageViewOptions": {
      "thisThen": ["showLinkInfoOnHover"]
    },
    "boxDisplayTextRequested": false,
    "trafficLightsRequested": false,
    "prioritiesRequested": false
  }
}
```

Use `expectedNoLevelHowPages` for page IDs or unique labels that must remain outside the numbered How hierarchy. The standard 10-choice setup requests `thisThen.showLinkInfoOnHover`. If additional Page View options were requested, list only those allowed to remain on, for example:

```json
{
  "requestedPageViewOptions": {
    "thisThen": ["showMeasures", "showEvalQuestions"]
  }
}
```

The optional `standaloneMeasuresRequested` and `standaloneEvalQuestionsRequested` flags may be set to `true` when the user explicitly requested unattached board-level items. Do not set them merely to bypass attachment validation.

`generationChecks` is not runtime board state. Keep it in the input JSON until the builder validates the config. Do not copy it into `savedState`, and do not remove it merely to bypass a failed strict preflight.

### 3.8 `builderValidation`

Builder output includes an additive top-level `builderValidation` object after validation succeeds. Do not manually author, paste, or preserve this field in input JSON. The builder removes any input-supplied value and inserts a fresh stamp.

The stamp records the builder and validation versions, validation mode, timestamp, checks run, warnings, and reported safe auto-fixes. `strict-generated` means the request-specific `generationChecks` path ran. `compatibility` means baseline checks ran without request-specific strict metadata.

The stamp is traceability metadata. It does not prove content quality, source accuracy, approval, security, or Official DoView® status.

## 4. Page objects

All pages should include:

```json
{
  "id": "p1",
  "label": "Page label",
  "pageType": "this_then",
  "cols": []
}
```

### 4.1 `id`

Required string.

Page IDs must be stable and unique within the board. The examples use `p1`, `p2`, `p3`, and so on.

Many other references point to page IDs, including Documentation Page content and generated box IDs.

### 4.2 `label`

Recommended string.

The page label is shown in tabs, navigation, overview, and page headings.

### 4.3 `pageType`

Supported values:

```json
"this_then"
"how"
"documentation"
```

If `pageType` is omitted, the reference engine treats the page as a This–Then Page in many paths. Generated configs should include `pageType` explicitly.

### 4.4 `color`

Object with three hex colour fields:

```json
{
  "color": {
    "bg": "#eff6ff",
    "bdr": "#bfdbfe",
    "tab": "#2563eb"
  }
}
```

For generated This–Then Pages, the builder requires a complete `color` object with `bg`, `bdr`, and `tab` as `#RRGGBB` hex strings.

It is also good practice to include colour objects on How and Documentation Pages, even where the builder is less strict.

### 4.5 `uid`

Optional stable unique ID.

The reference engine can backfill `uid` fields for pages, columns, boxes, links, Measures, and Evaluation Questions. If present, preserve them. Do not treat them as visible labels.

## 5. This–Then Pages

A This–Then Page represents causal or enabling logic. The config shape below is only the technical representation. Generated or transformed This–Then Pages must also follow the modelling rules in [`../spec/doview-board-minimum-spec.md`](../spec/doview-board-minimum-spec.md) and the expanded rules in [`../spec/this-then-page-rules.md`](../spec/this-then-page-rules.md).

```json
{
  "id": "p1",
  "label": "Weekend trip logic",
  "pageType": "this_then",
  "color": {
    "bg": "#eff6ff",
    "bdr": "#bfdbfe",
    "tab": "#2563eb"
  },
  "cols": [
    {
      "h": "Purpose and limits",
      "boxes": [
        "Weekend purpose agreed",
        "Budget and dates realistic"
      ]
    },
    {
      "h": "Practical plan ready",
      "boxes": [
        "Destination chosen",
        "Transport booked"
      ]
    }
  ]
}
```

### 5.1 `cols`

Required array.

Each column object uses:

```json
{
  "h": "Column heading",
  "boxes": ["Box label"]
}
```

### 5.2 `cols[].h`

Column heading.

Use a meaningful causal-stage heading. Avoid treating a column heading as a box. If a phrase is an outcome, condition, action, or causal item in the model, put it in `boxes` instead. Do not use generic headings such as `Stage 1`, `Inputs`, `Activities`, or `Outputs` unless they are genuinely appropriate for the domain.

### 5.3 `cols[].boxes`

Array of box-label strings.

The current reference engine expects `cols[].boxes` to contain labels. Rich box fields are carried in `savedState.B`, keyed by generated box ID. The builder warns if a box is an object in `cols[].boxes`. Box labels should be compact outcome or condition statements and should normally contain one concept per box.

### 5.4 This–Then Box IDs

The reference engine generates This–Then Box IDs from page ID, column index, and box index:

```text
<page-id>-c<column-index>-b<box-index>
```

Example:

```text
p1-c0-b0
p1-c2-b1
```

These IDs are used by `savedState.B`, `savedState.ttLinks`, Measure associations, Evaluation Question associations, tags, and jump fields.

## 6. How Pages

A How Page represents implementation, action, projects, workstreams, responsibilities, or delivery arrangements.

```json
{
  "id": "p2",
  "label": "Projects and actions",
  "pageType": "how",
  "color": {
    "bg": "#ecfdf5",
    "bdr": "#a7f3d0",
    "tab": "#10b981"
  },
  "howLevel": 1,
  "howBoxes": [
    {
      "id": "H001",
      "label": "Set up coordination rhythm"
    },
    {
      "id": "H002",
      "label": "Maintain risk and dependency register"
    }
  ],
  "nextHowNum": 3,
  "cols": []
}
```

### 6.1 `howLevel`

Optional number or `null`.

How levels define the meaning of Vertical Links within the board. They are not a universal ontology. For example, a board might use:

- Level 1 for programmes;
- Level 2 for projects;
- Level 3 for tasks.

Only adjacent levels count as Vertical Links between How Boxes in the reference engine. Unlevelled How Pages participate in Cross-Links only.

There is one numbered vertical How Page hierarchy. Each non-null numeric `howLevel` value may be used by at most one How Page. Duplicate numbered levels are invalid. Multiple Cross-Link/no-level How Pages remain valid when they use explicit `howLevel: null`.

For a generated no-level, cross-link, non-hierarchical, or non-vertical How Page, set `howLevel` explicitly to `null`. Do not omit the field: omission is retained for backward-compatible auto-assignment of numbered levels on older boards. The reference UI displays an explicit `null` level as `No level`. A numbered vertical How Page may still contain Cross-Links; use `null` when the page itself sits outside the vertical hierarchy.

### 6.2 `howBoxes`

Required array for How Pages.

Each How Box should include:

```json
{
  "id": "H001",
  "displayId": "H1",
  "label": "How Box label"
}
```

How Box IDs should be stable. Do not renumber existing How Boxes after deletion.

`displayId` is optional. It is the editable user-facing identifier shown on the board. It must not be used as the internal stable ID for links or references.

### 6.3 `nextHowNum`

Recommended number.

Tracks the next available How Box number for the page.

If the page has `H001` and `H002`, use:

```json
{
  "nextHowNum": 3
}
```

### 6.4 `cols`

Required array.

For How Pages, this is normally an empty array:

```json
{
  "cols": []
}
```

### 6.5 How Box IDs in saved state

The generated reference-engine key for a How Box is:

```text
<page-id>-<how-box-id>
```

Example:

```text
p2-H001
p2-H002
```

## 7. Documentation Pages

Documentation Pages hold longer explanatory or supporting material.

```json
{
  "id": "p3",
  "label": "How this board will be used",
  "pageType": "documentation",
  "color": {
    "bg": "#f3f4f6",
    "bdr": "#d1d5db",
    "tab": "#6b7280"
  },
  "cols": []
}
```

Documentation content is stored in `savedState.docContent`, keyed by page ID:

```json
{
  "savedState": {
    "docContent": {
      "p3": "<h2>Purpose</h2><p>This page explains how the board will be used.</p>"
    }
  }
}
```

The builder validates that each `savedState.docContent` key points to an existing Documentation Page.

Documentation content may include formatted HTML. Implementations that allow rich HTML must apply security controls appropriate to their deployment context.

Documentation Page clone blocks are stored inside the relevant `savedState.docContent[pageId]` HTML:

```html
<div class="doc-clone" data-clone-type="box_title" data-clone-key="p1-c0-b0"></div>
```

Supported `data-clone-type` values are `page_title`, `box_title`, `box_main_text`, `measure`, `eval_question`, and `link`. Use source keys for real existing board objects: page IDs (or `final` for the Final Outcomes page title), box IDs, Measure IDs, Evaluation Question IDs, or structural link IDs as appropriate. Link clone keys must point to links that survive runtime cleanup. For This–Then link clones, both endpoints must be ordinary This–Then boxes; a raw `ttLinks` record involving a Final Outcome box such as `final-b0`, a How box, a missing box, or any other non-This–Then endpoint is not a valid Documentation Page link-clone source. When a user explicitly requests Documentation Page clones, include real `.doc-clone` markers rather than copied text, paraphrases, headings, or ordinary links.

## 8. Final Outcomes

Final Outcomes are board-level outcomes, separate from ordinary page-level terminal outcomes.

Simple generated shape:

```json
{
  "finalOutcomes": [
    "Community food access is more reliable",
    "Household stress is reduced"
  ]
}
```

The reference engine uses generated box IDs for Final Outcomes:

```text
final-b0
final-b1
```

Rich Final Outcome state is stored under those keys in `savedState.B`, in the same general shape as other boxes.

## 9. Rich box state: `savedState.B`

`cols[].boxes`, `howBoxes`, and `finalOutcomes` carry the visible labels. Rich details are stored in `savedState.B`.

Example:

```json
{
  "savedState": {
    "B": {
      "p1-c0-b0": {
        "label": "Weekend purpose agreed",
        "light": "",
        "entries": [
          {
            "type": "note1",
            "text": "Family members agree what the weekend is mainly for."
          }
        ],
        "priority": "A",
        "hasSubpage": false,
        "detailText": "Keep the reason for the trip short and explicit.",
        "borderColor": "",
        "boxColor": "",
        "measures": [],
        "evalQuestions": [],
        "tagIds": [],
        "jumpToPage": "",
        "uid": "box_example"
      }
    }
  }
}
```

### 9.1 Box-state fields

Common fields:

| Field | Meaning |
|---|---|
| `label` | Box label. Should match the visible label in the page structure where applicable. |
| `light` | Optional box traffic-light state: `green`, `greenYellow`, `yellow`, `yellowRed`, `red`, `grey`, or empty/absent for unset. `grey` is a deliberate selected value, not unset. Generated boards should normally leave this empty unless the user asks otherwise. |
| `entries` | Array of note entries. Used for Notes 1–5 and older note-style entries. |
| `priority` | Optional formal priority marker. Use only `A`, `B`, `C`, `D`, `E`, `BAU`, or blank. Leave blank/absent unless the user requests priorities. |
| `hasSubpage` | Boolean used by the reference engine for drill/subpage affordances. |
| `detailText` | Display Text / supporting text for the box. |
| `borderColor` | Optional custom border colour. |
| `boxColor` | Optional custom fill colour. |
| `measures` | Array of Measure IDs associated with this box. |
| `evalQuestions` | Array of Evaluation Question IDs associated with this box. |
| `tagIds` | Array of tag IDs attached to this box. |
| `jumpToPage` | Optional page ID for a jump/drill navigation link. |
| `uid` | Stable unique ID. Preserve if present. |

For a single box, include each Measure ID or Evaluation Question ID at most once. The V1.3.7 reference engine de-duplicates repeated box-level Measure/Evaluation Question IDs when loading or saving a board, without changing the saved-state field names or Measure/Evaluation Question definitions.

The box-level `measures` and `evalQuestions` arrays are valid runtime associations. List views, detail panes, and Page View under-box displays must recognize those arrays for This-Then Boxes, How Boxes, and Final Outcome boxes. A generated config may use nested `savedState.B` without also duplicating the page list into `savedState.SP`.

Optional copy/provenance metadata may also appear:

```json
{
  "sourceUid": "",
  "sourceBoardUid": "",
  "sourceBoardTitle": "",
  "sourceObjectType": "",
  "sourceObjectLabelAtCopy": "",
  "copiedAt": ""
}
```

Preserve these fields where present. Do not invent them if absent.

### 9.2 Notes in `entries`

Box Notes are stored as entries:

```json
{
  "entries": [
    {
      "type": "note1",
      "text": "Evidence or assumption note."
    },
    {
      "type": "note2",
      "text": "Implementation note."
    }
  ]
}
```

Supported note entry types include:

```text
note1
note2
note3
note4
note5
```

Older boards may also contain legacy entry types such as `sofar` or `note`. Preserve unknown or legacy entries unless there is a deliberate migration.

### 9.3 Display Text

Box Display Text is stored as `detailText`.

```json
{
  "detailText": "Longer supporting explanation shown under the box when Display Text is enabled."
}
```

Hiding Display Text through Page View settings must not delete `detailText`.

For generated boards, leave box `detailText` blank/absent unless the user explicitly requests box-level detail, descriptions, evidence, explanations, notes, or text under boxes. Relationship rationale or evidence requested under links belongs in the relevant link `mainText`, not in box `detailText`.

## 10. Structural links

The reference engine stores structural links in two arrays:

```json
{
  "savedState": {
    "ttLinks": [],
    "howLinks": []
  }
}
```

Links are many-to-many. A box may have zero, one, or many incoming links and zero, one, or many outgoing links.

### 10.1 This–Then links: `savedState.ttLinks`

This–Then links connect This–Then Boxes to This–Then Boxes. Both endpoints must be ordinary This–Then boxes in the effective runtime page state. Links whose endpoints are Final Outcome boxes, How boxes, missing boxes, or other non-This–Then objects are removed by runtime cleanup and must not be used as Documentation Page link-clone sources.

```json
{
  "id": "ttl_1",
  "from": "p1-c0-b0",
  "to": "p1-c1-b0",
  "polarity": "positive",
  "light": "",
  "mainText": "A clear purpose helps choose a destination that fits the weekend.",
  "notes1": "",
  "notes2": "",
  "notes3": "",
  "measures": [],
  "evalQuestions": [],
  "tagIds": [],
  "uid": "link_example"
}
```

Fields:

| Field | Meaning |
|---|---|
| `id` | Stable link ID, usually `ttl_1`, `ttl_2`, and so on. |
| `from` | Source This–Then Box ID. |
| `to` | Target This–Then Box ID. |
| `polarity` | `positive` or `negative`. Missing or other values are treated as positive by the reference engine. |
| `light` | Optional link traffic-light value for This–Then arrows: `green`, `greenYellow`, `yellow`, `yellowRed`, `red`, `grey`, or empty/absent for unset. `grey` is a deliberate selected value, not unset. |
| `mainText` | Display Text / explanation for the link. It can be shown in the link popup and, when the relevant Page View option is on, as hover text near the arrow. |
| `notes1`, `notes2`, `notes3` | Link notes. |
| `measures` | Measure IDs associated with this This–Then link. |
| `evalQuestions` | Evaluation Question IDs associated with this This–Then link. |
| `tagIds` | Tags applied to this This–Then link. In the reference UI, these are shown and edited in the normal This–Then link detail popup only. |
| `uid` | Stable unique ID. Preserve if present. |

Generated Link Display Text should start with the substantive relationship, causal explanation, evidence summary, or user-facing explanation. Do not duplicate the official link Traffic Light in `mainText` with leading colour labels, status text, or symbols such as `GREEN —`, `RED —`, `Traffic light: Yellow`, or `Status: Yellow/Green`; store the official value only in `light`.

When link rationale, evidence, assumptions, supporting information, sources, URLs, relationship notes, or explanation are requested, each generated `mainText` value must be specific to the exact source and target boxes and explain the mechanism between them. Before output, inspect actual `ttLinks[].mainText` values for duplicates, near-duplicate sentence frames, generic page-level wording, and repeated generic source lists or URLs. If the text could be copied unchanged to another link, rewrite it. If evidence or sources have not been supplied or researched, do not invent them; label the text as rationale, assumption, or a suggested evidence need.

This–Then links may be positive or negative:

```json
{
  "polarity": "negative"
}
```

Use negative polarity when the source reduces, prevents, constrains, weakens, or makes less likely the target.

### 10.2 This–Then link counter: `ttLinkNextId`

Use this to preserve the next available This–Then link number:

```json
{
  "savedState": {
    "ttLinkNextId": 12
  }
}
```

If the board already has `ttl_1` through `ttl_11`, use `12`.

### 10.3 How links: `savedState.howLinks`

How links connect How Boxes to This–Then Boxes or How Boxes.

```json
{
  "id": "hwl_1",
  "from": "p2-H001",
  "to": "p1-c0-b0",
  "mainText": "Mapping work supports clear understanding of local need.",
  "notes1": "",
  "notes2": "",
  "notes3": "",
  "tagIds": [],
  "uid": "link_example"
}
```

Fields:

| Field | Meaning |
|---|---|
| `id` | Stable link ID, usually `hwl_1`, `hwl_2`, and so on. |
| `from` | Source How Box ID. In the reference engine, How links must have a How Box as the source. |
| `to` | Target This–Then Box ID or How Box ID. |
| `mainText` | Display Text / explanation for the How link. |
| `notes1`, `notes2`, `notes3` | Link notes. |
| `tagIds` | Optional tag IDs preserved on this How link for compatibility. The reference UI does not add or edit How-link tags in this build. |
| `uid` | Stable unique ID. Preserve if present. |
| `linkKind` | Optional. `"lateral"` explicitly marks a Cross-Link. The internal value remains `lateral` for backward-compatible reference-engine config support. |

How links do not support link-level Measures or Evaluation Questions in V1.3.7. Do not add `measures` or `evalQuestions` to How links expecting the reference engine to use them.

### 10.4 How link classification

The reference engine classifies How links from their endpoints.

A How-to-This–Then link is a Vertical Link only when the source How Box is on a Level 1 How Page.

```text
Level 1 How Box → This–Then Box = Vertical Link
Level 2-or-deeper How Box → This–Then Box = Cross-Link
```

A How-to-How link is hierarchical only when the source and target pages have adjacent How levels and the boxes are not on the same page.

```text
Level N How Box → Level N-1 How Box = upward Vertical Link
Level N How Box → Level N+1 How Box = downward Vertical Link
same page, same level, skipped level, or unlevelled page = Cross-Link
```

`linkKind: "lateral"` can be used to explicitly mark a How link as a Cross-Link. Keep the internal value `lateral`; do not rename the data key or saved value for terminology reasons.

### 10.5 How link counter: `howLinkNextId`

Use this to preserve the next available How link number:

```json
{
  "savedState": {
    "howLinkNextId": 4
  }
}
```

## 11. Measures

Measures are board-level reusable objects stored in `savedState.measures`.

```json
{
  "id": "M001",
  "displayId": "M1",
  "title": "Trip cost compared with planned budget",
  "mainText": "Compare actual spend with the budget agreed before booking.",
  "notes1": "",
  "notes2": "",
  "notes3": "",
  "trafficLight": "",
  "tagIds": [],
  "uid": "measure_example"
}
```

Fields:

| Field | Meaning |
|---|---|
| `id` | Stable Measure ID, usually `M001`, `M002`, and so on. |
| `displayId` | Optional editable user-facing identifier, such as `M1` or `IND3`. Internal references still use `id`. |
| `title` | Measure title. |
| `mainText` | Display Text / description. |
| `notes1`, `notes2`, `notes3` | Measure notes. |
| `trafficLight` | Optional Measure traffic-light state: `green`, `greenYellow`, `yellow`, `yellowRed`, `red`, `grey`, or empty/absent for unset. `grey` is a deliberate selected value, not unset. |
| `tagIds` | Tags applied to this Measure. |
| `uid` | Stable unique ID. Preserve if present. |

Existing Measures without `trafficLight` default to no Traffic Light. The field is metadata for the Measure item itself; do not add a separate `displayText` field or rename this field when generating configs.

Do not populate Measure `trafficLight` values unless the user explicitly requests Traffic Lights or clearly synonymous status treatment.

### 11.1 Measure associations

Measures may be associated with boxes:

```json
{
  "savedState": {
    "B": {
      "p1-c0-b0": {
        "measures": ["M001"]
      }
    }
  }
}
```

Do not repeat the same Measure ID more than once in a single box's `measures` array.

For normally generated boards, associate every requested Measure with at least one relevant box unless the user explicitly requests standalone, unattached, general, board-level, or portfolio-level Measures. A Measure may also be associated with a This–Then link where relevant, but do not leave requested Measures orphaned by default.

Measures may also be associated with This–Then links:

```json
{
  "savedState": {
    "ttLinks": [
      {
        "id": "ttl_1",
        "from": "p1-c0-b0",
        "to": "p1-c1-b0",
        "measures": ["M001"]
      }
    ]
  }
}
```

### 11.2 `measureNextId`

Use this to preserve the next available Measure number:

```json
{
  "savedState": {
    "measureNextId": 3
  }
}
```

Do not renumber Measures after deletion.

## 12. Evaluation Questions

Evaluation Questions are board-level reusable objects stored in `savedState.evalQuestions`.

```json
{
  "id": "EQ001",
  "displayId": "EQ1",
  "questionText": "Did the plan reduce avoidable stress?",
  "mainText": "Ask whether early planning prevented common last-minute problems.",
  "notes1": "",
  "notes2": "",
  "notes3": "",
  "trafficLight": "",
  "tagIds": [],
  "uid": "eq_example"
}
```

Fields:

| Field | Meaning |
|---|---|
| `id` | Stable Evaluation Question ID, usually `EQ001`, `EQ002`, and so on. |
| `displayId` | Optional editable user-facing identifier, such as `EQ1` or `Q3`. Internal references still use `id`. |
| `questionText` | The evaluation question. |
| `mainText` | Display Text / explanation. |
| `notes1`, `notes2`, `notes3` | Evaluation Question notes. |
| `trafficLight` | Optional Evaluation Question traffic-light state: `green`, `greenYellow`, `yellow`, `yellowRed`, `red`, `grey`, or empty/absent for unset. `grey` is a deliberate selected value, not unset. |
| `tagIds` | Tags applied to this Evaluation Question. |
| `uid` | Stable unique ID. Preserve if present. |

Existing Evaluation Questions without `trafficLight` default to no Traffic Light. The field is metadata for the Evaluation Question item itself; do not add a separate `displayText` field or rename this field when generating configs.

Do not populate Evaluation Question `trafficLight` values unless the user explicitly requests Traffic Lights or clearly synonymous status treatment.

### 12.1 Evaluation Question associations

Evaluation Questions may be associated with boxes:

```json
{
  "savedState": {
    "B": {
      "p1-c0-b0": {
        "evalQuestions": ["EQ001"]
      }
    }
  }
}
```

Do not repeat the same Evaluation Question ID more than once in a single box's `evalQuestions` array.

For normally generated boards, associate every requested Evaluation Question with at least one relevant box unless the user explicitly requests standalone, unattached, general, board-level, or portfolio-level Evaluation Questions. An Evaluation Question may also be associated with a This–Then link where relevant, but do not leave requested Evaluation Questions orphaned by default.

They may also be associated with This–Then links:

```json
{
  "savedState": {
    "ttLinks": [
      {
        "id": "ttl_1",
        "from": "p1-c0-b0",
        "to": "p1-c1-b0",
        "evalQuestions": ["EQ001"]
      }
    ]
  }
}
```

### 12.2 `eqNextId`

Use this to preserve the next available Evaluation Question number:

```json
{
  "savedState": {
    "eqNextId": 3
  }
}
```

Do not renumber Evaluation Questions after deletion.

## 13. Tags

Tags are board-level user-defined visual labels.

```json
{
  "savedState": {
    "tags": [
      {
        "id": "tag_example",
        "short": "EV",
        "label": "Evidence",
        "desc": "Evidence-supported item"
      }
    ]
  }
}
```

Supported elements can refer to tags through `tagIds` arrays.

Tags may apply to:

- boxes;
- This–Then links;
- Measures;
- Evaluation Questions.

Existing How-link `tagIds`, if present in older or externally generated board state, should be preserved for compatibility, but the reference UI does not add or edit How-link tags in this build.

Tags are not provenance, permissions, locks, verification, official status, authorship proof, security, or protection. Do not add tags to unsupported surfaces such as pages, page tabs, Sources, Board info, Page info, or Documentation Page clones.

## 14. Page, board, and Documentation state

### 14.1 `boardInfo`

Board-level information string.

```json
{
  "savedState": {
    "boardInfo": "Board-level assumptions, scope notes, or caveats."
  }
}
```

### 14.2 `pageInfo`

Object keyed by page ID.

```json
{
  "savedState": {
    "pageInfo": {
      "p1": "Page-specific assumptions or review notes."
    }
  }
}
```

### 14.3 `docContent`

Object keyed by Documentation Page ID.

```json
{
  "savedState": {
    "docContent": {
      "p3": "<h2>Evidence notes</h2><p>Supporting material.</p>"
    }
  }
}
```

### 14.4 `topRightText`

Optional short plain-text annotation shown in the page-info bar.

```json
{
  "savedState": {
    "topRightText": "Draft"
  }
}
```

Use this for short text such as `Draft`, `Illustrative only`, or `Internal working version`. It is not a security or confidentiality control.

## 15. View settings

Generated standalone boards must include explicit view settings.

Standard V1.3.7 setup settings:

```json
{
  "savedState": {
    "viewSettings": {
      "thisThen": {
        "showCounts": false,
        "showTrafficLights": false,
        "showPriorities": false,
        "showHowCounts": false,
        "showMeasures": false,
        "showEvalQuestions": false,
        "showMainText": false,
        "showMainTextCodeStyle": false,
        "showLinkInfoOnHover": true,
        "showLinkInfoCodeStyle": false,
        "showLateralHow": false,
        "showTags": false
      },
      "how": {
        "showNumbering": false,
        "showTrafficLights": false,
        "showPriorities": false,
        "showWhyCounts": false,
        "showLateralHow": false,
        "showMeasures": false,
        "showEvalQuestions": false,
        "showMainText": false,
        "showMainTextCodeStyle": false,
        "showTags": false
      },
      "finalOutcomes": {
        "showTrafficLights": false,
        "showPriorities": false,
        "showMeasures": false,
        "showEvalQuestions": false,
        "showMainText": false,
        "showMainTextCodeStyle": false,
        "showTags": false
      }
    }
  }
}
```

View settings control display only. They must not be used to delete or remove underlying data. Code-style Display Text view settings are optional, backward-compatible presentation preferences and default to `false` when absent.

Before publishing a generated board, inspect the actual `savedState.viewSettings`. Unless the user explicitly requested a particular Page View option, every generated Page View option should be `false`. Enable only requested options and any strictly necessary related option, not unrelated overlays.

## 16. Other saved-state fields

The reference engine may use these additional fields:

| Field | Meaning |
|---|---|
| `SP` | Saved copy of subpage/page structure. Present in saved boards and some standalone examples. |
| `FO` | Saved copy of Final Outcome labels/state. |
| `createdDate` | Board creation date string. |
| `boardInstanceId` | Instance identifier used by the reference engine. |
| `boardUid` | Stable board-level unique ID. |
| `sourcesInitialized` | Tracks whether the default source seed has been applied. |
| `presentationView` | Boolean presentation-view state. |
| `isReadonly` | Boolean marker for read-only copies. |

Preserve unknown saved-state fields where practical. Future versions may add fields.

## 17. Read-only config marker

A read-only copy carries this marker in embedded saved state:

```json
{
  "savedState": {
    "isReadonly": true
  }
}
```

This disables editing through the reference-board interface. It is not access control, encryption, tamper protection, authentication, authorization, or a security boundary.

See [`security-and-read-only-notes.md`](security-and-read-only-notes.md).

## 18. Sources

A source may be a string:

```json
{
  "sources": [
    "Local workshop notes, 2026-05-22"
  ]
}
```

Or an object:

```json
{
  "sources": [
    {
      "title": "Source title",
      "url": "https://example.org/source"
    }
  ]
}
```

Object source field aliases accepted by the builder include:

```text
title or label
url or href
```

Do not invent sources. Where public evidence is used, include sources at board level and place the relevant source close to the specific claim where useful, such as in box Display Text, link Display Text, Page info, Board info, or Documentation content.

The V1.3.7 builder scans visible generated board content for `http://` and `https://` URLs, deduplicates URL-bearing source entries, and safely adds missing content/evidence registry entries using the URL as the title when no better title is available. It excludes fixed package-controlled help, training, repository, trademark, and support URLs from auto-addition. It does not invent URLs, and it preserves explicitly titled source entries so genuine board-content sources are not removed.

## 19. File assembly rules

The builder creates a standalone HTML file with this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Board Title</title>
<script>
/* engine source */
</script>
</head>
<body>
<script>
DoView.init({
  "title": "Board Title"
});
</script>
</body>
</html>
```

The final HTML should:

- begin with `<!DOCTYPE html>`;
- include the engine exactly once in the head;
- include exactly one body-only `DoView.init(...)` config call;
- keep board config/state in that separate body initialization call, not inside the engine script;
- preserve standalone-board initialization scaffolding and script boundaries;
- not include prompt text;
- not include builder source;
- not include temporary validation code;
- not duplicate the engine in the body.
- preserve or expose a visible diagnostic if initialization fails, rather than leaving the user with an unexplained blank page where the environment supports such diagnostics.

Recommended output filename pattern:

```text
<board-slug>_doview-board_v<version>_<yyyy-mm-dd>.html
```

Example:

```text
example-board_doview-board_v1.3.7_2026-06-26.html
```

## 20. Minimal generated config example

This example is intentionally small. It is technically useful for testing the reference engine and builder; it is not a model of a rich real-world board.

```json
{
  "title": "Example Minimal DoView Board",
  "slug": "example-minimal-doview-board",
  "subpages": [
    {
      "id": "p1",
      "label": "Main logic",
      "pageType": "this_then",
      "color": {
        "bg": "#eff6ff",
        "bdr": "#bfdbfe",
        "tab": "#2563eb"
      },
      "cols": [
        {
          "h": "Starting conditions",
          "boxes": [
            "Need understood"
          ]
        },
        {
          "h": "Better response",
          "boxes": [
            "Action is focused"
          ]
        },
        {
          "h": "Result",
          "boxes": [
            "People benefit"
          ]
        }
      ]
    }
  ],
  "finalOutcomes": [
    "People benefit from a focused response"
  ],
  "sources": [],
  "savedState": {
    "B": {
      "p1-c0-b0": {
        "label": "Need understood",
        "light": "",
        "entries": [],
        "priority": "",
        "hasSubpage": false,
        "detailText": "",
        "borderColor": "",
        "boxColor": "",
        "measures": [],
        "evalQuestions": [],
        "tagIds": [],
        "jumpToPage": ""
      },
      "p1-c1-b0": {
        "label": "Action is focused",
        "light": "",
        "entries": [],
        "priority": "",
        "hasSubpage": false,
        "detailText": "",
        "borderColor": "",
        "boxColor": "",
        "measures": [],
        "evalQuestions": [],
        "tagIds": [],
        "jumpToPage": ""
      },
      "p1-c2-b0": {
        "label": "People benefit",
        "light": "",
        "entries": [],
        "priority": "",
        "hasSubpage": false,
        "detailText": "",
        "borderColor": "",
        "boxColor": "",
        "measures": [],
        "evalQuestions": [],
        "tagIds": [],
        "jumpToPage": ""
      },
      "final-b0": {
        "label": "People benefit from a focused response",
        "light": "",
        "entries": [],
        "priority": "",
        "hasSubpage": false,
        "detailText": "",
        "borderColor": "",
        "boxColor": "",
        "measures": [],
        "evalQuestions": [],
        "tagIds": [],
        "jumpToPage": ""
      }
    },
    "boardInfo": "",
    "pageInfo": {},
    "docContent": {},
    "ttLinks": [
      {
        "id": "ttl_1",
        "from": "p1-c0-b0",
        "to": "p1-c1-b0",
        "polarity": "positive",
        "mainText": "",
        "notes1": "",
        "notes2": "",
        "notes3": "",
        "measures": [],
        "evalQuestions": [],
        "tagIds": []
      },
      {
        "id": "ttl_2",
        "from": "p1-c1-b0",
        "to": "p1-c2-b0",
        "polarity": "positive",
        "mainText": "",
        "notes1": "",
        "notes2": "",
        "notes3": "",
        "measures": [],
        "evalQuestions": [],
        "tagIds": []
      }
    ],
    "ttLinkNextId": 3,
    "howLinks": [],
    "howLinkNextId": 1,
    "measures": [],
    "measureNextId": 1,
    "evalQuestions": [],
    "eqNextId": 1,
    "tags": [],
    "viewSettings": {
      "thisThen": {
        "showCounts": false,
        "showTrafficLights": false,
        "showPriorities": false,
        "showHowCounts": false,
        "showMeasures": false,
        "showEvalQuestions": false,
        "showMainText": false,
        "showLinkInfoOnHover": true,
        "showLateralHow": false,
        "showTags": false
      },
      "how": {
        "showNumbering": false,
        "showTrafficLights": false,
        "showPriorities": false,
        "showWhyCounts": false,
        "showLateralHow": false,
        "showMeasures": false,
        "showEvalQuestions": false,
        "showMainText": false,
        "showTags": false
      },
      "finalOutcomes": {
        "showTrafficLights": false,
        "showPriorities": false,
        "showMeasures": false,
        "showEvalQuestions": false,
        "showMainText": false,
        "showTags": false
      }
    },
    "topRightText": "",
    "sourcesInitialized": true
  }
}
```

## 21. Developer compatibility guidance

When generating or transforming configs:

- keep page IDs stable;
- keep box IDs consistent with page/column/box positions;
- update links when boxes move or are deleted;
- preserve `uid` fields where present;
- preserve unknown additive saved-state fields where practical;
- do not renumber How Boxes, Measures, Evaluation Questions, or links merely because an item was deleted;
- keep view settings separate from model data;
- do not treat tags as security, provenance, or official status;
- keep navigation jumps distinct from structural links;
- keep This–Then links distinct from How links;
- keep generated This–Then Pages domain-shaped rather than template-shaped, following the page-shape, terminal-outcome, causal-connectivity, and many-to-many link rules in the specification;
- do not add unsupported schema and assume the V1.3.7 reference engine will use it.

## 22. Validation checklist

Before using the builder or publishing a generated board, check:

- [ ] config is pure JSON;
- [ ] root object has `title`, `subpages`, and `savedState`;
- [ ] generated boards include `savedState.viewSettings`;
- [ ] page IDs are unique;
- [ ] page types are valid;
- [ ] This–Then Pages have complete `color` objects;
- [ ] This–Then Pages have been reviewed against the modelling rules in the minimum specification and `spec/this-then-page-rules.md`;
- [ ] `cols` arrays exist;
- [ ] How Pages have `howBoxes` arrays;
- [ ] numbered How Pages do not duplicate non-null numeric `howLevel` values;
- [ ] generated no-level, cross-link, non-hierarchical, or non-vertical How Pages use explicit `howLevel: null`;
- [ ] Documentation Page content keys point to Documentation Pages;
- [ ] requested Documentation Page clones use valid `.doc-clone` blocks with supported types and source keys that resolve against the effective runtime state, with link clones pointing only to runtime-surviving links;
- [ ] links point to real box IDs;
- [ ] requested link rationale/evidence text is specific to each exact source and target pair, with no duplicate or near-duplicate boilerplate, generic page-level rationale, irrelevant repeated URLs, or fabricated sources;
- [ ] generated Link Display Text does not duplicate link Traffic Light labels, symbols, or status text;
- [ ] every requested Measure and Evaluation Question is attached to at least one relevant box unless standalone or unattached items were explicitly requested;
- [ ] all generated Page View options are `false` unless the user explicitly requested particular options;
- [ ] box `detailText` stays blank/absent unless box-level supporting text was requested;
- [ ] `showTrafficLights` and `showPriorities` stay off and underlying `light`, `trafficLight`, and `priority` fields stay neutral/unset unless requested;
- [ ] optional This–Then link `tagIds` arrays are preserved where present;
- [ ] Measure and Evaluation Question Traffic Lights use optional `trafficLight` fields only;
- [ ] `sources` contains only real source material;
- [ ] visible generated-content URLs are represented in the board-level `sources` registry;
- [ ] final HTML includes a builder-inserted `builderValidation` stamp with an accurate mode;
- [ ] final HTML contains the engine once and one body `DoView.init(...)` call;
- [ ] engine script and initialization script syntax have been checked where possible;
- [ ] browser-like load validation has confirmed visible non-empty board content where possible;
- [ ] validation limitations are reported clearly;
- [ ] board quality has been reviewed against the minimum specification.
