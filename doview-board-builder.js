#!/usr/bin/env node
'use strict';

/*
DoView Board Builder V1.4.3
Public release: 2026-08-14
Plain Node.js local builder for assembling validated config-first DoView boards into canonical JSON and single-file HTML outputs. No external npm packages.
See CHANGELOG.md for release history and security notes.
*/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let shapeMetrics;
try {
  shapeMetrics = require('./tools/shape-metrics.js');
} catch (e) {
  console.error('ERROR: tools/shape-metrics.js could not be loaded. It ships alongside doview-board-builder.js and must stay in the tools/ folder next to the builder. (' + e.message + ')');
  process.exit(1);
}

let graphValidation;
try { graphValidation = require('./tools/graph-validation.js'); } catch (e) { console.error('ERROR: tools/graph-validation.js could not be loaded. (' + e.message + ')'); process.exit(1); }

let howLinkMetrics;
try {
  howLinkMetrics = require('./tools/how-link-metrics.js');
} catch (e) {
  console.error('ERROR: tools/how-link-metrics.js could not be loaded. It ships alongside doview-board-builder.js and must stay in the tools/ folder next to the builder. (' + e.message + ')');
  process.exit(1);
}

const BUILDER_VERSION = 'V1.4.3';
const VALIDATION_VERSION = 'V1.4.3';
const JSON_FORMAT = 'doview-board-json';
const SCHEMA_VERSION = 'V1.3.9';
const ENGINE_VERSION = 'V1.4.3';
const WORKFLOW_STEP_1 = 'step-1-structure';
const WORKFLOW_STEP_2 = 'step-2-how-mapping';
const WORKFLOW_STEPS = [WORKFLOW_STEP_1, WORKFLOW_STEP_2];
const EXPECTED_FILENAME_RE = /^[a-z0-9][a-z0-9-]*-1-4-3-(?:step-1-base-doview-board|step-2-prototype-doview-board-with-how-links)(?:-[a-z0-9][a-z0-9-]*)?-\d{4}-\d{2}-\d{2}-\d{4}\.html$/;

const SIMPLE_DEFAULT_VIEW_SETTINGS = {
  thisThen: { showCounts: false, showTrafficLights: false, showPriorities: false, showHowCounts: false, showMeasures: false, showEvalQuestions: false, showMainText: false, showFullMainText: false, showMainTextCodeStyle: false, showLinkInfoOnHover: false, showLinkInfoCodeStyle: false, showLateralHow: false, showTags: false },
  how: { showNumbering: false, showTrafficLights: false, showPriorities: false, showWhyCounts: false, showLateralHow: false, showMeasures: false, showEvalQuestions: false, showMainText: false, showFullMainText: false, showMainTextCodeStyle: false, showTags: false },
  finalOutcomes: { showTrafficLights: false, showPriorities: false, showMeasures: false, showEvalQuestions: false, showMainText: false, showFullMainText: false, showMainTextCodeStyle: false, showTags: false }
};
const PRIORITY_VALUES = ['A', 'B', 'C', 'D', 'E', 'BAU'];
const TRAFFIC_LIGHT_VALUES = ['green', 'greenYellow', 'yellow', 'yellowRed', 'red', 'grey'];
const DOC_CLONE_TYPES = ['page_title', 'box_title', 'box_main_text', 'measure', 'eval_question', 'link'];
const NO_LEVEL_HOW_PAGE_RE = /\b(?:cross[\s-]?link|non[\s-]?hierarchical|non[\s-]?vertical|no[\s-]?level)\b/i;
const COMPETENCY_HOW_PAGE_RE = /\b(?:competenc(?:y|ies)|cross[\s-]?cutting capabilit(?:y|ies))\b/i;
const COMPACT_LABEL_AUXILIARY_RE = /\b(?:is|are|was|were|has\s+been|have\s+been|will\s+be)\b/i;
const SELF_REVIEW_NOTICE = 'The draft was reviewed and revised before these files were produced. This was a self-review, not an independent audit. Before putting the board into operational use for an organisation or initiative, it needs to be carefully checked by humans to make sure that it truly reflects the organisation, policy or other type of initiative being modelled.';
const OBSOLETE_DOVIEW_BOARDS_URL = ['https://doviewplanning.org/doviewboards', 'use'].join('');
const SUPPORTING_EVIDENCE_PREFIX = 'Evidence supporting link:';
const NON_SUPPORTING_EVIDENCE_PREFIX = 'Evidence not supporting link:';
const LINK_TEXT_BANNED_PATTERNS = [
  /left[\s-]?to[\s-]?right causal logic/i,
  /this dependency reflects/i,
  /page[\s-]?level outcomes?/i,
  /final organi[sz]ational outcomes?/i,
  /upstream work enables or constrains/i,
  /next implementation condition/i,
  /validate using the associated measures?/i,
  /this link shows a relationship/i,
  /this box links to the next box/i,
  /this supports the next outcome/i,
  /public evidence sources for the board include/i,
  /through defined delivery, stewardship or assurance mechanisms/i,
  /directly enables or strengthens(?![^.]*\b(?:by|through|because|when|using|via)\b)[^.]*\.?$/i
];
const HOW_LINK_TEXT_BANNED_PATTERNS = [
  /supports implementation/i,
  /capabilit(?:y|ies) enables? activit(?:y|ies)/i,
  /supports? the next (?:activity|implementation item|workstream)/i,
  /directly performs, governs, funds or assures the workstream/i,
  /directly improves the quality or effectiveness of/i,
  /through defined delivery, stewardship or assurance mechanisms/i
];
const CANONICAL_DISCLAIMER_TITLE = 'Using DoView Boards and Disclaimer';
const CANONICAL_DISCLAIMER_TEXT = `Using DoView Boards and Disclaimer

See the disclaimer section below.

The DoView Board prompt and the DoView Board built within this DoView Board prototype app are provided free of charge so that anyone can experiment with DoView Boards and explore for themselves how they can answer the 20 key questions that anyone running or overseeing an organization needs to answer. See [https://doviewplanning.org/doviewboards](https://doviewplanning.org/doviewboards).

Walk-Through

To get a walk-through for using DoView Boards, see [https://doviewplanning.org/walkthrough](https://doviewplanning.org/walkthrough).

Accessing Consulting or Training

We can provide consulting or training on integrating the use of DoView Boards into your existing planning, implementation and reporting workflows in business, government, or nonprofit settings. See [https://doviewplanning.org/offerings](https://doviewplanning.org/offerings).

Adapting the DoView Board Prototype App to your setting

This DoView Board is being used within the DoView Board prototype app. It is a free of charge app that runs inside any browser window and can be used for piloting, testing, proof-of-concept and for use where confidential information is not being included and where there is a low security risk.

The DoView Board app is an open-source developer project under an Apache-2.0 open-source license. See [https://github.com/doviewplanning/official-doview-boards](https://github.com/doviewplanning/official-doview-boards). The wider DoView Planning methodology and DoView® trademarks are governed separately. See [https://doviewplanning.org/trademarkuse](https://doviewplanning.org/trademarkuse).

Because it is an open-source project, any developer can extend, harden, adapt, or include features of the DoView Board app in other planning products or systems to suit specific deployment requirements. For example, adding enhanced stability, scalability, security, authentication, data handling, or integration features needed for production use, sensitive content, or higher-security environments. If you are looking to deploy DoView Boards in a live operational setting, you can work with any developer to tailor the app to your needs. You can also get in touch with us for advice and methodological input into the best way for you to adapt and extend your use of DoView Boards in your particular setting. [https://doviewplanning.org/contact](https://doviewplanning.org/contact).

Disclaimer

DoView Boards are provided for planning and illustrative purposes only. The content of any DoView Board does not constitute professional advice of any kind, including but not limited to legal, financial, medical, strategic, or organizational advice. No warranty is given as to the accuracy, completeness, or fitness for purpose of any content. The usual precautions for AI-generated material need to be taken. Dr Paul Duignan, DoViewPlanning.org, The Ideas Web Ltd, DoView Corporation Ltd and any associated parties accept no liability whatsoever for any loss, damage, or adverse outcome arising directly or indirectly from the use of, or reliance on, any DoView Board or its contents. Use entirely at your own risk.

Please note that this DoView Board is in an interactive HTML file and contains active JavaScript so the board can work. Only open boards from sources you trust. Read-only copies disable editing through the board interface but are not security protection.`;
const STANDARD_NON_CONTENT_SOURCE_URLS = [
  'https://doviewplanning.org/doviewboards',
  'https://doviewplanning.org/help',
  'https://doviewplanning.org/walkthrough',
  'https://doviewplanning.org/offerings',
  'https://github.com/doviewplanning/official-doview-boards',
  'https://doviewplanning.org/trademarkuse',
  'https://doviewplanning.org/contact',
  'https://doviewplanning.org/collaborate'
];
function simpleDefaultViewSettings() { return JSON.parse(JSON.stringify(SIMPLE_DEFAULT_VIEW_SETTINGS)); }

function usage() {
  return [
    'DoView Board Builder ' + BUILDER_VERSION,
    '',
    'Usage:',
    '  node doview-board-builder.js --engine <engine-file> --config <config-json-file> --out <output-html-file> [--json-out <output-json-file>] [--compatibility]',
    '',
    'Example:',
    '  node doview-board-builder.js \\',
    '    --engine doview-board-engine.js \\',
    '    --config doview-board-config.json \\',
    '    --out labour-policy-1-4-3-step-1-base-doview-board-gpt-5-6-thinking-high-effort-2026-08-14-1118.html',
    '',
    'Inputs:',
    '  --engine   DoView engine JavaScript file, usually doview-board-engine.js',
    '  --config   Pure JSON board config file, usually doview-board-config.json',
    '  --out      Final single-file HTML output path',
    '  --json-out Canonical full JSON output path; defaults to the HTML path with a .json extension',
    '  --compatibility Allow an existing/legacy config without generationChecks. Never use this for a newly AI-generated board.',
    '',
    'Notes:',
    '  - The config must be JSON only, not DoView.init({...}) JavaScript.',
    '  - The generated board is a standalone HTML file containing active JavaScript; treat it like executable web content, not a passive document.',
    '  - Prefer this builder path for final boards: provide pure JSON config and let a vetted, known-good engine and builder emit validated canonical JSON plus matching HTML.',
    '  - Newly generated boards must include top-level generationChecks; strict-generated validation is the default and required path.',
    '  - Use --compatibility only to inspect or rebuild an existing legacy config that genuinely predates generationChecks. Compatibility output is not an acceptable completed AI-generated board.',
    '  - When top-level generationChecks metadata is present, strict preflight validation runs automatically and builder-only metadata is stripped before HTML output.',
    '  - Strict-generated input requires generationChecks.howLinkAudit. The audit is checked against effective savedState.howLinks; structural validation does not prove semantic completeness, so human/domain review remains required.',
    '  - V1.4.3 strict-generated input also requires generationChecks.workflowStep: step-1-structure or step-2-how-mapping.',
    '  - Step 2 must retain the accepted Step 1 builderValidation stamp.',
    '  - Link annotation fields and traffic lights remain blank throughout the V1.4.3 two-step workflow.',
    '  - In strict mode, repeated This-Then page geometry and unexcepted terminal-column overload are errors, not warnings. The only escape hatches are the structured generationChecks.shapePlan fields (per-page shapeReason, terminalColumnExceptions, syntheticLoadTest); prose justifications in board text are ignored. Shape errors mean restructure from domain logic, never remove content.',
    '  - Configs without generationChecks are rejected unless --compatibility is supplied explicitly.',
    '  - Do not manually embed prompt text, builder source, examples, or duplicate engine code into final board HTML.',
    '  - For production, enterprise, or multi-user deployment, use sandboxing, isolated origins, or another restricted viewer for generated boards.',
    'Prototype/intended-use notice: the prototype is designed for experimentation, learning, proof-of-concept uses, and non-confidential information in low-risk environments; for higher-risk, sensitive, regulated, public, multi-user, enterprise, or production use, put in place security, privacy, compliance, hosting, access-control, audit, data-handling, integration, and deployment arrangements appropriate to the intended environment. See https://doviewplanning.org/trademarkuse for DoView trademark-use guidance.',
    '  - Do not host untrusted generated board HTML on the same origin as sensitive cookies, admin sessions, or privileged tools.',
    '  - The builder is only an assembly and technical validation tool; do content-quality, source, sensitivity, and human-review checks before config finalization or publication.',
    '  - No npm install or external package is required. Keep tools/shape-metrics.js and tools/how-link-metrics.js beside the builder.'
  ].join('\n');
}

function fail(message) {
  console.error('ERROR: ' + message);
  process.exit(1);
}

function warn(warnings, message) {
  warnings.push(message);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      args.help = true;
      continue;
    }
    if (a === '--compatibility') {
      args.compatibility = true;
      continue;
    }
    if (a === '--engine' || a === '--config' || a === '--out' || a === '--json-out') {
      const v = argv[i + 1];
      if (!v || v.indexOf('--') === 0) fail('Missing value for ' + a);
      args[a === '--json-out' ? 'jsonOut' : a.slice(2)] = v;
      i++;
      continue;
    }
    fail('Unknown argument: ' + a);
  }
  return args;
}

function readTextFile(file, label) {
  if (!file) fail('Missing --' + label + ' argument');
  if (!fs.existsSync(file)) fail('Missing ' + label + ' file: ' + file);
  const stat = fs.statSync(file);
  if (!stat.isFile()) fail(label + ' path is not a file: ' + file);
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (e) {
    fail('Could not read ' + label + ' file: ' + file + ' (' + e.message + ')');
  }
}

function looksLikeWholeHtml(text) {
  return /^\s*<!doctype\s+html/i.test(text) || /^\s*<html[\s>]/i.test(text);
}

function parseConfig(configText, configPath) {
  const trimmed = configText.trim();
  if (!trimmed) fail('Config file is empty: ' + configPath);
  if (looksLikeWholeHtml(trimmed)) fail('Config file appears to be full HTML. Expected pure JSON only: ' + configPath);
  if (/DoView\s+Engine\s+V\d/i.test(trimmed) || /const\s+DoView\s*=/.test(trimmed)) fail('Config file appears to contain DoView engine text. Expected pure JSON only: ' + configPath);
  if (/doview-board-builder\.js/i.test(trimmed) || /DoView Board Builder V\d/i.test(trimmed)) fail('Config file appears to contain builder code. Expected pure JSON only: ' + configPath);
  if (/AI DoView Drawing Prompt|START BEHAVIOUR|THE SEVEN QUESTIONS/i.test(trimmed)) fail('Config file appears to contain prompt text. Expected pure JSON only: ' + configPath);
  if (/DoView\.init\s*\(/.test(trimmed)) fail('Config file contains DoView.init(...). Expected pure JSON only: ' + configPath);

  try {
    return JSON.parse(trimmed);
  } catch (e) {
    fail('Malformed JSON config in ' + configPath + ': ' + e.message);
  }
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function slugify(value) {
  return String(value || 'doview-board')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'doview-board';
}

function boxLabelValue(v) {
  if (typeof v === 'string') return v;
  if (isPlainObject(v) && typeof v.label === 'string') return v.label;
  return null;
}

function finalOutcomeLabelValue(v) {
  const label = boxLabelValue(v);
  if (label !== null) return label;
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return '';
  return String(v);
}

function normalizeFinalOutcomeList(list) {
  if (!Array.isArray(list)) return list;
  return list.map(finalOutcomeLabelValue);
}

function isHexColorString(v) {
  return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v.trim());
}

function normalizePriorityValue(v) {
  const p = v === null || v === undefined ? '' : String(v).trim().toUpperCase();
  return PRIORITY_VALUES.indexOf(p) >= 0 ? p : '';
}

function normalizeTrafficLightValue(v) {
  const value = v === null || v === undefined ? '' : String(v).trim();
  return TRAFFIC_LIGHT_VALUES.indexOf(value) >= 0 ? value : '';
}

function validateFormalPriorityValue(value, where, errors) {
  if (value === undefined || value === null || value === '') return;
  if (normalizePriorityValue(value) !== String(value).trim().toUpperCase()) {
    errors.push(where + ' must be A, B, C, D, E, BAU, or empty');
  }
}

function validateTrafficLightValue(value, where, errors) {
  if (value === undefined || value === null || value === '') return;
  if (normalizeTrafficLightValue(value) !== String(value).trim()) {
    errors.push(where + ' must be green, greenYellow, yellow, yellowRed, red, grey, or empty');
  }
}

function validateThisThenPageColor(p, pageLabel, errors) {
  if (!isPlainObject(p.color)) {
    errors.push('This–Then Page ' + pageLabel + ' must include a complete color object with bg, bdr, and tab hex values');
    return;
  }
  ['bg', 'bdr', 'tab'].forEach(function (key) {
    if (!isHexColorString(p.color[key])) {
      errors.push('This–Then Page ' + pageLabel + ' color.' + key + ' must be a #RRGGBB hex string');
    }
  });
}

function looksLikeNumberedPlaceholderLabel(label) {
  const text = String(label || '').trim();
  if (!text) return false;
  return /^(?:condition|outcome|box|stage|step|pathway|page|row|column|area|major area|item|implementation item|discovery condition)\s+0*\d+(?:\.\d+)*\s*[:.)-]?\s*$/i.test(text);
}

function warnNumberedPlaceholder(kind, label, where, warnings) {
  if (looksLikeNumberedPlaceholderLabel(label)) {
    warn(warnings, kind + ' label "' + label + '" at ' + where + ' looks like a numbered placeholder. Generated boards should use meaningful natural-language labels unless numbered items were explicitly requested.');
  }
}

function collectKnownBoxIds(cfg, warnings, pagesOverride) {
  const ids = new Set();
  const pages = Array.isArray(pagesOverride) ? pagesOverride : (Array.isArray(cfg.subpages) ? cfg.subpages : []);
  pages.forEach(function (p) {
    const type = p && (p.pageType || 'this_then');
    if (!p || !p.id) return;
    if (Array.isArray(p.cols)) {
      p.cols.forEach(function (col, ci) {
        if (col && Array.isArray(col.boxes)) {
          col.boxes.forEach(function (_box, bi) {
            ids.add(p.id + '-c' + ci + '-b' + bi);
          });
        }
      });
    }
    if (type === 'how' && Array.isArray(p.howBoxes)) {
      p.howBoxes.forEach(function (hb) {
        if (hb && hb.id) ids.add(p.id + '-' + hb.id);
      });
    }
  });
  const finalOutcomes = Array.isArray(cfg.finalOutcomes) ? cfg.finalOutcomes : [];
  finalOutcomes.forEach(function (_f, i) { ids.add('final-b' + i); });
  if (cfg.savedState && isPlainObject(cfg.savedState.B)) {
    Object.keys(cfg.savedState.B).forEach(function (k) { ids.add(k); });
  }
  return ids;
}

function runtimeUsesSavedSP(cfg) {
  const state = cfg && cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  return !!(state.B && isPlainObject(state.B) && Array.isArray(state.SP));
}

function effectiveRuntimePages(cfg) {
  const state = cfg && cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  if (runtimeUsesSavedSP(cfg)) return state.SP;
  return Array.isArray(cfg.subpages) ? cfg.subpages : [];
}

function collectPageIdsFromPages(pages) {
  const ids = new Set();
  (Array.isArray(pages) ? pages : []).forEach(function (page) {
    if (page && page.id) ids.add(page.id);
  });
  return ids;
}

function setDifference(left, right) {
  const out = [];
  left.forEach(function (value) {
    if (!right.has(value)) out.push(value);
  });
  return out;
}

function describeSetDifference(leftLabel, rightLabel, left, right, kind) {
  const missing = setDifference(left, right);
  const extra = setDifference(right, left);
  const parts = [];
  if (missing.length) parts.push(kind + ' in ' + leftLabel + ' but not ' + rightLabel + ': ' + missing.sort().join(', '));
  if (extra.length) parts.push(kind + ' in ' + rightLabel + ' but not ' + leftLabel + ': ' + extra.sort().join(', '));
  return parts;
}

