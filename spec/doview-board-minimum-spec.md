# DoView Board Minimum Specification

**DoView Boards version:** V1.2.1  
**Release date:** 2026-06-02  
**Document status:** Minimum compatibility specification for the V1.2.1 DoView Boards prompt package release

This document defines the minimum structure and behaviour expected of a DoView-compatible board, app, platform, system, or generated standalone board for the V1.2.1 release.

The reference JavaScript engine in this repository is the canonical reference implementation for this release. This specification defines the DoView-compatible standard that the reference engine demonstrates. Developers should not have to reverse-engineer the standard from the engine alone. The companion file [`this-then-page-rules.md`](this-then-page-rules.md) expands the This–Then Page modelling rules that are central to DoView-compatible board quality.

## 1. Purpose and scope

A DoView Board is a structured planning, outcomes, implementation, monitoring, evaluation, and learning board based on the DoView Planning approach.

A DoView Board is not just a drawing canvas. It represents outcomes, enabling conditions, actions, implementation work, evidence, measures, evaluation questions, sources, assumptions, risks, and supporting documentation in a structured form.

This specification covers the minimum requirements for:

- DoView-compatible board structure;
- This–Then Page modelling rules;
- required page types;
- This–Then causal pages;
- How implementation/alignment pages;
- Documentation Pages;
- Final Outcomes;
- boxes and box fields;
- Display Text and Notes;
- Measures and Evaluation Questions;
- structural link types;
- source and evidence handling;
- view, navigation, and interaction expectations;
- read-only meaning and limits;
- DoView-compatible vs Official DoView® wording;
- badge and trademark boundaries.

This document does not require every implementation to copy the reference engine's internal code, CSS, storage model, exact UI layout, or file-generation workflow. It does require implementations to preserve the core DoView Board structure and semantics described here.

## 2. Key terms

### DoView Planning

DoView Planning is the planning and outcomes-theory approach developed by Dr Paul Duignan.

### DoView Board

A DoView Board is a structured board using DoView Planning concepts. It normally contains This–Then causal logic, How implementation logic, board-level Final Outcomes, supporting documentation, measures, evaluation questions, and sources.

### DoView-compatible

A board, app, platform, tool, or system is DoView-compatible when it preserves the minimum structure and behaviour described in this specification.

“DoView-compatible” is descriptive wording. It does not mean official, endorsed, certified, approved, quality-assured, affiliated with DoView®, or entitled to use the Official DoView® Badge.

### Official DoView®

“Official DoView®” status, official endorsement, certification, approval, quality assurance, affiliation, and badge use require written permission from the relevant DoView® rights holder. Implementing this specification is not, by itself, enough to claim official status. See [`trademark-and-attribution.md`](../docs/trademark-and-attribution.md). To ask about official status, badge use, collaboration, review, quality assurance, or permission, contact DoView Planning at <https://doviewplanning.org/contact>.

### Reference implementation

The reference implementation is the V1.2.1 JavaScript engine released with this repository as `doview-board-engine.js`, together with the builder and prompt package. It demonstrates one working implementation of this specification.

## 3. Compatibility levels

This specification distinguishes three related but different ideas.

### 3.1 Conceptual DoView compatibility

A system is conceptually DoView-compatible if it follows the DoView Board structure and semantics described here, even if it uses a different programming language, storage model, rendering system, or app architecture.

### 3.2 Reference-engine compatibility

A board is reference-engine compatible if it can be loaded by the V1.2.1 reference engine using the config and saved-state structure expected by that engine.

Reference-engine compatibility is useful for examples, generated standalone boards, tests, and developers who want to embed or adapt the reference implementation.

### 3.3 Official DoView® status

Official status is a separate permission and trademark matter. A board or system may be DoView-compatible or reference-engine compatible without being official.

## 4. Core board requirements

A DoView-compatible board must have:

1. a board title;
2. one or more pages;
3. an overview or other clear navigation surface when there is more than one page;
4. support for This–Then causal logic;
5. support for How implementation/alignment logic;
6. support for Documentation content;
7. a built-in or clearly supported Final Outcomes area;
8. boxes representing outcomes, conditions, actions, implementation entities, or final outcomes;
9. structural links showing relationships between boxes;
10. support for Display Text and Notes on boxes;
11. support for Measures and Evaluation Questions associated with boxes, and where supported, This–Then links;
12. support for sources or evidence references;
13. a way to save, export, or persist the board structure;
14. clear distinction between editable, presentational, and read-only states.

A board may be simple and one-page, or substantial and multi-page. Simplicity is allowed where the topic is genuinely simple. Substantial topics should not be forced into an artificially thin, generic, or template-like board.

## 5. Required page types

A DoView-compatible board must support the following page types.

### 5.1 This–Then Pages

This–Then Pages represent causal logic: what helps make what happen.

They are used for:

- outcomes;
- enabling conditions;
- causal pathways;
- risks and assumptions phrased as conditions where useful;
- intermediate outcomes;
- final page-level outcomes;
- system-change or behaviour-change logic.

### 5.2 How Pages

How Pages represent activities, actions, projects, workstreams, implementation roles, teams, units, organizations, capabilities, or other implementation entities that help bring about This–Then outcomes.

They are used for:

- projects;
- activities;
- interventions;
- workstreams;
- tasks;
- teams;
- organizational units;
- capabilities;
- implementation responsibilities;
- delivery plans.

### 5.3 Documentation Pages

Documentation Pages hold explanatory or supporting material that does not fit naturally inside boxes.

They are used for:

- planning-cycle guidance;
- assumptions;
- caveats;
- methods;
- evidence summaries;
- reporting guidance;
- long-form explanation;
- instructions;
- definitions;
- narrative material;
- supporting documentation.

### 5.4 Final Outcomes

Final Outcomes are the highest-level board outcomes. In the reference engine they are presented as a special built-in page rather than an ordinary subpage.

