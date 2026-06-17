#!/usr/bin/env node
'use strict';

const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const root = path.resolve(__dirname, '..');
const builder = path.join(root, 'doview-board-builder.js');
const engine = path.join(root, 'doview-board-engine.js');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'doview-v131-runtime-meq-'));

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
    measures: measures,
    evalQuestions: evalQuestions,
    tagIds: []
  };
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

function runtimeFixture() {
  return {
    title: 'Runtime Measure and Evaluation Question fixture',
    slug: 'runtime-meq-fixture',
    generationChecks: {
      measuresMustAttachToBoxes: true,
      evalQuestionsMustAttachToBoxes: true,
      allPageViewOptionsOffUnlessRequested: true,
      boxDisplayTextRequested: false,
      trafficLightsRequested: false,
      prioritiesRequested: false
    },
    subpages: [
      {
        id: 'p1',
        label: 'This-Then fixture',
        pageType: 'this_then',
        color: { bg: '#eff6ff', bdr: '#bfdbfe', tab: '#2563eb' },
        cols: [
          { h: 'Earlier conditions', boxes: ['This-Then monitored'] },
          { h: 'Later outcomes', boxes: ['Outcome reached'] }
        ]
      },
      {
        id: 'p2',
        label: 'How fixture',
        pageType: 'how',
        howLevel: 1,
        color: { bg: '#ecfdf5', bdr: '#a7f3d0', tab: '#059669' },
        cols: [],
        howBoxes: [{ id: 'H001', label: 'How monitored' }],
        nextHowNum: 2
      }
    ],
    finalOutcomes: ['Final outcome monitored'],
    sources: [],
    savedState: {
      B: {
        'p1-c0-b0': boxState('This-Then monitored', ['M001'], ['EQ001']),
        'p2-H001': boxState('How monitored', ['M002'], ['EQ002']),
        'final-b0': boxState('Final outcome monitored', ['M003'], ['EQ003'])
      },
      measures: [
        { id: 'M001', title: 'This-Then measure' },
        { id: 'M002', title: 'How measure' },
        { id: 'M003', title: 'Final outcome measure' }
      ],
      measureNextId: 4,
      evalQuestions: [
        { id: 'EQ001', questionText: 'This-Then question?' },
        { id: 'EQ002', questionText: 'How question?' },
        { id: 'EQ003', questionText: 'Final outcome question?' }
      ],
      eqNextId: 4,
      viewSettings: viewSettings(),
      sourcesInitialized: true
    }
  };
}

function embeddedConfig(html) {
  const marker = 'DoView.init(';
  const start = html.lastIndexOf(marker);
  assert.ok(start >= 0, 'Expected embedded DoView.init config');
  const from = start + marker.length;
  const end = html.indexOf(');', from);
  assert.ok(end > from, 'Expected end of embedded DoView.init config');
  return JSON.parse(html.slice(from, end));
}

function chromeExecutable() {
  const candidates = [
    process.env.CHROME_BIN,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean);
  return candidates.find(function (candidate) { return fs.existsSync(candidate); }) || '';
}

