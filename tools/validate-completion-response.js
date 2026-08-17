#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const filenames = require('./delivery-filenames.js');

const NOTICE = 'The draft was reviewed and revised before these files were produced. This was a self-review, not an independent audit. Before putting the board into operational use for an organisation or initiative, it needs to be carefully checked by humans to make sure that it truly reflects the organisation, policy or other type of initiative being modelled.';
const COMPLETION = {
  '1': "**Step 1 is complete. Type 'Do step 2' to add links between the How Boxes, This–Then Boxes and other How Boxes.**",
  '2': '**Step 2 is complete. Download the finished proof-of-concept board using the links above.**'
};
const HTML_LABEL = 'Download the DoView Board HTML file';
const ZIP_LABEL = 'Download the DoView Board HTML file plus additional files';
const OLD_LABELS = ['Download the standalone HTML board', 'Download the additional files ZIP'];

function fail(message) {
  console.error('Completion-response validation failed: ' + message);
  process.exit(1);
}
function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : '';
}
function basenameFromTarget(target) {
  const clean = String(target || '').split(/[?#]/)[0];
  return path.basename(clean);
}

const step = arg('--step');
const responsePath = arg('--response');
if (!COMPLETION[step]) fail('--step must be 1 or 2.');
if (!responsePath) fail('--response requires a file path.');
const text = fs.readFileSync(responsePath, 'utf8').replace(/\r\n/g, '\n');
const lines = text.split('\n');
const nonblankLines = lines.filter(line => line.trim());
if (!nonblankLines.length) fail('response is empty.');
if (!text.includes(NOTICE)) fail('the exact human-review paragraph is missing.');
const completionMatches = nonblankLines.filter(line => line === COMPLETION[step]);
if (completionMatches.length !== 1) fail('the exact Step completion paragraph must appear once as a fully bold standalone paragraph.');
const noticeIndex = text.indexOf(NOTICE);
const completionIndex = text.indexOf(COMPLETION[step]);
if (noticeIndex > completionIndex) fail('the human-review paragraph must appear before the Step completion paragraph.');
if (/independent-audit prompt|ask me for the independent-audit|Continue with Step 3|Do step 3/i.test(text)) fail('obsolete Step 3 or automated-audit handoff text is present.');
if (OLD_LABELS.some(label => text.includes(label))) fail('an obsolete download label is present.');

const links = [...text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(m => ({ label: m[1], target: m[2] }));
const deliveryLinks = links.filter(x => /\.(?:html|zip)(?:[?#].*)?$/i.test(x.target));
if (deliveryLinks.length !== 2) fail('exactly two downloadable deliverable links are required: one HTML and one ZIP.');
const htmlLinks = deliveryLinks.filter(x => x.label === HTML_LABEL && /\.html(?:[?#].*)?$/i.test(x.target));
const zipLinks = deliveryLinks.filter(x => x.label === ZIP_LABEL && /\.zip(?:[?#].*)?$/i.test(x.target));
if (htmlLinks.length !== 1) fail('the response must contain exactly one link labelled "' + HTML_LABEL + '".');
if (zipLinks.length !== 1) fail('the response must contain exactly one link labelled "' + ZIP_LABEL + '".');
if (/\.(?:json|md)(?:[?#].*)?\)/i.test(text)) fail('JSON, audit and prompt-info files must not be linked separately.');
const htmlName = basenameFromTarget(htmlLinks[0].target);
const zipName = basenameFromTarget(zipLinks[0].target);
if (!filenames.validatePair(htmlName, zipName, step)) fail('the HTML and ZIP filenames do not follow the final V1.4.3 naming rules or do not share the required stem.');

const seen = new Set();
for (const line of nonblankLines.map(x => x.trim())) {
  if (seen.has(line)) fail('the response contains a duplicated nonblank line.');
  seen.add(line);
}
console.log('Completion-response validation passed for Step ' + step + '.');
