#!/usr/bin/env node
'use strict';

/*
DoView Board Builder V1.2.0
Public release: 2026-05-22
Plain Node.js local builder for assembling validated config-first DoView boards into single-file HTML outputs. No external npm packages.
See CHANGELOG.md for release history and security notes.
*/

const fs = require('fs');
const path = require('path');

const BUILDER_VERSION = 'V1.2.0';
const EXPECTED_FILENAME_RE = /^[a-z0-9][a-z0-9-]*_doview-board_[vV]\d+\.\d+\.\d+_\d{4}-\d{2}-\d{2}\.html$/;

const SIMPLE_DEFAULT_VIEW_SETTINGS = {
  thisThen: { showCounts: false, showTrafficLights: false, showPriorities: false, showHowCounts: false, showMeasures: false, showEvalQuestions: false, showMainText: false, showMainTextCodeStyle: false, showLinkInfoOnHover: false, showLinkInfoCodeStyle: false, showLateralHow: false, showTags: false },
  how: { showNumbering: false, showTrafficLights: false, showPriorities: false, showWhyCounts: false, showLateralHow: false, showMeasures: false, showEvalQuestions: false, showMainText: false, showMainTextCodeStyle: false, showTags: false },
  finalOutcomes: { showTrafficLights: false, showPriorities: false, showMeasures: false, showEvalQuestions: false, showMainText: false, showMainTextCodeStyle: false, showTags: false }
};
const PRIORITY_VALUES = ['A', 'B', 'C', 'D', 'E', 'BAU'];
const TRAFFIC_LIGHT_VALUES = ['green', 'greenYellow', 'yellow', 'yellowRed', 'red', 'grey'];
const CANONICAL_DISCLAIMER_TITLE = 'Using DoView Boards and Disclaimer';
const CANONICAL_DISCLAIMER_TEXT = `Using DoView Boards and Disclaimer

See the disclaimer section below.

The DoView Board prompt and the DoView Board built within this DoView Board prototype app are provided free of charge so that anyone can experiment with DoView Boards and explore for themselves how they can answer the 20 key questions that anyone running or overseeing an organization needs to answer. See [https://doviewplanning.org/doviewboardsuse](https://doviewplanning.org/doviewboardsuse).

Help

To get help using DoView Boards, type the following into any AI system: ‘Look just at this website [https://doviewplanning.org/help](https://doviewplanning.org/help) and tell me how to [put your question in here]’.

Accessing Consulting or Training

We can provide consulting or training on integrating the use of DoView Boards into your existing planning, implementation and reporting workflows in business, government, or nonprofit settings. See [https://doviewplanning.org/offerings](https://doviewplanning.org/offerings).

Adapting the DoView Board Prototype App to your setting

This DoView Board is being used within the DoView Board prototype app. It is a free of charge app that runs inside any browser window and can be used for piloting, testing, proof-of-concept and for use where confidential information is not being included and where there is a low security risk.

The DoView Board app is an open-source developer project under an Apache-2.0 open-source license. See [https://github.com/DoViewPlanning/doview-boards](https://github.com/DoViewPlanning/doview-boards). The wider DoView Planning methodology and DoView® trademarks are governed separately. See [https://doviewplanning.org/trademarkuse](https://doviewplanning.org/trademarkuse).

Because it is an open-source project, any developer can extend, harden, adapt, or include features of the DoView Board app in other planning products or systems to suit specific deployment requirements. For example, adding enhanced stability, scalability, security, authentication, data handling, or integration features needed for production use, sensitive content, or higher-security environments. If you are looking to deploy DoView Boards in a live operational setting, you can work with any developer to tailor the app to your needs. You can also get in touch with us for advice and methodological input into the best way for you to adapt and extend your use of DoView Boards in your particular setting. [https://doviewplanning.org/contact](https://doviewplanning.org/contact).

Disclaimer

DoView Boards are provided for planning and illustrative purposes only. The content of any DoView Board does not constitute professional advice of any kind, including but not limited to legal, financial, medical, strategic, or organizational advice. No warranty is given as to the accuracy, completeness, or fitness for purpose of any content. The usual precautions for AI-generated material need to be taken. Dr Paul Duignan, DoViewPlanning.org, The Ideas Web Ltd, DoView Corporation Ltd and any associated parties accept no liability whatsoever for any loss, damage, or adverse outcome arising directly or indirectly from the use of, or reliance on, any DoView Board or its contents. Use entirely at your own risk.

Please note that this DoView Board is in an interactive HTML file and contains active JavaScript so the board can work. Only open boards from sources you trust. Read-only copies disable editing through the board interface but are not security protection.`;
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
    '    --out labour-2026-nz-election_doview-board_v1.2.0_2026-05-22.html',
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

function collectKnownBoxIds(cfg, warnings) {
  const ids = new Set();
  const pages = Array.isArray(cfg.subpages) ? cfg.subpages : [];
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
    errors.push('Generated standalone boards must include savedState with explicit simple-default viewSettings so Page View and display controls reopen consistently.');
  } else {
    if (!isPlainObject(cfg.savedState.viewSettings)) {
      errors.push('savedState.viewSettings is required for generated standalone boards. Use explicit simple-default thisThen, how, and finalOutcomes objects unless the user chose Detailed Page View.');
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
    Help: true,
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
  const cfg = ensureCanonicalDisclaimerDocumentationPage(rawCfg);
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

  const normalizedCfg = normalizeConfig(cfg);
  const html = assembleHtml(engineText, normalizedCfg);
  const htmlResult = validateHtml(html, args.out);
  const warnings = configResult.warnings.concat(htmlResult.warnings);
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
  console.log('Validated HTML: engine once in head, one body-only DoView.init(...) config call, standalone output');
  if (warnings.length || writtenResult.warnings.length) {
    console.log('Warnings:');
    warnings.concat(writtenResult.warnings).forEach(function (w) { console.log('- ' + w); });
  }
}

main();