A DoView-compatible implementation must provide a clear way to represent board-level Final Outcomes separately from ordinary page-level terminal outcomes.

## 6. Board-level structure

A DoView-compatible board should include these board-level elements.

### 6.1 Title

The board must have a clear title.

### 6.2 Slug or stable board key

A board should have a stable slug, identifier, or key used for file naming, local storage, export, import, or persistence. The reference engine uses `slug`.

### 6.3 Subpages

A board contains an ordered list of pages. Each page should have:

- stable page ID;
- page label;
- page type;
- page order;
- page information or notes where supported;
- visual colour/accent information where applicable.

In the reference engine, pages are stored in `subpages`.

### 6.4 Board info

A board should support board-level information or notes. This is a suitable place for:

- assumptions;
- scope notes;
- caveats;
- evidence notes;
- intended-use notes;
- review notes;
- modelling choices.

### 6.5 Sources

A board should support sources used to build or justify the board. Sources should be actual source material, not prompt text, build notes, internal scratch notes, or AI commentary.

### 6.6 View settings

A board should preserve user-facing view settings separately from the underlying board data. Hiding a display item must not delete it from the board model.

## 7. This–Then Pages

This–Then Pages are central to DoView Boards. They are not generic flowcharts, mind maps, worksheets, kanban boards, or template diagrams. They represent the left-to-right causal or enabling logic of what is believed needs to occur in order to achieve outcomes.

The expanded rule-set for modelling This–Then Pages is set out in [`this-then-page-rules.md`](this-then-page-rules.md). This specification is authoritative for minimum compatibility; the companion file explains and operationalizes these requirements.

### 7.1 Purpose and page-type boundary

A This–Then Page shows causal or enabling logic: what helps make what happen.

Use This–Then Pages for:

- outcomes;
- enabling conditions;
- causal pathways;
- risks and assumptions phrased as conditions where useful;
- intermediate outcomes;
- system-change or behaviour-change logic;
- final page-level outcomes.

Use How Pages for activities, actions, projects, workstreams, implementation roles, teams, units, organizations, capabilities, or other implementation entities. Where a How item contributes to a This–Then outcome, use the supported How/This–Then structural link rather than turning the This–Then Page into an activity plan.

### 7.2 Left-to-right causal logic

A This–Then Page must normally read from left to right.

Boxes on the left represent earlier, enabling, contributing, diagnostic, prerequisite, or starting conditions. Boxes further right represent later, higher-level, more consequential, or more outcome-oriented states.

A box should normally be placed to the left of another box where achieving the left-hand box helps make the right-hand box possible, more likely, better, earlier, safer, more equitable, or more sustainable.

The board should not be a disconnected collection of topics. A reader should be able to follow the page from earlier conditions toward later outcomes and understand the claimed causal logic.

### 7.3 Columns

This–Then Pages must use columns to represent causal stages.

Column headings should name real causal stages in the domain. They should not be used as boxes. If a column heading states an outcome, condition, action, causal item, or implementation entity that belongs in the model, it should become a box or be rewritten as a stage heading.

Column headings should be meaningful and topic-specific. Avoid generic headings such as:

- “Stage 1”;
- “Stage 2”;
- “Column 1”;
- “Step 1”;
- “Phase 1”;
- “Inputs”;
- “Activities”;
- “Outputs”.

These terms may be used only where they are genuinely appropriate for the domain. A populated This–Then Page whose headings are dominated by an `Inputs / Activities / Outputs` template is not acceptable.

### 7.4 Boxes and wording

This–Then Boxes should normally be compact outcome or condition statements. They should usually represent one concept per box.

Good This–Then Box labels are:

- specific to the topic;
- written as outcomes, conditions, capacities, behaviours, decisions, states, risks phrased as conditions, assumptions, implementation states, or enabling factors;
- concise enough to work visually;
- meaningful without needing a numbered placeholder;
- not merely generic wording that could be pasted into any board.

Compact DoView outcome phrasing is preferred where appropriate. For example, “Funding secured” is usually preferred to “Funding has been secured,” unless the user asks for different wording.

Do not overload box labels with evidence, references, URLs, or long explanations. Put that material in Display Text, Notes, link annotations, Page info, Board info, Documentation Pages, or Sources.

Numbered placeholder labels should not be used unless the user explicitly asks for numbered items. Avoid labels such as “Condition 1.1,” “Outcome 2.3,” “Box 4.2.1,” “Step 3,” or “Pathway 07” unless numbering is part of the user’s requested structure.

### 7.5 Causal scope and external focus

A This–Then Page should include the relevant things that need to occur in the outside-world causal logic of the domain, not only things controlled by one organization or initiative.

This–Then Boxes are not limited to quantifiable outcomes. They may include:

- enabling conditions;
- capacities;
- behaviours;
- relationships;
- decisions;
- implementation states;
- risks phrased positively where useful;
- assumptions or external conditions where they materially affect the causal logic;
- intermediate outcomes;
- final page-level outcomes.

Keep measurement separate from the boxes being measured. Measures and Evaluation Questions may be associated with boxes or links, but the measure should not replace the outcome, condition, or causal item in the box.

### 7.6 Domain-shaped page structure

This–Then Pages must be domain-shaped, not template-shaped.

The number of columns, number of boxes per column, density of links, terminal outcome count, and overall page geometry must be determined by the actual causal structure of the topic. Multi-page boards should not look like the same worksheet filled in repeatedly with different words.

Do not default to:

- four columns on every page;
- three boxes in each early column and two boxes in the final column;
- a mechanical 3-column, 4-column, 3x2, 3x3, `4-4-4-4`, `4-4-4-3`, or `3-3-3-3-2` pattern;
- the same number of boxes per column across most pages;
- the same left-to-right pathway shape across unrelated domains;
- mechanically balanced pages where every topic area looks equally simple;
- repeated exact or near-matching page geometry without a domain reason.