function validateEffectivePageStateConsistency(cfg, strict, errors, warnings) {
  if (!runtimeUsesSavedSP(cfg)) return;
  const topPages = Array.isArray(cfg.subpages) ? cfg.subpages : [];
  const savedPages = cfg.savedState.SP;
  const pageMessages = describeSetDifference('subpages', 'savedState.SP', collectPageIdsFromPages(topPages), collectPageIdsFromPages(savedPages), 'Page IDs');
  const topBoxIds = collectKnownBoxIds({ subpages: topPages, finalOutcomes: cfg.finalOutcomes }, [], topPages);
  const savedBoxIds = collectKnownBoxIds({ subpages: savedPages, finalOutcomes: cfg.finalOutcomes }, [], savedPages);
  const boxMessages = describeSetDifference('subpages', 'savedState.SP', topBoxIds, savedBoxIds, 'Box IDs');
  pageMessages.concat(boxMessages).forEach(function (message) {
    reportModeIssue(strict, errors, warnings, message + '. Runtime loading uses savedState.SP when savedState.B and savedState.SP are present, so generated configs must keep these structures consistent.');
  });
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pushAutoFix(autoFixes, message) {
  if (autoFixes.indexOf(message) === -1) autoFixes.push(message);
}

function reportModeIssue(strict, errors, warnings, message) {
  if (strict) errors.push(message);
  else warn(warnings, message);
}

function howPageCopies(cfg) {
  const copies = [];
  if (Array.isArray(cfg.subpages)) copies.push({ name: 'subpages', pages: cfg.subpages });
  if (cfg.savedState && Array.isArray(cfg.savedState.SP)) copies.push({ name: 'savedState.SP', pages: cfg.savedState.SP });
  return copies;
}

function setNoLevelHowPage(cfg, pageId, pageLabel, autoFixes) {
  let changed = false;
  howPageCopies(cfg).forEach(function (copy) {
    copy.pages.forEach(function (p) {
      if (!p || p.id !== pageId || (p.pageType || 'this_then') !== 'how') return;
      if (p.howLevel !== null) {
        p.howLevel = null;
        changed = true;
      }
    });
  });
  if (changed) {
    pushAutoFix(autoFixes, 'Normalized Cross-Link/no-level How Page "' + pageLabel + '" to howLevel: null.');
  }
}

function enforceNoLevelHowPages(cfg, checks, strict, errors, warnings, autoFixes) {
  const pages = Array.isArray(cfg.subpages) ? cfg.subpages.filter(function (p) {
    return p && (p.pageType || 'this_then') === 'how';
  }) : [];
  const markedIds = new Set();
  pages.forEach(function (p) {
    if (NO_LEVEL_HOW_PAGE_RE.test(String(p.label || ''))) markedIds.add(p.id);
  });

  const expected = checks && checks.expectedNoLevelHowPages;
  if (expected !== undefined && !Array.isArray(expected)) {
    errors.push('generationChecks.expectedNoLevelHowPages must be an array of How Page IDs or labels');
  } else if (Array.isArray(expected)) {
    expected.forEach(function (entry, i) {
      if (!isNonEmptyString(entry)) {
        errors.push('generationChecks.expectedNoLevelHowPages[' + i + '] must be a non-empty How Page ID or label');
        return;
      }
      const wanted = normalizeSearchText(entry);
      const exact = pages.filter(function (p) {
        return normalizeSearchText(p.id) === wanted || normalizeSearchText(p.label) === wanted;
      });
      const matches = exact.length ? exact : pages.filter(function (p) {
        return normalizeSearchText(p.label).indexOf(wanted) >= 0;
      });
      if (matches.length !== 1) {
        errors.push('Expected no-level How Page "' + entry + '" matched ' + matches.length + ' How Pages. Identify exactly one page by ID or a unique label.');
        return;
      }
      markedIds.add(matches[0].id);
    });
  }

  pages.forEach(function (p) {
    if (!markedIds.has(p.id)) return;
    setNoLevelHowPage(cfg, p.id, p.label || p.id, autoFixes);
  });

  pages.forEach(function (p) {
    if (!markedIds.has(p.id)) return;
    const fixed = p.howLevel === null;
    if (!fixed) {
      errors.push('Cross-Link/no-level How Page "' + (p.label || p.id) + '" has howLevel: ' + String(p.howLevel) + '. Expected howLevel: null.');
    }
  });

  if (!strict && markedIds.size) {
    warn(warnings, 'Detected labelled Cross-Link/no-level How Pages and enforced howLevel: null as a safe baseline normalization.');
  }
}

function numberedHowLevelValue(value) {
  return (typeof value === 'number' && Number.isFinite(value) && Math.floor(value) === value) ? value : null;
}

function howPageDisplayRef(p, fallbackIndex) {
  const label = isNonEmptyString(p && p.label) ? p.label : '';
  const id = isNonEmptyString(p && p.id) ? p.id : '';
  if (label && id) return '"' + label + '" (' + id + ')';
  if (label) return '"' + label + '"';
  if (id) return id;
  return 'How Page at index ' + fallbackIndex;
}

function validateUniqueNumberedHowLevels(cfg, errors) {
  howPageCopies(cfg).forEach(function (copy) {
    const byLevel = Object.create(null);
    copy.pages.forEach(function (p, i) {
      if (!p || (p.pageType || 'this_then') !== 'how') return;
      const level = numberedHowLevelValue(p.howLevel);
      if (level === null) return;
      const key = String(level);
      if (!byLevel[key]) byLevel[key] = [];
      byLevel[key].push(howPageDisplayRef(p, i));
    });
    Object.keys(byLevel).forEach(function (level) {
      if (byLevel[level].length <= 1) return;
      errors.push('Duplicate numbered How Page level in ' + copy.name + ': howLevel ' + level + ' is used by more than one How Page (' + byLevel[level].join(', ') + '). There is only one vertical How Page hierarchy. Use one page per numbered level, or set lateral/cross-link How Pages to howLevel: null.');
    });
  });
}

function collectBoxLabelMap(cfg) {
  const labels = Object.create(null);
  const pages = effectiveRuntimePages(cfg);
  pages.forEach(function (p) {
    if (!p || !p.id) return;
    const type = p.pageType || 'this_then';
    if (Array.isArray(p.cols)) {
      p.cols.forEach(function (col, ci) {
        if (!col || !Array.isArray(col.boxes)) return;
        col.boxes.forEach(function (box, bi) {
          const label = boxLabelValue(box);
          if (label !== null) labels[p.id + '-c' + ci + '-b' + bi] = label;
        });
      });
    }
    if (type === 'how' && Array.isArray(p.howBoxes)) {
      p.howBoxes.forEach(function (hb) {
        if (hb && hb.id && typeof hb.label === 'string') labels[p.id + '-' + hb.id] = hb.label;
      });
    }
  });
  if (Array.isArray(cfg.finalOutcomes)) {
    cfg.finalOutcomes.forEach(function (f, i) { labels['final-b' + i] = finalOutcomeLabelValue(f); });
  }
  if (cfg.savedState && isPlainObject(cfg.savedState.B)) {
    Object.keys(cfg.savedState.B).forEach(function (key) {
      const b = cfg.savedState.B[key];
      if (b && typeof b.label === 'string' && b.label.trim()) labels[key] = b.label;
    });
  }
  return labels;
}

function linkArrayLocations(cfg, key) {
  const locations = [];
  if (cfg.savedState && Array.isArray(cfg.savedState[key])) {
    locations.push({ name: 'savedState.' + key, links: cfg.savedState[key] });
  }
  if (Array.isArray(cfg[key])) locations.push({ name: key, links: cfg[key] });
  return locations;
}

function runtimeLinkArrayLocations(cfg, key) {
  const state = cfg && cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  if (Array.isArray(state[key])) return [{ name: 'savedState.' + key, links: state[key] }];
  return [];
}

function effectiveRuntimeFinalOutcomes(cfg) {
  const state = cfg && cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  if (runtimeUsesSavedSP(cfg)) return Array.isArray(state.FO) ? state.FO : (Array.isArray(cfg.finalOutcomes) ? cfg.finalOutcomes : []);
  return Array.isArray(cfg.finalOutcomes) ? cfg.finalOutcomes : [];
}

function collectEffectiveRuntimeBoxContext(cfg) {
  const ids = new Set();
  const types = Object.create(null);
  const pages = effectiveRuntimePages(cfg);
  pages.forEach(function (p) {
    if (!p || !p.id) return;
    const type = p.pageType || 'this_then';
    if (type === 'this_then' && Array.isArray(p.cols)) {
      p.cols.forEach(function (col, ci) {
        (col && Array.isArray(col.boxes) ? col.boxes : []).forEach(function (_box, bi) {
          const key = p.id + '-c' + ci + '-b' + bi;
          ids.add(key);
          types[key] = 'this_then';
        });
      });
    }
    if (type === 'how' && Array.isArray(p.howBoxes)) {
      p.howBoxes.forEach(function (hb) {
        if (!hb || !hb.id) return;
        const key = p.id + '-' + hb.id;
        ids.add(key);
        types[key] = 'how';
      });
    }
  });
  effectiveRuntimeFinalOutcomes(cfg).forEach(function (_f, i) {
    const key = 'final-b' + i;
    ids.add(key);
    types[key] = 'final';
  });
  const state = cfg && cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  if (isPlainObject(state.B)) {
    Object.keys(state.B).forEach(function (key) { ids.add(key); });
  }
  return { ids: ids, types: types };
}

function runtimeBoxTypeLabel(type) {
  if (type === 'this_then') return 'ordinary This-Then box';
  if (type === 'how') return 'How box';
  if (type === 'final') return 'Final Outcome box';
  return 'non-page or unknown box';
}

function effectiveEndpointInvalidReason(key, boxContext, expectedType) {
  if (!isNonEmptyString(key)) return 'endpoint is missing';
  if (!boxContext.ids.has(key)) return 'endpoint "' + key + '" does not exist in effective runtime B';
  if (boxContext.types[key] !== expectedType) {
    return 'endpoint "' + key + '" is a ' + runtimeBoxTypeLabel(boxContext.types[key]) + ', not an ' + runtimeBoxTypeLabel(expectedType);
  }
  return '';
}

function effectiveTTLinkInvalidReason(link, boxContext) {
  if (!isPlainObject(link)) return 'link record is not an object';
  const fromReason = effectiveEndpointInvalidReason(link.from, boxContext, 'this_then');
  if (fromReason) return 'from ' + fromReason;
  const toReason = effectiveEndpointInvalidReason(link.to, boxContext, 'this_then');
  if (toReason) return 'to ' + toReason;
  return '';
}

function effectiveHowLinkInvalidReason(link, boxContext) {
  if (!isPlainObject(link)) return 'link record is not an object';
  const fromReason = effectiveEndpointInvalidReason(link.from, boxContext, 'how');
  if (fromReason) return 'from ' + fromReason;
  if (!isNonEmptyString(link.to)) return 'to endpoint is missing';
  if (!boxContext.ids.has(link.to)) return 'to endpoint "' + link.to + '" does not exist in effective runtime B';
  const toType = boxContext.types[link.to];
  if (toType !== 'this_then' && toType !== 'how') {
    return 'to endpoint "' + link.to + '" is a ' + runtimeBoxTypeLabel(toType) + ', not an ordinary This-Then box or How box';
  }
  return '';
}

function collectEffectiveRuntimeLinkInfo(cfg) {
  const boxContext = collectEffectiveRuntimeBoxContext(cfg);
  const validLinkIds = new Set();
  const invalidLinkReasons = Object.create(null);
  [
    { key: 'ttLinks', label: 'This-Then link', checker: effectiveTTLinkInvalidReason },
    { key: 'howLinks', label: 'How link', checker: effectiveHowLinkInvalidReason }
  ].forEach(function (rule) {
    runtimeLinkArrayLocations(cfg, rule.key).forEach(function (item) {
      item.links.forEach(function (link, i) {
        if (!link || !link.id) return;
        const reason = rule.checker(link, boxContext);
        if (reason) {
          invalidLinkReasons[link.id] = item.name + '[' + i + '] ' + rule.label + ' "' + link.id + '" will be removed by runtime cleanup: ' + reason;
        } else {
          validLinkIds.add(link.id);
        }
      });
    });
  });
  return { validLinkIds: validLinkIds, invalidLinkReasons: invalidLinkReasons };
}

function validateRuntimeSurvivingLinks(cfg, strict, errors, warnings) {
  const linkInfo = collectEffectiveRuntimeLinkInfo(cfg);
  Object.keys(linkInfo.invalidLinkReasons).sort().forEach(function (linkId) {
    reportModeIssue(strict, errors, warnings, linkInfo.invalidLinkReasons[linkId]);
  });
}

function removeRuntimeInvalidLinks(cfg, autoFixes) {
  const state = cfg && cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  const boxContext = collectEffectiveRuntimeBoxContext(cfg);
  [
    { key: 'ttLinks', label: 'This-Then', checker: effectiveTTLinkInvalidReason },
    { key: 'howLinks', label: 'How', checker: effectiveHowLinkInvalidReason }
  ].forEach(function (rule) {
    if (!Array.isArray(state[rule.key])) return;
    const removed = [];
    state[rule.key] = state[rule.key].filter(function (link, i) {
      const reason = rule.checker(link, boxContext);
      if (!reason) return true;
      removed.push(link && link.id ? link.id : ('index ' + i));
      return false;
    });
    if (removed.length) pushAutoFix(autoFixes, 'Removed ' + removed.length + ' legacy ' + rule.label + ' link record(s) that the runtime would discard: ' + removed.join(', ') + '.');
  });
}

function stemWord(word) {
  let out = String(word || '').toLowerCase();
  if (out.length > 5 && /ies$/.test(out)) out = out.slice(0, -3) + 'y';
  else if (out.length > 5 && /ing$/.test(out)) out = out.slice(0, -3);
  else if (out.length > 4 && /ed$/.test(out)) out = out.slice(0, -2);
  else if (out.length > 4 && /s$/.test(out)) out = out.slice(0, -1);
  return out;
}

function textWords(value) {
  return normalizeSearchText(String(value || '').replace(/https?:\/\/\S+/gi, ' url '))
    .split(' ')
    .filter(Boolean)
    .map(stemWord);
}

function meaningfulWordSet(value) {
  const stop = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have', 'help', 'helps', 'in', 'is', 'it', 'make', 'makes', 'more', 'of', 'on', 'or', 'that', 'the', 'their', 'this', 'to', 'with', 'work']);
  const out = new Set();
  textWords(value).forEach(function (word) {
    if (word.length >= 3 && !stop.has(word)) out.add(word);
  });
  return out;
}

function setHasAny(left, right) {
  let found = false;
  left.forEach(function (value) {
    if (right.has(value)) found = true;
  });
  return found;
}

function tokenSimilarity(leftText, rightText) {
  const left = meaningfulWordSet(leftText);
  const right = meaningfulWordSet(rightText);
  if (!left.size || !right.size) return 0;
  let common = 0;
  left.forEach(function (value) { if (right.has(value)) common++; });
  return common / Math.max(left.size, right.size);
}

function endpointFrame(text, fromLabel, toLabel) {
  const endpointWords = meaningfulWordSet((fromLabel || '') + ' ' + (toLabel || ''));
  return textWords(text).filter(function (word) {
    return word !== 'url' && !endpointWords.has(word);
  }).join(' ');
}

function linkTextReflectsEndpoint(text, fromLabel, toLabel) {
  const textSet = meaningfulWordSet(text);
  const endpointSet = meaningfulWordSet((fromLabel || '') + ' ' + (toLabel || ''));
  return !endpointSet.size || setHasAny(textSet, endpointSet);
}

function firstMatchingPattern(text, patterns) {
  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].test(text)) return patterns[i].source;
  }
  return '';
}

function validateStrictLinkTextArray(location, kind, links, labels, requireUrl, errors) {
  // V1.4.3 keeps all workflow link annotations blank.
  // This baseline function remains for compatibility-mode checking only.
}

function validateDeferredLinkTextArray(location, kind, links, errors) {
  links.forEach(function (link, i) {
    if (!isPlainObject(link)) return;
    const where = location + '[' + i + ']';
    ['mainText', 'notes1', 'notes2', 'notes3'].forEach(function (field) {
      if (isNonEmptyString(link[field])) {
        errors.push(where + '.' + field + ' must be blank in the V1.4.3 two-step workflow.');
      }
    });
    if (isNonEmptyString(link.light)) errors.push(where + '.light must be blank in the V1.4.3 two-step workflow.');
  });
}

function validateStrictLinkText(cfg, checks, errors) {
  const ttLocations = linkArrayLocations(cfg, 'ttLinks');
  const howLocations = linkArrayLocations(cfg, 'howLinks');
  if (checks.linkDisplayTextRequested !== false) errors.push('generationChecks.linkDisplayTextRequested must be false in Steps 1 and 2');
  if (checks.howLinkDisplayTextRequested !== false) errors.push('generationChecks.howLinkDisplayTextRequested must be false in Steps 1 and 2');
  ttLocations.forEach(function (item) { validateDeferredLinkTextArray(item.name, 'This-Then link', item.links, errors); });
  howLocations.forEach(function (item) { validateDeferredLinkTextArray(item.name, 'How-link', item.links, errors); });
}

function validateBaselineLinkTextArray(location, kind, links, strict, errors, warnings) {
  const seen = Object.create(null);
  links.forEach(function (link, i) {
    if (!isPlainObject(link) || !isNonEmptyString(link.mainText)) return;
    const where = location + '[' + i + ']';
    const text = link.mainText.trim();
    const normalized = normalizeSearchText(text);
    const banned = firstMatchingPattern(text, LINK_TEXT_BANNED_PATTERNS.concat(kind === 'How-link' ? HOW_LINK_TEXT_BANNED_PATTERNS : []));
    if (banned) {
      reportModeIssue(strict, errors, warnings, where + '.mainText contains obvious generic boilerplate (' + banned + '): "' + text + '"');
    }
    if (!seen[normalized]) seen[normalized] = where;
  });
}

function validateBaselineLinkText(cfg, strict, errors, warnings) {
  linkArrayLocations(cfg, 'ttLinks').forEach(function (item) {
    validateBaselineLinkTextArray(item.name, 'This-Then link', item.links, strict, errors, warnings);
  });
  linkArrayLocations(cfg, 'howLinks').forEach(function (item) {
    validateBaselineLinkTextArray(item.name, 'How-link', item.links, strict, errors, warnings);
  });
}

