#!/usr/bin/env node
'use strict';

/*
DoView Board Builder V1.3.7
Public release: 2026-06-26
Plain Node.js local builder for assembling validated config-first DoView boards into single-file HTML outputs. No external npm packages.
See CHANGELOG.md for release history and security notes.
*/

const fs = require('fs');
const path = require('path');

const BUILDER_VERSION = 'V1.3.7';
const VALIDATION_VERSION = 'V1.3.7';
const EXPECTED_FILENAME_RE = /^[a-z0-9][a-z0-9-]*_doview-board_[vV]\d+\.\d+\.\d+_\d{4}-\d{2}-\d{2}\.html$/;

const SIMPLE_DEFAULT_VIEW_SETTINGS = {
  thisThen: { showCounts: false, showTrafficLights: false, showPriorities: false, showHowCounts: false, showMeasures: false, showEvalQuestions: false, showMainText: false, showMainTextCodeStyle: false, showLinkInfoOnHover: false, showLinkInfoCodeStyle: false, showLateralHow: false, showTags: false },
  how: { showNumbering: false, showTrafficLights: false, showPriorities: false, showWhyCounts: false, showLateralHow: false, showMeasures: false, showEvalQuestions: false, showMainText: false, showMainTextCodeStyle: false, showTags: false },
  finalOutcomes: { showTrafficLights: false, showPriorities: false, showMeasures: false, showEvalQuestions: false, showMainText: false, showMainTextCodeStyle: false, showTags: false }
};
const PRIORITY_VALUES = ['A', 'B', 'C', 'D', 'E', 'BAU'];
const TRAFFIC_LIGHT_VALUES = ['green', 'greenYellow', 'yellow', 'yellowRed', 'red', 'grey'];
const DOC_CLONE_TYPES = ['page_title', 'box_title', 'box_main_text', 'measure', 'eval_question', 'link'];
const NO_LEVEL_HOW_PAGE_RE = /\b(?:cross[\s-]?link|non[\s-]?hierarchical|non[\s-]?vertical|no[\s-]?level)\b/i;
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
  /public evidence sources for the board include/i
];
const HOW_LINK_TEXT_BANNED_PATTERNS = [
  /supports implementation/i,
  /capabilit(?:y|ies) enables? activit(?:y|ies)/i,
  /supports? the next (?:activity|implementation item|workstream)/i
];
const CANONICAL_DISCLAIMER_TITLE = 'Using DoView Boards and Disclaimer';
const CANONICAL_DISCLAIMER_TEXT = `Using DoView Boards and Disclaimer

See the disclaimer section below.

The DoView Board prompt and the DoView Board built within this DoView Board prototype app are provided free of charge so that anyone can experiment with DoView Boards and explore for themselves how they can answer the 20 key questions that anyone running or overseeing an organization needs to answer. See [https://doviewplanning.org/doviewboardsuse](https://doviewplanning.org/doviewboardsuse).

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
  'https://doviewplanning.org/doviewboardsuse',
  'https://doviewplanning.org/help',
  'https://doviewplanning.org/walkthrough',
  'https://doviewplanning.org/offerings',
  'https://github.com/doviewplanning/official-doview-boards',
  'https://doviewplanning.org/trademarkuse',
  'https://doviewplanning.org/contact',
  'https://doviewplanning.org/doviewboards',
  'https://doviewplanning.org/collaborate'
];
function simpleDefaultViewSettings() { return JSON.parse(JSON.stringify(SIMPLE_DEFAULT_VIEW_SETTINGS)); }

function usage() {
  return [
    'DoView Board Builder ' + BUILDER_VERSION,
    '',
    'Usage:',
    '  node doview-board-builder.js --engine <engine-file> --config <config-json-file> --out <output-html-file>',
    '',
    'Example:',
    '  node doview-board-builder.js \\',
    '    --engine doview-board-engine.js \\',
    '    --config doview-board-config.json \\',
    '    --out labour-2026-nz-election_doview-board_v1.3.7_2026-06-26.html',
    '',
    'Inputs:',
    '  --engine   DoView engine JavaScript file, usually doview-board-engine.js',
    '  --config   Pure JSON board config file, usually doview-board-config.json',
    '  --out      Final single-file HTML output path',
    '',
    'Notes:',
    '  - The config must be JSON only, not DoView.init({...}) JavaScript.',
    '  - The generated board is a standalone HTML file containing active JavaScript; treat it like executable web content, not a passive document.',
    '  - Prefer this builder path for final boards: provide pure JSON config and let a vetted, known-good engine and builder assemble the HTML.',
    '  - When top-level generationChecks metadata is present, strict preflight validation runs automatically and builder-only metadata is stripped before HTML output.',
    '  - Do not manually embed prompt text, builder source, examples, or duplicate engine code into final board HTML.',
    '  - For production, enterprise, or multi-user deployment, use sandboxing, isolated origins, or another restricted viewer for generated boards.',
    'Prototype/intended-use notice: the prototype is designed for experimentation, learning, proof-of-concept uses, and non-confidential information in low-risk environments; for higher-risk, sensitive, regulated, public, multi-user, enterprise, or production use, put in place security, privacy, compliance, hosting, access-control, audit, data-handling, integration, and deployment arrangements appropriate to the intended environment. See https://doviewplanning.org/trademarkuse for DoView trademark-use guidance.',
    '  - Do not host untrusted generated board HTML on the same origin as sensitive cookies, admin sessions, or privileged tools.',
    '  - The builder is only an assembly and technical validation tool; do content-quality, source, sensitivity, and human-review checks before config finalization or publication.',
    '  - No npm install or external package is required.'
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
    if (a === '--engine' || a === '--config' || a === '--out') {
      const v = argv[i + 1];
      if (!v || v.indexOf('--') === 0) fail('Missing value for ' + a);
      args[a.slice(2)] = v;
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
  return /^(?:condition|outcome|box|step|pathway|stage|page|row|column|area|major area|item|implementation item|discovery condition)\s+0*\d+(?:\.\d+)*\s*[:.)-]?\s*$/i.test(text);
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
  if (runtimeUsesSavedSP(cfg)) return Array.isArray(state.FO) ? state.FO : [];
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
  const inspected = [];
  links.forEach(function (link, i) {
    if (!isPlainObject(link)) return;
    const where = location + '[' + i + ']';
    const text = typeof link.mainText === 'string' ? link.mainText.trim() : '';
    if (!text) {
      errors.push(where + '.mainText is required because ' + kind + ' Display Text was requested');
      return;
    }
    if (textWords(text).length < 4) {
      errors.push(where + '.mainText is too generic or short for relationship-specific ' + kind + ' Display Text: "' + text + '"');
    }
    const banned = firstMatchingPattern(text, LINK_TEXT_BANNED_PATTERNS.concat(kind === 'How-link' ? HOW_LINK_TEXT_BANNED_PATTERNS : []));
    if (banned) {
      errors.push(where + '.mainText contains banned or generic boilerplate (' + banned + '): "' + text + '"');
    }
    if (requireUrl && !/https?:\/\/\S+/i.test(text)) {
      errors.push(where + '.mainText must include a relationship-specific evidence URL because generationChecks.linkEvidenceUrlsRequested is true');
    }
    const fromLabel = labels[link.from] || '';
    const toLabel = labels[link.to] || '';
    if (!linkTextReflectsEndpoint(text, fromLabel, toLabel)) {
      errors.push(where + '.mainText does not refer to the actual source or target box content (' + (fromLabel || link.from) + ' -> ' + (toLabel || link.to) + ')');
    }
    inspected.push({ where: where, text: text, normalized: normalizeSearchText(text), frame: endpointFrame(text, fromLabel, toLabel) });
  });

  for (let i = 0; i < inspected.length; i++) {
    for (let j = i + 1; j < inspected.length; j++) {
      const left = inspected[i];
      const right = inspected[j];
      if (left.normalized === right.normalized) {
        errors.push(location + ' repeats identical ' + kind + ' mainText at ' + left.where + ' and ' + right.where);
      } else if (tokenSimilarity(left.text, right.text) >= 0.82) {
        errors.push(location + ' has near-repeated ' + kind + ' mainText at ' + left.where + ' and ' + right.where);
      } else if (left.frame && left.frame.split(' ').length >= 4 && left.frame === right.frame) {
        errors.push(location + ' repeats a ' + kind + ' sentence frame at ' + left.where + ' and ' + right.where);
      }
    }
  }
}

function validateStrictLinkText(cfg, checks, errors) {
  const labels = collectBoxLabelMap(cfg);
  const requireUrl = checks.linkEvidenceUrlsRequested === true;
  if (checks.linkDisplayTextRequested === true) {
    const locations = linkArrayLocations(cfg, 'ttLinks');
    if (!locations.length || !locations.some(function (item) { return item.links.length; })) {
      errors.push('generationChecks.linkDisplayTextRequested is true but no This-Then links were generated');
    }
    locations.forEach(function (item) {
      validateStrictLinkTextArray(item.name, 'This-Then link', item.links, labels, requireUrl, errors);
    });
  }
  if (checks.howLinkDisplayTextRequested === true) {
    const locations = linkArrayLocations(cfg, 'howLinks');
    if (!locations.length || !locations.some(function (item) { return item.links.length; })) {
      errors.push('generationChecks.howLinkDisplayTextRequested is true but no How links were generated');
    }
    locations.forEach(function (item) {
      validateStrictLinkTextArray(item.name, 'How-link', item.links, labels, requireUrl, errors);
    });
  }
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
    if (seen[normalized]) {
      reportModeIssue(strict, errors, warnings, location + ' repeats identical ' + kind + ' mainText at ' + seen[normalized] + ' and ' + where);
    } else {
      seen[normalized] = where;
    }
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

function runGenerationPreflight(cfg) {
  const out = cloneJson(cfg);
  const errors = [];
  const warnings = [];
  const autoFixes = [];
  const hasChecks = out.generationChecks !== undefined;
  const checks = hasChecks && isPlainObject(out.generationChecks) ? out.generationChecks : {};
  const strict = hasChecks && isPlainObject(out.generationChecks);
  if (hasChecks && !isPlainObject(out.generationChecks)) {
    errors.push('generationChecks must be an object when present');
  }
  if (Object.prototype.hasOwnProperty.call(out, 'builderValidation')) {
    delete out.builderValidation;
    pushAutoFix(autoFixes, 'Removed input builderValidation metadata. The builder creates a fresh validation stamp only after validation passes.');
  }

  enforceNoLevelHowPages(out, checks, strict, errors, warnings, autoFixes);
  validateUniqueNumberedHowLevels(out, errors);
  validateEffectivePageStateConsistency(out, strict, errors, warnings);
  validateCanonicalMeasureEvalQuestionIds(out, strict, errors, warnings);
  validateBaselineLinkText(out, strict, errors, warnings);
  validateRuntimeSurvivingLinks(out, strict, errors, warnings);
  validateDocumentationClones(out, checks, strict, errors, warnings);
  if (strict) {
    validateStrictLinkText(out, checks, errors);
    validateRequestedAttachments(out, checks, errors);
    if (checks.allPageViewOptionsOffUnlessRequested === true) clearUnrequestedViewOptions(out, checks, errors, autoFixes);
    validateUnrequestedBoxDisplayText(out, checks, errors);
    validateUnrequestedTrafficLights(out, checks, errors, autoFixes);
    validateUnrequestedPriorities(out, checks, errors, autoFixes);
  } else {
    warn(warnings, 'generationChecks metadata is absent; compatibility mode ran high-confidence baseline checks but skipped request-specific strict checks.');
  }
  return { cfg: out, errors: errors, warnings: warnings, autoFixes: autoFixes, mode: strict ? 'strict-generated' : 'compatibility' };
}

function stripBuilderOnlyMetadata(cfg) {
  const out = cloneJson(cfg);
  delete out.generationChecks;
  return out;
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

function collectUrlsFromText(value, urls) {
  if (typeof value !== 'string') return;
  const found = value.match(/https?:\/\/[^\s<>"')\]]+/gi) || [];
  found.forEach(function (candidate) {
    const url = candidate.replace(/[.,;:!?]+$/, '');
    const key = normalizedRegistryUrl(url);
    if (key && !isStandardNonContentSourceUrl(key) && !urls.has(key)) urls.set(key, url);
  });
}

function collectVisibleContentUrls(cfg) {
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
      scan(value[key]);
    });
  }
  ['title', 'subtitle', 'description', 'boardInfo', 'pageInfo', 'notes', 'topRightText', 'subpages', 'finalOutcomes', 'savedState'].forEach(function (key) {
    if (cfg[key] !== undefined) scan(cfg[key]);
  });
  return urls;
}

function ensureSourcesRegistryCompleteness(cfg, autoFixes) {
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
  collectVisibleContentUrls(cfg).forEach(function (url, key) {
    if (seen.has(key)) return;
    cfg.sources.push({ title: url, url: url });
    seen.add(key);
    pushAutoFix(autoFixes, 'Added missing visible-content URL to sources registry: ' + url);
  });
}

function createBuilderValidationStamp(mode, warnings, autoFixes) {
  return {
    builderVersion: BUILDER_VERSION,
    validationVersion: VALIDATION_VERSION,
    mode: mode,
    passed: true,
    validatedAt: new Date().toISOString(),
    checks: {
      noLevelHowPages: 'passed',
      uniqueNumberedHowLevels: 'passed',
      thisThenLinkText: 'passed',
      howLinkText: 'passed',
      documentationClones: 'passed',
      measureEqAttachment: 'passed',
      viewSettings: 'passed',
      displayTextTrafficPriority: 'passed',
      sourcesRegistry: 'passed'
    },
    warnings: warnings.slice(),
    autoFixes: autoFixes.slice()
  };
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

function pageShapeBucket(n) {
  if (typeof n !== 'number' || !isFinite(n)) return 'x';
  if (n <= 1) return '0-1';
  if (n === 2) return '2';
  if (n <= 4) return '3-4';
  return '5+';
}

function topShapeEntries(counts) {
  return Object.keys(counts).map(function (k) {
    return { key: k, count: counts[k] };
  }).sort(function (a, b) {
    if (b.count !== a.count) return b.count - a.count;
    return a.key < b.key ? -1 : (a.key > b.key ? 1 : 0);
  });
}

function pagesWithShape(shapePages, key) {
  return (shapePages[key] || []).map(function (p) { return p.label; }).join(', ');
}

function warnRepeatedThisThenGeometry(cfg, warnings, errors) {
  const pages = Array.isArray(cfg.subpages) ? cfg.subpages.filter(function (p) {
    return p && (p.pageType || 'this_then') === 'this_then';
  }) : [];
  if (pages.length < 4) return;
  if (isSyntheticLoadTestConfig(cfg)) return;

  const exactCounts = Object.create(null);
  const nearCounts = Object.create(null);
  const columnCounts = Object.create(null);
  const exactPages = Object.create(null);
  const nearPages = Object.create(null);
  const columnPages = Object.create(null);
  let mostlyThreeFourColumns = 0;

  pages.forEach(function (p) {
    const cols = Array.isArray(p.cols) ? p.cols : [];
    const counts = cols.map(function (col) {
      return col && Array.isArray(col.boxes) ? col.boxes.length : 0;
    });
    const exact = counts.join('-') || '(no columns)';
    const near = counts.length + ':' + counts.map(pageShapeBucket).join('-');
    const colKey = String(counts.length);
    const label = (p.label || p.id || '(untitled page)') + ' [' + exact + ']';
    exactCounts[exact] = (exactCounts[exact] || 0) + 1;
    nearCounts[near] = (nearCounts[near] || 0) + 1;
    columnCounts[colKey] = (columnCounts[colKey] || 0) + 1;
    if (!exactPages[exact]) exactPages[exact] = [];
    if (!nearPages[near]) nearPages[near] = [];
    if (!columnPages[colKey]) columnPages[colKey] = [];
    exactPages[exact].push({ label: label, counts: counts });
    nearPages[near].push({ label: label, counts: counts });
    columnPages[colKey].push({ label: label, counts: counts });
    if (counts.length && counts.filter(function (n) { return n === 3 || n === 4; }).length >= Math.max(1, counts.length - 1)) {
      mostlyThreeFourColumns++;
    }
  });

  const colTop = topShapeEntries(columnCounts);
  const exactTop = topShapeEntries(exactCounts);
  const nearTop = topShapeEntries(nearCounts);
  const topTwoExact = exactTop.slice(0, 2).reduce(function (sum, e) { return sum + e.count; }, 0);
  const topTwoNear = nearTop.slice(0, 2).reduce(function (sum, e) { return sum + e.count; }, 0);

  if (colTop[0] && colTop[0].count === pages.length) {
    const msg = 'Anti-template warning: all ' + pages.length + ' This–Then Pages have ' + colTop[0].key + ' columns. Revise page shapes based on domain logic before final output unless this is an explicitly justified synthetic/load-test board.';
    if (pages.length >= 7) errors.push(msg);
    else warn(warnings, msg);
  } else if (colTop[0] && colTop[0].count >= pages.length - 1) {
    warn(warnings, 'Anti-template warning: ' + colTop[0].count + ' of ' + pages.length + ' This–Then Pages have ' + colTop[0].key + ' columns. Check that variation is structural, not cosmetic. Pages: ' + pagesWithShape(columnPages, colTop[0].key));
  } else if (colTop[0] && colTop[0].count > pages.length / 2) {
    warn(warnings, 'Anti-template warning: most This–Then Pages share the same column count (' + colTop[0].key + ' columns on ' + colTop[0].count + ' of ' + pages.length + ' pages). Record a domain reason or revise page shapes.');
  }

  exactTop.forEach(function (entry) {
    if (entry.count > 2) {
      warn(warnings, 'Anti-template warning: ' + entry.count + ' This–Then Pages share exact box-count pattern ' + entry.key + '. Pages: ' + pagesWithShape(exactPages, entry.key));
    }
  });

  nearTop.forEach(function (entry) {
    if (entry.count > 2) {
      warn(warnings, 'Anti-template warning: ' + entry.count + ' This–Then Pages share near-match shape signature ' + entry.key + '. Near-matches bucket 3- and 4-box columns together so cosmetic last-column differences do not hide repetition. Pages: ' + pagesWithShape(nearPages, entry.key));
    }
  });

  if (topTwoExact > pages.length / 2 && exactTop.length > 1) {
    warn(warnings, 'Anti-template warning: the two most common exact This–Then patterns (' + exactTop.slice(0, 2).map(function (e) { return e.key + ' ×' + e.count; }).join(', ') + ') cover ' + topTwoExact + ' of ' + pages.length + ' pages. Revise if this is not domain-driven.');
  }

  if (topTwoNear / pages.length > 0.7 && nearTop.length > 1) {
    const msg2 = 'Anti-template warning: the two most common near-match This–Then signatures (' + nearTop.slice(0, 2).map(function (e) { return e.key + ' ×' + e.count; }).join(', ') + ') cover ' + topTwoNear + ' of ' + pages.length + ' pages. This suggests repeated page geometry despite small box-count differences.';
    if (pages.length >= 7) errors.push(msg2);
    else warn(warnings, msg2);
  }

  if (mostlyThreeFourColumns > pages.length / 2) {
    warn(warnings, 'Anti-template warning: most This–Then Pages are made mostly of 3- or 4-box columns. Check for repeated tidy-grid geometry such as 4-4-4-4, 4-4-4-3, or 3-3-3-3-2 and revise from domain logic if needed.');
  }

  if (colTop[0] && colTop[0].count > pages.length / 2 && exactTop.length <= 2) {
    warn(warnings, 'Anti-template warning: page-shape variation may be cosmetic rather than structural: a dominant column count plus only ' + exactTop.length + ' exact pattern family/families covers the board.');
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

function warnTerminalColumnOverload(cfg, warnings, errors) {
  const pages = Array.isArray(cfg.subpages) ? cfg.subpages.filter(function (p) {
    return p && (p.pageType || 'this_then') === 'this_then';
  }) : [];
  if (!pages.length) return;
  if (isSyntheticLoadTestConfig(cfg)) return;

  const justified = hasTerminalColumnJustification(cfg);
  const stats = [];
  let totalTerminal = 0;
  let pagesWithFour = 0;
  let pagesWithFive = 0;
  let pagesWithSixPlus = 0;
  let terminalDensest = 0;

  pages.forEach(function (p) {
    const cols = Array.isArray(p.cols) ? p.cols : [];
    const counts = cols.map(function (col) {
      return col && Array.isArray(col.boxes) ? col.boxes.length : 0;
    });
    const terminal = counts.length ? counts[counts.length - 1] : 0;
    const maxCount = counts.length ? Math.max.apply(null, counts) : 0;
    const isDensest = counts.length > 1 && terminal === maxCount && counts.filter(function (n) { return n === maxCount; }).length <= Math.max(1, Math.floor(counts.length / 2));
    const label = p.label || p.id || '(untitled page)';
    totalTerminal += terminal;
    if (terminal === 4) pagesWithFour++;
    if (terminal >= 5) pagesWithFive++;
    if (terminal >= 6) pagesWithSixPlus++;
    if (isDensest) terminalDensest++;
    stats.push({ page: p, label: label, counts: counts, terminal: terminal, isDensest: isDensest });
  });

  const avg = totalTerminal / pages.length;

  stats.forEach(function (s) {
    if (s.terminal >= 6) {
      const msg = 'Terminal-column warning: Page "' + s.label + '" has ' + s.terminal + ' terminal boxes. Ordinary This–Then Pages should usually end with 1–3 page-level outcomes. Consolidate, move some outcomes to intermediate columns, split the page, or record a clear domain reason.';
      if (!justified && pages.length >= 4) errors.push(msg);
      else warn(warnings, msg);
    } else if (s.terminal === 5) {
      warn(warnings, 'Terminal-column warning: Page "' + s.label + '" has 5 terminal boxes. Five or more terminal/end-column outcomes should be rare unless the domain reason is clear and documented.');
    } else if (s.terminal === 4) {
      warn(warnings, 'Terminal-column check: Page "' + s.label + '" has 4 terminal boxes. This can be acceptable with a genuine domain reason; ordinary pages usually end with 1–3.');
    }
  });

  if (avg > 3.5) {
    warn(warnings, 'Terminal-column warning: Average terminal-column count is ' + avg.toFixed(2) + ' across ' + pages.length + ' This–Then Pages. Check whether anti-stereotype variation has been achieved by overloading final columns.');
  }
  if (pagesWithFive > 1) {
    const msg2 = 'Terminal-column warning: ' + pagesWithFive + ' This–Then Pages have 5 or more terminal boxes. Several overloaded terminal columns suggest final-column multiplication rather than domain-shaped variation.';
    if (!justified && pages.length >= 4) errors.push(msg2);
    else warn(warnings, msg2);
  }
  if (pagesWithFour >= Math.ceil(pages.length / 2)) {
    warn(warnings, 'Terminal-column warning: most This–Then Pages have 4 or more terminal boxes. Ordinary pages should usually end with 1–3 page-level terminal outcomes unless genuine domain reasons are recorded.');
  }
  if (terminalDensest > pages.length / 2) {
    warn(warnings, 'Terminal-column warning: final/right-hand columns are often the densest columns. Check that page-shape variation is not mainly coming from adding terminal outcomes.');
  }
  if (pagesWithSixPlus && justified) {
    warn(warnings, 'Terminal-column warning: at least one page has 6 or more terminal boxes, but the config appears to contain a possible justification. Confirm the domain reason is explicit and adequate.');
  }
}

function validateConfig(cfg) {
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

  warnRepeatedThisThenGeometry(cfg, warnings, errors);
  warnTerminalColumnOverload(cfg, warnings, errors);

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
  const kept = pages.filter(function (p) { return !isCanonicalDisclaimerPage(p); });
  kept.push(canonicalDisclaimerPage(id));
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
    warn(warnings, 'Output filename does not match expected pattern <board-slug>_doview-board_v<version>_<yyyy-mm-dd>.html: ' + base);
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

  const engineText = readTextFile(args.engine, 'engine');
  if (!engineText.trim()) fail('Engine file is empty: ' + args.engine);
  if (looksLikeWholeHtml(engineText)) fail('Engine file appears to be HTML. Expected the DoView engine JavaScript file: ' + args.engine);
  if (!/const\s+DoView\s*=/.test(engineText) && !/return\s*\{\s*init\s*\}/.test(engineText)) {
    fail('Engine file does not look like the DoView engine JavaScript: ' + args.engine);
  }

  const configText = readTextFile(args.config, 'config');
  const rawCfg = parseConfig(configText, args.config);
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
  ensureSourcesRegistryCompleteness(cfg, preflightResult.autoFixes);
  const configResult = validateConfig(cfg);
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
  const normalizedCfg = normalizeConfig(cfg);
  normalizedCfg.builderValidation = createBuilderValidationStamp(preflightResult.mode, stampWarnings, preflightResult.autoFixes);
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
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(args.out, html, 'utf8');
  } catch (e) {
    fail('Could not write output HTML file: ' + args.out + ' (' + e.message + ')');
  }

  const written = readTextFile(args.out, 'out');
  const writtenResult = validateHtml(written, args.out);
  if (writtenResult.errors.length) {
    console.error('DoView written-file validation failed:');
    writtenResult.errors.forEach(function (e) { console.error('- ' + e); });
    process.exit(1);
  }

  console.log('DoView build succeeded: ' + args.out);
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

main();