Variation should be meaningful, not random. Do not add or remove columns or boxes merely to make the board look varied. Repeated structure is acceptable only where the domain genuinely requires it.

### 7.7 Domain decomposition and page-design reasoning

For substantial topics, a generator, app, or analyst should carry out a domain-decomposition pass before drafting This–Then Pages.

Consider distinct:

- outcome areas;
- actor or audience groups;
- causal pathways;
- delivery or implementation workstreams;
- risk or constraint areas;
- governance or accountability areas;
- context or enabling-condition areas;
- measurement or evaluation areas;
- learning, evidence, assumptions, or caveats areas.

Use this as a thinking checklist, not as a fixed page list. Do not compress genuinely distinct causal domains into one generic page just to keep the board small. Prefer separate This–Then Pages where the causal logic differs materially.

Before drafting each substantial This–Then Page, consider whether the page is mainly diagnostic, implementation-heavy, capability-building, risk-management, relationship-building, service-delivery, environmental/system-change, learning/evidence, outcome-integration, branching, convergent, simple linear, bottleneck-driven, or feedback-heavy. Let those answers determine the number of columns, the number of boxes, and where the page density sits.

### 7.8 Required page-shape audit for substantial multi-page boards

For ordinary multi-page boards with four or more This–Then Pages, the creator or generator must use a page-shape audit before finalizing the board.

For each This–Then Page, the audit should record:

1. page name;
2. domain or topic area;
3. number of columns;
4. boxes per column, such as `4-3-2-3`;
5. terminal/end-column box count;
6. whether the terminal/end-column count is normal, justified, or unusual;
7. broad shape class;
8. why this shape fits the domain;
9. whether it is an exact or near-match to another page;
10. what changed if it was too similar to another page.

The audit is an implementation/design requirement for substantial generated boards. It does not need to be displayed to the end user unless the user asks for it, but the board should not be finalized until the audit shows that This–Then Pages are genuinely domain-shaped.

### 7.9 Exact and near-matching page-shape rejection rules

For ordinary multi-page boards with four or more This–Then Pages, reject and revise the board if:

- all This–Then Pages have the same number of columns;
- all but one This–Then Page has the same number of columns;
- most This–Then Pages have the same number of columns without a documented domain reason;
- the two most common exact box-count patterns together cover most This–Then Pages;
- more than two This–Then Pages share the same exact box-count pattern;
- more than two This–Then Pages share a near-matching box-count pattern;
- most pages have the same early-column density;
- most pages have the same short-final-column pattern;
- most pages have the same simple left-to-right link rhythm;
- every page looks equally balanced or symmetrical;
- pages differ mainly in wording rather than causal structure;
- pages look like a generic template applied to several domains;
- final-column load appears to be the main source of page-shape variation.

Treat near-matches as repeated shapes. Near-matches include pages with the same number of columns, nearly the same boxes-per-column pattern, the same early-column density, the same short final-column pattern, the same left-to-right link rhythm, or the same visual balance even if one column has one extra or one fewer box.

For boards with seven or more This–Then Pages, the board should normally include at least three visibly different page-shape families unless the domain genuinely requires fewer and the reason is recorded. For boards with four to six This–Then Pages, the board should normally include at least two visibly different page-shape families unless the domain genuinely requires fewer and the reason is recorded.

### 7.10 Page-level terminal outcomes

A This–Then Page may end with one or more terminal page-level outcomes. These are not the same as the board-level Final Outcomes.

For ordinary This–Then Pages:

- one to three terminal/end-column boxes is the normal range;
- four can be acceptable where the domain genuinely has several parallel page-level outcomes and the reason is clear;
- five or more should be rare;
- six or more usually indicates that the page should be split, consolidated, or redesigned unless there is a clear domain reason.

Do not turn every subpage’s final column into a mini Final Outcomes page. Do not create page-shape variation mainly by overloading the final/right-hand column. Prefer genuine structural variation such as diagnostic-heavy starts, implementation-heavy middles, bottleneck columns, risk/feedback columns, branching or converging logic, different numbers of intermediate columns, different density in early or middle columns, or appropriate page splits.

### 7.11 Causal connectivity and many-to-many links

A substantial This–Then Page should function as a causal network rather than a disconnected inventory.

In substantial boards:

- each non-starting box should normally have at least one plausible incoming This–Then link unless deliberately presented as an initial condition;
- each non-ending box should normally have at least one meaningful forward link unless deliberately presented as a terminal outcome or side condition;
- isolated boxes should be connected, moved, rewritten, or removed unless there is a clear reason for them;
- links should express real causal or enabling relationships, not decorative density;
- important, non-obvious, evidence-based, or contested links should have supporting text through `mainText`, `notes1`, `notes2`, or `notes3` where supported.

This–Then structural links are many-to-many unless an implementation deliberately imposes a narrower rule. A source box may contribute to multiple target boxes, and a target box may depend on multiple source boxes.

Simple boards may have simple linking, but substantial boards should not look like unconnected lists.

### 7.12 Populated generated This–Then Pages

When an AI system, generator, or Board Chat feature creates a populated This–Then Page, it should create a real starting model rather than a placeholder.

A populated generated This–Then Page should normally include:

- one new This–Then subpage;
- at least three causal-stage columns;
- at least six boxes;
- compact outcome/condition box labels;
- domain-specific causal-stage headings;
- plausible left-to-right This–Then causal order.

The three-column and six-box thresholds are floors, not targets. Do not default to a mechanical 3x2 or 3x3 template. A one-box placeholder is not acceptable for a populated-page request.

Only create a blank, starter, empty, or shell This–Then Page where the user has explicitly asked for one or the app workflow is specifically creating an empty board.

### 7.13 Simple-board and documented-domain exceptions

A genuinely simple one-page board may remain simple. The standard does not require artificial complexity, unnecessary sources, unnecessary Documentation Pages, unnecessary Measures and Evaluation Questions, or forced page-shape variation where they do not fit the user’s purpose.

