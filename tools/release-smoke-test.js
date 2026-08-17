#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');
const deliveryNames = require('./delivery-filenames.js');
const howMetrics = require('./how-link-metrics.js');

const root = path.resolve(__dirname, '..');
const node = process.execPath;
const obsoleteUrl = ['https://doviewplanning.org/doviewboards', 'use'].join('');
const expectedVersion = 'V1.4.3';
const staleVersions = ['V1.4.3-rc4', 'V1.4.3-rc3'];
const staleFilenameVersions = ['1-4-3-rc4', '1-4-3-rc3'];
const stalePromptPhrases = [
  ['Evidence assessment is not part of this release ', 'candidate'].join(''),
  ['Rc4 does not require the ', 'paragraph'].join('')
];
const notice = 'The draft was reviewed and revised before these files were produced. This was a self-review, not an independent audit. Before putting the board into operational use for an organisation or initiative, it needs to be carefully checked by humans to make sure that it truly reflects the organisation, policy or other type of initiative being modelled.';
const completion = {
  '1': "**Step 1 is complete. Type 'Do step 2' to add links between the How Boxes, This–Then Boxes and other How Boxes.**",
  '2': '**Step 2 is complete. Download the finished proof-of-concept board using the links above.**'
};
const htmlLabel = 'Download the DoView Board HTML file';
const zipLabel = 'Download the DoView Board HTML file plus additional files';

function run(args, options) {
  return cp.spawnSync(args[0], args.slice(1), Object.assign({ cwd: root, encoding: 'utf8' }, options || {}));
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function textFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...textFiles(p));
    else out.push(p);
  }
  return out;
}
function validateResponse(step, text, tmp, name) {
  const p = path.join(tmp, name + '.md');
  fs.writeFileSync(p, text);
  return run([node, path.join(root, 'tools', 'validate-completion-response.js'), '--step', step, '--response', p]);
}
function validResponse(step, htmlName, zipName, trailing) {
  return 'Delivery files are ready.\n\n' +
    '[' + htmlLabel + '](sandbox:/mnt/data/' + htmlName + ')\n\n' +
    '[' + zipLabel + '](sandbox:/mnt/data/' + zipName + ')\n\n' +
    notice + '\n\n' + completion[step] + '\n' + (trailing || '');
}

// Opening menu: package rule, exact positive response and shortened negative response.
let result = run([node, path.join(root, 'tools', 'validate-opening-menu.js')]);
assert(result.status === 0, result.stderr || result.stdout);
const openingTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'doview-opening-'));
try {
  const menu = fs.readFileSync(path.join(root, 'OPENING-MENU.md'), 'utf8');
  const good = path.join(openingTmp, 'good.md');
  const bad = path.join(openingTmp, 'bad.md');
  fs.writeFileSync(good, menu);
  fs.writeFileSync(bad, 'What subject and title should the board cover?\n');
  assert(run([node, path.join(root, 'tools', 'validate-opening-menu.js'), '--response', good]).status === 0, 'verbatim opening menu was rejected.');
  assert(run([node, path.join(root, 'tools', 'validate-opening-menu.js'), '--response', bad]).status !== 0, 'shortened opening response was not rejected.');
} finally {
  fs.rmSync(openingTmp, { recursive: true, force: true });
}

// JavaScript syntax for builder, engine and all tools.
const jsFiles = [path.join(root, 'doview-board-builder.js'), path.join(root, 'doview-board-engine.js')]
  .concat(fs.readdirSync(path.join(root, 'tools')).filter(x => x.endsWith('.js')).map(x => path.join(root, 'tools', x)));
for (const file of jsFiles) {
  result = run([node, '--check', file]);
  assert(result.status === 0, path.relative(root, file) + ' failed JavaScript syntax validation: ' + result.stderr);
}

// Current operational files must not retain release-candidate versions or the obsolete URL.
for (const file of textFiles(root)) {
  const rel = path.relative(root, file);
  if (rel === 'MANIFEST.sha256' || rel === 'CHANGELOG.md' || rel === 'tools/release-smoke-test.js') continue;
  let data;
  try { data = fs.readFileSync(file, 'utf8'); } catch (_e) { continue; }
  for (const version of staleVersions) assert(!data.includes(version), rel + ' still contains stale release-candidate version ' + version + '.');
  for (const version of staleFilenameVersions) assert(!data.includes(version), rel + ' still contains stale filename version ' + version + '.');
  assert(!data.includes(obsoleteUrl), rel + ' contains the obsolete DoView Boards URL.');
  assert(!data.includes('not-in-v1.4.3-rc1'), rel + ' contains stale evidence-workflow metadata.');
}

