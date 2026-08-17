#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function fail(message) {
  console.error('Opening-menu validation failed: ' + message);
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const menuPath = path.join(root, 'OPENING-MENU.md');
if (!fs.existsSync(menuPath)) fail('OPENING-MENU.md is missing.');
const menu = fs.readFileSync(menuPath, 'utf8').replace(/\r\n/g, '\n');

if (!menu.startsWith('# Default DoView Board setup\n')) fail('the fixed heading is missing or altered.');
const choicesSection = menu.split('**The board will be built in two steps:**')[0];
for (let i = 1; i <= 10; i++) {
  const matches = choicesSection.match(new RegExp('^' + i + '\\.', 'gm')) || [];
  if (matches.length !== 1) fail('choice ' + i + ' must appear exactly once in the setup choices.');
}
if (!/\*\*Step 1 — Structure:\*\*/.test(menu)) fail('the Step 1 workflow statement is missing.');
if (!/\*\*Step 2 — How mapping:\*\*/.test(menu)) fail('the Step 2 workflow statement is missing.');
if (!/To use all defaults, provide the subject, preferred title and any source files or URLs\./.test(menu)) fail('the accept-defaults instruction is missing.');
if (!/To change a setting, identify its number and your preferred option\./.test(menu)) fail('the override instruction is missing.');

const start = fs.readFileSync(path.join(root, '000-START-HERE-RUN-FIRST.md'), 'utf8');
const agents = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8');
if (!/reproduce its entire contents \*\*verbatim\*\*/.test(start)) fail('the master preflight does not require verbatim reproduction.');
if (!/Do not add text before or after it\./.test(start)) fail('the master preflight does not prohibit surrounding text.');
if (!/reproduce `OPENING-MENU\.md` verbatim and nothing else/.test(agents)) fail('AGENTS.md does not enforce the fixed opening menu.');

const responseArg = process.argv.indexOf('--response');
if (responseArg >= 0) {
  const responsePath = process.argv[responseArg + 1];
  if (!responsePath) fail('--response requires a file path.');
  const response = fs.readFileSync(responsePath, 'utf8').replace(/\r\n/g, '\n');
  if (response !== menu) fail('the supplied startup response is not verbatim OPENING-MENU.md content.');
}

console.log('Opening-menu validation passed: fixed ten-choice menu, two workflow Steps and verbatim-use rules are present.');
