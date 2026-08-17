#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const filenames = require('./delivery-filenames.js');

function fail(message) {
  console.error('Delivery-ZIP validation failed: ' + message);
  process.exit(1);
}
function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : '';
}
function run(command, args, options) {
  return cp.spawnSync(command, args, Object.assign({ encoding: null }, options || {}));
}

const step = arg('--step');
const htmlPath = arg('--html');
const zipPath = arg('--zip');
if (!['1', '2'].includes(step) || !htmlPath || !zipPath) {
  fail('usage: node tools/validate-delivery-zip.js --step <1|2> --html <standalone.html> --zip <delivery.zip>');
}
if (!fs.existsSync(htmlPath)) fail('standalone HTML file does not exist: ' + htmlPath);
if (!fs.existsSync(zipPath)) fail('ZIP file does not exist: ' + zipPath);
const htmlName = path.basename(htmlPath);
const zipName = path.basename(zipPath);
if (!filenames.validatePair(htmlName, zipName, step)) fail('HTML and ZIP names do not form a valid final V1.4.3 delivery pair.');
const stem = htmlName.slice(0, -5);
const expected = [
  htmlName,
  stem + '.json',
  stem + '-prompt-used.md',
  stem + (step === '1' ? '-structure-audit.md' : '-mapping-audit.md')
];
const list = run('unzip', ['-Z1', zipPath]);
if (list.status !== 0) fail('unzip could not list the archive: ' + String(list.stderr || list.stdout || 'unknown error'));
const entries = String(list.stdout || '').replace(/\r\n/g, '\n').split('\n').filter(Boolean);
const duplicates = entries.filter((entry, i) => entries.indexOf(entry) !== i);
if (duplicates.length) fail('ZIP contains duplicate entries: ' + Array.from(new Set(duplicates)).join(', '));
for (const name of expected) {
  if (!entries.includes(name)) fail('ZIP is missing mandatory root-level entry: ' + name);
}
const integrity = run('unzip', ['-tqq', zipPath]);
if (integrity.status !== 0) fail('ZIP integrity test failed: ' + String(integrity.stderr || integrity.stdout || 'unknown error'));
const embedded = run('unzip', ['-p', zipPath, htmlName]);
if (embedded.status !== 0) fail('could not read the embedded HTML entry.');
const standalone = fs.readFileSync(htmlPath);
if (!Buffer.from(embedded.stdout || []).equals(standalone)) fail('HTML inside ZIP is not byte-identical to the standalone HTML.');
console.log('Delivery ZIP validation passed for Step ' + step + ': mandatory files present and HTML bytes match.');