function parseHtmlAttrs(text) {
  const attrs = Object.create(null);
  String(text || '').replace(/([A-Za-z0-9:_-]+)\s*=\s*(["'])(.*?)\2/g, function (_match, name, _quote, value) {
    attrs[name.toLowerCase()] = value;
    return _match;
  });
  return attrs;
}

function normalizeMeasureIdInput(id) {
  const x = String(id || '').trim().toUpperCase();
  const m = x.match(/^M(\d+)$/);
  return m ? 'M' + String(parseInt(m[1], 10)).padStart(3, '0') : x;
}

function normalizeEQIdInput(id) {
  const x = String(id || '').trim().toUpperCase();
  const m = x.match(/^(?:EQ|Q)(\d+)$/);
  return m ? 'EQ' + String(parseInt(m[1], 10)).padStart(3, '0') : x;
}

function isCanonicalMeasureId(id) {
  return /^M\d{3,}$/.test(String(id || ''));
}

function isCanonicalEQId(id) {
  return /^EQ\d{3,}$/.test(String(id || ''));
}

function validateCanonicalIdList(ids, listName, itemLabel, normalizer, isCanonical, strict, errors, warnings) {
  const seen = new Set();
  (Array.isArray(ids) ? ids : []).forEach(function (id, i) {
    const text = String(id || '');
    const where = listName + '[' + i + ']';
    if (!isNonEmptyString(text)) {
      reportModeIssue(strict, errors, warnings, where + ' must be a non-empty ' + itemLabel + ' ID');
      return;
    }
    const normalized = normalizer(text);
    if (!isCanonical(text) || text !== normalized) {
      reportModeIssue(strict, errors, warnings, where + ' uses non-canonical ' + itemLabel + ' ID "' + text + '". Use "' + normalized + '".');
    }
    if (seen.has(normalized)) {
      reportModeIssue(strict, errors, warnings, where + ' duplicates canonical ' + itemLabel + ' ID "' + normalized + '".');
    }
    seen.add(normalized);
  });
}

function validateCanonicalMeasureEvalQuestionIds(cfg, strict, errors, warnings) {
  const state = cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  validateCanonicalIdList(
    (Array.isArray(state.measures) ? state.measures : []).map(function (m) { return m && m.id; }),
    'savedState.measures.id',
    'Measure',
    normalizeMeasureIdInput,
    isCanonicalMeasureId,
    strict,
    errors,
    warnings
  );
  validateCanonicalIdList(
    (Array.isArray(state.evalQuestions) ? state.evalQuestions : []).map(function (q) { return q && q.id; }),
    'savedState.evalQuestions.id',
    'Evaluation Question',
    normalizeEQIdInput,
    isCanonicalEQId,
    strict,
    errors,
    warnings
  );
  const B = isPlainObject(state.B) ? state.B : {};
  Object.keys(B).forEach(function (boxId) {
    const box = B[boxId];
    if (!isPlainObject(box)) return;
    validateCanonicalIdList(box.measures || [], 'savedState.B[' + boxId + '].measures', 'Measure', normalizeMeasureIdInput, isCanonicalMeasureId, strict, errors, warnings);
    validateCanonicalIdList(box.evalQuestions || [], 'savedState.B[' + boxId + '].evalQuestions', 'Evaluation Question', normalizeEQIdInput, isCanonicalEQId, strict, errors, warnings);
  });
  linkArrayLocations(cfg, 'ttLinks').forEach(function (item) {
    item.links.forEach(function (link, i) {
      if (!isPlainObject(link)) return;
      validateCanonicalIdList(link.measures || [], item.name + '[' + i + '].measures', 'Measure', normalizeMeasureIdInput, isCanonicalMeasureId, strict, errors, warnings);
      validateCanonicalIdList(link.evalQuestions || [], item.name + '[' + i + '].evalQuestions', 'Evaluation Question', normalizeEQIdInput, isCanonicalEQId, strict, errors, warnings);
    });
  });
}

function collectCloneSourceKeys(cfg) {
  const pages = effectiveRuntimePages(cfg);
  const linkInfo = collectEffectiveRuntimeLinkInfo(cfg);
  const keys = {
    page_title: new Set(['final']),
    box_title: collectKnownBoxIds(cfg, [], pages),
    box_main_text: collectKnownBoxIds(cfg, [], pages),
    measure: new Set(),
    eval_question: new Set(),
    link: linkInfo.validLinkIds,
    linkInvalidReasons: linkInfo.invalidLinkReasons
  };
  pages.forEach(function (p) { if (p && p.id) keys.page_title.add(p.id); });
  const state = cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  (Array.isArray(state.measures) ? state.measures : []).forEach(function (m) { if (m && m.id) keys.measure.add(m.id); });
  (Array.isArray(state.evalQuestions) ? state.evalQuestions : []).forEach(function (q) { if (q && q.id) keys.eval_question.add(q.id); });
  return keys;
}

function validateDocumentationClones(cfg, checks, strict, errors, warnings) {
  const state = cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  const docContent = isPlainObject(state.docContent) ? state.docContent : {};
  const sourceKeys = collectCloneSourceKeys(cfg);
  const pages = Array.isArray(cfg.subpages) ? cfg.subpages : [];
  const pageLabels = Object.create(null);
  pages.forEach(function (page) {
    if (page && page.id) pageLabels[page.id] = String(page.label || '');
  });
  const cloneClaimRe = /\b(?:clones?|cloned|live references?)\b|data-clone-(?:id|key|type)|doc[\s_-]?clone/i;
  let cloneClaimed = checks.documentationClonesRequested === true;
  let validCloneCount = 0;
  Object.keys(docContent).forEach(function (pageId) {
    const html = String(docContent[pageId] || '');
    if (cloneClaimRe.test((pageLabels[pageId] || '') + ' ' + html)) cloneClaimed = true;
    if (/data-clone-id\s*=/i.test(html)) {
      reportModeIssue(strict, errors, warnings, 'savedState.docContent[' + pageId + '] uses fake Documentation clone syntax data-clone-id. Use an engine-supported <div class="doc-clone" data-clone-type="..." data-clone-key="..."></div> block.');
    }
    html.replace(/<([A-Za-z0-9]+)\b([^>]*)>/g, function (_match, tag, attrText) {
      const attrs = parseHtmlAttrs(attrText);
      const classes = String(attrs.class || '').split(/\s+/);
      if (classes.indexOf('doc-clone') === -1) return _match;
      const type = attrs['data-clone-type'] || '';
      const key = attrs['data-clone-key'] || '';
      if (String(tag).toLowerCase() !== 'div') {
        reportModeIssue(strict, errors, warnings, 'savedState.docContent[' + pageId + '] uses a .doc-clone on <' + tag + '>. Use an engine-supported <div class="doc-clone" ...></div> block.');
      } else if (DOC_CLONE_TYPES.indexOf(type) === -1) {
        reportModeIssue(strict, errors, warnings, 'savedState.docContent[' + pageId + '] has unsupported Documentation clone type: ' + (type || '(missing)'));
      } else if (type === 'measure' && !isCanonicalMeasureId(key)) {
        reportModeIssue(strict, errors, warnings, 'savedState.docContent[' + pageId + '] has non-canonical Measure clone key "' + (key || '(missing)') + '". Use canonical IDs such as M001.');
      } else if (type === 'eval_question' && !isCanonicalEQId(key)) {
        reportModeIssue(strict, errors, warnings, 'savedState.docContent[' + pageId + '] has non-canonical Evaluation Question clone key "' + (key || '(missing)') + '". Use canonical IDs such as EQ001.');
      } else if (type === 'link' && key && sourceKeys.linkInvalidReasons[key]) {
        reportModeIssue(strict, errors, warnings, 'Documentation Page ' + pageId + ' has link clone data-clone-key="' + key + '" but link "' + key + '" is not runtime-valid. ' + sourceKeys.linkInvalidReasons[key]);
      } else if (!key || !sourceKeys[type].has(key)) {
        reportModeIssue(strict, errors, warnings, 'savedState.docContent[' + pageId + '] has Documentation clone key "' + (key || '(missing)') + '" that does not point to a real runtime-surviving ' + type + ' object');
      } else {
        validCloneCount++;
      }
      return _match;
    });
  });
  pages.forEach(function (page) {
    if (page && (page.pageType || 'this_then') === 'documentation' && cloneClaimRe.test(String(page.label || ''))) cloneClaimed = true;
  });
  if (cloneClaimed && !validCloneCount) {
    reportModeIssue(strict, errors, warnings, 'Documentation clones are claimed or requested but no valid engine-supported .doc-clone blocks were found in savedState.docContent');
  }
}

function validateRequestedAttachments(cfg, checks, errors) {
  const state = cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  const B = isPlainObject(state.B) ? state.B : {};
  const knownBoxes = collectKnownBoxIds(cfg, []);
  [
    { flag: 'measuresMustAttachToBoxes', standalone: 'standaloneMeasuresRequested', list: 'measures', field: 'measures', label: 'Measure' },
    { flag: 'evalQuestionsMustAttachToBoxes', standalone: 'standaloneEvalQuestionsRequested', list: 'evalQuestions', field: 'evalQuestions', label: 'Evaluation Question' }
  ].forEach(function (rule) {
    if (checks[rule.flag] !== true || checks[rule.standalone] === true) return;
    const items = Array.isArray(state[rule.list]) ? state[rule.list] : [];
    const itemIds = new Set();
    items.forEach(function (item, i) {
      if (!item || !isNonEmptyString(item.id)) {
        errors.push('savedState.' + rule.list + '[' + i + '] must have an ID for strict attachment validation');
      } else {
        itemIds.add(item.id);
      }
    });
    if (!items.length) {
      errors.push('generationChecks.' + rule.flag + ' is true but no ' + rule.label + ' items were generated');
      return;
    }
    const attached = new Set();
    Object.keys(B).forEach(function (boxId) {
      if (!knownBoxes.has(boxId) || !isPlainObject(B[boxId]) || !Array.isArray(B[boxId][rule.field])) return;
      B[boxId][rule.field].forEach(function (itemId) {
        if (!itemIds.has(itemId)) {
          errors.push('savedState.B[' + boxId + '].' + rule.field + ' points to missing ' + rule.label + ' ID: ' + itemId);
        } else {
          attached.add(itemId);
        }
      });
    });
    itemIds.forEach(function (itemId) {
      if (!attached.has(itemId)) errors.push(rule.label + ' "' + itemId + '" is not attached to any relevant box');
    });
  });
}

function requestedViewOptionAllowed(checks, section, key) {
  const requested = checks.requestedPageViewOptions;
  if (Array.isArray(requested)) return requested.indexOf(section + '.' + key) >= 0;
  if (!isPlainObject(requested)) return false;
  if (Array.isArray(requested[section])) return requested[section].indexOf(key) >= 0;
  return isPlainObject(requested[section]) && requested[section][key] === true;
}

function clearUnrequestedViewOptions(cfg, checks, errors, autoFixes) {
  const state = cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : null;
  if (!state || !isPlainObject(state.viewSettings)) {
    errors.push('savedState.viewSettings is required for strict Page View validation');
    return;
  }
  Object.keys(state.viewSettings).forEach(function (section) {
    const settings = state.viewSettings[section];
    if (!isPlainObject(settings)) return;
    Object.keys(settings).forEach(function (key) {
      if (settings[key] === true && !requestedViewOptionAllowed(checks, section, key)) {
        settings[key] = false;
        pushAutoFix(autoFixes, 'Set unrequested Page View option savedState.viewSettings.' + section + '.' + key + ' to false.');
      }
    });
  });
}

function clearViewFlag(cfg, flag, autoFixes) {
  const state = cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : null;
  if (!state || !isPlainObject(state.viewSettings)) return;
  Object.keys(state.viewSettings).forEach(function (section) {
    const settings = state.viewSettings[section];
    if (isPlainObject(settings) && settings[flag] === true) {
      settings[flag] = false;
      pushAutoFix(autoFixes, 'Set unrequested Page View option savedState.viewSettings.' + section + '.' + flag + ' to false.');
    }
  });
}

function validateUnrequestedBoxDisplayText(cfg, checks, errors) {
  if (checks.boxDisplayTextRequested !== false) return;
  const B = cfg.savedState && isPlainObject(cfg.savedState.B) ? cfg.savedState.B : {};
  Object.keys(B).forEach(function (boxId) {
    if (isPlainObject(B[boxId]) && isNonEmptyString(B[boxId].detailText)) {
      errors.push('savedState.B[' + boxId + '].detailText must be blank or omitted because box Display Text was not requested');
    }
  });
}

function validateUnrequestedTrafficLights(cfg, checks, errors, autoFixes) {
  if (checks.trafficLightsRequested !== false) return;
  clearViewFlag(cfg, 'showTrafficLights', autoFixes);
  const state = cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  const B = isPlainObject(state.B) ? state.B : {};
  Object.keys(B).forEach(function (boxId) {
    if (B[boxId] && isNonEmptyString(B[boxId].light)) errors.push('savedState.B[' + boxId + '].light must be blank or omitted because Traffic Lights were not requested');
  });
  linkArrayLocations(cfg, 'ttLinks').forEach(function (item) {
    item.links.forEach(function (link, i) {
      if (link && isNonEmptyString(link.light)) errors.push(item.name + '[' + i + '].light must be blank or omitted because Traffic Lights were not requested');
    });
  });
  ['measures', 'evalQuestions'].forEach(function (field) {
    (Array.isArray(state[field]) ? state[field] : []).forEach(function (item, i) {
      if (item && isNonEmptyString(item.trafficLight)) errors.push('savedState.' + field + '[' + i + '].trafficLight must be blank or omitted because Traffic Lights were not requested');
    });
  });
}

function validateUnrequestedPriorities(cfg, checks, errors, autoFixes) {
  if (checks.prioritiesRequested !== false) return;
  clearViewFlag(cfg, 'showPriorities', autoFixes);
  const state = cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  const B = isPlainObject(state.B) ? state.B : {};
  Object.keys(B).forEach(function (boxId) {
    if (B[boxId] && isNonEmptyString(B[boxId].priority)) errors.push('savedState.B[' + boxId + '].priority must be blank or omitted because priorities were not requested');
  });
  howPageCopies(cfg).forEach(function (copy) {
    copy.pages.forEach(function (page, i) {
      if (page && page.overviewCard && isNonEmptyString(page.overviewCard.priority)) {
        errors.push(copy.name + '[' + i + '].overviewCard.priority must be blank or omitted because priorities were not requested');
      }
    });
  });
}

const SHAPE_PLAN_ARCHETYPES = [
  'diagnostic-heavy', 'pipeline', 'branching', 'convergent', 'bottleneck',
  'feedback-loop', 'implementation-heavy', 'outcome-integrative', 'simple-linear'
];

function normalizeShapeReason(text) {
  return String(text == null ? '' : text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function shapePlanPagesAsConfig(planPages) {
  return {
    subpages: planPages.map(function (entry) {
      return {
        id: entry.pageId,
        label: entry.pageId,
        pageType: 'this_then',
        cols: (Array.isArray(entry.boxCounts) ? entry.boxCounts : []).map(function (n) {
          return { h: '', boxes: new Array(Number.isInteger(n) && n > 0 ? n : 0).fill('') };
        })
      };
    })
  };
}

// Validates generationChecks.shapePlan: the model's pre-generation shape commitment.
// Returns the context consumed later by the terminal-column and geometry checks
// ({ syntheticLoadTest, hasPlannedPages, exceptionsByPageId }); when shapePlan is
// present these structured fields are authoritative and the prose-sniffing regexes
// are ignored.
function validateShapePlan(cfg, plan, errors, warnings) {
  const context = { syntheticLoadTest: false, hasPlannedPages: false, exceptionsByPageId: Object.create(null) };
  if (!isPlainObject(plan)) {
    errors.push('generationChecks.shapePlan must be an object when present');
    return context;
  }
  context.hasPlannedPages = Array.isArray(plan.pages) && plan.pages.length > 0;
  const errorsBefore = errors.length;
  if (plan.syntheticLoadTest !== undefined && typeof plan.syntheticLoadTest !== 'boolean') {
    errors.push('generationChecks.shapePlan.syntheticLoadTest must be true or false when present');
  }
  context.syntheticLoadTest = plan.syntheticLoadTest === true;

  const analysis = shapeMetrics.analyzeShapes(cfg);
  const actualById = Object.create(null);
  analysis.pages.forEach(function (p) { if (p.id) actualById[p.id] = p; });

  const plannedIds = Object.create(null);
  if (plan.pages === undefined) {
    if (!context.syntheticLoadTest) {
      errors.push('generationChecks.shapePlan.pages is required (one entry per This–Then Page) unless shapePlan.syntheticLoadTest is true');
    }
  } else if (!Array.isArray(plan.pages)) {
    errors.push('generationChecks.shapePlan.pages must be an array');
  } else {
    plan.pages.forEach(function (entry, i) {
      const where = 'generationChecks.shapePlan.pages[' + i + ']';
      if (!isPlainObject(entry)) {
        errors.push(where + ' must be an object');
        return;
      }
      if (!isNonEmptyString(entry.pageId)) {
        errors.push(where + '.pageId must name a This–Then Page id');
        return;
      }
      if (plannedIds[entry.pageId]) {
        errors.push(where + ' duplicates the shapePlan entry for page ' + entry.pageId);
        return;
      }
      plannedIds[entry.pageId] = true;
      const actual = actualById[entry.pageId];
      if (!actual) {
        errors.push(where + '.pageId does not match any This–Then Page in the config: ' + entry.pageId);
      }
      if (SHAPE_PLAN_ARCHETYPES.indexOf(entry.archetype) === -1) {
        errors.push(where + '.archetype must be one of: ' + SHAPE_PLAN_ARCHETYPES.join(', '));
      }
      const columnsValid = Number.isInteger(entry.columns) && entry.columns >= 1;
      if (!columnsValid) errors.push(where + '.columns must be a positive integer');
      const boxCountsValid = Array.isArray(entry.boxCounts) && entry.boxCounts.length > 0 && entry.boxCounts.every(function (n) { return Number.isInteger(n) && n >= 0; });
      if (!boxCountsValid) errors.push(where + '.boxCounts must be an array of non-negative integers (boxes per column, left to right)');
      if (columnsValid && boxCountsValid && entry.boxCounts.length !== entry.columns) {
        errors.push(where + '.boxCounts has ' + entry.boxCounts.length + ' entries but columns is ' + entry.columns + '; they must agree');
      }
      if (!isNonEmptyString(entry.shapeReason) || !normalizeShapeReason(entry.shapeReason)) {
        errors.push(where + '.shapeReason must give one or two sentences of domain reasoning for this page shape');
      }
      if (actual && columnsValid && boxCountsValid) {
        if (entry.columns !== actual.columnCount || entry.boxCounts.join('-') !== actual.boxCounts.join('-')) {
          errors.push('shapePlan mismatch for This–Then Page "' + actual.label + '" (' + entry.pageId + '): planned ' + entry.columns + ' columns [' + entry.boxCounts.join('-') + '] but the config has ' + actual.columnCount + ' columns [' + actual.boxCounts.join('-') + ']. The config must match the committed shapePlan exactly — rebuild the page from the plan, or update the plan from domain reasoning first');
        }
      }
    });
    analysis.pages.forEach(function (p) {
      if (!p.id || plannedIds[p.id]) return;
      errors.push('This–Then Page "' + p.label + '" (' + p.id + ') has no generationChecks.shapePlan.pages entry; every This–Then Page must be planned before generation');
    });
  }

  if (plan.terminalColumnExceptions !== undefined) {
    if (!Array.isArray(plan.terminalColumnExceptions)) {
      errors.push('generationChecks.shapePlan.terminalColumnExceptions must be an array when present');
    } else {
      plan.terminalColumnExceptions.forEach(function (ex, i) {
        const where = 'generationChecks.shapePlan.terminalColumnExceptions[' + i + ']';
        if (!isPlainObject(ex)) {
          errors.push(where + ' must be an object');
          return;
        }
        if (!isNonEmptyString(ex.pageId)) {
          errors.push(where + '.pageId must name a This–Then Page id');
          return;
        }
        const actual = actualById[ex.pageId];
        if (!actual) {
          errors.push(where + '.pageId does not match any This–Then Page in the config: ' + ex.pageId);
          return;
        }
        if (context.exceptionsByPageId[ex.pageId]) {
          errors.push(where + ' duplicates the terminal-column exception for page ' + ex.pageId);
          return;
        }
        if (!Number.isInteger(ex.terminalBoxes) || ex.terminalBoxes < 1) {
          errors.push(where + '.terminalBoxes must be a positive integer');
          return;
        }
        if (ex.terminalBoxes !== actual.terminalBoxes) {
          errors.push(where + ' declares ' + ex.terminalBoxes + ' terminal boxes but page "' + actual.label + '" has ' + actual.terminalBoxes + '; the exception must describe the page as built');
          return;
        }
        if (!isNonEmptyString(ex.reason) || !normalizeShapeReason(ex.reason)) {
          errors.push(where + '.reason must give the genuine domain reason for the overloaded terminal column');
          return;
        }
        if (actual.terminalBoxes <= 3) {
          warn(warnings, where + ' is unnecessary: page "' + actual.label + '" has only ' + actual.terminalBoxes + ' terminal boxes');
        }
        context.exceptionsByPageId[ex.pageId] = { terminalBoxes: ex.terminalBoxes, reason: ex.reason };
      });
    }
  }

  const structuralOk = errors.length === errorsBefore;
  if (structuralOk && Array.isArray(plan.pages) && plan.pages.length && !context.syntheticLoadTest) {
    // Repetition is caught on the ~20-line plan itself, where it is cheap to fix.
    // Terminal-column findings are excluded here: terminal policy is governed by
    // the structured exceptions in warnTerminalColumnOverload.
    const planAnalysis = shapeMetrics.analyzeShapes(shapePlanPagesAsConfig(plan.pages));
    planAnalysis.findings.forEach(function (f) {
      if (f.severity !== 'fail') return;
      if (f.id.indexOf('terminal-') === 0) return;
      errors.push('shapePlan structural check failed (' + f.id + '): ' + f.message + (f.pages && f.pages.length ? ' Pages: ' + f.pages.join(', ') : ''));
    });

    const n = plan.pages.length;
    if (n >= 4) {
      const archetypeGroups = Object.create(null);
      plan.pages.forEach(function (entry) {
        if (!archetypeGroups[entry.archetype]) archetypeGroups[entry.archetype] = [];
        archetypeGroups[entry.archetype].push(entry);
      });
      Object.keys(archetypeGroups).forEach(function (archetype) {
        const group = archetypeGroups[archetype];
        if (group.length / n <= 0.6) return;
        const seenReasons = Object.create(null);
        const repeated = [];
        group.forEach(function (entry) {
          const key = normalizeShapeReason(entry.shapeReason);
          if (seenReasons[key]) repeated.push(entry.pageId);
          seenReasons[key] = true;
        });
        if (repeated.length) {
          errors.push('shapePlan archetype check failed: archetype "' + archetype + '" covers ' + group.length + ' of ' + n + ' planned This–Then Pages and the shapeReasons for ' + repeated.join(', ') + ' repeat the reasoning of another page. Pages sharing a dominant archetype must be justified by genuinely different domain logic — restructure the pages or record page-specific reasons');
        }
      });
    }
  }

  return context;
}

function normalizedStringSet(values) {
  return new Set((Array.isArray(values) ? values : []).map(function (value) { return String(value); }));
}

function sameStringSet(left, right) {
  if (left.size !== right.size) return false;
  let same = true;
  left.forEach(function (value) { if (!right.has(value)) same = false; });
  return same;
}

function howAuditExceptionProblem(reason, source) {
  if (!isNonEmptyString(reason)) return 'is missing';
  const normalized = normalizeSearchText(reason);
  const ref = normalizeSearchText(source.ref);
  const label = normalizeSearchText(source.label);
  const namesSource = (ref && normalized.indexOf(ref) >= 0) || (label && normalized.indexOf(label) >= 0);
  if (!namesSource) return 'must name the source by its box reference or full label';
  let explanation = normalized;
  if (ref) explanation = explanation.split(ref).join(' ');
  if (label) explanation = explanation.split(label).join(' ');
  explanation = explanation.replace(/\s+/g, ' ').trim();
  const meaningful = explanation.split(' ').filter(function (word) {
    return word.length >= 3 && ['and', 'are', 'because', 'for', 'from', 'has', 'have', 'into', 'not', 'that', 'the', 'this', 'with'].indexOf(word) === -1;
  });
  if (meaningful.length < 6) return 'must give a substantive source-specific explanation, not a blanket phrase';
  if (/^(?:has |have )?(?:no|none|not any) (?:relevant|appropriate|suitable|valid|direct) (?:target|targets|link|links|relationship|relationships)(?: were accepted| apply| exist)?$/.test(explanation)) {
    return 'uses a blanket no-relevant-links phrase';
  }
  return '';
}

function validateHowLinkGenerationAudit(cfg, checks, errors, warnings) {
  const audit = checks.howLinkAudit;
  if (!isPlainObject(audit)) {
    errors.push('How-link audit declaration failure: generationChecks.howLinkAudit is required in strict-generated input and must be an object. Repeat the candidate audit for every How source before rebuilding.');
    return;
  }
  if (typeof audit.requested !== 'boolean') {
    errors.push('How-link audit declaration failure: generationChecks.howLinkAudit.requested must be a boolean. Repeat the candidate audit and record whether How links were requested.');
    return;
  }
  if (!Array.isArray(audit.sources)) {
    errors.push('How-link audit declaration failure: generationChecks.howLinkAudit.sources must be an array. Repeat the candidate audit and declare one record per actual How Box when requested.');
    return;
  }

  const analysis = howLinkMetrics.analyzeHowLinks(cfg);
  if (audit.requested === false) {
    if (audit.sources.length) {
      errors.push('How-link audit declaration failure: requested is false, so generationChecks.howLinkAudit.sources must be empty. Repeat the request check rather than declaring unrequested links.');
    }
    if (analysis.totals.howLinkCount) {
      errors.push('How-link request failure: requested is false but savedState.howLinks contains ' + analysis.totals.howLinkCount + ' generated link(s). Remove those generated links and repeat the request check.');
    }
    return;
  }

  const actualByRef = Object.create(null);
  analysis.sources.forEach(function (source) { actualByRef[source.ref] = source; });
  const declaredByRef = Object.create(null);
  const validReasonByRef = Object.create(null);

  audit.sources.forEach(function (record, index) {
    const where = 'generationChecks.howLinkAudit.sources[' + index + ']';
    if (!isPlainObject(record)) {
      errors.push('How-link audit declaration failure: ' + where + ' must be an object. Repeat the candidate audit and declare from plus acceptedTargets.');
      return;
    }
    if (!isNonEmptyString(record.from)) {
      errors.push('How-link audit declaration failure: ' + where + '.from must name an actual How Box reference. Repeat the candidate audit for the missing source.');
      return;
    }
    if (declaredByRef[record.from]) {
      errors.push('How-link audit declaration failure: duplicate record for source ' + record.from + '. Keep exactly one declaration per actual How Box.');
      return;
    }
    declaredByRef[record.from] = record;
    const source = actualByRef[record.from];
    if (!source) {
      errors.push('How-link audit declaration failure: ' + where + '.from does not name an actual effective How Box: ' + record.from + '. Repeat the audit against the effective runtime pages.');
      return;
    }
    if (!Array.isArray(record.acceptedTargets)) {
      errors.push('How-link audit declaration failure: ' + where + '.acceptedTargets must be an array of accepted applicable-layer target references.');
      return;
    }
    const targetValuesValid = record.acceptedTargets.every(function (target) { return isNonEmptyString(target); });
    if (!targetValuesValid) {
      errors.push('How-link audit declaration failure: ' + where + '.acceptedTargets must contain only non-empty target references.');
    }
    const declaredSet = normalizedStringSet(record.acceptedTargets);
    if (declaredSet.size !== record.acceptedTargets.length) {
      errors.push('How-link duplicate declaration failure: ' + where + '.acceptedTargets contains a duplicate target. Repeat the candidate audit and record each accepted relationship once.');
    }
    const candidateSet = normalizedStringSet(source.candidateTargets);
    declaredSet.forEach(function (target) {
      if (!candidateSet.has(target)) {
        errors.push('How-link audit declaration failure: ' + where + ' declares ' + target + ', which is not in the builder-derived applicable layer (' + source.applicableTargetLayer.label + '). Do not duplicate Cross-Links or indirect targets in acceptedTargets.');
      }
    });
    const actualSet = normalizedStringSet(source.applicableTargets);
    if (!sameStringSet(declaredSet, actualSet)) {
      errors.push('How-link audit/graph mismatch for ' + source.ref + ': declared applicable targets [' + Array.from(declaredSet).sort().join(', ') + '] but the final savedState.howLinks graph contains [' + Array.from(actualSet).sort().join(', ') + ']. Repeat the source-to-every-candidate audit and serialize exactly the accepted applicable-layer relationships; do not merely increase link counts.');
    }
    if (record.exceptionReason !== undefined) {
      const problem = howAuditExceptionProblem(record.exceptionReason, source);
      if (problem) {
        errors.push('How-link exception declaration failure for ' + source.ref + ': exceptionReason ' + problem + '. Give the genuine source-specific reason after repeating the candidate audit.');
      } else {
        validReasonByRef[source.ref] = true;
      }
    }
  });

  analysis.sources.forEach(function (source) {
    const record = declaredByRef[source.ref];
    if (!record) {
      errors.push('How-link missing audit record for ' + source.ref + ' ("' + source.label + '"). Repeat the candidate audit and add one declaration for every actual How Box.');
      return;
    }
    if (source.candidateTargetCount > 0 && source.applicableDegree === 0 && !validReasonByRef[source.ref]) {
      errors.push('How-link missing mapping declaration failure for ' + source.ref + ': ' + source.candidateTargetCount + ' candidates exist in ' + source.applicableTargetLayer.label + ', but no direct target was accepted and no valid source-specific exceptionReason was supplied. Repeat the source-to-every-candidate audit; do not satisfy this by applying a quota or merely increasing counts.');
    }
  });

  if (analysis.duplicatePairs.length) {
    errors.push('How-link duplicate graph failure: savedState.howLinks contains ' + analysis.duplicatePairs.length + ' duplicate source-target pair(s): ' + analysis.duplicatePairs.map(function (pair) { return pair.from + '→' + pair.to; }).join(', ') + '. Repeat the candidate audit and serialize each accepted relationship once.');
  }
  if (analysis.shallowerToDeeperLinks.length) {
    errors.push('How-link direction failure: ' + analysis.shallowerToDeeperLinks.length + ' adjacent numbered link(s) run from a shallower level to a deeper level. Level 2 sources must point to Level 1, and deeper sources must point to the adjacent higher layer; reverse the audit direction and repeat the candidate comparison rather than increasing counts.');
  }
  analysis.groups.forEach(function (group) {
    if (group.reverseSubstituteLinks.length) {
      errors.push('How-link reverse-substitute failure for How Level ' + group.howLevel + ': reverse links from Level ' + (group.howLevel - 1) + ' reach the deeper layer while its sources have no applicable Level ' + group.howLevel + '→Level ' + (group.howLevel - 1) + ' mapping. Repeat the deeper-source candidate audit; Level ' + (group.howLevel - 1) + '→Level ' + group.howLevel + ' does not satisfy it.');
    }
    if (!group.mechanicalLowDegree) return;
    warn(warnings, 'How-link mechanical-pattern warning for ' + group.pageLabel + ': ' + group.modalSourceCount + ' of ' + group.sourceCount + ' sources share applicable-layer degree ' + group.modalApplicableDegree + ' across ' + group.candidateTargetCount + ' candidates. Structural checks cannot prove semantic completeness; human/domain review remains required.');
    const unexcepted = group.mechanicalSourceRefs.filter(function (ref) { return !validReasonByRef[ref]; });
    if (unexcepted.length) {
      errors.push('How-link mechanical-pattern failure for ' + group.pageLabel + ': the mechanically sparse pattern affects sources without validated source-specific exceptionReason values (' + unexcepted.join(', ') + '). Repeat each source-to-every-candidate audit and explain genuine restrained decisions; do not respond by imposing or raising a link quota.');
    }
  });

  const level2TokenSources = analysis.deeperOnlyToThisThenSources.filter(function (ref) {
    return actualByRef[ref] && actualByRef[ref].howLevel === 2;
  });
  if (level2TokenSources.length) {
    errors.push('How-link Level 2 token-mapping failure: Level 1 exists, but these Level 2 sources map to This–Then boxes and have no accepted Level 2→Level 1 relationship: ' + level2TokenSources.join(', ') + '. Level 2→This–Then does not satisfy the Level 2 audit; repeat the Level 2-to-every-Level-1 candidate comparison rather than adding token links.');
  }
}

function stableJsonValue(value) {
  if (Array.isArray(value)) return value.map(stableJsonValue);
  if (isPlainObject(value)) {
    const out = {};
    Object.keys(value).sort().forEach(function (key) { out[key] = stableJsonValue(value[key]); });
    return out;
  }
  return value;
}

function stableDigest(value) {
  return 'sha256:' + crypto.createHash('sha256').update(JSON.stringify(stableJsonValue(value))).digest('hex');
}

function stripLinkExplanationFields(link) {
  const out = cloneJson(link || {});
  delete out.mainText;
  delete out.notes1;
  delete out.notes2;
  delete out.notes3;
  delete out.light;
  return out;
}

function workflowDigestConfig(cfg, includeHowGraph) {
  const out = cloneJson(cfg || {});
  delete out.generationChecks;
  delete out.builderValidation;
  const stripArray = function (links) {
    return Array.isArray(links) ? links.map(stripLinkExplanationFields) : links;
  };
  if (out.savedState && isPlainObject(out.savedState)) {
    out.savedState.ttLinks = stripArray(out.savedState.ttLinks);
    if (includeHowGraph) {
      out.savedState.howLinks = stripArray(out.savedState.howLinks);
    } else {
      delete out.savedState.howLinks;
      delete out.savedState.howLinkNextId;
    }
    // Workflow digests ignore annotation-only fields for compatibility.
    if (isPlainObject(out.savedState.viewSettings) && isPlainObject(out.savedState.viewSettings.thisThen)) {
      out.savedState.viewSettings.thisThen.showTrafficLights = false;
      out.savedState.viewSettings.thisThen.showMainText = false;
      out.savedState.viewSettings.thisThen.showFullMainText = false;
      out.savedState.viewSettings.thisThen.showLinkInfoOnHover = false;
    }
  }
  if (Array.isArray(out.ttLinks)) out.ttLinks = stripArray(out.ttLinks);
  if (includeHowGraph) {
    if (Array.isArray(out.howLinks)) out.howLinks = stripArray(out.howLinks);
  } else {
    delete out.howLinks;
  }
  return out;
}

function workflowStructureDigest(cfg) {
  return stableDigest(workflowDigestConfig(cfg, false));
}

function workflowMappingDigest(cfg) {
  return stableDigest(workflowDigestConfig(cfg, true));
}

function stripLinkEvidenceFields(link) {
  const out = cloneJson(link || {});
  delete out.mainText;
  delete out.notes1;
  delete out.notes2;
  delete out.notes3;
  delete out.light;
  return out;
}

function workflowEvidenceDigest(cfg) {
  const out = cloneJson(cfg || {});
  delete out.generationChecks;
  delete out.builderValidation;
  return stableDigest(out);
}


function evidenceLinkKey(link) {
  return link && link.id ? 'this-then:' + link.id : '';
}

function evidenceAnnotationDigest(link) {
  return stableDigest({
    mainText: String(link && link.mainText || ''),
    notes1: String(link && link.notes1 || ''),
    notes2: String(link && link.notes2 || ''),
    notes3: String(link && link.notes3 || ''),
    light: String(link && link.light || '')
  });
}

function thisThenLinkLookup(cfg) {
  const lookup = Object.create(null);
  const state = cfg && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  (Array.isArray(state.ttLinks) ? state.ttLinks : []).forEach(function (link) {
    const key = evidenceLinkKey(link);
    if (key) lookup[key] = link;
  });
  return lookup;
}

function priorEvidenceHistory(previousValidation) {
  const history = previousValidation && Array.isArray(previousValidation.evidenceReviewHistory)
    ? previousValidation.evidenceReviewHistory : [];
  return history.filter(function (entry) {
    return isPlainObject(entry) && isNonEmptyString(entry.linkKey) && isNonEmptyString(entry.annotationDigest);
  });
}


function validateWorkflowStep(cfg, checks, previousValidation, errors) {
  const step = checks.workflowStep;
  if (WORKFLOW_STEPS.indexOf(step) === -1) {
    errors.push('generationChecks.workflowStep is required and must be one of: ' + WORKFLOW_STEPS.join(', '));
    return '';
  }

  const state = cfg && cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  const howLinks = Array.isArray(state.howLinks) ? state.howLinks : [];
  const audit = checks.howLinkAudit;

  if (step === WORKFLOW_STEP_1) {
    if (howLinks.length) errors.push('Step 1 must contain no How links');
    if (!isPlainObject(audit) || audit.requested !== false) errors.push('Step 1 requires generationChecks.howLinkAudit.requested: false');
    return step;
  }

  if (!isPlainObject(previousValidation) || previousValidation.mode !== 'strict-generated') {
    errors.push('Step 2 must start from canonical strict-generated JSON from the accepted Step 1 build, including its builderValidation stamp');
    return step;
  }
  if ([WORKFLOW_STEP_1, WORKFLOW_STEP_2].indexOf(previousValidation.workflowStep) === -1) {
    errors.push('Step 2 input must carry a Step 1 or Step 2 builderValidation stamp');
  }
  if (!isPlainObject(previousValidation.step1CausalReviewHistory)) {
    errors.push('Step 2 input stamp is missing step1CausalReviewHistory. V1.4.3 must preserve the accepted Step 1 causal-review record.');
  }
  if (!isNonEmptyString(previousValidation.structureDigest)) {
    errors.push('Step 2 input stamp is missing structureDigest');
  } else if (workflowStructureDigest(cfg) !== previousValidation.structureDigest) {
    errors.push('Step 2 frozen-structure failure: pages, boxes, This-Then links, outcomes, measures, evaluation questions, sources, documentation or non-mapping settings differ from the accepted Step 1 structure');
  }
  if (!isPlainObject(audit) || audit.requested !== true) errors.push('Step 2 requires generationChecks.howLinkAudit.requested: true');
  return step;
}

function containsObsoleteDoViewBoardsUrl(value) {
  try { return JSON.stringify(value).includes(OBSOLETE_DOVIEW_BOARDS_URL); } catch (_e) { return false; }
}

function validateNoObsoleteDoViewBoardsUrl(value, where, errors) {
  if (containsObsoleteDoViewBoardsUrl(value)) {
    errors.push(where + ' contains the obsolete DoView Boards URL. Replace it with https://doviewplanning.org/doviewboards.');
  }
}

function runGenerationPreflight(cfg) {
  const out = cloneJson(cfg);
  const errors = [];
  const warnings = [];
  const autoFixes = [];
  const hasChecks = out.generationChecks !== undefined;
  const checks = hasChecks && isPlainObject(out.generationChecks) ? out.generationChecks : {};
  const strict = hasChecks && isPlainObject(out.generationChecks);
  const previousValidation = isPlainObject(out.builderValidation) ? cloneJson(out.builderValidation) : null;
  validateNoObsoleteDoViewBoardsUrl(out, 'Input board configuration', errors);
  let workflowStep = '';
  if (hasChecks && !isPlainObject(out.generationChecks)) {
    errors.push('generationChecks must be an object when present');
  }
  if (strict) workflowStep = validateWorkflowStep(out, checks, previousValidation, errors);
  if (Object.prototype.hasOwnProperty.call(out, 'builderValidation')) {
    delete out.builderValidation;
    pushAutoFix(autoFixes, strict
      ? 'Removed input builderValidation metadata after validating the V1.4.3 workflow transition. The builder creates a fresh validation stamp only after validation passes.'
      : 'Removed input builderValidation metadata. The compatibility rebuild creates a fresh validation stamp.');
  }

  enforceNoLevelHowPages(out, checks, strict, errors, warnings, autoFixes);
  validateUniqueNumberedHowLevels(out, errors);
  validateEffectivePageStateConsistency(out, strict, errors, warnings);
  validateCanonicalMeasureEvalQuestionIds(out, strict, errors, warnings);
  validateBaselineLinkText(out, strict, errors, warnings);
  validateRuntimeSurvivingLinks(out, strict, errors, warnings);
  if (!strict) removeRuntimeInvalidLinks(out, autoFixes);
  validateDocumentationClones(out, checks, strict, errors, warnings);
  let shapePlanContext = null;
  let competencyReviewContext = { denseSourceCount: 0, denseTargetCount: 0, overallDensity: 0 };
  let mappingBreadthContext = { broadSourceRefs: [] };
  let linkReviewContext = { questionableLinkCount: 0 };
  let linkExplanationContext = { overPreferredLimitCount: 0 };
  let linkEvidenceContext = { batchReviewedLinkCount: 0, reviewedLinkCount: 0, evidenceUrlCount: 0, trafficLightCounts: { green: 0, amber: 0, red: 0 }, history: [] };
  let causalReviewContext = { questionableLinkCount: 0, crossPageLinkCount: 0, denseAdjacentPairCount: 0, semanticRiskLinkCount: 0, crossPageLinkIds: [], denseAdjacentPairKeys: [], semanticRiskLinkIds: [], questionableLinkIds: [], zeroIssuesRationale: '' };
  let selfReviewContext = { correctionsApplied: [], deferredJudgementItems: [], chatHandoff: null };
  let graphValidationContext = { errors: [], warnings: [], metrics: {} };
  if (strict) {
    graphValidationContext = graphValidation.analyze(out);
    graphValidationContext.errors.forEach(function (message) { errors.push('Deterministic graph validation: ' + message); });
    graphValidationContext.warnings.forEach(function (message) { warnings.push('Deterministic graph validation: ' + message); });
    if (typeof checks.standardDocumentationPlanRequested !== 'boolean') errors.push('generationChecks.standardDocumentationPlanRequested must be true for the standard three-page Documentation plan or false when the user explicitly requests a different Documentation setup.');
    validateStrictLinkText(out, checks, errors);
    validateRequestedAttachments(out, checks, errors);
    if (checks.allPageViewOptionsOffUnlessRequested === true) clearUnrequestedViewOptions(out, checks, errors, autoFixes);
    validateUnrequestedBoxDisplayText(out, checks, errors);
    validateUnrequestedTrafficLights(out, checks, errors, autoFixes);
    validateUnrequestedPriorities(out, checks, errors, autoFixes);
    if (checks.shapePlan !== undefined) shapePlanContext = validateShapePlan(out, checks.shapePlan, errors, warnings);
    validateHowLinkGenerationAudit(out, checks, errors, warnings);
    competencyReviewContext = validateCompetencyMappingReview(out, checks, errors, warnings);
    mappingBreadthContext = validateMappingBreadthReview(out, checks, errors);
    causalReviewContext = validateThisThenCausalReview(out, checks, errors);
    linkReviewContext = validateLinkCredibilityReview(out, checks, errors);
    linkExplanationContext = validateLinkExplanationReview(out, checks, errors);
    linkEvidenceContext = validateLinkEvidenceReview(out, checks, previousValidation, errors);
    selfReviewContext = validateGeneratorSelfReview(out, checks, graphValidationContext, errors);
  } else {
    warn(warnings, 'generationChecks metadata is absent; compatibility mode ran high-confidence baseline checks but skipped request-specific strict checks.');
  }
  return { cfg: out, errors: errors, warnings: warnings, autoFixes: autoFixes, mode: strict ? 'strict-generated' : 'compatibility', shapePlan: shapePlanContext, workflowStep: workflowStep, competencyReview: competencyReviewContext, mappingBreadthReview: mappingBreadthContext, linkCredibilityReview: linkReviewContext, linkExplanationReview: linkExplanationContext, linkEvidenceReview: linkEvidenceContext, thisThenCausalReview: causalReviewContext, generatorSelfReview: selfReviewContext, previousValidation: previousValidation, standardDocumentationPlanRequested: strict ? checks.standardDocumentationPlanRequested === true : false, graphValidation: graphValidationContext };
}

function stripBuilderOnlyMetadata(cfg) {
  const out = cloneJson(cfg);
  delete out.generationChecks;
  return out;
}


function visibleWordCount(value) {
  return String(value || '').trim().split(/\s+/).filter(Boolean).length;
}

function validateCompactBoardLabels(cfg, strict, errors, warnings) {
  const pages = effectiveRuntimePages(cfg);
  pages.forEach(function (page, pi) {
    if (!page) return;
    const type = page.pageType || 'this_then';
    if (type === 'this_then' && Array.isArray(page.cols)) {
      page.cols.forEach(function (col, ci) {
        (col && Array.isArray(col.boxes) ? col.boxes : []).forEach(function (box, bi) {
          const label = boxLabelValue(box);
          if (!isNonEmptyString(label)) return;
          const where = 'This-Then box ' + (page.id || pi) + '-c' + ci + '-b' + bi;
          const words = visibleWordCount(label);
          if (COMPACT_LABEL_AUXILIARY_RE.test(label)) {
            reportModeIssue(strict, errors, warnings, where + ' uses sentence-like auxiliary wording: "' + label + '". Rewrite as compact DoView wording, for example "Pressures understood" rather than "Pressures are understood".');
          }
          if (words > 12) {
            reportModeIssue(strict, errors, warnings, where + ' has ' + words + ' words: "' + label + '". Visible box labels should normally be 3-8 words and must not exceed 12 words without a genuinely unavoidable technical term.');
          } else if (words > 8) {
            warn(warnings, where + ' has ' + words + ' words. Confirm every word is necessary in the small visual box: "' + label + '".');
          }
        });
      });
    }
    if (type === 'how' && Array.isArray(page.howBoxes)) {
      page.howBoxes.forEach(function (box, bi) {
        if (!box || !isNonEmptyString(box.label)) return;
        const words = visibleWordCount(box.label);
        const where = 'How Box ' + (page.id || pi) + '-' + (box.id || bi);
        if (words > 12) {
          reportModeIssue(strict, errors, warnings, where + ' has ' + words + ' words: "' + box.label + '". Group related work and use a compact workstream, function or competency label.');
        } else if (words > 9) {
          warn(warnings, where + ' has ' + words + ' words. Confirm it is not combining several separate How Boxes: "' + box.label + '".');
        }
      });
    }
  });
}

function validateStandardDocumentationPlan(cfg, strict, enforceStandard, errors, warnings) {
  const pages = effectiveRuntimePages(cfg);
  const docs = pages.filter(function (page) { return page && (page.pageType || 'this_then') === 'documentation'; });
  if (!strict) {
    if (enforceStandard && docs.length !== 3) warn(warnings, 'Standard proof-of-concept boards now use exactly three Documentation Pages; this compatibility board has ' + docs.length + '.');
    return;
  }
  if (!enforceStandard) return;
  if (docs.length !== 3) {
    errors.push('Standard V1.4.3 boards require exactly three Documentation Pages: one combined purpose/scope/assumptions/sources/cautions page, one illustrative monitoring and evaluation plan, and the package-controlled "' + CANONICAL_DISCLAIMER_TITLE + '" page. Found ' + docs.length + '.');
    return;
  }
  const canonical = docs.filter(isCanonicalDisclaimerPage);
  if (canonical.length !== 1) errors.push('Exactly one Documentation Page must be titled "' + CANONICAL_DISCLAIMER_TITLE + '".');
  const me = docs.filter(function (page) { return /monitoring.*evaluation|evaluation.*monitoring|\bm\s*&\s*e\b/i.test(String(page.label || '')); });
  if (me.length !== 1) errors.push('Exactly one Documentation Page must be the illustrative monitoring and evaluation plan.');
  const other = docs.filter(function (page) { return !isCanonicalDisclaimerPage(page) && me.indexOf(page) === -1; });
  if (other.length !== 1) return;
  const state = cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  const html = isPlainObject(state.docContent) ? String(state.docContent[other[0].id] || '') : '';
  const combined = (String(other[0].label || '') + ' ' + html).toLowerCase();
  const checks = [ /purpose/, /scope/, /assumption/, /source/, /caution|limitation|uncertaint/ ];
  const hits = checks.filter(function (rx) { return rx.test(combined); }).length;
  if (hits < 4) {
    errors.push('The non-M&E Documentation Page must combine board purpose, scope, assumptions, sources and cautions/limitations rather than splitting those topics across extra pages.');
  }
}

function howBoxMetadata(cfg) {
  const records = [];
  effectiveRuntimePages(cfg).forEach(function (page) {
    if (!page || (page.pageType || 'this_then') !== 'how' || !Array.isArray(page.howBoxes)) return;
    page.howBoxes.forEach(function (box) {
      if (!box || !box.id) return;
      records.push({
        ref: page.id + '-' + box.id,
        label: String(box.label || ''),
        pageId: page.id,
        pageLabel: String(page.label || ''),
        howLevel: numberedHowLevelValue(page.howLevel),
        competency: page.howLevel === null && COMPETENCY_HOW_PAGE_RE.test(String(page.label || ''))
      });
    });
  });
  return records;
}

function reviewExceptionMap(entries, where, errors) {
  const map = Object.create(null);
  if (entries === undefined) return map;
  if (!Array.isArray(entries)) {
    errors.push(where + ' must be an array');
    return map;
  }
  entries.forEach(function (entry, i) {
    const itemWhere = where + '[' + i + ']';
    if (!isPlainObject(entry) || !isNonEmptyString(entry.ref) || !isNonEmptyString(entry.reason)) {
      errors.push(itemWhere + ' must contain non-empty ref and reason fields');
      return;
    }
    if (visibleWordCount(entry.reason) < 8) {
      errors.push(itemWhere + '.reason must give a substantive case-specific explanation, not a short blanket phrase');
      return;
    }
    map[entry.ref] = entry.reason.trim();
  });
  return map;
}

function validateCompetencyMappingReview(cfg, checks, errors, warnings) {
  const step = checks.workflowStep;
  const review = checks.competencyMappingReview;
  if (step === WORKFLOW_STEP_1) {
    if (review !== undefined && (!isPlainObject(review) || review.requested !== false)) errors.push('Step 1 generationChecks.competencyMappingReview, when supplied, must use requested: false');
    return { denseSourceCount: 0, denseTargetCount: 0, overallDensity: 0, targetCount: 0, uniformDegreePattern: false, targetMode: '', permittedTargetRefs: [] };
  }
  if (!isPlainObject(review) || review.requested !== true) {
    errors.push('Step 2 requires generationChecks.competencyMappingReview with requested: true and targetMode set to level-1-only-default or user-defined.');
    return { denseSourceCount: 0, denseTargetCount: 0, overallDensity: 0, targetCount: 0, uniformDegreePattern: false, targetMode: '', permittedTargetRefs: [] };
  }
  const mode = String(review.targetMode || '');
  if (mode !== 'level-1-only-default' && mode !== 'user-defined') errors.push('generationChecks.competencyMappingReview.targetMode must be level-1-only-default or user-defined');
  if (mode === 'user-defined' && (!isNonEmptyString(review.userOverrideReason) || visibleWordCount(review.userOverrideReason) < 8)) {
    errors.push('A user-defined competency target arrangement requires a substantive userOverrideReason recording the user setup choice.');
  }
  const sourceExceptions = reviewExceptionMap(review.sourceExceptions || [], 'generationChecks.competencyMappingReview.sourceExceptions', errors);
  const targetExceptions = reviewExceptionMap(review.targetExceptions || [], 'generationChecks.competencyMappingReview.targetExceptions', errors);
  const boxes = howBoxMetadata(cfg);
  const competencies = boxes.filter(function (box) { return box.competency; });
  const level1 = boxes.filter(function (box) { return box.howLevel === 1; });
  const numbered = boxes.filter(function (box) { return box.howLevel !== null; });
  if (!competencies.length) return { denseSourceCount: 0, denseTargetCount: 0, overallDensity: 0, targetCount: 0, uniformDegreePattern: false, targetMode: '', permittedTargetRefs: [] };
  let permittedTargets = level1;
  if (mode === 'user-defined') {
    const declared = Array.isArray(review.permittedTargetRefs) ? review.permittedTargetRefs.filter(isNonEmptyString) : [];
    const boxByRef = Object.create(null); boxes.forEach(function (box) { boxByRef[box.ref] = box; });
    permittedTargets = declared.map(function (ref) { return boxByRef[ref]; }).filter(Boolean);
    if (!permittedTargets.length) errors.push('user-defined competency mapping requires a non-empty permittedTargetRefs array');
    exactSetDeclaration(permittedTargets.map(function (box) { return box.ref; }), declared, 'generationChecks.competencyMappingReview.permittedTargetRefs', errors);
  }
  const compRefs = new Set(competencies.map(function (box) { return box.ref; }));
  const targetRefs = new Set(permittedTargets.map(function (box) { return box.ref; }));
  const allNumberedRefs = new Set(numbered.map(function (box) { return box.ref; }));
  const links = cfg.savedState && Array.isArray(cfg.savedState.howLinks) ? cfg.savedState.howLinks : [];
  const allCompetencyLinks = links.filter(function (link) { return link && compRefs.has(link.from); });
  allCompetencyLinks.forEach(function (link) {
    if (mode === 'level-1-only-default' && !targetRefs.has(link.to)) {
      errors.push('Default competency mapping failure: ' + link.from + ' may link only to Level 1 project boxes, but targets ' + link.to + '. Use user-defined mode only when the user explicitly chose another arrangement.');
    } else if (mode === 'user-defined' && !targetRefs.has(link.to)) {
      errors.push('User-defined competency mapping failure: ' + link.from + ' targets undeclared competency target ' + link.to + '.');
    }
  });
  const pairs = allCompetencyLinks.filter(function (link) { return targetRefs.has(link.to); });
  const bySource = Object.create(null), byTarget = Object.create(null);
  pairs.forEach(function (link) { bySource[link.from] = (bySource[link.from] || 0) + 1; byTarget[link.to] = (byTarget[link.to] || 0) + 1; });
  const targetCount = permittedTargets.length;
  const denseSources = competencies.filter(function (box) { return targetCount >= 4 && (bySource[box.ref] || 0) / targetCount > 0.50; });
  denseSources.forEach(function (box) {
    if (!sourceExceptions[box.ref]) errors.push('Competency selectivity failure for ' + box.ref + ' ("' + box.label + '"): it maps to ' + (bySource[box.ref] || 0) + ' of ' + targetCount + ' permitted project targets. Generic relevance is insufficient; prune or provide a source-specific review reason.');
  });
  const denseTargets = permittedTargets.filter(function (box) { return competencies.length >= 5 && (byTarget[box.ref] || 0) / competencies.length >= 0.75; });
  denseTargets.forEach(function (box) {
    if (!targetExceptions[box.ref]) errors.push('Competency target-side density failure for ' + box.ref + ' ("' + box.label + '"): it receives ' + (byTarget[box.ref] || 0) + ' of ' + competencies.length + ' competencies. Prune generic links or provide a target-specific review reason.');
  });
  const possible = competencies.length * targetCount;
  const density = possible ? pairs.length / possible : 0;
  if (density >= 0.40) warn(warnings, 'Competency mapping covers ' + Math.round(density * 100) + '% of the actually permitted target layer. This is a diagnostic review indicator, not a target maximum. Retain or remove each relationship only through the pair-specific admission test and record any broad-pattern rationale.');
  else if (density >= 0.25) warn(warnings, 'Competency mapping covers ' + Math.round(density * 100) + '% of the actually permitted target layer. This is diagnostic only; do not add or remove links merely to fall below a threshold.');
  const degrees = competencies.map(function (box) { return bySource[box.ref] || 0; });
  const dist = Object.create(null); degrees.forEach(function (d) { dist[d] = (dist[d] || 0) + 1; });
  const modal = Object.keys(dist).map(Number).sort(function (a,b) { return (dist[b]-dist[a]) || (a-b); })[0] || 0;
  const uniform = competencies.length >= 6 && modal > 0 && dist[modal] / competencies.length >= 0.70;
  if (uniform && review.reviewedUniformDegreePattern !== true) errors.push('Competency mapping uniformity review required: ' + dist[modal] + ' of ' + competencies.length + ' competencies have exactly ' + modal + ' links. Confirm this was reviewed and was not produced by a quota.');
  if (uniform && !isNonEmptyString(review.uniformDegreePatternReason)) errors.push('A suspiciously uniform competency pattern requires uniformDegreePatternReason or further pruning.');
  return { denseSourceCount: denseSources.length, denseTargetCount: denseTargets.length, overallDensity: density, targetCount: targetCount, uniformDegreePattern: uniform, targetMode: mode, permittedTargetRefs: permittedTargets.map(function (box) { return box.ref; }).sort() };
}

function mappingBreadthPatterns(cfg) {
  const boxes = howBoxMetadata(cfg);
  const level1 = boxes.filter(function (box) { return box.howLevel === 1; });
  const level2 = boxes.filter(function (box) { return box.howLevel === 2; });
  const level1Refs = new Set(level1.map(function (box) { return box.ref; }));
  const level2Refs = new Set(level2.map(function (box) { return box.ref; }));
  const ttMap = collectPageQualifiedBoxMap(cfg);
  const ttBoxes = Object.keys(ttMap).map(function (ref) { return ttMap[ref]; }).filter(function (box) { return box.type === 'this_then'; });
  const pageCounts = Object.create(null);
  ttBoxes.forEach(function (box) { pageCounts[box.pageId] = (pageCounts[box.pageId] || 0) + 1; });
  const links = cfg.savedState && Array.isArray(cfg.savedState.howLinks) ? cfg.savedState.howLinks : [];
  const totalBySource = Object.create(null), pageBySource = Object.create(null);
  links.forEach(function (link) {
    if (!link || !level1Refs.has(link.from) || !ttMap[link.to] || ttMap[link.to].type !== 'this_then') return;
    totalBySource[link.from] = (totalBySource[link.from] || 0) + 1;
    const pid = ttMap[link.to].pageId;
    if (!pageBySource[link.from]) pageBySource[link.from] = Object.create(null);
    pageBySource[link.from][pid] = (pageBySource[link.from][pid] || 0) + 1;
  });
  const broad = [];
  level1.forEach(function (box) {
    const total = totalBySource[box.ref] || 0;
    const totalThreshold = Math.max(10, Math.ceil(ttBoxes.length * 0.12));
    let pageOwner = false;
    Object.keys(pageBySource[box.ref] || {}).forEach(function (pid) {
      if ((pageCounts[pid] || 0) >= 6 && (pageBySource[box.ref][pid] || 0) / pageCounts[pid] >= 0.70) pageOwner = true;
    });
    if (total >= totalThreshold || pageOwner) broad.push(box.ref);
  });
  const l2Counts = Object.create(null);
  links.forEach(function (link) {
    if (link && level2Refs.has(link.from) && level1Refs.has(link.to)) l2Counts[link.from] = (l2Counts[link.from] || 0) + 1;
  });
  level2.forEach(function (box) {
    const count = l2Counts[box.ref] || 0;
    if (count >= Math.max(8, Math.ceil(level1.length * 0.75))) broad.push(box.ref);
  });
  return Array.from(new Set(broad)).sort();
}

function validateMappingBreadthReview(cfg, checks, errors) {
  const step = checks.workflowStep;
  const review = checks.mappingBreadthReview;
  if (step === WORKFLOW_STEP_1) {
    if (review !== undefined && (!isPlainObject(review) || review.requested !== false)) errors.push('Step 1 generationChecks.mappingBreadthReview, when supplied, must use requested: false');
    return { broadSourceRefs: [] };
  }
  if (!isPlainObject(review) || review.requested !== true || review.reviewedAllBroadSources !== true || !Array.isArray(review.reviewItems)) {
    errors.push('Step 2 requires generationChecks.mappingBreadthReview with requested: true, reviewedAllBroadSources: true and one reviewItems entry for every unusually broad Level 1 or Level 2 source.');
    return { broadSourceRefs: [] };
  }
  const actual = mappingBreadthPatterns(cfg);
  exactSetDeclaration(actual, review.broadSourceRefs || [], 'generationChecks.mappingBreadthReview.broadSourceRefs', errors);
  const itemRefs = [];
  review.reviewItems.forEach(function (entry, i) {
    const where = 'generationChecks.mappingBreadthReview.reviewItems[' + i + ']';
    if (!isPlainObject(entry) || !isNonEmptyString(entry.ref)) { errors.push(where + '.ref is required'); return; }
    itemRefs.push(entry.ref);
    if (!isNonEmptyString(entry.reason) || visibleWordCount(entry.reason) < 10) errors.push(where + '.reason must explain why the broad mapping was reviewed and why retained links remain decision-useful');
  });
  exactSetDeclaration(actual, itemRefs, 'generationChecks.mappingBreadthReview.reviewItems[].ref', errors);
  return { broadSourceRefs: actual };
}

function validateLinkExplanationReview(cfg, checks, errors) {
  const review = checks.linkExplanationReview;
  if (review !== undefined && (!isPlainObject(review) || review.requested !== false)) {
    errors.push('V1.4.3 does not use a blanket rationale step. generationChecks.linkExplanationReview, when supplied, must use requested: false.');
  }
  return { overPreferredLimitCount: 0 };
}

function linkLookupByKey(cfg) {
  const state = cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  const lookup = Object.create(null);
  (Array.isArray(state.ttLinks) ? state.ttLinks : []).forEach(function (link) { if (link && link.id) lookup['this-then:' + link.id] = link; });
  (Array.isArray(state.howLinks) ? state.howLinks : []).forEach(function (link) { if (link && link.id) lookup['how:' + link.id] = link; });
  return lookup;
}

function validateLinkEvidenceReview(cfg, checks, previousValidation, errors) {
  const review = checks.linkEvidenceReview;
  if (review !== undefined && (!isPlainObject(review) || review.requested !== false)) {
    errors.push('V1.4.3 does not include an evidence-review Step. generationChecks.linkEvidenceReview, when supplied, must use requested: false.');
  }
  return { batchReviewedLinkCount: 0, reviewedLinkCount: 0, evidenceUrlCount: 0, trafficLightCounts: { green: 0, amber: 0, red: 0 }, history: [] };
}

function validateLinkCredibilityReview(cfg, checks, errors) {
  const review = checks.linkCredibilityReview;
  if (review !== undefined && (!isPlainObject(review) || review.requested !== false)) {
    errors.push('V1.4.3 does not use a mandatory all-link credibility certification. linkCredibilityReview, when supplied, must use requested: false.');
  }
  return { questionableLinkCount: 0 };
}

function collectPageQualifiedBoxMap(cfg) {
  const labels = collectBoxLabelMap(cfg);
  const map = Object.create(null);
  effectiveRuntimePages(cfg).forEach(function (page) {
    if (!page || !page.id) return;
    const type = page.pageType || 'this_then';
    if (type === 'this_then' && Array.isArray(page.cols)) {
      page.cols.forEach(function (col, ci) {
        (col && Array.isArray(col.boxes) ? col.boxes : []).forEach(function (_box, bi) {
          const ref = page.id + '-c' + ci + '-b' + bi;
          map[ref] = { ref: ref, label: String(labels[ref] || ''), pageId: page.id, pageLabel: String(page.label || ''), type: 'this_then', colIndex: ci };
        });
      });
    }
    if (type === 'how' && Array.isArray(page.howBoxes)) {
      page.howBoxes.forEach(function (box) {
        if (!box || !box.id) return;
        const ref = page.id + '-' + box.id;
        map[ref] = { ref: ref, label: String(labels[ref] || box.label || ''), pageId: page.id, pageLabel: String(page.label || ''), type: 'how', colIndex: null };
      });
    }
  });
  effectiveRuntimeFinalOutcomes(cfg).forEach(function (_f, i) {
    const ref = 'final-b' + i;
    map[ref] = { ref: ref, label: String(labels[ref] || ''), pageId: 'final', pageLabel: 'Final Outcomes', type: 'final', colIndex: null };
  });
  return map;
}

function exactSetDeclaration(actualValues, declaredValues, where, errors) {
  if (!Array.isArray(declaredValues)) {
    errors.push(where + ' must be an array');
    return;
  }
  const actual = Array.from(new Set(actualValues)).sort();
  const declared = Array.from(new Set(declaredValues.filter(isNonEmptyString))).sort();
  if (declared.length !== declaredValues.length) errors.push(where + ' must contain unique non-empty strings');
  if (JSON.stringify(actual) !== JSON.stringify(declared)) {
    errors.push(where + ' must exactly match the items requiring review. Expected [' + actual.join(', ') + '] but received [' + declared.join(', ') + '].');
  }
}

function suspectedThisThenRisk(fromLabel, toLabel) {
  const from = normalizeSearchText(fromLabel || '');
  const to = normalizeSearchText(toLabel || '');
  const reasons = [];
  const earlyEvidence = /\b(?:understood|identified|assessed|mapped|evidence|information|needs|demand|risks?|pressures?|status|baseline)\b/;
  const laterOutcome = /\b(?:prioriti[sz]ed|selected|demonstrated|improved|strengthened|expanded|achieved|trusted|sustained|aligned|restored|recovered)\b/;
  if (earlyEvidence.test(to) && laterOutcome.test(from)) reasons.push('a later result may be shown as causing evidence, needs, risks or understanding normally required earlier');
  const restorationTarget = /\b(?:restored|reconnected|connectivity|refuges strengthened|recovery secured)\b/;
  const protectionOnlySource = /\b(?:managed|protected|answered|responded|deterred|mitigated|avoided|triaged|maintained|reviewed)\b/;
  if (restorationTarget.test(to) && protectionOnlySource.test(from)) reasons.push('protection, response, management or review may be presented as active restoration without the missing restoration mechanism');
  if (/\b(?:responsibly|responsible behaviour|compliance improved)\b/.test(to) && /\b(?:access|opportunit(?:y|ies)|expanded)\b/.test(from)) reasons.push('greater access or opportunity may not itself cause responsible behaviour');
  if (/\bfinancial sustainability\b/.test(to) && /\b(?:measures?|impact|performance) reviewed\b/.test(from)) reasons.push('reviewing measures may require an intermediate budgeting or resource-allocation decision before financial sustainability changes');
  if (/\benvironmental harm deterred\b/.test(to) && /\b(?:applications? triaged|triage)\b/.test(from)) reasons.push('administrative triage may not directly deter harm without conditions, monitoring or sanctions');
  return reasons;
}

function thisThenReviewPatterns(cfg) {
  const boxes = collectPageQualifiedBoxMap(cfg);
  const state = cfg.savedState && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  const links = Array.isArray(state.ttLinks) ? state.ttLinks : [];
  const crossPageLinkIds = links.filter(function (link) {
    return link && boxes[link.from] && boxes[link.to] && boxes[link.from].pageId !== boxes[link.to].pageId;
  }).map(function (link) { return link.id; }).filter(Boolean);
  const denseAdjacentPairKeys = [];
  effectiveRuntimePages(cfg).forEach(function (page) {
    if (!page || (page.pageType || 'this_then') !== 'this_then' || !Array.isArray(page.cols)) return;
    for (let ci = 0; ci < page.cols.length - 1; ci++) {
      const fromCount = page.cols[ci] && Array.isArray(page.cols[ci].boxes) ? page.cols[ci].boxes.length : 0;
      const toCount = page.cols[ci + 1] && Array.isArray(page.cols[ci + 1].boxes) ? page.cols[ci + 1].boxes.length : 0;
      const possible = fromCount * toCount;
      if (possible < 4) continue;
      let actual = 0;
      links.forEach(function (link) {
        const from = boxes[link && link.from];
        const to = boxes[link && link.to];
        if (from && to && from.pageId === page.id && to.pageId === page.id && from.colIndex === ci && to.colIndex === ci + 1) actual++;
      });
      if (actual / possible >= 0.8) denseAdjacentPairKeys.push(page.id + ':c' + ci + '->c' + (ci + 1));
    }
  });
  const semanticRiskLinkIds = [];
  const semanticRiskReasons = Object.create(null);
  links.forEach(function (link) {
    if (!link || !link.id || !boxes[link.from] || !boxes[link.to]) return;
    const reasons = suspectedThisThenRisk(boxes[link.from].label, boxes[link.to].label);
    if (reasons.length) {
      semanticRiskLinkIds.push(link.id);
      semanticRiskReasons[link.id] = reasons.join('; ');
    }
  });
  return { crossPageLinkIds: crossPageLinkIds, denseAdjacentPairKeys: denseAdjacentPairKeys, semanticRiskLinkIds: semanticRiskLinkIds, semanticRiskReasons: semanticRiskReasons };
}

function validateThisThenCausalReview(cfg, checks, errors) {
  const patterns = thisThenReviewPatterns(cfg);
  const review = checks.thisThenCausalReview;
  if (checks.workflowStep !== WORKFLOW_STEP_1) return { questionableLinkCount: 0, crossPageLinkCount: patterns.crossPageLinkIds.length, denseAdjacentPairCount: patterns.denseAdjacentPairKeys.length, semanticRiskLinkCount: patterns.semanticRiskLinkIds.length, crossPageLinkIds: patterns.crossPageLinkIds, denseAdjacentPairKeys: patterns.denseAdjacentPairKeys, semanticRiskLinkIds: patterns.semanticRiskLinkIds, questionableLinkIds: [], priorityReviewMode: 'advisory' };
  if (review !== undefined && !isPlainObject(review)) errors.push('generationChecks.thisThenCausalReview must be an object when supplied. V1.4.3 treats semantic review as advisory, not technical certification.');
  const questionable = isPlainObject(review) && Array.isArray(review.questionableLinks) ? review.questionableLinks : [];
  return { questionableLinkCount: questionable.length, crossPageLinkCount: patterns.crossPageLinkIds.length, denseAdjacentPairCount: patterns.denseAdjacentPairKeys.length, semanticRiskLinkCount: patterns.semanticRiskLinkIds.length, crossPageLinkIds: patterns.crossPageLinkIds, denseAdjacentPairKeys: patterns.denseAdjacentPairKeys, semanticRiskLinkIds: patterns.semanticRiskLinkIds, questionableLinkIds: questionable.map(function(x){return x&&x.linkId;}).filter(Boolean), priorityReviewMode: 'advisory' };
}


function computeCompletionMetrics(cfg, graphMetrics) {
  const state = cfg && isPlainObject(cfg.savedState) ? cfg.savedState : {};
  const pages = effectiveRuntimePages(cfg);
  const pageType = function (page) { return String(page && page.pageType || 'this_then'); };
  let howBoxCount = 0;
  pages.forEach(function (page) {
    if (pageType(page) === 'how' && Array.isArray(page.howBoxes)) howBoxCount += page.howBoxes.length;
  });
  const finalOutcomes = Array.isArray(state.FO) ? state.FO : (Array.isArray(cfg.finalOutcomes) ? cfg.finalOutcomes : []);
  return {
    thisThenPageCount: pages.filter(function (page) { return pageType(page) === 'this_then'; }).length,
    ordinaryBoxCount: Number(graphMetrics && graphMetrics.thisThenBoxCount || 0),
    thisThenLinkCount: Number(graphMetrics && graphMetrics.thisThenLinkCount || 0),
    crossPageLinkCount: Number(graphMetrics && graphMetrics.crossPageLinkCount || 0),
    howPageCount: pages.filter(function (page) { return pageType(page) === 'how'; }).length,
    howBoxCount: howBoxCount,
    howLinkCount: Number(graphMetrics && graphMetrics.howLinkCount || 0),
    measureCount: Array.isArray(state.measures) ? state.measures.length : 0,
    evaluationQuestionCount: Array.isArray(state.evalQuestions) ? state.evalQuestions.length : 0,
    documentationPageCount: pages.filter(function (page) { return pageType(page) === 'documentation'; }).length,
    finalOutcomeCount: finalOutcomes.length
  };
}

function validateGeneratorSelfReview(cfg, checks, graphValidationContext, errors) {
  const review = checks.generatorSelfReview;
  if (!isPlainObject(review) || review.requested !== true || review.reviewedCurrentStep !== true || review.clearProblemsCorrected !== true) {
    errors.push('Every strict Step requires generationChecks.generatorSelfReview with requested: true, reviewedCurrentStep: true and clearProblemsCorrected: true.');
    return { correctionsApplied: [], deferredJudgementItems: [], chatHandoff: null, completionMetrics: {} };
  }
  if (!isNonEmptyString(review.reviewSummary) || visibleWordCount(review.reviewSummary) < 12) {
    errors.push('generationChecks.generatorSelfReview.reviewSummary must describe the final review-and-revision pass.');
  }
  if (!Array.isArray(review.correctionsApplied)) errors.push('generationChecks.generatorSelfReview.correctionsApplied must be an array.');
  if (!Array.isArray(review.deferredJudgementItems)) errors.push('generationChecks.generatorSelfReview.deferredJudgementItems must be an array.');
  const corrections = Array.isArray(review.correctionsApplied) ? review.correctionsApplied : [];
  const deferred = Array.isArray(review.deferredJudgementItems) ? review.deferredJudgementItems : [];
  corrections.forEach(function (entry, i) {
    const where = 'generationChecks.generatorSelfReview.correctionsApplied[' + i + ']';
    if (!isPlainObject(entry) || !isNonEmptyString(entry.issue) || !isNonEmptyString(entry.correction)) {
      errors.push(where + ' must contain substantive issue and correction strings.');
    }
  });
  deferred.forEach(function (entry, i) {
    const where = 'generationChecks.generatorSelfReview.deferredJudgementItems[' + i + ']';
    if (!isPlainObject(entry) || !isNonEmptyString(entry.matter) || !isNonEmptyString(entry.reasonNotSilentlyChanged)) {
      errors.push(where + ' must contain matter and reasonNotSilentlyChanged strings.');
    }
  });

  const metrics = computeCompletionMetrics(cfg, graphValidationContext && graphValidationContext.metrics);
  const handoff = review.chatHandoff;
  if (!isPlainObject(handoff)) {
    errors.push('generationChecks.generatorSelfReview.chatHandoff is required.');
  } else {
    const expectedCompletion = checks.workflowStep === WORKFLOW_STEP_1
      ? "**Step 1 is complete. Type 'Do step 2' to add links between the How Boxes, This–Then Boxes and other How Boxes.**"
      : "**Step 2 is complete. Download the finished proof-of-concept board using the links above.**";
    if (handoff.completionParagraph !== expectedCompletion) errors.push('generatorSelfReview.chatHandoff.completionParagraph must be exactly the fully bold Step paragraph: ' + expectedCompletion);
    if (handoff.selfReviewNotice !== SELF_REVIEW_NOTICE) errors.push('generatorSelfReview.chatHandoff.selfReviewNotice must contain the exact V1.4.3 human-review notice.');
    if (handoff.completionParagraphFullyBold !== true) errors.push('generatorSelfReview.chatHandoff.completionParagraphFullyBold must be true.');
    if (Object.prototype.hasOwnProperty.call(handoff, 'completionLineMustBeFinal')) errors.push('generatorSelfReview.chatHandoff.completionLineMustBeFinal is obsolete and must be removed.');
    if (Object.prototype.hasOwnProperty.call(handoff, 'independentAuditOffer') || Object.prototype.hasOwnProperty.call(handoff, 'independentAuditPromptFile')) {
      errors.push('V1.4.3 completion handoffs must not include obsolete automated-review offers or prompt-file references.');
    }
    if (!isPlainObject(handoff.reportedCounts)) {
      errors.push('generatorSelfReview.chatHandoff.reportedCounts is required and must be copied from the actual final board.');
    } else {
      Object.keys(metrics).forEach(function (key) {
        if (Number(handoff.reportedCounts[key]) !== metrics[key]) {
          errors.push('generatorSelfReview.chatHandoff.reportedCounts.' + key + ' must equal the actual final-board value ' + metrics[key] + '.');
        }
      });
    }
  }
  return {
    correctionsApplied: cloneJson(corrections),
    deferredJudgementItems: cloneJson(deferred),
    reviewSummary: String(review.reviewSummary || ''),
    chatHandoff: isPlainObject(handoff) ? cloneJson(handoff) : null,
    completionMetrics: cloneJson(metrics)
  };
}

function validateSourceEntry(s, i, errors) {
  if (typeof s === 'string') {
    if (!s.trim()) errors.push('Empty source at index ' + i);
    return;
  }
  if (isPlainObject(s)) {
    const url = s.url || s.href || '';
    const title = s.title || s.label || '';
    if (!String(url).trim() && !String(title).trim()) {
      errors.push('Source at index ' + i + ' has neither a URL nor a title/label');
    }
    return;
  }
  errors.push('Invalid source at index ' + i);
}

function normalizedRegistryUrl(value) {
  if (!isNonEmptyString(value)) return '';
  try {
    const parsed = new URL(String(value).trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.href.replace(/\/$/, '');
  } catch (_e) {
    return '';
  }
}

function sourceEntryUrl(source) {
  if (isPlainObject(source)) return source.url || source.href || '';
  if (typeof source === 'string' && /^https?:\/\/\S+$/i.test(source.trim())) return source.trim();
  return '';
}

function isStandardNonContentSourceUrl(value) {
  const key = normalizedRegistryUrl(value);
  return !!key && STANDARD_NON_CONTENT_SOURCE_URLS.some(function (url) {
    return normalizedRegistryUrl(url) === key;
  });
}

function isAutoAddedStandardNonContentSource(source) {
  const url = sourceEntryUrl(source);
  if (!isStandardNonContentSourceUrl(url)) return false;
  if (!isPlainObject(source)) return false;
  const title = String(source.title || source.label || '').trim();
  return !title || normalizedRegistryUrl(title) === normalizedRegistryUrl(url);
}

function extractHttpUrls(value) {
  const urls = new Map();
  collectUrlsFromText(String(value || ''), urls);
  return Array.from(urls.values());
}

function collectUrlsFromText(value, urls) {
  if (typeof value !== 'string') return;
  const found = value.match(/https?:\/\/[^\s<>"')\]]+/gi) || [];
  found.forEach(function (candidate) {
    const url = candidate.replace(/[.,;:!?]+$/, '');
    const key = normalizedRegistryUrl(url);
    if (key && !isStandardNonContentSourceUrl(key) && !urls.has(key)) urls.set(key, url);
  });
}

function collectVisibleContentUrls(cfg, ignoreLinkEvidenceNotes) {
  const urls = new Map();
  function scan(value) {
    if (typeof value === 'string') {
      collectUrlsFromText(value, urls);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(scan);
      return;
    }
    if (!isPlainObject(value)) return;
    Object.keys(value).forEach(function (key) {
      if (key === 'sources' || key === 'generationChecks' || key === 'builderValidation' || key === 'aiEndpoint' || key === 'aiModel') return;
      if (ignoreLinkEvidenceNotes && (key === 'notes1' || key === 'notes2' || key === 'notes3') && (Object.prototype.hasOwnProperty.call(value, 'from') && Object.prototype.hasOwnProperty.call(value, 'to'))) return;
      scan(value[key]);
    });
  }
  ['title', 'subtitle', 'description', 'boardInfo', 'pageInfo', 'notes', 'topRightText', 'subpages', 'finalOutcomes', 'savedState'].forEach(function (key) {
    if (cfg[key] !== undefined) scan(cfg[key]);
  });
  return urls;
}

function ensureSourcesRegistryCompleteness(cfg, autoFixes, workflowStep) {
  if (cfg.sources === undefined) cfg.sources = [];
  if (!Array.isArray(cfg.sources)) return;
  const seen = new Set();
  const deduped = [];
  cfg.sources.forEach(function (source) {
    const url = sourceEntryUrl(source);
    if (isAutoAddedStandardNonContentSource(source)) {
      pushAutoFix(autoFixes, 'Removed standard non-content package URL from sources registry: ' + url);
      return;
    }
    const key = normalizedRegistryUrl(url);
    if (key && seen.has(key)) {
      pushAutoFix(autoFixes, 'Removed duplicate source registry entry for ' + url + '.');
      return;
    }
    if (key) seen.add(key);
    deduped.push(source);
  });
  cfg.sources = deduped;
  const defaultSourceUrl = 'https://doviewplanning.org/doviewboards';
  const defaultSourceTitle = 'Information about DoView Boards';
  const defaultKey = normalizedRegistryUrl(defaultSourceUrl);
  const existingDefaultIndex = cfg.sources.findIndex(function (source) { return normalizedRegistryUrl(sourceEntryUrl(source)) === defaultKey; });
  if (existingDefaultIndex >= 0) {
    const existing = cfg.sources.splice(existingDefaultIndex, 1)[0];
    const exact = isPlainObject(existing) && String(existing.title || existing.label || '').trim() === defaultSourceTitle && normalizedRegistryUrl(sourceEntryUrl(existing)) === defaultKey;
    cfg.sources.unshift({ title: defaultSourceTitle, url: defaultSourceUrl });
    if (existingDefaultIndex !== 0 || !exact) pushAutoFix(autoFixes, 'Normalised and moved the default DoView information source to the first registry position.');
  } else {
    cfg.sources.unshift({ title: defaultSourceTitle, url: defaultSourceUrl });
    pushAutoFix(autoFixes, 'Added the default DoView information source as the first registry entry.');
  }
  seen.add(defaultKey);
  collectVisibleContentUrls(cfg, false).forEach(function (url, key) {
    if (seen.has(key)) return;
    cfg.sources.push({ title: url, url: url });
    seen.add(key);
    pushAutoFix(autoFixes, 'Added missing visible-content URL to sources registry: ' + url);
  });
}


function createBuilderValidationStamp(mode, warnings, autoFixes, workflowStep, cfg, competencyReview, mappingBreadthReview, linkCredibilityReview, linkExplanationReview, linkEvidenceReview, thisThenCausalReview, generatorSelfReview, previousValidation, graphValidationContext) {
  const mappingComplete = workflowStep === WORKFLOW_STEP_2;
  const stamp = {
    builderVersion: BUILDER_VERSION,
    validationVersion: VALIDATION_VERSION,
    mode: mode,
    passed: true,
    validatedAt: new Date().toISOString(),
    checks: {
      noLevelHowPages: 'passed',
      uniqueNumberedHowLevels: 'passed',
      thisThenLinkAnnotations: 'blank-as-required',
      howLinkAnnotations: 'blank-as-required',
      documentationClones: 'passed',
      measureEqAttachment: 'passed',
      viewSettings: 'passed',
      displayTextTrafficPriority: 'passed',
      sourcesRegistry: 'passed',
      documentationPagePlan: 'passed',
      compactBoxLabels: 'passed',
      competencyMappingReview: mappingComplete ? 'passed' : 'deferred-to-step-2',
      mappingBreadthReview: mappingComplete ? 'passed' : 'deferred-to-step-2',
      evidenceReviewWorkflow: 'not-part-of-v1.4.3',
      thisThenCausalReview: 'passed',
      selfReview: 'passed',
      completionCounts: 'passed',
      completionParagraphDeclaration: 'passed'
    },
    warnings: warnings.slice(),
    autoFixes: autoFixes.slice()
  };
  if (mode === 'strict-generated') {
    stamp.workflowStep = workflowStep;
    stamp.structureDigest = workflowStructureDigest(cfg);
    stamp.howLinkGenerationAudit = mappingComplete ? 'passed' : 'deferred-to-step-2';
    if (mappingComplete) stamp.mappingDigest = workflowMappingDigest(cfg);
    if (mappingComplete && competencyReview) {
      stamp.competencyMappingDensity = Number((competencyReview.overallDensity || 0).toFixed(4));
      stamp.competencyPermittedTargetCount = competencyReview.targetCount || 0;
      stamp.competencyTargetMode = competencyReview.targetMode || '';
      stamp.competencyPermittedTargetRefs = Array.isArray(competencyReview.permittedTargetRefs) ? competencyReview.permittedTargetRefs.slice() : [];
      stamp.denseCompetencySources = competencyReview.denseSourceCount || 0;
      stamp.denseCompetencyTargets = competencyReview.denseTargetCount || 0;
      stamp.uniformCompetencyDegreePattern = competencyReview.uniformDegreePattern === true;
    }
    if (mappingComplete && mappingBreadthReview) {
      stamp.broadMappingSourcesReviewed = Array.isArray(mappingBreadthReview.broadSourceRefs) ? mappingBreadthReview.broadSourceRefs.length : 0;
      stamp.broadMappingSourceRefs = Array.isArray(mappingBreadthReview.broadSourceRefs) ? mappingBreadthReview.broadSourceRefs.slice() : [];
    }
    let step1History = null;
    if (workflowStep === WORKFLOW_STEP_1 && thisThenCausalReview) {
      step1History = {
        crossPageLinkIds: (thisThenCausalReview.crossPageLinkIds || []).slice(),
        denseAdjacentPairKeys: (thisThenCausalReview.denseAdjacentPairKeys || []).slice(),
        semanticRiskLinkIds: (thisThenCausalReview.semanticRiskLinkIds || []).slice(),
        questionableLinkIds: (thisThenCausalReview.questionableLinkIds || []).slice()
      };
    } else if (previousValidation && isPlainObject(previousValidation.step1CausalReviewHistory)) {
      step1History = cloneJson(previousValidation.step1CausalReviewHistory);
    }
    if (step1History) {
      stamp.step1CausalReviewHistory = step1History;
      stamp.step1QuestionableCausalLinks = step1History.questionableLinkIds.length;
      stamp.crossPageLinksReviewed = step1History.crossPageLinkIds.length;
      stamp.denseAdjacentPatternsReviewed = step1History.denseAdjacentPairKeys.length;
      stamp.semanticRiskLinksReviewed = step1History.semanticRiskLinkIds.length;
    }
    stamp.selfReviewSummary = generatorSelfReview && generatorSelfReview.reviewSummary ? generatorSelfReview.reviewSummary : '';
    stamp.selfReviewCorrectionCount = generatorSelfReview && Array.isArray(generatorSelfReview.correctionsApplied) ? generatorSelfReview.correctionsApplied.length : 0;
    stamp.selfReviewDeferredJudgementCount = generatorSelfReview && Array.isArray(generatorSelfReview.deferredJudgementItems) ? generatorSelfReview.deferredJudgementItems.length : 0;
    stamp.chatHandoffValidated = generatorSelfReview && generatorSelfReview.chatHandoff ? true : false;
    stamp.completionMetrics = generatorSelfReview && generatorSelfReview.completionMetrics ? cloneJson(generatorSelfReview.completionMetrics) : {};
    stamp.deterministicGraphMetrics = graphValidationContext && graphValidationContext.metrics ? cloneJson(graphValidationContext.metrics) : {};
  }
  return stamp;
}

function validateLinkArray(name, links, knownBoxIds, errors, warnings) {
  if (links === undefined || links === null) return;
  if (!Array.isArray(links)) {
    errors.push(name + ' must be an array if present');
    return;
  }
  links.forEach(function (l, i) {
    if (!isPlainObject(l)) {
      warn(warnings, name + '[' + i + '] is not an object; skipped older/unknown link-record validation');
      return;
    }
    if (!('from' in l) || !('to' in l)) {
      warn(warnings, name + '[' + i + '] has no from/to fields; skipped older/unknown link-record validation');
      return;
    }
    if (!knownBoxIds.has(l.from)) errors.push(name + '[' + i + '] from points to a missing box: ' + l.from);
    if (!knownBoxIds.has(l.to)) errors.push(name + '[' + i + '] to points to a missing box: ' + l.to);
    if (name.indexOf('ttLinks') >= 0 && l.light !== undefined) validateTrafficLightValue(l.light, name + '[' + i + '].light', errors);
  });
}

function isSyntheticLoadTestConfig(cfg) {
  const parts = [];
  ['title', 'slug', 'subtitle', 'description'].forEach(function (key) {
    if (typeof cfg[key] === 'string') parts.push(cfg[key]);
  });
  if (cfg.savedState && typeof cfg.savedState.boardInfo === 'string') parts.push(cfg.savedState.boardInfo);
  const text = parts.join(' ').toLowerCase();
  return /(?:synthetic|load[-\s]?test|stress[-\s]?test|scale[-\s]?test|test board)/.test(text) && /(?:structure does not matter|content does not matter|artificial|synthetic|load[-\s]?test|stress[-\s]?test|scale[-\s]?test)/.test(text);
}

function shapePageList(entry) {
  return entry.pages.map(function (p) { return p.label + ' [' + p.exactKey + ']'; }).join(', ');
}

// Strict-mode error suffixes (ANTI-STEREOTYPE-PLAN Section 3). Shape errors must
// always instruct restructuring from domain logic, never content removal.
const STRICT_RESTRUCTURE_HINT = ' Restructure the affected pages from domain logic (different step counts, branching, convergence, feedback) and record per-page reasoning in generationChecks.shapePlan — do not thin or genericise page content to pass validation.';
const STRICT_SYNTHETIC_HINT = ' For a genuine synthetic/load-test board set generationChecks.shapePlan.syntheticLoadTest to true.';

function warnRepeatedThisThenGeometry(cfg, shapeAnalysis, warnings, errors, shapePlan, strict) {
  const board = shapeAnalysis.board;
  const pages = shapeAnalysis.pages;
  if (pages.length < 4) return;
  // Structured escape hatches are authoritative wherever they can exist: the
  // shapePlan.syntheticLoadTest flag when a shapePlan is present, and nothing at
  // all for strict configs without one. The prose-sniffing regex applies only in
  // compatibility mode (no generationChecks).
  if (shapePlan ? shapePlan.syntheticLoadTest : (!strict && isSyntheticLoadTestConfig(cfg))) return;

  // Valid per-page shapeReasons (validated in preflight) keep the near-uniform
  // column-count finding at warning level in strict mode.
  const plannedReasons = !!(shapePlan && shapePlan.hasPlannedPages);

  const colTop = board.columnCountEntries;
  const exactTop = board.exactPatternEntries;
  const nearTop = board.nearPatternEntries;
  const topTwoExact = board.topTwoExactCoverage;
  const topTwoNear = board.topTwoNearCoverage;
  const mostlyThreeFourColumns = board.mostlyThreeFourPages;

  if (colTop[0] && colTop[0].count === pages.length) {
    if (strict) {
      errors.push('Anti-template error: all ' + pages.length + ' This–Then Pages have ' + colTop[0].key + ' columns.' + STRICT_RESTRUCTURE_HINT + STRICT_SYNTHETIC_HINT);
    } else {
      const msg = 'Anti-template warning: all ' + pages.length + ' This–Then Pages have ' + colTop[0].key + ' columns. Revise page shapes based on domain logic before final output unless this is an explicitly justified synthetic/load-test board.';
      if (pages.length >= 7) errors.push(msg);
      else warn(warnings, msg);
    }
  } else if (colTop[0] && colTop[0].count >= pages.length - 1) {
    if (strict && !plannedReasons) {
      errors.push('Anti-template error: ' + colTop[0].count + ' of ' + pages.length + ' This–Then Pages have ' + colTop[0].key + ' columns and no generationChecks.shapePlan records per-page domain reasoning.' + STRICT_RESTRUCTURE_HINT + ' Pages: ' + shapePageList(colTop[0]));
    } else {
      warn(warnings, 'Anti-template warning: ' + colTop[0].count + ' of ' + pages.length + ' This–Then Pages have ' + colTop[0].key + ' columns. Check that variation is structural, not cosmetic. Pages: ' + shapePageList(colTop[0]));
    }
  } else if (colTop[0] && colTop[0].count > pages.length / 2) {
    warn(warnings, 'Anti-template warning: most This–Then Pages share the same column count (' + colTop[0].key + ' columns on ' + colTop[0].count + ' of ' + pages.length + ' pages). Record a domain reason or revise page shapes.');
  }

  exactTop.forEach(function (entry) {
    if (entry.count > 2) {
      if (strict && entry.count >= pages.length - 1) {
        errors.push('Anti-template error: ' + entry.count + ' of ' + pages.length + ' This–Then Pages share exact box-count pattern ' + entry.key + '.' + STRICT_RESTRUCTURE_HINT + ' Pages: ' + shapePageList(entry));
      } else {
        warn(warnings, 'Anti-template warning: ' + entry.count + ' This–Then Pages share exact box-count pattern ' + entry.key + '. Pages: ' + shapePageList(entry));
      }
    }
  });

  nearTop.forEach(function (entry) {
    if (entry.count > 2) {
      if (strict && entry.count >= pages.length - 1) {
        errors.push('Anti-template error: ' + entry.count + ' of ' + pages.length + ' This–Then Pages share near-match shape signature ' + entry.key + ' (3- and 4-box columns bucket together, so cosmetic last-column differences do not hide repetition).' + STRICT_RESTRUCTURE_HINT + ' Pages: ' + shapePageList(entry));
      } else {
        warn(warnings, 'Anti-template warning: ' + entry.count + ' This–Then Pages share near-match shape signature ' + entry.key + '. Near-matches bucket 3- and 4-box columns together so cosmetic last-column differences do not hide repetition. Pages: ' + shapePageList(entry));
      }
    }
  });

  if (topTwoExact > pages.length / 2 && exactTop.length > 1) {
    const exactDetail = exactTop.slice(0, 2).map(function (e) { return e.key + ' ×' + e.count; }).join(', ');
    if (strict && topTwoExact === pages.length) {
      errors.push('Anti-template error: the two most common exact This–Then patterns (' + exactDetail + ') cover all ' + pages.length + ' pages — two-pattern alternation is still a template.' + STRICT_RESTRUCTURE_HINT);
    } else {
      warn(warnings, 'Anti-template warning: the two most common exact This–Then patterns (' + exactDetail + ') cover ' + topTwoExact + ' of ' + pages.length + ' pages. Revise if this is not domain-driven.');
    }
  }

  if (topTwoNear / pages.length > 0.7 && nearTop.length > 1) {
    const nearDetail = nearTop.slice(0, 2).map(function (e) { return e.key + ' ×' + e.count; }).join(', ');
    if (strict && topTwoNear === pages.length) {
      errors.push('Anti-template error: the two most common near-match This–Then signatures (' + nearDetail + ') cover all ' + pages.length + ' pages (3- and 4-box columns bucket together) — two-signature alternation is still a template.' + STRICT_RESTRUCTURE_HINT);
    } else {
      const msg2 = 'Anti-template warning: the two most common near-match This–Then signatures (' + nearDetail + ') cover ' + topTwoNear + ' of ' + pages.length + ' pages. This suggests repeated page geometry despite small box-count differences.';
      if (pages.length >= 7) errors.push(msg2);
      else warn(warnings, msg2);
    }
  }

  if (mostlyThreeFourColumns > pages.length / 2) {
    warn(warnings, 'Anti-template warning: most This–Then Pages are made mostly of 3- or 4-box columns. Check for repeated tidy-grid geometry such as 4-4-4-4, 4-4-4-3, or 3-3-3-3-2 and revise from domain logic if needed.');
  }

  if (colTop[0] && colTop[0].count > pages.length / 2 && exactTop.length <= 2) {
    warn(warnings, 'Anti-template warning: page-shape variation may be cosmetic rather than structural: a dominant column count plus only ' + exactTop.length + ' exact pattern family/families covers the board.');
  }

  // Section 3: heading-rhythm and link-topology findings enter strict mode as
  // warnings first; promotion to errors waits for evidence from generated boards
  // (Section 4). Compatibility mode is unchanged.
  if (strict) {
    const headTop = board.headingRhythm.entries[0];
    if (headTop && headTop.count >= 3) {
      warn(warnings, 'Anti-template warning: ' + headTop.count + ' of ' + pages.length + ' This–Then Pages share the same normalized column-heading sequence — the pages follow one heading rhythm. Vary column headings to match each page\'s domain logic. Pages: ' + headTop.pages.map(function (p) { return p.label; }).join(', '));
    }
    const topo = board.topology;
    if (topo && topo.totals.withinPageLinkCount && topo.totals.linearPages === pages.length) {
      warn(warnings, 'Anti-template warning: every This–Then Page has purely linear link topology (no branching, convergence, skip-column, or feedback links). Genuine domain structure usually produces some fan-in/fan-out — check the links, not just the box counts.');
    }
  }
}


function hasTerminalColumnJustification(cfg) {
  const parts = [];
  ['title', 'slug', 'subtitle', 'description'].forEach(function (key) {
    if (typeof cfg[key] === 'string') parts.push(cfg[key]);
  });
  if (cfg.savedState && typeof cfg.savedState.boardInfo === 'string') parts.push(cfg.savedState.boardInfo);
  if (cfg.savedState && cfg.savedState.pageInfo && isPlainObject(cfg.savedState.pageInfo)) {
    Object.keys(cfg.savedState.pageInfo).forEach(function (key) {
      if (typeof cfg.savedState.pageInfo[key] === 'string') parts.push(cfg.savedState.pageInfo[key]);
    });
  }
  const text = parts.join(' ').toLowerCase();
  return /(?:final[-\s]?column reason|end[-\s]?column reason|right[-\s]?hand column reason|parallel outcomes? justified|domain reason|genuine domain|justified terminal|justified final|requires several|requires multiple|several parallel)/.test(text);
}

function warnTerminalColumnOverload(cfg, shapeAnalysis, warnings, errors, shapePlan, strict) {
  const pages = shapeAnalysis.pages;
  if (!pages.length) return;
  // Structured escape hatches are authoritative wherever they can exist: the
  // shapePlan fields (syntheticLoadTest, terminalColumnExceptions) when a
  // shapePlan is present, and nothing at all for strict configs without one.
  // The prose-sniffing regexes apply only in compatibility mode.
  if (shapePlan ? shapePlan.syntheticLoadTest : (!strict && isSyntheticLoadTestConfig(cfg))) return;

  // structuredOnly: only shapePlan.terminalColumnExceptions can downgrade the
  // overload errors; the hasTerminalColumnJustification() prose regex is ignored.
  const structuredOnly = !!shapePlan || strict === true;
  const justified = structuredOnly ? false : hasTerminalColumnJustification(cfg);
  function excepted(s) {
    if (!shapePlan) return justified;
    const ex = shapePlan.exceptionsByPageId[s.id];
    return !!(ex && ex.terminalBoxes === s.terminalBoxes);
  }
  const terminal = shapeAnalysis.board.terminal;
  const avg = terminal.averageTerminalBoxes;
  const pagesWithFour = terminal.pagesWithExactlyFour;
  const pagesWithFive = terminal.pagesWithFivePlus;
  const pagesWithSixPlus = terminal.pagesWithSixPlus;
  const terminalDensest = terminal.pagesWhereTerminalDensest;

  pages.forEach(function (s) {
    if (s.terminalBoxes >= 6) {
      if (structuredOnly) {
        if (excepted(s)) {
          warn(warnings, 'Terminal-column warning: Page "' + s.label + '" has ' + s.terminalBoxes + ' terminal boxes; a shapePlan.terminalColumnExceptions entry records the domain reason. Confirm the reason is genuine and page-specific.');
        } else {
          const msgStructured = 'Terminal-column error: Page "' + s.label + '" has ' + s.terminalBoxes + ' terminal boxes and no matching shapePlan.terminalColumnExceptions entry. Restructure the page from domain logic — move outcomes into intermediate columns, add branching or convergence, or split the page — or record a structured exception with the genuine domain reason.';
          if (pages.length >= 4) errors.push(msgStructured);
          else warn(warnings, msgStructured);
        }
      } else {
        const msg = 'Terminal-column warning: Page "' + s.label + '" has ' + s.terminalBoxes + ' terminal boxes. Ordinary This–Then Pages should usually end with 1–3 page-level outcomes. Consolidate, move some outcomes to intermediate columns, split the page, or record a clear domain reason.';
        if (!justified && pages.length >= 4) errors.push(msg);
        else warn(warnings, msg);
      }
    } else if (s.terminalBoxes === 5) {
      warn(warnings, 'Terminal-column warning: Page "' + s.label + '" has 5 terminal boxes. Five or more terminal/end-column outcomes should be rare unless the domain reason is clear and documented.');
    } else if (s.terminalBoxes === 4) {
      warn(warnings, 'Terminal-column check: Page "' + s.label + '" has 4 terminal boxes. This can be acceptable with a genuine domain reason; ordinary pages usually end with 1–3.');
    }
  });

  if (avg > 3.5) {
    warn(warnings, 'Terminal-column warning: Average terminal-column count is ' + avg.toFixed(2) + ' across ' + pages.length + ' This–Then Pages. Check whether anti-stereotype variation has been achieved by overloading final columns.');
  }
  if (pagesWithFive > 1) {
    if (structuredOnly) {
      const unexcepted = pages.filter(function (s) { return s.terminalBoxes >= 5 && !excepted(s); });
      if (unexcepted.length && pages.length >= 4) {
        errors.push('Terminal-column error: ' + pagesWithFive + ' This–Then Pages have 5 or more terminal boxes and ' + unexcepted.map(function (s) { return '"' + s.label + '"'; }).join(', ') + ' ' + (unexcepted.length === 1 ? 'has' : 'have') + ' no shapePlan.terminalColumnExceptions entry. Several overloaded terminal columns suggest final-column multiplication — restructure those pages from domain logic or record structured exceptions with genuine domain reasons.');
      } else {
        warn(warnings, 'Terminal-column warning: ' + pagesWithFive + ' This–Then Pages have 5 or more terminal boxes. Several overloaded terminal columns suggest final-column multiplication rather than domain-shaped variation.');
      }
    } else {
      const msg2 = 'Terminal-column warning: ' + pagesWithFive + ' This–Then Pages have 5 or more terminal boxes. Several overloaded terminal columns suggest final-column multiplication rather than domain-shaped variation.';
      if (!justified && pages.length >= 4) errors.push(msg2);
      else warn(warnings, msg2);
    }
  }
  if (pagesWithFour >= Math.ceil(pages.length / 2)) {
    // The counter behind this message counts pages with exactly 4 terminal boxes
    // (pages with 5+ feed the dedicated overload checks above), so the wording
    // must not claim "4 or more" (ISSUES.md 2026-07-03, resolved in Section 3).
    warn(warnings, 'Terminal-column warning: most This–Then Pages have 4 terminal boxes. Ordinary pages should usually end with 1–3 page-level terminal outcomes unless genuine domain reasons are recorded.');
  }
  if (terminalDensest > pages.length / 2) {
    warn(warnings, 'Terminal-column warning: final/right-hand columns are often the densest columns. Check that page-shape variation is not mainly coming from adding terminal outcomes.');
  }
  if (pagesWithSixPlus && justified) {
    warn(warnings, 'Terminal-column warning: at least one page has 6 or more terminal boxes, but the config appears to contain a possible justification. Confirm the domain reason is explicit and adequate.');
  }
}

function validateConfig(cfg, shapePlan, strict, standardDocumentationPlanRequested) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(cfg)) errors.push('Config root must be a JSON object');
  if (errors.length) return { errors, warnings };

  if (!isNonEmptyString(cfg.title)) errors.push('Missing board title');
  if (!isNonEmptyString(cfg.slug)) {
    warn(warnings, 'Missing slug; expected output filename slug will be inferred as "' + slugify(cfg.title) + '" for filename-check purposes only');
  }

  if (!Array.isArray(cfg.subpages)) {
    errors.push('subpages must be an array');
  } else {
    const pageIds = new Set();
    cfg.subpages.forEach(function (p, pi) {
      if (!isPlainObject(p)) {
        errors.push('subpages[' + pi + '] must be an object');
        return;
      }
      if (!isNonEmptyString(p.id)) errors.push('Page at subpages[' + pi + '] missing id');
      if (p.id && pageIds.has(p.id)) errors.push('Duplicate page id: ' + p.id);
      if (p.id) pageIds.add(p.id);

      if (!isNonEmptyString(p.label)) warn(warnings, 'Page ' + (p.id || pi) + ' has no label');
      else warnNumberedPlaceholder('Page', p.label, 'subpages[' + pi + ']', warnings);
      const type = p.pageType || 'this_then';
      if (['this_then', 'how', 'documentation'].indexOf(type) === -1) {
        errors.push('Invalid pageType for ' + (p.id || ('subpages[' + pi + ']')) + ': ' + type);
      }
      if (type === 'this_then') validateThisThenPageColor(p, p.id || ('subpages[' + pi + ']'), errors);

      if (!Array.isArray(p.cols)) {
        errors.push('Page ' + (p.id || pi) + ' missing cols array');
      } else {
        p.cols.forEach(function (col, ci) {
          if (!isPlainObject(col)) {
            errors.push('Column ' + ci + ' on page ' + (p.id || pi) + ' must be an object');
            return;
          }
          if (type === 'this_then' && !isNonEmptyString(col.h)) warn(warnings, 'Column ' + ci + ' on page ' + p.id + ' has no heading');
          else if (type === 'this_then') warnNumberedPlaceholder('Column heading', col.h, 'page ' + (p.id || pi) + ' column ' + ci, warnings);
          if (!Array.isArray(col.boxes)) {
            errors.push('Column ' + ci + ' on page ' + (p.id || pi) + ' missing boxes array');
          } else {
            col.boxes.forEach(function (box, bi) {
              const label = boxLabelValue(box);
              if (!isNonEmptyString(label)) errors.push('Box ' + bi + ' in column ' + ci + ' on page ' + (p.id || pi) + ' has no label string');
              else warnNumberedPlaceholder('Box', label, 'page ' + (p.id || pi) + ' column ' + ci + ' box ' + bi, warnings);
              if (isPlainObject(box)) warn(warnings, 'Box ' + bi + ' in column ' + ci + ' on page ' + (p.id || pi) + ' is an object; the current engine expects cols.boxes labels, with rich fields carried in savedState.B');
            });
          }
        });
      }

      if (type === 'this_then' && !Array.isArray(p.cols)) errors.push('This–Then Page ' + (p.id || pi) + ' missing cols array');
      if (type === 'how') {
        if (!Array.isArray(p.howBoxes)) {
          errors.push('How Page ' + (p.id || pi) + ' missing howBoxes array');
        } else {
          const howIds = new Set();
          p.howBoxes.forEach(function (hb, hi) {
            if (!isPlainObject(hb)) {
              errors.push('How Box ' + hi + ' on page ' + (p.id || pi) + ' must be an object');
              return;
            }
            if (!isNonEmptyString(hb.id)) errors.push('How Box ' + hi + ' on page ' + (p.id || pi) + ' missing id');
            if (hb.id && howIds.has(hb.id)) errors.push('Duplicate How Box id on page ' + p.id + ': ' + hb.id);
            if (hb.id) howIds.add(hb.id);
            if (!isNonEmptyString(hb.label)) errors.push('How Box ' + (hb.id || hi) + ' on page ' + (p.id || pi) + ' missing label');
            else warnNumberedPlaceholder('How Box', hb.label, 'page ' + (p.id || pi) + ' howBox ' + (hb.id || hi), warnings);
          });
        }
      }
      if (type === 'documentation' && p.howBoxes && !Array.isArray(p.howBoxes)) {
        errors.push('Documentation Page ' + (p.id || pi) + ' howBoxes must be an array if present');
      }
      if (isPlainObject(p.overviewCard) && p.overviewCard.priority !== undefined) {
        validateFormalPriorityValue(p.overviewCard.priority, 'subpages[' + pi + '].overviewCard.priority', errors);
      }
    });
  }

  if (cfg.finalOutcomes !== undefined && !Array.isArray(cfg.finalOutcomes)) {
    errors.push('finalOutcomes must be an array if present');
  }
  if (Array.isArray(cfg.finalOutcomes)) {
    cfg.finalOutcomes.forEach(function (f, i) {
      const label = typeof f === 'string' ? f : (isPlainObject(f) ? f.label : '');
      if (!isNonEmptyString(label)) {
        errors.push('Final outcome at index ' + i + ' has no label string');
      } else {
        if (isPlainObject(f)) {
          warn(warnings, 'finalOutcomes[' + i + '] uses object form; the builder will use its label field. Generated configs should use plain string entries.');
        }
        warnNumberedPlaceholder('Final outcome', label, 'finalOutcomes[' + i + ']', warnings);
      }
    });
  } else {
    warn(warnings, 'finalOutcomes is missing; the board will have no Final Outcomes entries unless this is intentional');
  }

  if (cfg.sources !== undefined) {
    if (!Array.isArray(cfg.sources)) errors.push('sources must be an array if present');
    else cfg.sources.forEach(function (s, i) { validateSourceEntry(s, i, errors); });
  }

  const pages = Array.isArray(cfg.subpages) ? cfg.subpages : [];
  const pageById = new Map();
  pages.forEach(function (p) { if (p && p.id) pageById.set(p.id, p); });
  const docContent = cfg.savedState && isPlainObject(cfg.savedState.docContent) ? cfg.savedState.docContent : {};
  if (cfg.savedState && cfg.savedState.docContent !== undefined && !isPlainObject(cfg.savedState.docContent)) {
    errors.push('savedState.docContent must be an object if present');
  }
  Object.keys(docContent).forEach(function (id) {
    const p = pageById.get(id);
    if (!p) errors.push('savedState.docContent points to missing page: ' + id);
    else if ((p.pageType || 'this_then') !== 'documentation') errors.push('savedState.docContent key ' + id + ' is not a Documentation Page');
  });

  const knownBoxIds = collectKnownBoxIds(cfg, warnings);
  if (cfg.savedState && isPlainObject(cfg.savedState)) {
    validateLinkArray('savedState.ttLinks', cfg.savedState.ttLinks, knownBoxIds, errors, warnings);
    validateLinkArray('savedState.howLinks', cfg.savedState.howLinks, knownBoxIds, errors, warnings);
  }
  validateLinkArray('ttLinks', cfg.ttLinks, knownBoxIds, errors, warnings);
  validateLinkArray('howLinks', cfg.howLinks, knownBoxIds, errors, warnings);

  if (cfg.savedState && isPlainObject(cfg.savedState.B)) {
    Object.keys(cfg.savedState.B).forEach(function (k) {
      const b = cfg.savedState.B[k];
      if (!isPlainObject(b)) {
        warn(warnings, 'savedState.B[' + k + '] is not an object; older/unknown state field preserved without detailed validation');
      } else if (b.priority !== undefined) {
        validateFormalPriorityValue(b.priority, 'savedState.B[' + k + '].priority', errors);
      }
      if (isPlainObject(b) && b.light !== undefined) {
        validateTrafficLightValue(b.light, 'savedState.B[' + k + '].light', errors);
      }
    });
  }

  if (!cfg.savedState || !isPlainObject(cfg.savedState)) {
    errors.push('Generated standalone boards must include savedState with explicit viewSettings so Page View and display controls reopen consistently.');
  } else {
    if (!isPlainObject(cfg.savedState.viewSettings)) {
      errors.push('savedState.viewSettings is required for generated standalone boards. Use explicit thisThen, how, and finalOutcomes objects, with only requested Page View options turned on.');
    } else {
      ['thisThen', 'how', 'finalOutcomes'].forEach(function (section) {
        if (!isPlainObject(cfg.savedState.viewSettings[section])) {
          errors.push('savedState.viewSettings.' + section + ' is required for generated standalone boards.');
        }
      });
    }
  }

  validateStandardDocumentationPlan(cfg, strict === true, standardDocumentationPlanRequested === true, errors, warnings);
  validateCompactBoardLabels(cfg, strict === true, errors, warnings);

  const shapeAnalysis = shapeMetrics.analyzeShapes(cfg);
  warnRepeatedThisThenGeometry(cfg, shapeAnalysis, warnings, errors, shapePlan || null, strict === true);
  warnTerminalColumnOverload(cfg, shapeAnalysis, warnings, errors, shapePlan || null, strict === true);

  return { errors, warnings };
}

function escapeHtmlText(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlAttr(s) {
  return escapeHtmlText(s)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function canonicalDisclaimerInlineHtml(text) {
  return escapeHtmlText(text || '').replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, function (_match, label, url) {
    return '<a href="' + escapeHtmlAttr(url) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
  });
}

function canonicalDisclaimerDocHtml() {
  const sectionHeads = {
    'Walk-Through': true,
    'Accessing Consulting or Training': true,
    'Adapting the DoView Board Prototype App to your setting': true,
    Disclaimer: true
  };
  return CANONICAL_DISCLAIMER_TEXT.split(/\n{2,}/).map(function (block) {
    const text = block.trim();
    if (!text) return '';
    const html = canonicalDisclaimerInlineHtml(text).replace(/\n/g, '<br>');
    if (text === CANONICAL_DISCLAIMER_TITLE) return '<h1>' + html + '</h1>';
    if (sectionHeads[text]) return '<h2>' + html + '</h2>';
    return '<p>' + html + '</p>';
  }).join('\n');
}

function isCanonicalDisclaimerPage(p) {
  return isPlainObject(p) && (p.pageType || 'this_then') === 'documentation' && String(p.label || '').trim() === CANONICAL_DISCLAIMER_TITLE;
}

function canonicalDisclaimerPage(id) {
  return {
    id: id,
    label: CANONICAL_DISCLAIMER_TITLE,
    pageType: 'documentation',
    color: { bg: '#f3e8ff', bdr: '#d8b4fe', tab: '#8b5cf6' },
    cols: []
  };
}

function collectPageIds(pages, predicate) {
  const ids = [];
  if (!Array.isArray(pages)) return ids;
  pages.forEach(function (p) {
    if (!p || !p.id) return;
    if (!predicate || predicate(p)) ids.push(String(p.id));
  });
  return ids;
}

function chooseCanonicalDisclaimerPageId(cfg) {
  const topPages = Array.isArray(cfg.subpages) ? cfg.subpages : [];
  const savedPages = cfg.savedState && Array.isArray(cfg.savedState.SP) ? cfg.savedState.SP : [];
  const canonicalIds = collectPageIds(topPages, isCanonicalDisclaimerPage).concat(collectPageIds(savedPages, isCanonicalDisclaimerPage));
  const nonCanonicalIds = new Set(collectPageIds(topPages, function (p) { return !isCanonicalDisclaimerPage(p); }).concat(collectPageIds(savedPages, function (p) { return !isCanonicalDisclaimerPage(p); })));
  for (let i = 0; i < canonicalIds.length; i++) {
    if (!nonCanonicalIds.has(canonicalIds[i])) return canonicalIds[i];
  }
  const allIds = new Set(collectPageIds(topPages).concat(collectPageIds(savedPages)));
  let maxPageNumber = 0;
  allIds.forEach(function (id) {
    const m = /^p(\d+)$/.exec(id);
    if (m) maxPageNumber = Math.max(maxPageNumber, parseInt(m[1], 10));
  });
  let nextId;
  do {
    maxPageNumber++;
    nextId = 'p' + maxPageNumber;
  } while (allIds.has(nextId));
  return nextId;
}

function ensureCanonicalDisclaimerPageInList(pages, id) {
  if (!Array.isArray(pages)) return pages;
  const existing = pages.find(function (p) { return isCanonicalDisclaimerPage(p) && String(p.id) === String(id); }) || pages.find(isCanonicalDisclaimerPage);
  const kept = pages.filter(function (p) { return !isCanonicalDisclaimerPage(p); });
  kept.push(Object.assign({}, existing || {}, canonicalDisclaimerPage(id)));
  return kept;
}

function ensureCanonicalDisclaimerDocumentationPage(cfg) {
  const out = JSON.parse(JSON.stringify(cfg));
  if (!Array.isArray(out.subpages)) return out;

  const oldCanonicalIds = collectPageIds(out.subpages, isCanonicalDisclaimerPage);
  if (out.savedState && Array.isArray(out.savedState.SP)) {
    collectPageIds(out.savedState.SP, isCanonicalDisclaimerPage).forEach(function (id) { oldCanonicalIds.push(id); });
  }
  const pageId = chooseCanonicalDisclaimerPageId(out);
  out.subpages = ensureCanonicalDisclaimerPageInList(out.subpages, pageId);

  if (!isPlainObject(out.savedState)) out.savedState = {};
  if (Array.isArray(out.savedState.SP)) {
    out.savedState.SP = ensureCanonicalDisclaimerPageInList(out.savedState.SP, pageId);
  }
  if (!isPlainObject(out.savedState.docContent)) out.savedState.docContent = {};
  oldCanonicalIds.forEach(function (id) {
    if (id !== pageId) delete out.savedState.docContent[id];
  });
  out.savedState.docContent[pageId] = canonicalDisclaimerDocHtml();
  return out;
}

function escapeScriptJson(json) {
  return json
    .replace(/<\/script/gi, '<\\/script')
    .replace(/<!--/g, '<\\!--');
}

function countMatches(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}

function countStandaloneLine(html, line) {
  const re = new RegExp('^' + line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'gm');
  return countMatches(html, re);
}

function getStandaloneSection(html, openLine, closeLine) {
  const lines = html.split(/\n/);
  const start = lines.findIndex(function (line) { return line === openLine; });
  const end = lines.findIndex(function (line, i) { return i > start && line === closeLine; });
  if (start < 0 || end < 0 || end <= start) return '';
  return lines.slice(start + 1, end).join('\n');
}

function getBodySection(html) {
  return getStandaloneSection(html, '<body>', '</body>');
}

function getHeadSection(html) {
  return getStandaloneSection(html, '<head>', '</head>');
}


function normalizeConfig(cfg) {
  const out = JSON.parse(JSON.stringify(cfg));
  out.finalOutcomes = normalizeFinalOutcomeList(out.finalOutcomes);
  if (isPlainObject(out.savedState) && Array.isArray(out.savedState.FO)) {
    out.savedState.FO = normalizeFinalOutcomeList(out.savedState.FO);
  }
  if (!isPlainObject(out.savedState)) out.savedState = {};
  if (!isPlainObject(out.savedState.viewSettings)) out.savedState.viewSettings = simpleDefaultViewSettings();
  const defaultViewSettings = simpleDefaultViewSettings();
  ['thisThen', 'how', 'finalOutcomes'].forEach(function (section) {
    if (!isPlainObject(out.savedState.viewSettings[section])) out.savedState.viewSettings[section] = defaultViewSettings[section];
    Object.keys(defaultViewSettings[section]).forEach(function (key) {
      if (typeof out.savedState.viewSettings[section][key] !== 'boolean') out.savedState.viewSettings[section][key] = defaultViewSettings[section][key];
    });
  });
  if (isPlainObject(out.savedState.B)) {
    Object.keys(out.savedState.B).forEach(function (k) {
      if (isPlainObject(out.savedState.B[k])) {
        out.savedState.B[k].priority = normalizePriorityValue(out.savedState.B[k].priority);
        out.savedState.B[k].light = normalizeTrafficLightValue(out.savedState.B[k].light);
        if (/^final-b\d+$/.test(k)) out.savedState.B[k].label = finalOutcomeLabelValue(out.savedState.B[k].label);
      }
    });
  }
  if (Array.isArray(out.savedState.ttLinks)) {
    out.savedState.ttLinks.forEach(function (l) {
      if (isPlainObject(l)) l.light = normalizeTrafficLightValue(l.light);
    });
  }
  if (Array.isArray(out.subpages)) {
    out.subpages.forEach(function (p) {
      if (isPlainObject(p) && isPlainObject(p.overviewCard)) p.overviewCard.priority = normalizePriorityValue(p.overviewCard.priority);
    });
  }
  if (Array.isArray(out.savedState.SP)) {
    out.savedState.SP.forEach(function (p) {
      if (isPlainObject(p) && isPlainObject(p.overviewCard)) p.overviewCard.priority = normalizePriorityValue(p.overviewCard.priority);
    });
  }
  return out;
}

function generatedUid(prefix) {
  return (prefix || 'id') + '_' + crypto.randomUUID();
}

function canonicalBoxState(label, existing, prefix) {
  const box = isPlainObject(existing) ? existing : {};
  box.label = String(label || '');
  box.light = normalizeTrafficLightValue(box.light);
  box.priority = normalizePriorityValue(box.priority);
  if (!Array.isArray(box.entries)) box.entries = [];
  if (typeof box.hasSubpage !== 'boolean') box.hasSubpage = false;
  if (typeof box.detailText !== 'string') box.detailText = '';
  if (typeof box.borderColor !== 'string') box.borderColor = '';
  if (typeof box.boxColor !== 'string') box.boxColor = '';
  if (!Array.isArray(box.measures)) box.measures = [];
  if (!Array.isArray(box.evalQuestions)) box.evalQuestions = [];
  if (!Array.isArray(box.tagIds)) box.tagIds = [];
  if (typeof box.jumpToPage !== 'string') box.jumpToPage = '';
  if (!isNonEmptyString(box.uid)) box.uid = generatedUid(prefix || 'box');
  return box;
}

function nextNumericId(items, field, re) {
  let highest = 0;
  (Array.isArray(items) ? items : []).forEach(function (item) {
    const value = item && item[field];
    const match = typeof value === 'string' ? value.match(re) : null;
    if (match) highest = Math.max(highest, parseInt(match[1], 10));
  });
  return highest + 1;
}

function canonicalizeFullConfig(cfg) {
  const out = cloneJson(cfg);
  const state = isPlainObject(out.savedState) ? out.savedState : {};
  const usesSavedRuntime = isPlainObject(state.B) && Array.isArray(state.SP);
  const runtimePages = usesSavedRuntime ? cloneJson(state.SP) : cloneJson(Array.isArray(out.subpages) ? out.subpages : []);
  const runtimeFinalOutcomes = usesSavedRuntime
    ? normalizeFinalOutcomeList(Array.isArray(state.FO) ? state.FO : (Array.isArray(out.finalOutcomes) ? out.finalOutcomes : []))
    : normalizeFinalOutcomeList(Array.isArray(out.finalOutcomes) ? out.finalOutcomes : []);

  out.format = JSON_FORMAT;
  out.schemaVersion = SCHEMA_VERSION;
  out.engineVersion = ENGINE_VERSION;
  out.subpages = runtimePages;
  out.finalOutcomes = runtimeFinalOutcomes;
  out.savedState = state;
  state.B = isPlainObject(state.B) ? state.B : {};

  runtimePages.forEach(function (page) {
    if (!isPlainObject(page)) return;
    if (!isNonEmptyString(page.uid)) page.uid = generatedUid('page');
    if (!Array.isArray(page.cols)) page.cols = [];
    page.cols.forEach(function (col, ci) {
      if (!isPlainObject(col)) return;
      if (!isNonEmptyString(col.uid)) col.uid = generatedUid('col');
      if (!Array.isArray(col.boxes)) col.boxes = [];
      col.boxes.forEach(function (rawLabel, bi) {
        const label = boxLabelValue(rawLabel);
        const key = page.id + '-c' + ci + '-b' + bi;
        state.B[key] = canonicalBoxState(label === null ? '' : label, state.B[key], 'box');
      });
    });
    if (Array.isArray(page.howBoxes)) {
      page.howBoxes.forEach(function (howBox) {
        if (!isPlainObject(howBox) || !isNonEmptyString(howBox.id)) return;
        const key = page.id + '-' + howBox.id;
        const existing = isPlainObject(state.B[key]) ? state.B[key] : {};
        const sharedUid = isNonEmptyString(howBox.uid) ? howBox.uid : (isNonEmptyString(existing.uid) ? existing.uid : generatedUid('box'));
        howBox.uid = sharedUid;
        existing.uid = sharedUid;
        state.B[key] = canonicalBoxState(howBox.label, existing, 'box');
      });
    }
  });

  runtimeFinalOutcomes.forEach(function (label, i) {
    const key = 'final-b' + i;
    state.B[key] = canonicalBoxState(label, state.B[key], 'final');
  });

  state.SP = cloneJson(runtimePages);
  state.FO = cloneJson(runtimeFinalOutcomes);
  if (!isNonEmptyString(state.boardUid)) state.boardUid = generatedUid('board');
  if (!Array.isArray(state.ttLinks)) state.ttLinks = [];
  if (!Array.isArray(state.howLinks)) state.howLinks = [];
  if (!Array.isArray(state.measures)) state.measures = [];
  if (!Array.isArray(state.evalQuestions)) state.evalQuestions = [];
  if (!Array.isArray(state.tags)) state.tags = [];
  if (!isPlainObject(state.pageInfo)) state.pageInfo = {};
  if (!isPlainObject(state.docContent)) state.docContent = {};
  if (typeof state.boardInfo !== 'string') state.boardInfo = '';
  if (typeof state.topRightText !== 'string') state.topRightText = '';
  if (typeof state.presentationView !== 'boolean') state.presentationView = false;
  if (typeof state.sourcesInitialized !== 'boolean') state.sourcesInitialized = false;

  state.ttLinks.forEach(function (link) { if (isPlainObject(link) && !isNonEmptyString(link.uid)) link.uid = generatedUid('link'); });
  state.howLinks.forEach(function (link) { if (isPlainObject(link) && !isNonEmptyString(link.uid)) link.uid = generatedUid('link'); });
  state.measures.forEach(function (measure) { if (isPlainObject(measure) && !isNonEmptyString(measure.uid)) measure.uid = generatedUid('measure'); });
  state.evalQuestions.forEach(function (question) { if (isPlainObject(question) && !isNonEmptyString(question.uid)) question.uid = generatedUid('eq'); });

  if (!Number.isInteger(state.ttLinkNextId) || state.ttLinkNextId < 1) state.ttLinkNextId = nextNumericId(state.ttLinks, 'id', /(?:ttl_|TT)(\d+)$/i);
  if (!Number.isInteger(state.howLinkNextId) || state.howLinkNextId < 1) state.howLinkNextId = nextNumericId(state.howLinks, 'id', /(?:hwl_|HL)(\d+)$/i);
  if (!Number.isInteger(state.measureNextId) || state.measureNextId < 1) state.measureNextId = nextNumericId(state.measures, 'id', /^M0*(\d+)$/i);
  if (!Number.isInteger(state.eqNextId) || state.eqNextId < 1) state.eqNextId = nextNumericId(state.evalQuestions, 'id', /^EQ0*(\d+)$/i);

  out.subpages = cloneJson(state.SP);
  out.finalOutcomes = cloneJson(state.FO);
  return out;
}

function validateCanonicalConfig(cfg) {
  const errors = [];
  validateNoObsoleteDoViewBoardsUrl(cfg, 'Canonical board configuration', errors);
  const state = cfg.savedState;
  if (cfg.format !== JSON_FORMAT) errors.push('format must be ' + JSON_FORMAT);
  if (cfg.schemaVersion !== SCHEMA_VERSION) errors.push('schemaVersion must be ' + SCHEMA_VERSION);
  if (cfg.engineVersion !== ENGINE_VERSION) errors.push('engineVersion must be ' + ENGINE_VERSION);
  if (!isPlainObject(state) || !isPlainObject(state.B) || !Array.isArray(state.SP) || !Array.isArray(state.FO)) {
    errors.push('Canonical JSON must include savedState.B, savedState.SP, and savedState.FO');
    return errors;
  }

  const knownBoxIds = collectKnownBoxIds({ subpages: state.SP, finalOutcomes: state.FO }, [], state.SP);
  knownBoxIds.forEach(function (key) {
    if (!isPlainObject(state.B[key])) errors.push('Canonical JSON is missing savedState.B[' + key + ']');
  });
  Object.keys(state.B).forEach(function (key) {
    if (!knownBoxIds.has(key)) errors.push('savedState.B contains a box key not present in savedState.SP or savedState.FO: ' + key);
  });

  function validateLinks(name, links) {
    links.forEach(function (link, i) {
      if (!isPlainObject(link)) return;
      if (!knownBoxIds.has(link.from)) errors.push(name + '[' + i + '].from points to missing box: ' + link.from);
      if (!knownBoxIds.has(link.to)) errors.push(name + '[' + i + '].to points to missing box: ' + link.to);
    });
  }
  validateLinks('savedState.ttLinks', state.ttLinks);
  validateLinks('savedState.howLinks', state.howLinks);

  const measureIds = new Set(state.measures.map(function (measure) { return measure && measure.id; }).filter(Boolean));
  const eqIds = new Set(state.evalQuestions.map(function (question) { return question && question.id; }).filter(Boolean));
  const tagIds = new Set(state.tags.map(function (tag) { return tag && tag.id; }).filter(Boolean));
  const pageIds = new Set(state.SP.map(function (page) { return page && page.id; }).filter(Boolean));
  pageIds.add('overview');
  pageIds.add('final');
  function validateIdRefs(values, knownIds, owner, kind) {
    (Array.isArray(values) ? values : []).forEach(function (id, i) {
      if (!knownIds.has(id)) errors.push(owner + '[' + i + '] points to missing ' + kind + ': ' + id);
    });
  }
  Object.keys(state.B).forEach(function (key) {
    const box = state.B[key];
    validateIdRefs(box.measures, measureIds, 'savedState.B[' + key + '].measures', 'Measure');
    validateIdRefs(box.evalQuestions, eqIds, 'savedState.B[' + key + '].evalQuestions', 'Evaluation Question');
    validateIdRefs(box.tagIds, tagIds, 'savedState.B[' + key + '].tagIds', 'tag');
    if (box.jumpToPage && !pageIds.has(box.jumpToPage)) errors.push('savedState.B[' + key + '].jumpToPage points to missing page: ' + box.jumpToPage);
  });
  state.ttLinks.forEach(function (link, i) {
    if (!isPlainObject(link)) return;
    validateIdRefs(link.measures, measureIds, 'savedState.ttLinks[' + i + '].measures', 'Measure');
    validateIdRefs(link.evalQuestions, eqIds, 'savedState.ttLinks[' + i + '].evalQuestions', 'Evaluation Question');
    validateIdRefs(link.tagIds, tagIds, 'savedState.ttLinks[' + i + '].tagIds', 'tag');
  });
  state.howLinks.forEach(function (link, i) {
    if (isPlainObject(link)) validateIdRefs(link.tagIds, tagIds, 'savedState.howLinks[' + i + '].tagIds', 'tag');
  });
  state.measures.forEach(function (measure, i) {
    if (isPlainObject(measure)) validateIdRefs(measure.tagIds, tagIds, 'savedState.measures[' + i + '].tagIds', 'tag');
  });
  state.evalQuestions.forEach(function (question, i) {
    if (isPlainObject(question)) validateIdRefs(question.tagIds, tagIds, 'savedState.evalQuestions[' + i + '].tagIds', 'tag');
  });

  function findEmbeddedCredential(value, owner) {
    if (!value || typeof value !== 'object') return;
    Object.keys(value).forEach(function (key) {
      const normalized = key.toLowerCase().replace(/[^a-z]/g, '');
      const childOwner = owner ? owner + '.' + key : key;
      if (normalized === 'apikey' || normalized === 'aikey' || (normalized === 'key' && /(?:^|\.)aiSettings$/i.test(owner))) {
        errors.push(childOwner + ' must not contain an API key or AI credential');
      }
      findEmbeddedCredential(value[key], childOwner);
    });
  }
  findEmbeddedCredential(cfg, '');

  const uidOwners = new Map();
  function registerUid(uid, owner) {
    if (!isNonEmptyString(uid)) { errors.push(owner + ' is missing uid'); return; }
    if (uidOwners.has(uid)) errors.push('Duplicate uid ' + uid + ' on ' + owner + ' and ' + uidOwners.get(uid));
    else uidOwners.set(uid, owner);
  }
  registerUid(state.boardUid, 'savedState.boardUid');
  state.SP.forEach(function (page, pi) {
    registerUid(page.uid, 'savedState.SP[' + pi + ']');
    (page.cols || []).forEach(function (col, ci) { registerUid(col.uid, 'savedState.SP[' + pi + '].cols[' + ci + ']'); });
  });
  Object.keys(state.B).forEach(function (key) { registerUid(state.B[key].uid, 'savedState.B[' + key + ']'); });
  state.ttLinks.forEach(function (link, i) { if (isPlainObject(link)) registerUid(link.uid, 'savedState.ttLinks[' + i + ']'); });
  state.howLinks.forEach(function (link, i) { if (isPlainObject(link)) registerUid(link.uid, 'savedState.howLinks[' + i + ']'); });
  state.measures.forEach(function (measure, i) { if (isPlainObject(measure)) registerUid(measure.uid, 'savedState.measures[' + i + ']'); });
  state.evalQuestions.forEach(function (question, i) { if (isPlainObject(question)) registerUid(question.uid, 'savedState.evalQuestions[' + i + ']'); });
  return errors;
}

function defaultJsonOutputPath(htmlPath) {
  return /\.html$/i.test(htmlPath) ? htmlPath.replace(/\.html$/i, '.json') : htmlPath + '.json';
}

function assembleHtml(engineText, cfg) {
  const title = escapeHtmlText(cfg.title || 'DoView Board');
  const configJson = escapeScriptJson(JSON.stringify(cfg, null, 2));
  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<title>' + title + '</title>',
    '<script>',
    engineText.replace(/\s*$/, ''),
    '</script>',
    '</head>',
    '<body>',
    '<script>',
    'DoView.init(' + configJson + ');',
    '</script>',
    '</body>',
    '</html>',
    ''
  ].join('\n');
}

function validateHtml(html, outPath) {
  const errors = [];
  const warnings = [];
  if (!html.startsWith('<!DOCTYPE html>\n')) errors.push('Final HTML must start exactly with <!DOCTYPE html> followed by a newline');
  if (countStandaloneLine(html, '<head>') !== 1 || countStandaloneLine(html, '</head>') !== 1) errors.push('Final HTML must contain exactly one head');
  if (countStandaloneLine(html, '<body>') !== 1 || countStandaloneLine(html, '</body>') !== 1) errors.push('Final HTML must contain exactly one body');
  if (!/<\/html>\s*$/i.test(html)) errors.push('Final HTML must end with </html>');
  if (html.includes(OBSOLETE_DOVIEW_BOARDS_URL)) errors.push('Final HTML contains the obsolete DoView Boards URL.');

  const head = getHeadSection(html);
  const body = getBodySection(html);
  if (!head) errors.push('Could not isolate head section');
  if (!body) errors.push('Could not isolate body section');

  const headEngineMarkers = countMatches(head, /return\s*\{\s*init\s*\}/g);
  if (headEngineMarkers !== 1) errors.push('Engine must appear exactly once in the head (return { init } count in head: ' + headEngineMarkers + ')');

  const wholeEngineMarkers = countMatches(html, /return\s*\{\s*init\s*\}/g);
  if (wholeEngineMarkers !== 1) errors.push('Engine appears duplicated or missing in final HTML (return { init } count: ' + wholeEngineMarkers + ')');

  const bodyInitCount = countMatches(body, /DoView\.init\s*\(/g);
  if (bodyInitCount !== 1) errors.push('Body must contain exactly one DoView.init(...) config call (found: ' + bodyInitCount + ')');

  if (/function\s+render\s*\(/.test(body) || /const\s+DoView\s*=/.test(body) || /DoView\s+Engine\s+V\d/.test(body)) {
    errors.push('Body appears to contain engine code');
  }
  if (/DoView Board Builder V\d|function\s+parseArgs\s*\(|function\s+validateConfig\s*\(/.test(html)) {
    errors.push('Final HTML must not contain builder code');
  }
  if (/AI DoView Drawing Prompt|START BEHAVIOUR|THE SEVEN QUESTIONS/i.test(html)) {
    errors.push('Final HTML must not contain prompt text');
  }
  if (/validate-doview-config\.js/i.test(html)) {
    errors.push('Final HTML must not contain temporary validation code');
  }
  const base = path.basename(outPath || '');
  if (base && !EXPECTED_FILENAME_RE.test(base)) {
    errors.push('Output filename does not match V1.4.3 pattern <board>-1-4-3-step-1-base-doview-board[-model][-effort]-<yyyy-mm-dd>-<hhmm>.html or the equivalent step-2-prototype-doview-board-with-how-links form: ' + base);
  }
  return { errors, warnings };
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(usage());
    return;
  }

  if (!args.engine) fail('Missing --engine argument');
  if (!args.config) fail('Missing --config argument');
  if (!args.out) fail('Missing --out argument');
  const jsonOut = args.jsonOut || defaultJsonOutputPath(args.out);
  if (path.resolve(jsonOut) === path.resolve(args.out)) fail('JSON and HTML output paths must be different');
  if (path.resolve(jsonOut) === path.resolve(args.config)) fail('Canonical JSON output would overwrite the input config; use --json-out with a different path');

  const engineText = readTextFile(args.engine, 'engine');
  if (!engineText.trim()) fail('Engine file is empty: ' + args.engine);
  if (looksLikeWholeHtml(engineText)) fail('Engine file appears to be HTML. Expected the DoView engine JavaScript file: ' + args.engine);
  if (!/const\s+DoView\s*=/.test(engineText) && !/return\s*\{\s*init\s*\}/.test(engineText)) {
    fail('Engine file does not look like the DoView engine JavaScript: ' + args.engine);
  }

  const configText = readTextFile(args.config, 'config');
  const rawCfg = parseConfig(configText, args.config);
  if (rawCfg.generationChecks === undefined && args.compatibility !== true) {
    fail('Newly generated boards require top-level generationChecks and strict-generated validation. Add complete generationChecks and rebuild. Use --compatibility only for an existing legacy board, never to complete a new AI-generated board.');
  }
  const preflightResult = runGenerationPreflight(rawCfg);
  if (preflightResult.errors.length) {
    console.error('DoView strict preflight validation failed:');
    preflightResult.errors.forEach(function (e) { console.error('- ' + e); });
    if (preflightResult.autoFixes.length) {
      console.error('Auto-fixes applied before validation stopped:');
      preflightResult.autoFixes.forEach(function (fix) { console.error('- ' + fix); });
    }
    if (preflightResult.warnings.length) {
      console.error('Warnings:');
      preflightResult.warnings.forEach(function (w) { console.error('- ' + w); });
    }
    process.exit(1);
  }
  const cfg = ensureCanonicalDisclaimerDocumentationPage(stripBuilderOnlyMetadata(preflightResult.cfg));
  ensureSourcesRegistryCompleteness(cfg, preflightResult.autoFixes, preflightResult.workflowStep);
  const configResult = validateConfig(cfg, preflightResult.shapePlan, preflightResult.mode === 'strict-generated', preflightResult.standardDocumentationPlanRequested);
  if (configResult.errors.length) {
    console.error('DoView config validation failed:');
    configResult.errors.forEach(function (e) { console.error('- ' + e); });
    if (configResult.warnings.length) {
      console.error('Warnings:');
      configResult.warnings.forEach(function (w) { console.error('- ' + w); });
    }
    process.exit(1);
  }

  const stampWarnings = preflightResult.warnings.concat(configResult.warnings);
  let normalizedCfg = canonicalizeFullConfig(normalizeConfig(cfg));
  normalizedCfg.builderValidation = createBuilderValidationStamp(preflightResult.mode, stampWarnings, preflightResult.autoFixes, preflightResult.workflowStep, normalizedCfg, preflightResult.competencyReview, preflightResult.mappingBreadthReview, preflightResult.linkCredibilityReview, preflightResult.linkExplanationReview, preflightResult.linkEvidenceReview, preflightResult.thisThenCausalReview, preflightResult.generatorSelfReview, preflightResult.previousValidation, preflightResult.graphValidation);
  normalizedCfg = canonicalizeFullConfig(normalizedCfg);
  const canonicalErrors = validateCanonicalConfig(normalizedCfg);
  if (canonicalErrors.length) {
    console.error('DoView canonical JSON validation failed:');
    canonicalErrors.forEach(function (e) { console.error('- ' + e); });
    process.exit(1);
  }
  const canonicalJson = JSON.stringify(normalizedCfg, null, 2) + '\n';
  const html = assembleHtml(engineText, normalizedCfg);
  const htmlResult = validateHtml(html, args.out);
  const warnings = preflightResult.warnings.concat(configResult.warnings, htmlResult.warnings);
  if (htmlResult.errors.length) {
    console.error('DoView HTML validation failed:');
    htmlResult.errors.forEach(function (e) { console.error('- ' + e); });
    if (warnings.length) {
      console.error('Warnings:');
      warnings.forEach(function (w) { console.error('- ' + w); });
    }
    process.exit(1);
  }

  try {
    const outDir = path.dirname(path.resolve(args.out));
    const jsonOutDir = path.dirname(path.resolve(jsonOut));
    fs.mkdirSync(outDir, { recursive: true });
    fs.mkdirSync(jsonOutDir, { recursive: true });
    fs.writeFileSync(jsonOut, canonicalJson, 'utf8');
    fs.writeFileSync(args.out, html, 'utf8');
  } catch (e) {
    fail('Could not write canonical JSON and HTML outputs (' + e.message + ')');
  }

  const writtenJson = readTextFile(jsonOut, 'json-out');
  let parsedWrittenJson;
  try { parsedWrittenJson = JSON.parse(writtenJson); } catch (e) { fail('Written canonical JSON is invalid: ' + e.message); }
  const writtenJsonErrors = validateCanonicalConfig(parsedWrittenJson);
  if (writtenJsonErrors.length) {
    console.error('DoView written JSON validation failed:');
    writtenJsonErrors.forEach(function (e) { console.error('- ' + e); });
    process.exit(1);
  }
  if (JSON.stringify(parsedWrittenJson) !== JSON.stringify(normalizedCfg)) fail('Written canonical JSON differs from the validated config');

  const written = readTextFile(args.out, 'out');
  const writtenResult = validateHtml(written, args.out);
  if (writtenResult.errors.length) {
    console.error('DoView written-file validation failed:');
    writtenResult.errors.forEach(function (e) { console.error('- ' + e); });
    process.exit(1);
  }

  console.log('DoView build succeeded:');
  console.log('- Canonical JSON: ' + jsonOut);
  console.log('- Standalone HTML: ' + args.out);
  console.log('Validated config: ' + args.config);
  console.log('Builder validation stamp inserted: ' + preflightResult.mode + ' (' + BUILDER_VERSION + ')');
  console.log('Validated HTML: engine once in head, one body-only DoView.init(...) config call, standalone output');
  if (preflightResult.autoFixes.length) {
    console.log('Auto-fixes applied:');
    preflightResult.autoFixes.forEach(function (fix) { console.log('- ' + fix); });
  }
  const reportedWarnings = Array.from(new Set(warnings.concat(writtenResult.warnings)));
  if (reportedWarnings.length) {
    console.log('Warnings:');
    reportedWarnings.forEach(function (w) { console.log('- ' + w); });
  }
}

if (require.main === module) main();

module.exports = {
  workflowStructureDigest,
  workflowMappingDigest,
  workflowEvidenceDigest,
  evidenceAnnotationDigest,
  validateCanonicalConfig,
  canonicalizeFullConfig,
  normalizeConfig
};
