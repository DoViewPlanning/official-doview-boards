#!/usr/bin/env node
'use strict';

const VERSION_SEGMENT = '1-4-3';
const STEP_SEGMENTS = {
  '1': 'step-1-base-doview-board',
  '2': 'step-2-prototype-doview-board-with-how-links'
};
const ZIP_SUFFIX = '-plus-additional-files-ai-readible-json-and-prompt-info.zip';
const DATE_TIME_SOURCE = '(\\d{4})-(\\d{2})-(\\d{2})-(\\d{2})(\\d{2})';
const SAFE_NAME_RE = /^[a-z0-9][a-z0-9.-]*$/;
const FORBIDDEN_TOKEN_RE = /(?:^|-)(?:effort-not-exposed|model-unknown|unknown-model|nzst|nzdt|nzt|utc|gmt|pacific-auckland|timezone|time-zone|utc-offset)(?:-|\.|$)/;

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function patternFor(step, extension) {
  const segment = STEP_SEGMENTS[String(step)];
  if (!segment) return null;
  return new RegExp(
    '^([a-z0-9]+(?:-[a-z0-9]+)*)-' + VERSION_SEGMENT + '-' + escapeRegExp(segment) +
    '(?:-([a-z0-9]+(?:-[a-z0-9]+)*))?-' + DATE_TIME_SOURCE + escapeRegExp(extension) + '$'
  );
}
function validDateTime(match) {
  const year = Number(match[3]);
  const month = Number(match[4]);
  const day = Number(match[5]);
  const hour = Number(match[6]);
  const minute = Number(match[7]);
  if (year < 2000 || month < 1 || month > 12 || day < 1 || hour > 23 || minute > 59) return false;
  const d = new Date(Date.UTC(year, month - 1, day, hour, minute));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day && d.getUTCHours() === hour && d.getUTCMinutes() === minute;
}
function forbidden(name) {
  return FORBIDDEN_TOKEN_RE.test(String(name));
}
function validateHtmlName(name, step) {
  if (!SAFE_NAME_RE.test(String(name || '')) || forbidden(name)) return false;
  const re = patternFor(step, '.html');
  const match = re && String(name).match(re);
  return !!match && validDateTime(match);
}
function validateZipName(name, step) {
  if (!SAFE_NAME_RE.test(String(name || '')) || forbidden(name)) return false;
  const re = patternFor(step, ZIP_SUFFIX);
  const match = re && String(name).match(re);
  return !!match && validDateTime(match);
}
function expectedZipForHtml(htmlName) {
  return String(htmlName || '').replace(/\.html$/, ZIP_SUFFIX);
}
function validatePair(htmlName, zipName, step) {
  return validateHtmlName(htmlName, step) && validateZipName(zipName, step) && zipName === expectedZipForHtml(htmlName);
}
function htmlStem(htmlName) {
  return validateHtmlName(htmlName, '1') || validateHtmlName(htmlName, '2') ? htmlName.slice(0, -5) : '';
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const get = flag => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : ''; };
  const html = get('--html');
  const zip = get('--zip');
  const step = get('--step');
  if (!html || !zip || !STEP_SEGMENTS[step]) {
    console.error('Usage: node tools/delivery-filenames.js --step <1|2> --html <name.html> --zip <name.zip>');
    process.exit(2);
  }
  if (!validatePair(html, zip, step)) {
    console.error('Delivery filename validation failed.');
    process.exit(1);
  }
  console.log('Delivery filenames valid for Step ' + step + '.');
}

module.exports = { VERSION_SEGMENT, STEP_SEGMENTS, ZIP_SUFFIX, validateHtmlName, validateZipName, expectedZipForHtml, validatePair, htmlStem };