A repeated page shape, unusual terminal outcome count, sparse linking pattern, or synthetic structure may be acceptable where the domain genuinely requires it, the user explicitly requests it, or the board is an explicitly synthetic load-test board. The reason should be clear or documented where the board is substantial.

## 8. How Pages

### 8.1 Purpose

How Pages show how outcomes will be pursued. They represent actions, projects, workstreams, implementation entities, responsibilities, capabilities, or delivery arrangements.

How Pages should be used for “what we do” or “who/what acts” rather than for causal outcome pathways that belong on This–Then Pages.

### 8.2 How Boxes

How Boxes represent implementation items such as:

- actions;
- projects;
- interventions;
- workstreams;
- teams;
- units;
- organizations;
- people or roles;
- capabilities;
- implementation tasks.

In the reference engine, How Boxes use stable IDs such as `H001`, `H002`, and `H003`. The visible number is stable and should not change when other How Boxes are deleted or reordered.

### 8.3 How Page levels

A How Page may have a board-defined level. For example, one board might use:

- level 1 = projects;
- level 2 = teams;
- level 3 = people.

Another board may define levels differently. Levels are not a fixed ontology; they give meaning to the up/down alignment links within that board.

A How Page may also have no level. User-facing Cross-Link How Pages are unlevelled How Pages; they may still contain useful implementation information but do not participate in the strict adjacent-level Vertical Link hierarchy.

### 8.4 How Page layout

A How Page does not need This–Then columns or arrows. The reference engine displays How Boxes as a neutral grid with stable visible IDs.

A compatible implementation may use a different layout if it preserves the meaning of How Boxes, levels, and link types.

## 9. Documentation Pages

### 9.1 Purpose

Documentation Pages are for supporting material that needs more space than a box, link, measure, or evaluation question field.

They are appropriate for:

- narrative explanation;
- assumptions;
- caveats;
- evidence summaries;
- implementation guidance;
- reporting guidance;
- method notes;
- background information;
- instructions for using the board.

### 9.2 Documentation content

Documentation Page content may include formatted text. The reference engine stores Documentation Page content in board state keyed by page ID.

A compatible implementation should preserve Documentation Page content when saving, loading, exporting, importing, copying, or converting boards.

Documentation content should be handled carefully because generated boards are active HTML/JavaScript files. Implementations that allow rich HTML must apply security controls appropriate to their deployment context.

### 9.3 Documentation is not a replacement for structure

Documentation Pages should not be used to avoid modelling important causal or implementation logic. Important outcomes and enabling conditions should still be represented as This–Then Boxes. Important implementation actions should still be represented as How Boxes.

## 10. Final Outcomes

### 10.1 Purpose

Final Outcomes represent the highest-level outcomes the board is ultimately concerned with.

They should be broader than most page-level terminal outcomes and should give the board a clear overall purpose.

### 10.2 Final Outcomes vs page-level outcomes

A This–Then Page may have one or more terminal outcomes in its final column. Those page-level outcomes may contribute to the board-level Final Outcomes.

Do not turn every This–Then Page’s final column into a mini Final Outcomes page. Use the Final Outcomes area for board-level outcomes.

### 10.3 Visual distinction

Final Outcomes should be visually distinct from ordinary This–Then Boxes. The reference engine uses a black-and-white style with neutral borders and a distinct Final Outcomes heading.

A compatible implementation may use different styling if Final Outcomes remain clearly identifiable as board-level outcomes.

## 11. Boxes and fields

### 11.1 Box types

A DoView-compatible board should distinguish at least these box types:

- This–Then Boxes;
- How Boxes;
- Final Outcome boxes.

The same implementation may use a shared internal box model, but the meaning of each box type must remain clear.

### 11.2 Box labels

Every box must have a label.

Box labels should be natural-language labels, not placeholders. Avoid labels such as “Condition 1,” “Outcome 2,” “Box 3,” “Step 4,” or “Pathway 5” unless the user explicitly asked for numbered items.

### 11.3 Display Text

Boxes should support Display Text. Display Text is longer explanatory text associated with a box and may be shown under the box in the board view where the view settings allow it.

Display Text is different from the box label. The box label should remain concise; Display Text can explain, qualify, or document the box.

### 11.4 Notes

Boxes should support Notes 1, Notes 2, Notes 3, Notes 4, and Notes 5.

The notes fields may be used for evidence, assumptions, caveats, implementation details, user commentary, or other structured supporting information.

### 11.5 Traffic Lights and priorities

A compatible board may support traffic-light status and priority markers.

In the reference package, newly generated boards should not pre-assign non-neutral Traffic Lights or priorities unless the user explicitly asks for them. Defaults should be neutral/unset.

Traffic Lights and priority markers are planning aids. They are not approval, verification, official status, or security controls.

### 11.6 Tags

Tags are user-defined visual labels. They may be used for grouping, filtering, review state, responsibility, version, role, site, source category, or other user-defined meanings.

Tags are not:

- provenance proof;
- locking;
- permissions;
- authorship proof;
- official status;
- verification;
- security;
- protection.

In the V1.2.1 reference implementation, tags may apply to boxes, structural links, Measures, and Evaluation Questions. They are not implemented for pages, page tabs, Sources, Board info, Page info, Documentation Page clones, copied/imported content as separate surfaces, or unsupported UI surfaces.

### 11.7 Jump/drill links

A board may allow a box to jump to another page or drill down to related content. Jump/drill navigation is not the same as a This–Then structural link or How structural link. Implementations should keep navigation relationships visually and semantically distinct from causal and implementation links.

## 12. Structural links

A DoView-compatible board must distinguish the main structural link types.

### 12.0 Link cardinality and direction

Structural links in a DoView Board are generally many-to-many unless a specific implementation or board rule deliberately restricts them.

A box may have:

