# This–Then Page modelling rules

DoView Boards are a tool for doing DoView Planning (https://doviewplanning.org). DoView Planning is an applied version of outcomes theory (https://doviewplanning.org/theory). Central to outcomes theory is the use of a particular type of This–Then diagram to set out the causal logic of what it is believed needs to occur in order to achieve outcomes.

This–Then diagrams are drawn according to a specific set of rules. The DoView Planning rules for drawing DoView diagrams are described at https://www.doviewplanning.org/theory#rulesfordrawingdoviewdiagrams. This document sets out how those rules are represented in the DoView Board app and in GitHub package implementations.

This file expands the normative requirements in [`doview-board-minimum-spec.md`](doview-board-minimum-spec.md). If there is any conflict, the minimum specification controls.

## 1. Why the DoView Drawing Rules matter

The DoView Drawing Rules are a core part of what makes a DoView Board a DoView Board.

They have been developed through extensive real-world use to support a powerful way of visualising outcomes and the pathways leading to them.

This–Then modelling is a central part of a DoView Board. A DoView Board is not just a diagramming surface or a collection of labelled boxes. It is intended to make explicit the causal logic of what is believed needs to happen in order for outcomes to be achieved.

In particular:

- **Outcomes, not activities.** This-Then boxes should normally be written as completed results, such as "increased awareness", not activities such as "increasing awareness". The board should show the outcomes being worked toward, not just what people are busy doing.
- **Everything important on one board.** Risks, assumptions, measures, evaluation questions, documentation and other critical review material should remain connected to the board system rather than being pushed into disconnected tables or side documents where decision-makers may miss them.
- **Future-proof first, then prioritise.** A DoView Board should map the wider set of outcomes and contributing factors that may matter, then allow current priorities to be flagged. Prioritisation should not replace the fuller map.

The rules in this file help ensure that generated or implemented boards remain DoView-compatible rather than becoming generic flowcharts, template worksheets, activity plans, mind maps, or decorative diagrams.

Developers and AI coding agents should preserve these rules when changing prompts, examples, builder behaviour, documentation or specifications.

## 2. Core DoView diagram principles represented in This–Then Pages

The public DoView Planning rules for drawing DoView diagrams are represented in the V1.3.6 package in the following ways.

### 2.1 Keep boxes compact

Box labels should be short enough to be read quickly. Long explanations, evidence, references, caveats, and supporting material should go in Display Text, Notes, link notes, Page info, Board info, Documentation Pages, or Sources.

### 2.2 Word boxes as outcomes, conditions, or completed states where appropriate

This–Then Boxes should usually describe outcomes, conditions, capacities, behaviours, decisions, states, risks phrased as conditions, assumptions, implementation states, or enabling factors.

Where natural, use compact completed-state wording. For example, use “Funding secured” rather than “Funding has been secured,” unless the user asks for another style.

### 2.3 Put one concept in each box

A box should usually contain one concept. Avoid combining an end and a means in the same box. For example, do not write a box such as “Community awareness increased through producing videos” when the awareness outcome and the video-production implementation method should be modelled separately.

### 2.4 Build externally focused models

A DoView Board should show the relevant things that need to happen in the outside-world causal logic of the domain, not only what one organization controls.

This means a This–Then Page may include outcomes, enabling conditions, external assumptions, risks phrased positively, system conditions, actor behaviours, relationship conditions, policy conditions, or implementation states where they materially affect the causal logic.

### 2.5 Do not force the diagram into inputs / activities / outputs / outcomes sections

The causal flow in the domain should determine where boxes sit. Categories such as inputs, activities, outputs, and outcomes may be useful as tags or analysis overlays, but they should not be used as a default page template for populated This–Then Pages.

### 2.6 Do not silo causal contribution

A lower-level box may contribute to more than one higher-level box. A higher-level box may depend on more than one lower-level box. This–Then links are many-to-many unless an implementation deliberately imposes a narrower rule.

### 2.7 Keep measurement separate from what is measured

Measures and Evaluation Questions should be associated with boxes or links after the causal model is built. They should not replace the outcome, condition, or causal item being measured.

### 2.8 Build a model that can hold the wider outcomes system

A substantial DoView Board should not be limited to current priorities if the relevant causal system is wider. It should be capable of showing the important outcomes, conditions, assumptions, and pathways that matter over time. Current priorities can then be identified on or within that wider model.

### 2.9 Allow multiple high-level outcomes where the domain requires them

Do not assume that every organization, initiative, or domain has a single high-level outcome. Where the real-world domain contains several differentiated high-level outcomes, the board may represent several board-level Final Outcomes and several page-level terminal outcomes.

### 2.10 Use left-to-right logic

For ordinary DoView Boards in left-to-right reading contexts, This–Then Pages should place earlier, enabling, or contributing boxes to the left and later, higher-level, or more consequential boxes to the right.

### 2.11 Include all relevant and necessary causal steps

This–Then Pages should include the relevant and necessary causal steps at the level of detail required by the user’s purpose. Do not omit important intermediate conditions merely to make the page look simple or symmetrical.

### 2.12 Use evaluative descriptors where useful

Where useful, a box may include an evaluative descriptor such as “adequate,” “sufficient,” “effective,” “appropriate,” “timely,” “trusted,” or “accessible.” Use these only where they improve the causal meaning of the box.

### 2.13 Use meaningful subpages for large models

Large or substantial DoView Boards should be divided into meaningful subpages. Subpages should reflect real domains, causal pathways, actors, workstreams, risk areas, outcome areas, or system components rather than an arbitrary page quota.

## 3. This–Then Page purpose and boundaries

A This–Then Page is for outcomes, conditions, causal logic, enabling logic, and “what leads to what.”

Use This–Then Pages for:

- outcomes;
- enabling conditions;
- causal pathways;
- risks and assumptions phrased as conditions where useful;
- capacities;
- behaviours;
- relationships;
- decisions;
- implementation states where they function as causal conditions;
- intermediate outcomes;
- page-level terminal outcomes;
- system-change or behaviour-change logic.

Use How Pages for activities, projects, tasks, interventions, workstreams, implementation roles, teams, units, organizations, capabilities, or other implementation entities. Where a How item contributes to a This–Then outcome, use the supported How/This–Then structural link. Do not turn the This–Then Page into an activity plan merely because implementation actions are important.

## 4. Left-to-right causal logic

This–Then Pages should read from left to right.

Boxes on the left represent earlier, enabling, contributing, diagnostic, prerequisite, or starting conditions. Boxes further right represent later, higher-level, more consequential, or more outcome-oriented states.

A box should normally sit to the left of another box where achieving the left-hand box helps make the right-hand box possible, more likely, better, earlier, safer, more equitable, or more sustainable.

Final or right-hand boxes are page-level terminal outcomes unless they are explicitly part of the board-level Final Outcomes area. They should not automatically be treated as board-level Final Outcomes.

## 5. Column rules

Columns represent causal stages.

Column headings should name real causal stages in the domain. They should not be treated as boxes. If a column heading is really an outcome, condition, action, causal item, or implementation entity, it should become a box or be rewritten as a stage heading.

Avoid generic column headings such as:

- `Stage 1`;
- `Stage 2`;
- `Column 1`;
- `Step 1`;
- `Phase 1`;
- `Inputs`;
- `Activities`;
- `Outputs`.

These headings may be used only where they are genuinely appropriate for the domain. A populated This–Then Page dominated by a generic `Inputs / Activities / Outputs` structure is not acceptable.

## 6. Box wording rules

Box labels should normally be compact, outcome-focused, or condition-focused.

Good box labels should:

- represent one concept per box;
- be specific to the topic;
- describe an outcome, condition, capacity, behaviour, decision, state, enabling factor, relationship, implementation state, risk condition, assumption, external condition, intermediate outcome, or page-level terminal outcome;
- be meaningful without relying on a numbered placeholder;
- avoid generic wording that could be pasted unchanged into almost any board;
- avoid long explanations, evidence, URLs, and references.

Do not use numbered placeholder labels unless the user explicitly asks for numbered items. Avoid labels such as:

- `Condition 1.1`;
- `Outcome 2.3`;
- `Box 4.2.1`;
- `Step 3`;
- `Pathway 07`.

## 7. Domain-shaped page structure

Build the board from the actual logic of the topic. Do not apply a fixed template.

The number of pages, columns, boxes, terminal outcomes, and links should be determined by the structure of the domain and the purpose of the board.

Do not default to:

- four columns on every This–Then Page;
- three boxes in each early column and two boxes in the final column;
- a mechanical 3-column, 4-column, 3x2, 3x3, `4-4-4-4`, `4-4-4-3`, or `3-3-3-3-2` structure;
- the same number of boxes per column across most pages;
- the same left-to-right pathway shape across unrelated domains;
- repeated page structures with different wording;
- mechanically balanced pages where every topic area looks equally simple.

Repeated structure is allowed only where the domain genuinely calls for it. Variation must be meaningful, not cosmetic. Do not introduce random variation just to look different.

## 8. Domain-decomposition pass

For substantial topics, do a domain-decomposition pass before drafting the board.

Identify the main distinct domains naturally implied by the topic. A domain may be:

- a major outcome area;
- an actor or audience group;
- a causal pathway;
- a delivery or implementation workstream;
- a risk or constraint area;
- a governance or accountability area;
- a context or enabling-condition area;
- a measurement or evaluation area;
- a learning, evidence, assumption, or caveat area.

Do not use the domain list as fixed page headings. Use it as a thinking checklist. Do not compress genuinely distinct causal domains into one generic page merely to keep the board small. Prefer separate This–Then Pages where the causal logic differs materially.

## 9. Page-design questions

Before drafting each substantial This–Then Page, ask:

1. Is this page mainly diagnostic, implementation-heavy, capability-building, risk-management, relationship-building, service-delivery, environmental/system-change, learning/evidence, outcome-integration, branching, convergent, simple linear, bottleneck-driven, or feedback-heavy?
2. Does it need a broad early diagnostic column, or only a small set of starting conditions?
3. Does it need several implementation-condition columns, or only one?
4. Does it need one final page-level outcome, several parallel page-level outcomes, or intermediate outcomes before the final page-level outcomes?
5. Does the causal logic converge, branch, loop back, or run mostly linearly?
6. Are there bottlenecks, risks, feedbacks, or enabling conditions that justify uneven columns?
7. Which parts of this domain are genuinely complex, and which are simple?
8. How should the number of columns and boxes follow from those answers?

Use the answers to shape the page before writing boxes. Do not start by choosing a default four-column or five-column layout.

## 10. Anti-template and natural-shape rules

A DoView Board must not look as if one page template has been filled in repeatedly with different words.

Do not default to:

- four columns on every This–Then Page;
- three boxes in each early column and two boxes in the final column;
- the same number of boxes per column across most pages;
- the same left-to-right pathway shape across unrelated domains;
- repeated page structures with different wording;
- mechanically balanced pages where every topic area looks equally simple.

If most pages have the same structure, the board is too template-like and should be revised.

Different domains usually need different causal shapes. Some pages may need more diagnostic detail. Some may need more implementation detail. Some pages may need fewer columns. Some pages may need more intermediate outcomes. Some may be broad and integrative. Some may be narrow and operational.

## 11. Strong anti-stereotype page-shape rules

Avoiding one banned page pattern is not enough. A board is still too template-like if most This–Then Pages use the same broad geometry, even when exact box counts differ slightly.

The following are unacceptable in ordinary multi-page boards unless explicitly synthetic or genuinely domain-justified:

- every This–Then Page has four columns;
- almost every This–Then Page has five columns;
- most pages use `4-4-4-4`;
- most pages use `4-4-4-3`;
- most pages use `3-3-3-3-2`;
- the board alternates between near-identical patterns such as `4-4-4-4` and `4-4-4-3`;
- many pages have the same number of columns and only differ by one box in the last column;
- headings change but the underlying causal geometry stays the same;
- every page looks equally balanced, dense, or symmetrical;
- pages look like the same worksheet with different topic words;
- page-shape variation is achieved mainly by loading the final/right-hand column with many terminal outcomes.

Treat near-matches as repeated shapes. Near-matches include pages with:

- the same number of columns;
- nearly the same boxes-per-column pattern;
- the same early-column density;
- the same short final-column pattern;
- the same left-to-right link rhythm;
- the same visual balance, even if one column has one extra or one fewer box.

Examples of near-matches include:

- `4-4-4-4` and `4-4-4-3`;
- `3-3-3-3-2` and `3-3-3-2-2`;
- `3-3-3-2` and `3-3-2-2`;
- `4-3-3-3` and `3-3-3-3`.

If near-matches dominate the board, revise the board before output.

## 12. Required page-shape table

For ordinary multi-page boards with four or more This–Then Pages, create a page-shape table before finalising the config.

For each This–Then Page, record:

1. page name;
2. domain or topic area;
3. number of columns;
4. boxes per column, such as `4-3-2-3`;
5. terminal/end-column box count;
6. whether the terminal count is normal, justified, or unusual;
7. broad shape class;
8. why this shape fits the domain;
9. whether it is an exact or near-match to another page;
10. what was changed if it was too similar to another page.

Do not finalise the board until the table shows that the This–Then Pages are genuinely domain-shaped. Do not use the table as a quota system.

## 13. Strong page-shape rejection rules

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
- pages differ mainly in wording, not causal structure;
- pages look like a generic template applied to several domains;
- final-column load appears to be the main source of page-shape variation.

## 14. Shape-family expectation

For boards with seven or more This–Then Pages, the board should normally include at least three visibly different page-shape families unless the domain genuinely requires fewer and the reason is recorded.

For boards with four to six This–Then Pages, the board should normally include at least two visibly different page-shape families unless the domain genuinely requires fewer and the reason is recorded.

A page-shape family is defined by a combination of:

- number of columns;
- boxes-per-column rhythm;
- where the density sits;
- whether the page is diagnostic-heavy, implementation-heavy, convergent, branching, simple, integrative, or risk/feedback-heavy;
- how links move through the page.

Do not treat `4-4-4-4` and `4-4-4-3` as meaningfully different shape families. Do not revise by randomly adding or removing boxes. Revise by rethinking the causal logic.

## 15. Terminal/end-column outcome rules

A This–Then Page may end with one or more terminal page-level outcomes. These are not the same as board-level Final Outcomes.

For ordinary This–Then Pages:

- 1–3 terminal/end-column boxes is the normal range;
- 4 can be acceptable only where the domain genuinely has several parallel page-level outcomes and the reason is clear;
- 5 or more should be rare;
- 6 or 7 on an ordinary page is usually a warning sign that the page is overloaded, should be split, or has outcomes that belong earlier.

Do not turn every subpage’s final column into a mini Final Outcomes page. Do not create anti-template variation mainly by making final columns contain many parallel outcomes.

Prefer variation through real structure: diagnostic-heavy starts, implementation-heavy middles, bottlenecks, risk/feedback columns, branching or converging logic, different intermediate columns, different early/middle density, or splitting pages appropriately.

Reject or revise an ordinary multi-page board if:

- any ordinary page has 6 or more terminal boxes without a clear domain reason;
- more than one page has 5 or more terminal boxes;
- most pages have 4 or more terminal boxes;
- average terminal count is above 3.5;
- final/right-hand columns are consistently the densest columns.

## 16. Natural complexity rule

Do not force every domain into the same level of complexity.

The number of boxes and columns should be determined by:

- the number of important causal conditions;
- the number of distinct mechanisms;
- the number of meaningful intermediate outcomes;
- the complexity of the domain;
- the level of detail needed for the user’s purpose.

Do not make every page feel equally weighted unless the topic genuinely requires that.

## 17. Causal connectivity and link-density rules

Natural page shape must not come at the expense of causal connectivity.

For substantial boards, review each This–Then Page as a causal network, not a set of separate labelled boxes.

Ask:

- Which boxes are intentionally starting conditions?
- Which boxes are intentionally terminal outcomes?
- Which remaining boxes lack incoming This–Then links?
- Which remaining boxes lack meaningful forward This–Then links?
- Which adjacent or non-adjacent columns have missing causal links?
- Which cross-page causal dependencies should be represented?
- Which important links need `mainText`, `notes1`, `notes2`, or `notes3` to explain the relationship, assumption, evidence, risk, or caveat?

Each non-starting box should normally have at least one plausible incoming causal link unless deliberately presented as an initial condition.

Each non-ending box should normally have at least one meaningful forward link unless deliberately presented as a terminal outcome or side condition.

Isolated boxes should be connected, moved, rewritten, or removed unless there is a clear reason for them.

Links should express real This–Then causality, not decorative density. Do not add links merely to increase counts.

Important, non-obvious, evidence-based, or contested links should have supporting text.

Substantial This–Then Pages should not look like disconnected inventories.

## 18. Many-to-many link rules

Structural links are generally many-to-many unless a specific implementation or board rule deliberately restricts them.

A box may have zero, one, or many incoming links. A box may have zero, one, or many outgoing links. One source box can contribute to multiple target boxes. One target box can depend on multiple source boxes.

This–Then links are distinct from How links. Navigation jumps are distinct from structural links.

## 19. Populated This–Then Page creation rules

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

If the user asks to add a page but does not specify the page type and does not clearly imply a populated This–Then Page, the app or assistant should ask whether the user wants a This–Then Page, How Page, or Documentation Page.

## 20. This–Then Page colour-object rule

Every generated This–Then subpage in the reference-engine config must include a complete `color` object with:

- `bg`;
- `bdr`;
- `tab`.

Each value must be a valid hex color string.

## 21. Simple-board and documented-domain exceptions

A genuinely simple one-page board may remain simple. The rules do not require artificial complexity, unnecessary sources, unnecessary Documentation Pages, unnecessary Measures and Evaluation Questions, or forced page-shape variation where they do not fit the user’s purpose.

A repeated page shape, unusual terminal outcome count, sparse linking pattern, or synthetic structure may be acceptable where the domain genuinely requires it, the user explicitly requests it, or the board is an explicitly synthetic load-test board. The reason should be clear or documented where the board is substantial.