// Final operational prompt prose must not regress to release-candidate wording.
const operationalPrompt = fs.readFileSync(path.join(root, 'doview-board-building-prompt.md'), 'utf8');
for (const phrase of stalePromptPhrases) {
  assert(!operationalPrompt.includes(phrase), 'doview-board-building-prompt.md contains stale release-candidate wording: ' + phrase);
}

// Accepted interface controls remain present.
const engine = fs.readFileSync(path.join(root, 'doview-board-engine.js'), 'utf8');
assert(!engine.includes('class="hdr-site"'), 'the removed DoViewPlanning.Org header link is present.');
assert(!engine.includes('.hdr-site'), 'the removed header-site CSS is present.');
assert(!/\.ctrl-bar\{[^}]*zoom\s*:\s*1\.35/.test(engine), 'bottom control bar still uses zoom: 1.35.');
assert(/\.ctrl-bar\{[^}]*flex-wrap:nowrap;[^}]*overflow-x:auto/.test(engine), 'compact horizontally scrollable bottom control bar rule is missing.');
assert(/\.ctrl-bar \.cbtn\{[^}]*font-size:14px/.test(engine), '14px bottom-menu button text rule is missing.');

// Filename positives.
const pairs = [
  ['andy-burnham-administration-1-4-3-step-1-base-doview-board-gpt-5-6-thinking-high-effort-2026-08-05-1144.html', '1'],
  ['andy-burnham-administration-1-4-3-step-1-base-doview-board-gpt-5-6-thinking-2026-08-05-1144.html', '1'],
  ['andy-burnham-administration-1-4-3-step-1-base-doview-board-2026-08-05-1144.html', '1'],
  ['andy-burnham-administration-1-4-3-step-2-prototype-doview-board-with-how-links-gpt-5-6-thinking-2026-08-06-2051.html', '2']
].map(([html, step]) => [html, deliveryNames.expectedZipForHtml(html), step]);
for (const [html, zip, step] of pairs) {
  assert(deliveryNames.validatePair(html, zip, step), 'valid delivery filename pair was rejected: ' + html);
}

