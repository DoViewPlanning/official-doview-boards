# V1.4.3 build validation

**Package:** DoView Board V1.4.3  
**Saved JSON schema:** V1.3.9  
**Validation date:** 14 August 2026

## Release scope

V1.4.3 retains the two-step workflow: Step 1 builds the reviewed structure and Step 2 preserves that structure while adding restrained How mapping. Strict validation establishes technical consistency, not factual or organisational correctness.

## Final V1.4.3 delivery checks

- Step 1 names use `1-4-3-step-1-base-doview-board`.
- Step 2 names use `1-4-3-step-2-prototype-doview-board-with-how-links`.
- Known model and exposed effort components are accepted; unavailable components are omitted.
- Timezone components, `effort-not-exposed`, rc4/rc3 names and old Step segments are rejected.
- ZIP names use the exact HTML stem plus `-plus-additional-files-ai-readible-json-and-prompt-info.zip`.
- Each Step ZIP contains root-level HTML, canonical JSON, prompt-used record and the correct audit.
- HTML inside the ZIP is byte-identical to the separately delivered HTML.
- Completion responses contain exactly two deliverable links with the exact final labels.
- Separate JSON, audit and prompt-record links are rejected.
- The exact human-review paragraph is required.
- The entire Step completion paragraph must be bold.
- Citation definitions or platform-generated material may follow the bold paragraph.

## Retained technical checks

- The opening menu is reproduced verbatim when the subject is absent; a one-line replacement fails.
- JavaScript syntax is checked for the engine, builder and every tool.
- The obsolete `doviewboardsuse` URL is rejected in input JSON, canonical JSON and generated HTML.
- `evidenceReviewWorkflow` remains exactly `not-part-of-v1.4.3`.
- The saved schema remains V1.3.9.
- Completion counts and deterministic graph metrics are recalculated from the final canonical board.
- Step 2 preserves the accepted Step 1 structure digest.
- Canonical JSON and embedded HTML state must match.
- The compact horizontally scrollable control bar remains present and the removed header site line remains absent.

## Regression fixtures

The accepted RC4 Andy Burnham and New Zealand Commerce Commission Step 1 and Step 2 fixture results are documented in the accepted RC4 test evidence. Expected counts are recorded in the final-release handover and release test report. Rerun status for the final package is recorded in `V1.4.3-RELEASE-TEST-RESULTS.md`.

## Automated commands

From the package root:

```bash
node tools/release-smoke-test.js
sha256sum -c MANIFEST.sha256
```

For a produced Step delivery ZIP:

```bash
node tools/validate-delivery-zip.js --step 1 --html <board.html> --zip <board-plus-additional-files-ai-readible-json-and-prompt-info.zip>
```