- no incoming links;
- one incoming link;
- multiple incoming links;
- no outgoing links;
- one outgoing link;
- multiple outgoing links.

Multiple boxes may link to the same target box, and one box may link to multiple target boxes.

This is especially important on This–Then Pages, where the board should represent a causal network rather than a simple one-to-one chain. A This–Then Box may contribute to several later boxes, and several earlier boxes may contribute to the same later box.

How Page Vertical Links are also many-to-many unless a board deliberately imposes a stricter hierarchy. For example, one Level 1 How Box may align with several Level 2 How Boxes, and one Level 2 How Box may align upward to more than one Level 1 How Box where that accurately represents the implementation structure.

Many-to-many linking must still preserve link meaning. Links should not be added merely to create density. Each link should represent a real causal, enabling, alignment, implementation, or relationship claim.

This–Then links describe causal or enabling relationships. Vertical Links describe implementation hierarchy or alignment. Cross-Links describe implementation relationships that are not part of the strict adjacent-level hierarchy. Jump or drill links are navigation links and are not the same as structural links.

### 12.1 This–Then causal links

This–Then links are formal directional links between This–Then Boxes.

They mean that the source box helps make the target box happen, or affects it in a causal or enabling way.

Requirements:

- This–Then links must have a source box and target box;
- they must be directional;
- they may be within a page or across This–Then Pages;
- they should not target How Pages or Documentation Pages;
- same-column links may be allowed where they have meaningful causal value;
- feedback loops may be allowed;
- links should be inspectable and removable;
- links should be saved and restored with the board.

### 12.2 Positive and negative This–Then polarity

This–Then links may have polarity.

- Positive polarity means the source helps produce, increase, enable, strengthen, or make more likely the target.
- Negative polarity means the source reduces, prevents, constrains, weakens, or makes less likely the target.

Implementations that support polarity should display the difference clearly.

### 12.3 How links

How links connect implementation items to outcomes or to other implementation items.

A How link should always have a How Box as its source in the reference-engine model. It may point to a This–Then Box or to another How Box, subject to the Vertical Link and Cross-Link rules below.

How links are not ordinary This–Then causal links. They express implementation alignment or relationship rather than a This–Then outcome pathway.

### 12.4 Vertical Links

Vertical Links are hierarchical implementation/alignment links.

An upward Vertical Link points from a How Box to the outcome, higher-level How Box, or adjacent higher implementation level that the source contributes to or aligns with. A downward Vertical Link points from a How Box to a lower-level How Box that helps implement, deliver, break down, or operationalize the source.

In the V1.2.1 reference model:

- a Level 1 How Box may link upward to This–Then Boxes;
- a Level 1 How Box may link downward to Level 2 How Boxes;
- a Level-N How Box where N is 2 or higher may link upward to Level-(N-1) How Boxes;
- a Level-N How Box may link downward to Level-(N+1) How Boxes;
- hierarchical How-to-How links are adjacent-level only;
- hierarchical How link counts should register symmetrically at both ends of the relationship.

### 12.5 Cross-Links

Cross-Links are implementation relationships that are not part of the strict adjacent-level hierarchy.

They include:

- same-page How-to-How links;
- same-level How-to-How links;
- skipped-level How-to-How links;
- links from unlevelled How Pages;
- links from Level 2-or-deeper How Boxes to This–Then Boxes.

These links should be visually and conceptually distinct from Vertical Links.

### 12.6 Page jump, drill, documentation, and source references

Page jump or drill links are navigation relationships. They help users move from a box or board item to another page or related content. They are not, by themselves, This–Then causal links or How structural links.

Documentation references connect board items to explanatory material, assumptions, caveats, review notes, or longer-form supporting text.

Source references connect board items to evidence or source material. A source reference does not make the board item official, verified, approved, certified, or quality-assured.

Implementations should not visually or semantically collapse navigation jumps, documentation references, source references, This–Then links, and How links into one undifferentiated link type.

### 12.7 Link notes and annotations

Structural links should support notes or annotations where possible. Link notes are useful for:

- explaining why the relationship exists;
- recording evidence;
- recording assumptions;
- clarifying negative polarity;
- documenting contested or uncertain relationships;
- explaining cross-page logic.

The reference engine supports Notes 1, Notes 2, and Notes 3 on structural links.

### 12.8 Measures and Evaluation Questions on links

The V1.2.1 reference engine supports associating Measures and Evaluation Questions with This–Then links. It does not support this feature for How links in this release.

A compatible implementation should not silently discard Measure or Evaluation Question associations attached to This–Then links.

## 13. Measures

### 13.1 Purpose

Measures are board-level reusable objects used to track progress, performance, implementation, outcomes, or other important indicators.

Measures are not just free-text notes on boxes. They should have their own identity and may be associated with one or more boxes and, in the reference engine, one or more This–Then links.

### 13.2 Minimum Measure fields

A Measure should support:

- stable Measure ID;
- title;
- Display Text;
- Notes 1;
- Notes 2;
- Notes 3;
- associated boxes;
- tags where the implementation supports tags.

In the reference engine, Measure IDs use the form `M001`, `M002`, `M003`, and so on. IDs should not be renumbered after deletion.

### 13.3 Measure associations

Measures may be associated with:

- This–Then Boxes;
- How Boxes;
- Final Outcome boxes;
- This–Then links, where the implementation supports link-level Measure associations.

A Measure may exist without any association.

### 13.4 Display

Measures may be displayed under associated boxes when the relevant view setting is enabled. Hiding Measures from view must not delete Measures or their associations.

## 14. Evaluation Questions

### 14.1 Purpose

Evaluation Questions are board-level reusable objects used to identify what needs to be tested, learned, evaluated, or answered.

They help connect the board to evaluation, monitoring, learning, research, and evidence use.

### 14.2 Minimum Evaluation Question fields

An Evaluation Question should support:

