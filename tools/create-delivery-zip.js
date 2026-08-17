#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');
const filenames = require('./delivery-filenames.js');

function fail(message) {
  console.error('Delivery-ZIP creation failed: ' + message);
  process.exit(1);
}
function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : '';
}
function copyExact(source, destination, expectedName) {
  if (!source || !fs.existsSync(source)) fail('missing input file for ' + expectedName + ': ' + source);
  if (path.basename(source) !== expectedName) fail('input filename must be exactly ' + expectedName + ', received ' + path.basename(source));
  fs.copyFileSync(source, destination);
}

const step = arg('--step');
const html = arg('--html');
const json = arg('--json');
const prompt = arg('--prompt');
const audit = arg('--audit');
const out = arg('--out');
if (!['1', '2'].includes(step) || !html || !json || !prompt || !audit || !out) {
  fail('usage: node tools/create-delivery-zip.js --step <1|2> --html <file> --json <file> --prompt <file> --audit <file> --out <file.zip>');
}
const htmlName = path.basename(html);
const outName = path.basename(out);
if (!filenames.validatePair(htmlName, outName, step)) fail('HTML and output ZIP names do not form a valid final V1.4.3 delivery pair.');
const stem = htmlName.slice(0, -5);
const expected = {
  html: htmlName,
  json: stem + '.json',
  prompt: stem + '-prompt-used.md',
  audit: stem + (step === '1' ? '-structure-audit.md' : '-mapping-audit.md')
};
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'doview-delivery-'));
try {
  copyExact(html, path.join(tmp, expected.html), expected.html);
  copyExact(json, path.join(tmp, expected.json), expected.json);
  copyExact(prompt, path.join(tmp, expected.prompt), expected.prompt);
  copyExact(audit, path.join(tmp, expected.audit), expected.audit);
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  if (fs.existsSync(out)) fs.unlinkSync(out);
  const zipped = cp.spawnSync('zip', ['-q', '-X', path.resolve(out), expected.html, expected.json, expected.prompt, expected.audit], { cwd: tmp, encoding: 'utf8' });
  if (zipped.status !== 0) fail('zip command failed: ' + (zipped.stderr || zipped.stdout || 'unknown error'));
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
const checked = cp.spawnSync(process.execPath, [path.join(__dirname, 'validate-delivery-zip.js'), '--step', step, '--html', html, '--zip', out], { encoding: 'utf8' });
if (checked.status !== 0) fail(checked.stderr || checked.stdout || 'created ZIP did not validate');
console.log('Created validated V1.4.3 delivery ZIP: ' + out);
