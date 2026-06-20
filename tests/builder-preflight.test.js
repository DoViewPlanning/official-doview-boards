#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const builder = path.join(root, 'doview-board-builder.js');
const engine = path.join(root, 'doview-board-engine.js');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'doview-v132-preflight-'));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function viewSettings() {
  return {
    thisThen: {
      showCounts: false,
      showTrafficLights: false,
      showPriorities: false,
      showHowCounts: false,
      showMeasures: false,
      showEvalQuestions: false,
      showMainText: false,
      showMainTextCodeStyle: false,
      showLinkInfoOnHover: false,
      showLinkInfoCodeStyle: false,
      showLateralHow: false,
      showTags: false
    },
    how: {
      showNumbering: false,
      showTrafficLights: false,
      showPriorities: false,
      showWhyCounts: false,
      showLateralHow: false,
      showMeasures: false,
      showEvalQuestions: false,
      showMainText: false,
      showMainTextCodeStyle: false,
      showTags: false
    },
    finalOutcomes: {
      showTrafficLights: false,
      showPriorities: false,
      showMeasures: false,
      showEvalQuestions: false,
      showMainText: false,
      showMainTextCodeStyle: false,
      showTags: false
    }
  };
}

function boxState(label, measures, evalQuestions) {
  return {
    label: label,
    light: '',
    entries: [],
    priority: '',
    hasSubpage: false,
    detailText: '',
    borderColor: '',
    boxColor: '',
    measures: measures || [],
    evalQuestions: evalQuestions || [],
    tagIds: []
  };
}

function passingConfig() {
  const config = {
    title: 'Builder strict preflight fixture',
    slug: 'builder-strict-preflight-fixture',
    generationChecks: {
      expectedNoLevelHowPages: ['Competencies Cross-Link'],
      linkDisplayTextRequested: true,
      howLinkDisplayTextRequested: true,
      documentationClonesRequested: true,
      measuresMustAttachToBoxes: true,
      evalQuestionsMustAttachToBoxes: true,
      allPageViewOptionsOffUnlessRequested: true,
      requestedPageViewOptions: {
        thisThen: ['showLinkInfoOnHover']
      },
      boxDisplayTextRequested: false,
      trafficLightsRequested: false,
      prioritiesRequested: false
    },
    subpages: [
      {
        id: 'p1',
        label: 'Delivery logic',
        pageType: 'this_then',
        color: { bg: '#eff6ff', bdr: '#bfdbfe', tab: '#2563eb' },
        cols: [
          { h: 'Foundations', boxes: ['Foundation brief agreed', 'Stakeholder access arranged'] },
          { h: 'Delivery evidence', boxes: ['Delivery sequence confirmed', 'Participant feedback gathered'] }
        ]
      },
      {
        id: 'p2',
        label: 'Level 1 workstreams',
        pageType: 'how',
        howLevel: 1,
        howBoxes: [{ id: 'H001', label: 'Programme coordination' }],
        nextHowNum: 2,
        cols: []
      },
      {
        id: 'p3',
        label: 'Level 2 delivery teams',
        pageType: 'how',
        howLevel: 2,
        howBoxes: [{ id: 'H001', label: 'Delivery team' }],
        nextHowNum: 2,
        cols: []
      },
      {
        id: 'p4',
        label: 'Competencies Cross-Link',
        pageType: 'how',
        howLevel: null,
        howBoxes: [
          { id: 'H001', label: 'Facilitation capability' },
          { id: 'H002', label: 'Competency coaching' }
        ],
        nextHowNum: 3,
        cols: []
      },
      {
        id: 'p5',
        label: 'Documentation clones',
        pageType: 'documentation',
        cols: []
      }
    ],
    finalOutcomes: ['Delivery decisions improve'],
    sources: [],
    savedState: {
      B: {
        'p1-c1-b0': boxState('Delivery sequence confirmed', ['M001'], ['EQ001'])
      },
      docContent: {
        p5: '<h2>Live references</h2><div class="doc-clone" data-clone-type="page_title" data-clone-key="p1"></div><div class="doc-clone" data-clone-type="box_title" data-clone-key="p1-c0-b0"></div><div class="doc-clone" data-clone-type="box_main_text" data-clone-key="p1-c1-b0"></div><div class="doc-clone" data-clone-type="measure" data-clone-key="M001"></div><div class="doc-clone" data-clone-type="eval_question" data-clone-key="EQ001"></div><div class="doc-clone" data-clone-type="link" data-clone-key="ttl_1"></div>'
      },
      ttLinks: [
        {
          id: 'ttl_1',
          from: 'p1-c0-b0',
          to: 'p1-c1-b0',
          mainText: 'An agreed foundation brief gives delivery owners enough detail to confirm the delivery sequence.'
        },
        {
          id: 'ttl_2',
          from: 'p1-c0-b1',
          to: 'p1-c1-b1',
          mainText: 'Arranged stakeholder access allows facilitators to gather participant feedback.'
        }
      ],
      howLinks: [
        {
          id: 'hwl_1',
          from: 'p2-H001',
          to: 'p1-c0-b0',
          mainText: 'Programme coordination keeps the foundation brief agreed with delivery owners.'
        },
        {
          id: 'hwl_2',
          from: 'p3-H001',
          to: 'p2-H001',
          mainText: 'Delivery team reporting gives programme coordination current implementation constraints.'
        },
        {
          id: 'hwl_3',
          from: 'p4-H001',
          to: 'p1-c1-b1',
          mainText: 'Facilitation capability helps gather participant feedback from stakeholders.'
        },
        {
          id: 'hwl_4',
          from: 'p4-H002',
          to: 'p2-H001',
          mainText: 'Competency coaching strengthens programme coordination before delivery begins.'
        }
      ],
      measures: [{ id: 'M001', title: 'Confirmed delivery sequence count' }],
      evalQuestions: [{ id: 'EQ001', questionText: 'What keeps delivery sequencing practical?' }],
      viewSettings: viewSettings()
    }
  };
  config.savedState.SP = clone(config.subpages);
  config.savedState.FO = clone(config.finalOutcomes);
  config.savedState.viewSettings.thisThen.showLinkInfoOnHover = true;
  return config;
}