- stable Evaluation Question ID;
- question text;
- Display Text;
- Notes 1;
- Notes 2;
- Notes 3;
- associated boxes;
- tags where the implementation supports tags.

In the reference engine, Evaluation Question IDs use the form `EQ001`, `EQ002`, `EQ003`, and so on. IDs should not be renumbered after deletion.

### 14.3 Evaluation Question associations

Evaluation Questions may be associated with:

- This–Then Boxes;
- How Boxes;
- Final Outcome boxes;
- This–Then links, where the implementation supports link-level Evaluation Question associations.

An Evaluation Question may exist without any association.

### 14.4 Display

Evaluation Questions may be displayed under associated boxes when the relevant view setting is enabled. Hiding Evaluation Questions from view must not delete Evaluation Questions or their associations.

## 15. Sources and evidence

### 15.1 Sources list

A DoView-compatible board should support a board-level Sources list.

Sources should identify actual materials used to inform the board. A source may be represented as a URL, title, label, or source object depending on the implementation.

### 15.2 Source integrity

Do not invent sources. Do not add URLs or references that were not used. Do not use the Sources list for internal build notes, prompt text, scratch notes, or commentary.

Where evidence or public research was used, source information should be placed in the Sources list and, where useful, close to the relevant claim in box notes, link notes, Page info, Board info, or Documentation content.

### 15.3 User-supplied material

Where a board is built from user-supplied material, preserve the distinction between user-supplied material and public internet sources where practical.

### 15.4 Sources are not official verification

A source entry does not make a board official, verified, endorsed, approved, locked, or quality-assured. Sources are references for review and interpretation.

## 16. Views and display settings

### 16.1 View settings are presentation controls

View settings control what is visible. They do not delete data.

A compatible implementation should allow users to show or hide major display elements without losing the underlying board content.

### 16.2 This–Then view settings

A This–Then Page should be able to show or hide, at minimum where implemented:

- Traffic Lights;
- priorities;
- Display Text under Boxes;
- Measures under boxes;
- Evaluation Questions under boxes;
- This–Then Link counts;
- Vertical Link counts from How Boxes;
- Cross-Links to How Boxes;
- tags where supported.

### 16.3 How view settings

A How Page should be able to show or hide, at minimum where implemented:

- Traffic Lights;
- priorities;
- Display Text under Boxes;
- numbering;
- Measures under boxes;
- Evaluation Questions under boxes;
- Vertical Link counts to This–Then Boxes or How Boxes;
- Cross-Links to This–Then Boxes or How Boxes;
- tags where supported.

### 16.4 Final Outcomes view settings

The Final Outcomes area should be able to show or hide, at minimum where implemented:

- Traffic Lights;
- priorities;
- Display Text under Boxes;
- Measures under boxes;
- Evaluation Questions under boxes;
- tags where supported.

### 16.5 Simple default view

The V1.2.1 generated-board default is a simple Page View with optional display items off unless the user asks otherwise.

Users should be able to turn on additional details through Page View controls. A simple default view must not mean the underlying data has been removed.

## 17. Overview and navigation

### 17.1 Overview

Multi-page boards should provide an Overview or equivalent navigation surface.

The Overview should help users understand the board structure and move to pages and Final Outcomes.

### 17.2 Page navigation

A compatible board should provide clear navigation between:

- Overview;
- This–Then Pages;
- How Pages;
- Documentation Pages;
- Final Outcomes.

### 17.3 Cross-page navigation

Where a link, search result, jump, or overview item leads to another page, the implementation should make the navigation understandable. Users should be able to tell why they were taken to the destination where practical.

### 17.4 Search

Search is not conceptually required for every minimal implementation, but the reference engine supports board search across page titles, box titles, Display Text, Measures, Evaluation Questions, and Documentation content. Compatible systems that support search should preserve the distinction between structural items and free-text results.

## 18. Visual and interaction conventions

### 18.1 This–Then visual language

This–Then Pages should communicate left-to-right causal logic. The layout should make it clear which boxes are earlier/enabling and which are later/outcome-oriented.

The reference engine uses coloured page accents, columns, arrows, and This/Then visual cues.

### 18.2 How visual language

How Pages should look and behave differently from This–Then Pages. They should not imply This–Then causal columns where the page is actually an implementation page.

The reference engine uses neutral How Boxes in a grid with stable H-number IDs.

### 18.3 Documentation visual language

Documentation Pages should look and behave differently from box pages. They should support reading and editing longer-form content without implying that text paragraphs are structural boxes.

### 18.4 Link affordances

A compatible implementation should keep different relationship types visually distinct:

- This–Then links;
- Vertical Links;
- Cross-Links;
- jump/drill navigation.

This distinction is important. A navigation jump should not be confused with a causal link. A Cross-Link should not be confused with a This–Then link.

### 18.5 Read-only indicators

Where read-only mode is supported, the interface should clearly indicate that the board is a read-only copy or read-only view.

The interface must not imply that read-only mode is tamper-proof, authenticated, certified, official, or security-protected.

## 19. Saving, export, import, and standalone boards

### 19.1 Standalone generated boards

The reference package generates standalone `.html` boards. A standalone board contains the engine and board configuration/state needed to open the board without the prompt, builder, config file, or separate engine file.

A compatible implementation may use other persistence methods, but it should preserve the board structure and semantics when saving, exporting, importing, copying, or rebuilding.

### 19.2 Active HTML warning

Standalone `.html` boards are active HTML/JavaScript files. They should be treated like executable web content, not passive documents.

For security and deployment guidance, see `docs/security-and-read-only-notes.md`.

### 19.3 Reference build structure

For reference-engine standalone boards:

- the final HTML should begin with `<!DOCTYPE html>`;
- the engine should be embedded once;
- the board config should be provided through one `DoView.init(...)` call or equivalent embedded state path;
- prompt text and builder code should not be embedded in final board HTML;
- final boards should be validated before release or sharing.

