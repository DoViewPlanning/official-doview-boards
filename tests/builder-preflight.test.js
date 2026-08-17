#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const childProcess = require('child_process');
const howMetrics = require('../tools/how-link-metrics.js');

const root = path.resolve(__dirname, '..');
const builder = path.join(root, 'doview-board-builder.js');
const engine = path.join(root, 'doview-board-engine.js');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'doview-v143-preflight-'));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function example(name) {
  return JSON.parse(fs.readFileSync(path.join(root, 'examples', name + '.json'), 'utf8'));
}

function runCase(name, config, shouldPass, options) {
  const opts = options || {};
  const configPath = path.join(tempDir, name + '.json');
  const outPath = path.join(tempDir, name + '-1-4-3-step-1-base-doview-board-2026-08-14-1210.html');
  const jsonPath = path.join(tempDir, name + '.canonical.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  const args = [
    builder,
    '--engine', engine,
    '--config', configPath,
    '--out', outPath,
    '--json-out', jsonPath
  ];
  if (opts.compatibility !== false) args.push('--compatibility');
  const result = childProcess.spawnSync(process.execPath, args, { encoding: 'utf8' });
  if (shouldPass) {
    assert.strictEqual(result.status, 0, name + ' should pass:\n' + result.stdout + '\n' + result.stderr);
    assert.ok(fs.existsSync(outPath), name + ' should produce HTML');
    assert.ok(fs.existsSync(jsonPath), name + ' should produce canonical JSON');
  } else {
    assert.notStrictEqual(result.status, 0, name + ' should fail');
    assert.ok(!fs.existsSync(outPath), name + ' must not produce HTML after validation failure');
  }
  return { result: result, outPath: outPath, jsonPath: jsonPath };
}

function addHowPage(config, id, label, howLevel) {
  const page = {
    id: id,
    label: label,
    pageType: 'how',
    howLevel: howLevel,
    howBoxes: [{ id: 'H001', label: label + ' item' }],
    nextHowNum: 2,
    cols: []
  };
  config.subpages.push(clone(page));
  config.savedState = config.savedState || {};
  if (!Array.isArray(config.savedState.SP)) config.savedState.SP = clone(config.subpages.slice(0, -1));
  config.savedState.SP.push(clone(page));
  config.savedState.B = config.savedState.B || {};
  config.savedState.B[id + '-H001'] = {
    label: label + ' item', light: '', entries: [], priority: '', hasSubpage: false,
    detailText: '', borderColor: '', boxColor: '', measures: [], evalQuestions: [], tagIds: []
  };
}

try {
  const passing = runCase('compatibility-example', example('complex-example'), true);
  const canonical = JSON.parse(fs.readFileSync(passing.jsonPath, 'utf8'));
  const embedded = howMetrics.extractEmbeddedConfig(fs.readFileSync(passing.outPath, 'utf8'));
  assert.deepStrictEqual(embedded, canonical, 'canonical JSON and HTML embedded state must be equal');
  assert.strictEqual(canonical.schemaVersion, 'V1.3.9');
  assert.strictEqual(canonical.engineVersion, 'V1.4.3');
  assert.strictEqual(canonical.builderValidation.builderVersion, 'V1.4.3');
  assert.strictEqual(canonical.builderValidation.validationVersion, 'V1.4.3');
  assert.strictEqual(canonical.builderValidation.mode, 'compatibility');
  assert.strictEqual(canonical.generationChecks, undefined, 'builder-only generationChecks must not be embedded');
  assert.ok(!Number.isNaN(Date.parse(canonical.builderValidation.validatedAt)));

  const noCompatibility = example('simple-example');
  delete noCompatibility.builderValidation;
  const noCompatibilityResult = runCase('missing-generation-checks-without-flag', noCompatibility, false, { compatibility: false });
  assert.match(noCompatibilityResult.result.stderr + noCompatibilityResult.result.stdout, /generationChecks/);

  const incompleteStrict = example('simple-example');
  incompleteStrict.generationChecks = { workflowStep: 'step-1-structure' };
  const incompleteStrictResult = runCase('incomplete-strict-metadata', incompleteStrict, false, { compatibility: false });
  assert.match(incompleteStrictResult.result.stderr + incompleteStrictResult.result.stdout, /generatorSelfReview|howLinkAudit/);

  const duplicateLevel = example('complex-example');
  addHowPage(duplicateLevel, 'p10', 'Duplicate Level 1 work', 1);
  const duplicateResult = runCase('duplicate-how-level-fails', duplicateLevel, false);
  assert.match(duplicateResult.result.stderr + duplicateResult.result.stdout, /Duplicate numbered How Page level[\s\S]*howLevel 1/);

  const multipleNull = example('complex-example');
  addHowPage(multipleNull, 'p10', 'Competencies Cross-Link', null);
  addHowPage(multipleNull, 'p11', 'Partners Cross-Link', null);
  runCase('multiple-null-how-levels-pass', multipleNull, true);

  const inconsistentSavedSP = example('simple-example');
  inconsistentSavedSP.savedState.SP[0].cols[0].boxes[0] = 'Different saved-state label';
  const savedSPBuilt = runCase('savedstate-sp-compatibility-source', inconsistentSavedSP, true);
  const savedSPCanonical = JSON.parse(fs.readFileSync(savedSPBuilt.jsonPath, 'utf8'));
  assert.strictEqual(savedSPCanonical.savedState.SP[0].cols[0].boxes[0], 'Different saved-state label');

  const unresolved = example('simple-example');
  unresolved.savedState.ttLinks[0].to = 'p1-c99-b99';
  const unresolvedBuilt = runCase('unresolved-link-endpoint-cleaned-in-compatibility', unresolved, true);
  const unresolvedCanonical = JSON.parse(fs.readFileSync(unresolvedBuilt.jsonPath, 'utf8'));
  assert.ok(!unresolvedCanonical.savedState.ttLinks.some(function (link) { return link.to === 'p1-c99-b99'; }));

  const obsoleteUrl = example('simple-example');
  obsoleteUrl.savedState.boardInfo = ['https://doviewplanning.org/doviewboards', 'use'].join('');
  const obsoleteResult = runCase('obsolete-url-fails', obsoleteUrl, false);
  assert.match(obsoleteResult.result.stderr + obsoleteResult.result.stdout, /obsolete DoView Boards URL/);

  const sourcesRegistry = example('simple-example');
  sourcesRegistry.savedState.boardInfo = 'Evidence: https://example.org/v143-builder-test';
  const sourcesBuilt = runCase('sources-registry-autofix', sourcesRegistry, true);
  const sourcesCanonical = JSON.parse(fs.readFileSync(sourcesBuilt.jsonPath, 'utf8'));
  const sourceUrls = sourcesCanonical.sources.map(function (source) {
    return typeof source === 'string' ? source : source.url;
  });
  assert.ok(sourceUrls.includes('https://example.org/v143-builder-test'));
  assert.ok(sourcesCanonical.builderValidation.autoFixes.some(function (fix) {
    return /Added missing visible-content URL to sources registry/.test(fix);
  }));

  const engineText = fs.readFileSync(engine, 'utf8');
  assert.match(engineText, /Builder validation: not confirmed/);
  assert.match(engineText, /Builder validation: confirmed/);

  console.log('Builder V1.4.3 preflight and compatibility fixtures passed.');
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