try {
  const configPath = path.join(tempDir, 'runtime-meq-fixture.json');
  const htmlPath = path.join(tempDir, 'runtime-meq-fixture_doview-board_v1.3.4_2026-06-16.html');
  const probePath = path.join(tempDir, 'runtime-meq-probe.html');
  fs.writeFileSync(configPath, JSON.stringify(runtimeFixture(), null, 2));
  const build = childProcess.spawnSync(process.execPath, [
    builder,
    '--engine', engine,
    '--config', configPath,
    '--out', htmlPath
  ], { encoding: 'utf8' });
  assert.strictEqual(build.status, 0, 'Runtime fixture builder failed:\n' + build.stderr);

  const html = fs.readFileSync(htmlPath, 'utf8');
  const embedded = embeddedConfig(html);
  assert.strictEqual(embedded.savedState.SP, undefined, 'Regression fixture must omit savedState.SP');
  assert.strictEqual(embedded.builderValidation.checks.measureEqAttachment, 'passed');

  const probe = `
setTimeout(function(){
    var result={};
    function text(id){var el=document.getElementById(id);return el?el.textContent:'';}
    function underBoxText(boxId){var box=document.getElementById('bx-'+boxId);var next=box&&box.nextElementSibling;return next?next.textContent:'';}
    function enableMEQ(){
      openViewPanel();
      document.getElementById('vShowMeasures').checked=true;
      document.getElementById('vShowEvalQuestions').checked=true;
      saveViewPanel();
    }
    try{
      navTo('p1');
      result.thisThenInitiallyHidden=underBoxText('p1-c0-b0').indexOf('This-Then measure')<0;
      enableMEQ();
      result.thisThenUnderBox=underBoxText('p1-c0-b0');
      openMeasuresRegistry();
      result.measureRegistry=text('measuresRegistryList');
      closeModal('measuresRegistryModal');
      openEQRegistry();
      result.eqRegistry=text('eqRegistryList');
      closeModal('eqRegistryModal');
      openMeasureDetail('M001');
      result.measureDetail=text('measureDetailContent');
      closeModal('measureDetailModal');
      openEQDetail('EQ001');
      result.eqDetail=text('eqDetailContent');
      closeModal('eqDetailModal');
      navTo('p2');
      enableMEQ();
      result.howUnderBox=underBoxText('p2-H001');
      navTo('final');
      enableMEQ();
      result.finalUnderBox=underBoxText('final-b0');
    }catch(e){
      result.error=String(e&&e.stack||e);
    }
    document.body.setAttribute('data-runtime-meq-result',encodeURIComponent(JSON.stringify(result)));
},80);`;
  const bodyScriptClose = '</script>\n</body>';
  assert.ok(html.includes(bodyScriptClose), 'Expected builder body initialization script');
  fs.writeFileSync(probePath, html.replace(bodyScriptClose, probe + '\n' + bodyScriptClose));

  const chrome = chromeExecutable();
  if (!chrome) {
    console.log('Runtime Measure/EQ browser fixture skipped: Chrome/Chromium not found.');
    process.exit(0);
  }
  const browser = childProcess.spawnSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    '--disable-extensions',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=1500',
    '--user-data-dir=' + path.join(tempDir, 'chrome-profile'),
    '--dump-dom',
    pathToFileURL(probePath).href
  ], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, timeout: 30000 });
  if (browser.status !== 0) {
    const launchFailure = 'Headless browser fixture could not start (status=' + browser.status + ', signal=' + browser.signal + '):\n' + (browser.stderr || '');
    if (process.env.DOVIEW_REQUIRE_BROWSER === '1') assert.strictEqual(browser.status, 0, launchFailure);
    console.log('Runtime Measure/EQ browser fixture skipped: browser startup unavailable in this environment.');
    process.exit(0);
  }
  const match = browser.stdout.match(/data-runtime-meq-result="([^"]+)"/);
  assert.ok(match, 'Expected runtime Measure/EQ probe result in dumped DOM');
  const report = JSON.parse(decodeURIComponent(match[1]));
  assert.strictEqual(report.error, undefined, report.error);
  assert.strictEqual(report.thisThenInitiallyHidden, true, 'Measure/EQ display defaults must remain off');
  assert.match(report.thisThenUnderBox, /This-Then measure/);
  assert.match(report.thisThenUnderBox, /This-Then question\?/);
  assert.match(report.howUnderBox, /How measure/);
  assert.match(report.howUnderBox, /How question\?/);
  assert.match(report.finalUnderBox, /Final outcome measure/);
  assert.match(report.finalUnderBox, /Final outcome question\?/);
  assert.match(report.measureRegistry, /M1This-Then measure1 associated/);
  assert.match(report.eqRegistry, /EQ1This-Then question\?1 associated/);
  assert.doesNotMatch(report.measureRegistry, /not associated/);
  assert.doesNotMatch(report.eqRegistry, /not associated/);
  assert.match(report.measureDetail, /Associated boxes:This-Then monitored/);
  assert.match(report.eqDetail, /Associated boxes:This-Then monitored/);
  console.log('Runtime Measure/EQ browser fixture passed.');
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