### 19.4 Builder limits

The builder validates and assembles board files mechanically. Builder success does not prove that the board is a good DoView model.

A technically valid but shallow, generic, under-linked, or template-like board may still fail this specification’s substantive quality expectations.

## 20. Reference-engine config shape

This section summarizes the V1.2.1 reference-engine config shape. The separate `docs/config-reference.md` should provide the more detailed technical reference.

A reference-engine-compatible config contains:

```json
{
  "title": "Board Title",
  "slug": "board_slug",
  "subpages": [],
  "finalOutcomes": [],
  "sources": [],
  "savedState": {}
}
```

### 20.1 This–Then subpage shape

A This–Then subpage uses:

```json
{
  "id": "p1",
  "label": "Page label",
  "pageType": "this_then",
  "color": {
    "bg": "#dbeafe",
    "bdr": "#93c5fd",
    "tab": "#3b82f6"
  },
  "cols": [
    {
      "h": "Column heading",
      "boxes": ["Box label"]
    }
  ]
}
```

For generated boards, every This–Then subpage must include a complete `color` object with `bg`, `bdr`, and `tab` hex values.

### 20.2 How subpage shape

A How subpage uses:

```json
{
  "id": "p2",
  "label": "How Page label",
  "pageType": "how",
  "howLevel": 1,
  "howBoxes": [
    {
      "id": "H001",
      "label": "How Box label"
    }
  ],
  "nextHowNum": 2,
  "cols": []
}
```

### 20.3 Documentation subpage shape

A Documentation subpage uses:

```json
{
  "id": "p3",
  "label": "Documentation Page label",
  "pageType": "documentation",
  "cols": []
}
```

Documentation content is stored in saved state, keyed by the Documentation Page ID.

```json
{
  "savedState": {
    "docContent": {
      "p3": "<h2>Purpose</h2><p>Documentation content.</p>"
    }
  }
}
```

### 20.4 Box IDs in the reference engine

The reference engine uses generated box IDs such as:

- `p1-c0-b0` for a This–Then Box;
- `p2-H001` for a How Box;
- `final-b0` for a Final Outcome box.

Structural links and associations refer to these IDs.

### 20.5 Saved state

`savedState` may include:

- box state;
- board info;
- page info;
- Documentation content;
- This–Then links;
- How links;
- Measures;
- Evaluation Questions;
- tags;
- view settings;
- top-right text;
- created date;
- board instance identifiers;
- other additive metadata used by the reference engine.

Developers adapting the reference engine should preserve unknown or additive saved-state fields where practical, rather than discarding them.

## 21. Board quality requirements

Board quality requirements must be read together with the This–Then Page modelling rules in section 7 and the expanded guidance in [`this-then-page-rules.md`](this-then-page-rules.md). Technical validity is not enough if a substantial board is shallow, generic, under-linked, or template-shaped.

### 21.1 Domain-shaped boards

Substantial boards must be shaped by the domain, not by an arbitrary visual template.

A DoView-compatible generated board should show that the creator considered:

- distinct domains or workstreams;
- actors and audiences;
- causal pathways;
- risks and constraints;
- implementation workstreams;
- evidence needs;
- measures;
- evaluation questions;
- omitted areas;
- natural differences between simple and complex parts of the topic.

### 21.2 Omitted-domain check

For substantial topics, a board should not omit or collapse major domains, actors, audiences, causal pathways, delivery stages, risks, constraints, enabling conditions, implementation workstreams, evidence needs, measures, or learning questions that would materially improve the board.

### 21.3 Omitted-regularity check

For multi-page boards, repeated geometry should be examined. Repetition is acceptable only where the domain genuinely requires it.

The board should be revised if:

- all or nearly all This–Then Pages have the same number of columns;
- more than two pages share the same exact or near-matching box-count pattern without a domain reason;
- most pages have the same early-column density;
- most pages use the same simple left-to-right link rhythm;
- pages differ mainly in wording rather than causal structure;
- variation is achieved mainly by overloading final/right-hand columns.

### 21.4 Causal-connectivity check

For substantial boards, This–Then links should be reviewed before finalizing the board. The board should not contain many isolated boxes or under-linked stages unless the reason is clear.

### 21.5 Numbered-label check

Numbered placeholder labels should not be used unless the user explicitly asks for numbered items.

### 21.6 Simple-board exception

A genuinely simple one-page board may remain simple. The standard does not require artificial complexity, unnecessary sources, unnecessary Documentation Pages, or extra Measures and Evaluation Questions where they do not fit the user’s purpose.

## 22. Read-only meaning and limits

Read-only mode is a convenience feature. It hides or disables editing through the board interface.

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

Anyone with the HTML file may be able to copy, inspect, save, edit, modify, extract, or redistribute an altered version using browser tools, text editors, scripts, or other software.

Do not use read-only mode as proof that a board is official, unchanged, approved, locked, verified, certified, or protected.

## 23. Board Chat

Board Chat is optional. A DoView Board can be viewed, edited, saved, copied, printed, presented, and opened in read-only mode without Board Chat.

A DoView-compatible board or system does not need to implement Board Chat.

If Board Chat is implemented, it should be governed carefully because it may send board content to an AI endpoint or provider. API keys are sensitive and should not be saved in exported board state.

For higher-risk, sensitive, confidential, regulated, public, multi-user, enterprise, or production environments, Board Chat should be disabled by default or governed through approved endpoints, backend/proxy arrangements, logging, retention, audit, and data-handling controls.

## 24. DoView-compatible vs Official DoView®

A board, app, platform, or system may accurately describe itself as DoView-compatible if it implements this minimum specification accurately.

Accurate descriptive wording may include:

- DoView-compatible;
- supports DoView Boards;
- based on DoView Planning;
- implements the DoView Boards minimum standard;
- creates DoView-compatible boards;
- uses DoView Planning;
- uses DoView-based models.