function extraHowPage(id, label, howLevel) {
  return {
    id: id,
    label: label,
    pageType: 'how',
    howLevel: howLevel,
    howBoxes: [{ id: 'H001', label: label + ' action' }],
    nextHowNum: 2,
    cols: []
  };
}

function runCase(name, config, shouldPass) {
  const configPath = path.join(tempDir, name + '.json');
  const outPath = path.join(tempDir, name + '_doview-board_v1.3.6_2026-06-19.html');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  const result = childProcess.spawnSync(process.execPath, [
    builder,
    '--engine', engine,
    '--config', configPath,
    '--out', outPath
  ], { encoding: 'utf8' });
  if (shouldPass) {
    assert.strictEqual(result.status, 0, name + ' should pass:\n' + result.stderr);
    assert.ok(fs.existsSync(outPath), name + ' should produce HTML');
  } else {
    assert.notStrictEqual(result.status, 0, name + ' should fail');
    assert.ok(!fs.existsSync(outPath), name + ' must not produce HTML after strict validation failure');
  }
  return { result: result, outPath: outPath };
}

function embeddedConfig(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const marker = 'DoView.init(';
  const start = html.lastIndexOf(marker);
  assert.ok(start >= 0, 'Expected embedded DoView.init config');
  const from = start + marker.length;
  const end = html.indexOf(');', from);
  assert.ok(end > from, 'Expected end of embedded DoView.init config');
  return JSON.parse(html.slice(from, end));
}