// Filename negatives.
const invalidPairs = [
  ['andy-1-4-3-rc4-step-1-base-doview-board-2026-08-14-1144.html', '1'],
  ['andy-1-4-3-rc3-step-1-base-doview-board-2026-08-05-1144.html', '1'],
  ['andy-1-4-3-step-1-base-model-2026-08-05-1144.html', '1'],
  ['andy-1-4-3-step-2-mapping-how-links-2026-08-05-1144.html', '2'],
  ['andy-1-4-3-step-1-base-doview-board-gpt-5-6-thinking-effort-not-exposed-2026-08-05-1144.html', '1'],
  ['andy-1-4-3-step-1-base-doview-board-gpt-5-6-thinking-nzst-2026-08-05-1144.html', '1'],
  ['andy-1-4-3-step-1-base-doview-board-gpt-5-6-thinking-pacific-auckland-2026-08-05-1144.html', '1'],
  ['andy-1-4-3-step-1-base-doview-board-gpt-5-6-thinking-utc-2026-08-05-1144.html', '1'],
  ['andy-1-4-3-step-1-base-doview-board-2026-13-05-1144.html', '1'],
  ['andy-1-4-3-step-1-base-doview-board-2026-08-05-2460.html', '1']
];
for (const [html, step] of invalidPairs) {
  assert(!deliveryNames.validatePair(html, deliveryNames.expectedZipForHtml(html), step), 'invalid filename was accepted: ' + html);
}
const oldSuffixHtml = pairs[0][0];
assert(!deliveryNames.validatePair(oldSuffixHtml, oldSuffixHtml.replace(/\.html$/, '-additional-files-ai-readible-json-and-prompt-info.zip'), '1'), 'old ZIP suffix was accepted.');
assert(!deliveryNames.validatePair(pairs[0][0], pairs[1][1], '1'), 'mismatched HTML/ZIP stems were accepted.');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'doview-v143-'));
try {
  // Compatibility rebuilds of bundled examples, JSON/HTML equality, version stamp and UI checks.
  for (const name of ['simple-example', 'complex-example']) {
    const htmlName = name + '-1-4-3-step-1-base-doview-board-test-model-2026-08-05-1118.html';
    const outHtml = path.join(tmp, htmlName);
    const outJson = path.join(tmp, name + '.json');
    const build = run([node, path.join(root, 'doview-board-builder.js'), '--engine', path.join(root, 'doview-board-engine.js'), '--config', path.join(root, 'examples', name + '.json'), '--out', outHtml, '--json-out', outJson, '--compatibility']);
    assert(build.status === 0, name + ' compatibility rebuild failed:\n' + build.stdout + '\n' + build.stderr);
    const html = fs.readFileSync(outHtml, 'utf8');
    const parsed = JSON.parse(fs.readFileSync(outJson, 'utf8'));
    const embedded = howMetrics.extractEmbeddedConfig(html);
    assert(embedded && JSON.stringify(embedded) === JSON.stringify(parsed), name + ' canonical JSON and embedded HTML state differ.');
    assert(parsed.schemaVersion === 'V1.3.9', name + ' saved schema changed.');
    assert(parsed.engineVersion === expectedVersion, name + ' output has the wrong engine version.');
    assert(parsed.builderValidation.builderVersion === expectedVersion, name + ' output has the wrong builder stamp.');
    assert(parsed.builderValidation.checks.evidenceReviewWorkflow === 'not-part-of-v1.4.3', name + ' output has stale evidence-workflow metadata.');
    assert(parsed.builderValidation.checks.completionParagraphDeclaration === 'passed', name + ' output lacks the final completion paragraph validation stamp.');
    assert(!html.includes(obsoleteUrl), name + ' output contains the obsolete URL.');
    assert(!html.includes('class="hdr-site"'), name + ' output contains the removed header link.');
  }

  // Obsolete URL negative build.
  const invalid = JSON.parse(fs.readFileSync(path.join(root, 'examples', 'simple-example.json'), 'utf8'));
  invalid.savedState = invalid.savedState || {};
  invalid.savedState.boardInfo = String(invalid.savedState.boardInfo || '') + '\n' + obsoleteUrl;
  const invalidPath = path.join(tmp, 'obsolete-url.json');
  fs.writeFileSync(invalidPath, JSON.stringify(invalid, null, 2));
  result = run([node, path.join(root, 'doview-board-builder.js'), '--engine', path.join(root, 'doview-board-engine.js'), '--config', invalidPath, '--out', path.join(tmp, 'invalid-1-4-3-step-1-base-doview-board-test-2026-08-05-1118.html'), '--compatibility']);
  assert(result.status !== 0, 'obsolete URL negative test was not rejected.');
  assert((result.stderr + result.stdout).includes('obsolete DoView Boards URL'), 'obsolete URL rejection did not report the expected reason.');

  // Completion response positive, including citation material after the bold paragraph.
  const html1 = pairs[0][0], zip1 = pairs[0][1];
  result = validateResponse('1', validResponse('1', html1, zip1, '\n[1]: https://example.org\n'), tmp, 'good-response');
  assert(result.status === 0, 'valid completion response with trailing citation definition was rejected: ' + result.stderr);

  // Completion response negatives.
  const oldLabels = validResponse('1', html1, zip1).replace(htmlLabel, 'Download the standalone HTML board').replace(zipLabel, 'Download the additional files ZIP');
  assert(validateResponse('1', oldLabels, tmp, 'bad-old-labels').status !== 0, 'old link labels were accepted.');
  const extraJson = '[Download the canonical JSON](sandbox:/mnt/data/board.json)\n\n' + validResponse('1', html1, zip1);
  assert(validateResponse('1', extraJson, tmp, 'bad-extra-json').status !== 0, 'separate JSON link was accepted.');
  const fragmentBold = validResponse('1', html1, zip1).replace(completion['1'], "Step 1 is complete. Type **'Do step 2'** to add links between the How Boxes, This–Then Boxes and other How Boxes.");
  assert(validateResponse('1', fragmentBold, tmp, 'bad-fragment-bold').status !== 0, 'partially bold completion paragraph was accepted.');
  const noBold = validResponse('1', html1, zip1).replace(completion['1'], completion['1'].slice(2, -2));
  assert(validateResponse('1', noBold, tmp, 'bad-no-bold').status !== 0, 'unbolded completion paragraph was accepted.');
  const duplicateIntro = validResponse('1', html1, zip1).replace('Delivery files are ready.\n\n', 'Delivery files are ready.\n\nDelivery files are ready.\n\n');
  assert(validateResponse('1', duplicateIntro, tmp, 'bad-duplicate').status !== 0, 'duplicated introductory line was accepted.');
  const invalidHtml = 'andy-1-4-3-step-1-base-model-2026-08-05-1144.html';
  const invalidZip = invalidHtml.replace(/\.html$/, deliveryNames.ZIP_SUFFIX);
  assert(validateResponse('1', validResponse('1', invalidHtml, invalidZip), tmp, 'bad-filename').status !== 0, 'invalid delivery filenames were accepted.');

  // ZIP creation and validation positive for both Steps.
  for (const [htmlName, zipName, step] of [pairs[0], pairs[3]]) {
    const stem = htmlName.slice(0, -5);
    const htmlPath = path.join(tmp, htmlName);
    const jsonPath = path.join(tmp, stem + '.json');
    const promptPath = path.join(tmp, stem + '-prompt-used.md');
    const auditPath = path.join(tmp, stem + (step === '1' ? '-structure-audit.md' : '-mapping-audit.md'));
    const zipPath = path.join(tmp, zipName);
    fs.writeFileSync(htmlPath, '<!doctype html><title>' + stem + '</title>\n');
    fs.writeFileSync(jsonPath, '{"fixture":true}\n');
    fs.writeFileSync(promptPath, '# Prompt used\n');
    fs.writeFileSync(auditPath, '# Audit\n');
    result = run([node, path.join(root, 'tools', 'create-delivery-zip.js'), '--step', step, '--html', htmlPath, '--json', jsonPath, '--prompt', promptPath, '--audit', auditPath, '--out', zipPath]);
    assert(result.status === 0, 'valid Step ' + step + ' delivery ZIP creation failed: ' + result.stderr + result.stdout);
    result = run([node, path.join(root, 'tools', 'validate-delivery-zip.js'), '--step', step, '--html', htmlPath, '--zip', zipPath]);
    assert(result.status === 0, 'valid Step ' + step + ' delivery ZIP was rejected: ' + result.stderr + result.stdout);
  }

  // ZIP negative: mandatory HTML omitted.
  const negHtmlName = pairs[1][0];
  const negZipName = pairs[1][1];
  const negStem = negHtmlName.slice(0, -5);
  const negDir = path.join(tmp, 'zip-negative-missing');
  fs.mkdirSync(negDir);
  fs.writeFileSync(path.join(negDir, negStem + '.json'), '{}\n');
  fs.writeFileSync(path.join(negDir, negStem + '-prompt-used.md'), '# prompt\n');
  fs.writeFileSync(path.join(negDir, negStem + '-structure-audit.md'), '# audit\n');
  const negZip = path.join(tmp, negZipName);
  result = cp.spawnSync('zip', ['-q', '-X', negZip, negStem + '.json', negStem + '-prompt-used.md', negStem + '-structure-audit.md'], { cwd: negDir, encoding: 'utf8' });
  assert(result.status === 0, 'could not create missing-HTML negative ZIP.');
  const negHtml = path.join(tmp, negHtmlName);
  fs.writeFileSync(negHtml, '<!doctype html><title>standalone</title>\n');
  assert(run([node, path.join(root, 'tools', 'validate-delivery-zip.js'), '--step', '1', '--html', negHtml, '--zip', negZip]).status !== 0, 'ZIP without HTML was accepted.');

  // ZIP negative: embedded HTML differs byte-for-byte.
  const mismatchDir = path.join(tmp, 'zip-negative-mismatch');
  fs.mkdirSync(mismatchDir);
  fs.writeFileSync(path.join(mismatchDir, negHtmlName), '<!doctype html><title>different</title>\n');
  fs.writeFileSync(path.join(mismatchDir, negStem + '.json'), '{}\n');
  fs.writeFileSync(path.join(mismatchDir, negStem + '-prompt-used.md'), '# prompt\n');
  fs.writeFileSync(path.join(mismatchDir, negStem + '-structure-audit.md'), '# audit\n');
  const mismatchZip = path.join(tmp, 'mismatch-' + negZipName);
  result = cp.spawnSync('zip', ['-q', '-X', mismatchZip, negHtmlName, negStem + '.json', negStem + '-prompt-used.md', negStem + '-structure-audit.md'], { cwd: mismatchDir, encoding: 'utf8' });
  assert(result.status === 0, 'could not create mismatched-HTML negative ZIP.');
  // Rename to the required valid ZIP basename for pair validation.
  const mismatchValidPath = path.join(tmp, negZipName + '.mismatch.tmp');
  fs.renameSync(mismatchZip, mismatchValidPath);
  // validate-delivery-zip checks basename, so copy under a valid name in a separate directory.
  const mismatchOutDir = path.join(tmp, 'mismatch-out');
  fs.mkdirSync(mismatchOutDir);
  const mismatchNamed = path.join(mismatchOutDir, negZipName);
  fs.copyFileSync(mismatchValidPath, mismatchNamed);
  assert(run([node, path.join(root, 'tools', 'validate-delivery-zip.js'), '--step', '1', '--html', negHtml, '--zip', mismatchNamed]).status !== 0, 'ZIP with non-identical HTML was accepted.');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log('V1.4.3 final release smoke tests passed.');