This wording must not imply official endorsement, certification, approval, quality assurance, affiliation, badge rights, or production by Dr Paul Duignan, DoView Corporation Limited, or any official DoView® body unless written permission has been given.

## 25. Official DoView® Badge and trademark requirements

Implementing this specification does not grant permission to use:

- the DoView® Badge;
- the Official DoView® Badge;
- DoView® Standards Badge;
- DoView® Compliance Badge;
- DoView® Certified Badge;
- DoView® Approved Badge;
- DoView® Quality Badge;
- official DoView® logos;
- any confusingly similar badge, certification mark, approval mark, or official-status mark.

Official badge, logo, endorsement, certification, approval, quality-assurance, affiliation, or official-status claims require written permission.

For the full developer-facing trademark and attribution guidance, see [`trademark-and-attribution.md`](../docs/trademark-and-attribution.md). To ask about official status, badge use, collaboration, review, quality assurance, endorsement, certification, or permission, contact DoView Planning at <https://doviewplanning.org/contact>.

## 26. Extension and adaptation

Developers are encouraged to build on, adapt, extend, and integrate DoView-compatible boards into other apps, platforms, workflows, AI tools, systems, and products.

Compatible extensions may include:

- different storage backends;
- collaborative editing;
- permissions outside the board file;
- stronger security models;
- accessibility improvements;
- different rendering technologies;
- additional import/export formats;
- analytics;
- version control;
- integration with project-management, planning, evaluation, or agentic systems;
- additional metadata;
- alternative UI layouts.

Extensions should not break the core semantics of:

- This–Then causal pages;
- How implementation/alignment pages;
- Documentation Pages;
- Final Outcomes;
- structural link types;
- Display Text and Notes;
- Measures;
- Evaluation Questions;
- sources;
- read-only limitations;
- DoView-compatible vs Official DoView® distinction.

## 27. Non-compatible or misleading uses

A board, app, platform, or system should not be described as implementing the DoView Boards minimum standard if it:

- lacks This–Then causal structure;
- treats DoView Boards as ordinary unstructured drawing canvases;
- removes or obscures the distinction between This–Then, How, Documentation, and Final Outcomes;
- uses link types in a way that confuses causal, implementation, and navigation relationships;
- discards Measures, Evaluation Questions, sources, notes, or saved-state fields without warning;
- presents read-only mode as security protection;
- claims official DoView® status without written permission;
- uses the Official DoView® Badge or similar badge without written permission;
- produces boards that are materially template-shaped rather than domain-shaped for substantial topics.

A modified or inspired system may still accurately say that it is inspired by DoView Planning, draws on DoView Planning, or uses a modified DoView-based approach where that is accurate.

## 28. Minimum compatibility checklist

A developer can use this checklist when assessing compatibility.

### Required structure

- [ ] Board title is present.
- [ ] One or more pages are present.
- [ ] This–Then Pages are supported.
- [ ] How Pages are supported.
- [ ] Documentation Pages are supported.
- [ ] Final Outcomes are supported separately from ordinary page-level outcomes.
- [ ] Multi-page boards have clear overview/navigation.

### Required semantics

- [ ] This–Then Pages show causal/enabling left-to-right logic.
- [ ] This–Then Pages follow the modelling rules in section 7 and [`this-then-page-rules.md`](this-then-page-rules.md).
- [ ] How Pages show implementation/action/alignment logic.
- [ ] Documentation Pages hold supporting text and explanation.
- [ ] Final Outcomes represent board-level outcomes.
- [ ] This–Then links are distinct from How links.
- [ ] Vertical Links are distinct from Cross-Links.
- [ ] Navigation jumps are distinct from structural links.

### Required content features

- [ ] Boxes have labels.
- [ ] Boxes support Display Text.
- [ ] Boxes support Notes.
- [ ] Measures are supported as board-level reusable objects.
- [ ] Evaluation Questions are supported as board-level reusable objects.
- [ ] Sources or evidence references are supported.
- [ ] Tags, if implemented, are treated as visual/user-defined labels rather than security or provenance.

### Required quality expectations

- [ ] Substantial boards are domain-shaped rather than template-shaped.
- [ ] Multi-page boards do not repeat the same This–Then geometry without a domain reason.
- [ ] Ordinary multi-page boards with four or more This–Then Pages have been checked against the page-shape audit, near-match, shape-family, and terminal/end-column rules.
- [ ] This–Then Boxes are causally connected where appropriate.
- [ ] Terminal page-level outcomes are not overloaded as a substitute for real page-shape variation.
- [ ] Numbered placeholder labels are avoided unless explicitly requested.

### Required safety and status expectations

- [ ] Generated HTML boards are treated as active web content.
- [ ] Read-only mode is not described as a security boundary.
- [ ] Board Chat, if implemented, is optional and governed appropriately.
- [ ] DoView-compatible wording does not imply official status.
- [ ] Official badge, logo, certification, approval, or endorsement claims are not made without written permission.

## 29. Relationship to other repository files

This specification should be read with:

- `README.md` for repository overview and quick start;
- `doview-board-engine.js` for the canonical reference implementation;
- `spec/this-then-page-rules.md` for expanded This–Then Page modelling guidance;
- `doview-board-builder.js` for local standalone board assembly;
- `doview-board-building-prompt.md` for the AI prompt package;
- `docs/config-reference.md` for the technical config format;
- `docs/developer-integration-guide.md` for developer use of the reference engine;
- `docs/security-and-read-only-notes.md` for security, deployment, and read-only limitations;
- `docs/trademark-and-attribution.md` for trademark, attribution, and Official DoView® Badge guidance.

## 30. Versioning

This is the V1.2.1 minimum specification for the V1.2.1 DoView Boards prompt package release.

Future releases may refine the specification, config format, reference engine, examples, validation rules, checksum verification, security guidance, or badge process. Developers should state which DoView Boards specification version their implementation targets.