try {
  const passing = runCase('passing-fixture', passingConfig(), true);
  const passingEmbedded = embeddedConfig(passing.outPath);
  assert.strictEqual(passingEmbedded.generationChecks, undefined, 'builder-only generationChecks must not be embedded');
  assert.strictEqual(passingEmbedded.builderValidation.passed, true, 'builderValidation stamp must record a passing build');
  assert.strictEqual(passingEmbedded.builderValidation.builderVersion, 'V1.3.6');
  assert.strictEqual(passingEmbedded.builderValidation.validationVersion, 'V1.3.6');
  assert.strictEqual(passingEmbedded.builderValidation.mode, 'strict-generated');
  assert.strictEqual(passingEmbedded.builderValidation.checks.measureEqAttachment, 'passed');
  assert.strictEqual(passingEmbedded.builderValidation.checks.sourcesRegistry, 'passed');
  assert.ok(!Number.isNaN(Date.parse(passingEmbedded.builderValidation.validatedAt)), 'validatedAt must be an ISO timestamp');

  const engineText = fs.readFileSync(engine, 'utf8');
  assert.match(engineText, /Builder validation: not confirmed/, 'old boards without a stamp must have a detectable not-confirmed status');
  assert.match(engineText, /Builder validation: confirmed/, 'stamped boards must have a detectable confirmed status');

  const numbered = passingConfig();
  numbered.subpages[3].howLevel = 3;
  const corrected = runCase('numbered-cross-link-autofix', numbered, true);
  assert.match(corrected.result.stdout, /Normalized Cross-Link\/no-level How Page/);
  const correctedConfig = embeddedConfig(corrected.outPath);
  assert.strictEqual(correctedConfig.subpages.find(function (p) { return p.id === 'p4'; }).howLevel, null);

  const duplicateLevelOne = passingConfig();
  duplicateLevelOne.subpages.push(extraHowPage('p6', 'Duplicate Level 1 delivery', 1));
  const duplicateLevelOneResult = runCase('duplicate-how-level-1-fails', duplicateLevelOne, false);
  assert.match(duplicateLevelOneResult.result.stderr + duplicateLevelOneResult.result.stdout, /Duplicate numbered How Page level[\s\S]*howLevel 1/);

  const duplicateLevelTwo = passingConfig();
  duplicateLevelTwo.subpages.push(extraHowPage('p6', 'Duplicate Level 2 delivery', 2));
  const duplicateLevelTwoResult = runCase('duplicate-how-level-2-fails', duplicateLevelTwo, false);
  assert.match(duplicateLevelTwoResult.result.stderr + duplicateLevelTwoResult.result.stdout, /Duplicate numbered How Page level[\s\S]*howLevel 2/);

  const multipleNull = passingConfig();
  multipleNull.subpages.push(extraHowPage('p6', 'Stakeholder Cross-Link', null));
  multipleNull.savedState.SP.push(extraHowPage('p6', 'Stakeholder Cross-Link', null));
  runCase('multiple-null-how-levels-pass', multipleNull, true);

  const completeHierarchyWithNulls = passingConfig();
  completeHierarchyWithNulls.subpages.push(extraHowPage('p6', 'Level 3 quality assurance', 3));
  completeHierarchyWithNulls.subpages.push(extraHowPage('p7', 'Stakeholder Cross-Link', null));
  completeHierarchyWithNulls.savedState.SP.push(extraHowPage('p6', 'Level 3 quality assurance', 3));
  completeHierarchyWithNulls.savedState.SP.push(extraHowPage('p7', 'Stakeholder Cross-Link', null));
  runCase('level-1-2-3-plus-null-how-levels-pass', completeHierarchyWithNulls, true);

  const repeatedTt = passingConfig();
  repeatedTt.savedState.ttLinks.forEach(function (link) {
    link.mainText = 'Rationale: upstream work enables or constrains the next implementation condition in this pathway.';
  });
  runCase('repeated-this-then-text-fails', repeatedTt, false);

  const repeatedHow = passingConfig();
  repeatedHow.savedState.howLinks.forEach(function (link) {
    link.mainText = 'Capability enables activity and supports implementation.';
  });
  runCase('repeated-how-text-fails', repeatedHow, false);

  const fakeClones = passingConfig();
  fakeClones.savedState.docContent.p5 = '<h2>Copied references</h2><span data-clone-id="p1-c0-b0">Foundation brief agreed</span>';
  runCase('fake-documentation-clones-fail', fakeClones, false);

  const lowercaseMeasureClone = passingConfig();
  lowercaseMeasureClone.savedState.docContent.p5 = '<h2>Live references</h2><div class="doc-clone" data-clone-type="measure" data-clone-key="m001"></div>';
  runCase('lowercase-measure-clone-key-fails', lowercaseMeasureClone, false);

  const shortEvalClone = passingConfig();
  shortEvalClone.savedState.docContent.p5 = '<h2>Live references</h2><div class="doc-clone" data-clone-type="eval_question" data-clone-key="q001"></div>';
  runCase('short-eq-clone-key-fails', shortEvalClone, false);

  const missingCloneSource = passingConfig();
  missingCloneSource.savedState.docContent.p5 = '<h2>Live references</h2><div class="doc-clone" data-clone-type="measure" data-clone-key="M999"></div>';
  runCase('missing-documentation-clone-source-fails', missingCloneSource, false);

  const missingLinkCloneSource = passingConfig();
  missingLinkCloneSource.savedState.docContent.p5 = '<h2>Live references</h2><div class="doc-clone" data-clone-type="link" data-clone-key="ttl_999"></div>';
  const missingLinkCloneResult = runCase('missing-link-clone-source-fails', missingLinkCloneSource, false);
  assert.match(missingLinkCloneResult.result.stderr + missingLinkCloneResult.result.stdout, /ttl_999[\s\S]*runtime-surviving link object/);

  const finalToLinkClone = passingConfig();
  finalToLinkClone.savedState.B['final-b0'] = boxState('Delivery decisions improve');
  finalToLinkClone.savedState.ttLinks.push({
    id: 'ttl_final_to',
    from: 'p1-c0-b0',
    to: 'final-b0',
    mainText: 'Foundation brief agreed is assumed to support Delivery decisions improve.'
  });
  finalToLinkClone.savedState.docContent.p5 = '<h2>Live references</h2><div class="doc-clone" data-clone-type="link" data-clone-key="ttl_final_to"></div>';
  const finalToLinkCloneResult = runCase('final-outcome-to-link-clone-fails', finalToLinkClone, false);
  assert.match(finalToLinkCloneResult.result.stderr + finalToLinkCloneResult.result.stdout, /ttl_final_to[\s\S]*Final Outcome box/);

  const finalFromLinkClone = passingConfig();
  finalFromLinkClone.savedState.B['final-b0'] = boxState('Delivery decisions improve');
  finalFromLinkClone.savedState.ttLinks.push({
    id: 'ttl_final_from',
    from: 'final-b0',
    to: 'p1-c1-b0',
    mainText: 'Delivery decisions improve is not a valid source for Delivery sequence confirmed.'
  });
  finalFromLinkClone.savedState.docContent.p5 = '<h2>Live references</h2><div class="doc-clone" data-clone-type="link" data-clone-key="ttl_final_from"></div>';
  const finalFromLinkCloneResult = runCase('final-outcome-from-link-clone-fails', finalFromLinkClone, false);
  assert.match(finalFromLinkCloneResult.result.stderr + finalFromLinkCloneResult.result.stdout, /ttl_final_from[\s\S]*Final Outcome box/);

  const missingEndpointLinkClone = passingConfig();
  missingEndpointLinkClone.savedState.ttLinks.push({
    id: 'ttl_missing_endpoint',
    from: 'p1-c0-b0',
    to: 'p1-c9-b9',
    mainText: 'Foundation brief agreed is linked to a missing endpoint in this invalid fixture.'
  });
  missingEndpointLinkClone.savedState.docContent.p5 = '<h2>Live references</h2><div class="doc-clone" data-clone-type="link" data-clone-key="ttl_missing_endpoint"></div>';
  const missingEndpointLinkCloneResult = runCase('missing-endpoint-link-clone-fails', missingEndpointLinkClone, false);
  assert.match(missingEndpointLinkCloneResult.result.stderr + missingEndpointLinkCloneResult.result.stdout, /ttl_missing_endpoint[\s\S]*does not exist in effective runtime B/);

  const nonTTEndpointLinkClone = passingConfig();
  nonTTEndpointLinkClone.savedState.ttLinks.push({
    id: 'ttl_how_endpoint',
    from: 'p1-c0-b0',
    to: 'p2-H001',
    mainText: 'Foundation brief agreed is incorrectly linked to Programme coordination as a This-Then link.'
  });
  nonTTEndpointLinkClone.savedState.docContent.p5 = '<h2>Live references</h2><div class="doc-clone" data-clone-type="link" data-clone-key="ttl_how_endpoint"></div>';
  const nonTTEndpointLinkCloneResult = runCase('non-this-then-endpoint-link-clone-fails', nonTTEndpointLinkClone, false);
  assert.match(nonTTEndpointLinkCloneResult.result.stderr + nonTTEndpointLinkCloneResult.result.stdout, /ttl_how_endpoint[\s\S]*How box/);

  const inconsistentSavedSP = passingConfig();
  inconsistentSavedSP.savedState.SP[0].cols[1].boxes = ['Different saved-state box only'];
  const inconsistentSavedSPResult = runCase('savedstate-sp-inconsistency-fails', inconsistentSavedSP, false);
  assert.match(inconsistentSavedSPResult.result.stderr + inconsistentSavedSPResult.result.stdout, /savedState\.SP/);

  const missingNoLevel = passingConfig();
  missingNoLevel.generationChecks.expectedNoLevelHowPages = ['Missing competencies page'];
  runCase('missing-no-level-page-fails', missingNoLevel, false);

  const unattached = passingConfig();
  unattached.savedState.B['p1-c1-b0'].measures = [];
  unattached.savedState.B['p1-c1-b0'].evalQuestions = [];
  runCase('unattached-measures-eqs-fail', unattached, false);

  const viewFix = passingConfig();
  viewFix.savedState.viewSettings.thisThen.showCounts = true;
  viewFix.savedState.viewSettings.how.showNumbering = true;
  const viewCorrected = runCase('unrequested-page-view-autofix', viewFix, true);
  const viewCorrectedConfig = embeddedConfig(viewCorrected.outPath);
  assert.strictEqual(viewCorrectedConfig.savedState.viewSettings.thisThen.showCounts, false);
  assert.strictEqual(viewCorrectedConfig.savedState.viewSettings.how.showNumbering, false);

  const allowedView = passingConfig();
  allowedView.generationChecks.requestedPageViewOptions = { thisThen: ['showMeasures', 'showLinkInfoOnHover'] };
  allowedView.savedState.viewSettings.thisThen.showMeasures = true;
  const allowedViewBuilt = runCase('requested-page-view-remains-on', allowedView, true);
  assert.strictEqual(embeddedConfig(allowedViewBuilt.outPath).savedState.viewSettings.thisThen.showMeasures, true);
  assert.strictEqual(embeddedConfig(allowedViewBuilt.outPath).savedState.viewSettings.thisThen.showLinkInfoOnHover, true);

  const missingEvidenceUrls = passingConfig();
  missingEvidenceUrls.generationChecks.linkEvidenceUrlsRequested = true;
  runCase('requested-link-evidence-urls-fail-when-missing', missingEvidenceUrls, false);

  const trafficPriority = passingConfig();
  trafficPriority.savedState.B['p1-c1-b0'].light = 'green';
  trafficPriority.savedState.B['p1-c1-b0'].priority = 'A';
  trafficPriority.savedState.viewSettings.thisThen.showTrafficLights = true;
  trafficPriority.savedState.viewSettings.thisThen.showPriorities = true;
  runCase('unrequested-traffic-priority-values-fail', trafficPriority, false);

  const boxDisplay = passingConfig();
  boxDisplay.savedState.B['p1-c1-b0'].detailText = 'Unrequested box-level description.';
  runCase('unrequested-box-display-text-fails', boxDisplay, false);

  const compatibility = passingConfig();
  delete compatibility.generationChecks;
  compatibility.subpages[3].howLevel = 3;
  const compatibilityBuilt = runCase('compatibility-baseline-cross-link-autofix', compatibility, true);
  const compatibilityEmbedded = embeddedConfig(compatibilityBuilt.outPath);
  assert.strictEqual(compatibilityEmbedded.builderValidation.mode, 'compatibility');
  assert.strictEqual(compatibilityEmbedded.subpages.find(function (p) { return p.id === 'p4'; }).howLevel, null);
  assert.ok(compatibilityEmbedded.builderValidation.warnings.some(function (warning) {
    return /compatibility mode ran high-confidence baseline checks/.test(warning);
  }));

  const compatibilityRepeated = passingConfig();
  delete compatibilityRepeated.generationChecks;
  compatibilityRepeated.savedState.ttLinks.forEach(function (link) {
    link.mainText = 'This link shows a relationship between board items.';
  });
  const compatibilityRepeatedBuilt = runCase('compatibility-repeated-link-warns', compatibilityRepeated, true);
  assert.ok(embeddedConfig(compatibilityRepeatedBuilt.outPath).builderValidation.warnings.some(function (warning) {
    return /generic boilerplate|repeats identical/.test(warning);
  }));

  const inputStamp = passingConfig();
  inputStamp.builderValidation = { passed: true, builderVersion: 'invented' };
  const inputStampBuilt = runCase('input-stamp-overwritten', inputStamp, true);
  const replacedStamp = embeddedConfig(inputStampBuilt.outPath).builderValidation;
  assert.strictEqual(replacedStamp.builderVersion, 'V1.3.6');
  assert.ok(replacedStamp.autoFixes.some(function (fix) { return /Removed input builderValidation metadata/.test(fix); }));

  const sourcesRegistry = passingConfig();
  sourcesRegistry.sources = [
    { title: 'Evidence source', url: 'https://example.org/evidence' },
    { title: 'Duplicate evidence source', url: 'https://example.org/evidence/' },
    { title: 'https://doviewplanning.org/walkthrough', url: 'https://doviewplanning.org/walkthrough' },
    { title: 'Authored methodology source', url: 'https://doviewplanning.org/theory' }
  ];
  sourcesRegistry.savedState.docContent.p5 += '<p>Supporting material: https://example.org/documentation-source</p><p>Package walk-through link: https://doviewplanning.org/walkthrough</p><p>Package training link: https://doviewplanning.org/offerings</p><p>Package repository link: https://github.com/doviewplanning/official-doview-boards</p>';
  sourcesRegistry.savedState.ttLinks[0].notes1 = 'Relationship evidence: https://example.org/link-source';
  const sourcesBuilt = runCase('sources-registry-autofix', sourcesRegistry, true);
  const sourcesEmbedded = embeddedConfig(sourcesBuilt.outPath);
  const sourceUrls = sourcesEmbedded.sources.map(function (source) { return typeof source === 'string' ? source : source.url; });
  assert.ok(sourceUrls.includes('https://example.org/documentation-source'));
  assert.ok(sourceUrls.includes('https://example.org/link-source'));
  assert.ok(sourceUrls.includes('https://doviewplanning.org/theory'));
  assert.ok(!sourceUrls.includes('https://doviewplanning.org/walkthrough'));
  assert.ok(!sourceUrls.includes('https://doviewplanning.org/offerings'));
  assert.ok(!sourceUrls.includes('https://github.com/doviewplanning/official-doview-boards'));
  assert.strictEqual(sourceUrls.filter(function (url) { return url === 'https://example.org/evidence' || url === 'https://example.org/evidence/'; }).length, 1);
  assert.ok(sourcesEmbedded.builderValidation.autoFixes.some(function (fix) { return /Added missing visible-content URL to sources registry/.test(fix); }));
  assert.ok(sourcesEmbedded.builderValidation.autoFixes.some(function (fix) { return /Removed duplicate source registry entry/.test(fix); }));
  assert.ok(sourcesEmbedded.builderValidation.autoFixes.some(function (fix) { return /Removed standard non-content package URL from sources registry/.test(fix); }));

  console.log('Builder strict preflight fixtures passed.');
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
