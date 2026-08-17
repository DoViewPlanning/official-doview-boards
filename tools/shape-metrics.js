'use strict';

/*
DoView shape-metrics module V1.4.3
Deterministic structural analysis of This–Then page shapes in a DoView board config.
Single source of truth for page-shape measurement: the builder's anti-template and
terminal-column checks consume analyzeShapes(), as do tools/score-board.js and the
shape-metrics test fixtures.

Measurement only: this module never consults prose fields (title, boardInfo, etc.)
for justifications or exemptions. Policy — deciding whether a finding blocks a build —
belongs to the caller (the builder applies its own warn/error escalation).

Plain Node.js, no dependencies.
*/

// --- Per-page shape helpers -------------------------------------------------

function pageShapeBucket(n) {
  if (typeof n !== 'number' || !isFinite(n)) return 'x';
  if (n <= 1) return '0-1';
  if (n === 2) return '2';
  if (n <= 4) return '3-4';
  return '5+';
}

function thisThenPages(cfg) {
  if (!cfg || !Array.isArray(cfg.subpages)) return [];
  return cfg.subpages.filter(function (p) {
    return p && (p.pageType || 'this_then') === 'this_then';
  });
}

const HEADING_STOP_WORDS = { the: true, a: true, an: true, of: true, and: true, to: true, for: true, in: true, on: true, with: true };

function normalizeHeading(h) {
  const tokens = String(h == null ? '' : h)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(function (t) { return t && !HEADING_STOP_WORDS[t]; })
    .map(function (t) { return t.length > 3 && t.charAt(t.length - 1) === 's' ? t.slice(0, -1) : t; });
  return tokens.join('+');
}

function pageShape(p, pageIndex) {
  const cols = Array.isArray(p.cols) ? p.cols : [];
  const boxCounts = cols.map(function (col) {
    return col && Array.isArray(col.boxes) ? col.boxes.length : 0;
  });
  const headings = cols.map(function (col) { return col && col.h != null ? String(col.h) : ''; });
  const headingKeys = headings.map(normalizeHeading).filter(function (k) { return k; });
  const terminal = boxCounts.length ? boxCounts[boxCounts.length - 1] : 0;
  const maxCount = boxCounts.length ? Math.max.apply(null, boxCounts) : 0;
  return {
    id: p.id != null ? String(p.id) : '',
    pageIndex: pageIndex,
    label: p.label || p.id || '(untitled page)',
    columnCount: boxCounts.length,
    boxCounts: boxCounts,
    exactKey: boxCounts.join('-') || '(no columns)',
    nearKey: boxCounts.length + ':' + boxCounts.map(pageShapeBucket).join('-'),
    mostlyThreeFour: !!(boxCounts.length && boxCounts.filter(function (n) { return n === 3 || n === 4; }).length >= Math.max(1, boxCounts.length - 1)),
    terminalBoxes: terminal,
    terminalIsDensest: boxCounts.length > 1 && terminal === maxCount && boxCounts.filter(function (n) { return n === maxCount; }).length <= Math.max(1, Math.floor(boxCounts.length / 2)),
    headings: headings,
    headingSequenceKey: headingKeys.length ? headingKeys.join('|') : ''
  };
}

// --- Distribution helpers ---------------------------------------------------

function sortedEntries(map) {
  return Object.keys(map).map(function (k) {
    return { key: k, count: map[k].count, pages: map[k].pages };
  }).sort(function (a, b) {
    if (b.count !== a.count) return b.count - a.count;
    return a.key < b.key ? -1 : (a.key > b.key ? 1 : 0);
  });
}

function tally(map, key, page) {
  if (!map[key]) map[key] = { count: 0, pages: [] };
  map[key].count++;
  map[key].pages.push(page);
}

function topTwoCoverage(entries) {
  return entries.slice(0, 2).reduce(function (sum, e) { return sum + e.count; }, 0);
}

// --- Link topology ----------------------------------------------------------

const BOX_REF_RE = /^(.*)-c(\d+)-b(\d+)$/;

function parseBoxRef(ref) {
  if (typeof ref !== 'string') return null;
  const m = BOX_REF_RE.exec(ref);
  if (!m) return null;
  return { pageId: m[1], col: parseInt(m[2], 10), box: ref };
}

function analyzeTopology(cfg, pages) {
  const links = cfg && cfg.savedState && Array.isArray(cfg.savedState.ttLinks) ? cfg.savedState.ttLinks : null;
  if (!links) return null;

  const pageById = Object.create(null);
  const perPage = pages.map(function (p) {
    const stats = {
      id: p.id,
      label: p.label,
      linkCount: 0,
      maxFanIn: 0,
      maxFanOut: 0,
      convergenceCount: 0,
      divergenceCount: 0,
      skipColumnLinkCount: 0,
      feedbackLinkCount: 0,
      isLinear: true,
      inDegrees: Object.create(null),
      outDegrees: Object.create(null)
    };
    if (p.id) pageById[p.id] = stats;
    return stats;
  });

  let crossPageLinkCount = 0;
  let otherLinkCount = 0;

  links.forEach(function (l) {
    if (!l) return;
    const from = parseBoxRef(l.from);
    const to = parseBoxRef(l.to);
    if (!from || !to || !pageById[from.pageId] || !pageById[to.pageId]) {
      otherLinkCount++;
      return;
    }
    if (from.pageId !== to.pageId) {
      crossPageLinkCount++;
      return;
    }
    const stats = pageById[from.pageId];
    stats.linkCount++;
    stats.outDegrees[from.box] = (stats.outDegrees[from.box] || 0) + 1;
    stats.inDegrees[to.box] = (stats.inDegrees[to.box] || 0) + 1;
    if (to.col - from.col >= 2) stats.skipColumnLinkCount++;
    if (to.col < from.col) stats.feedbackLinkCount++;
  });

  const totals = {
    withinPageLinkCount: 0,
    skipColumnLinkCount: 0,
    feedbackLinkCount: 0,
    convergenceCount: 0,
    divergenceCount: 0,
    pagesWithConvergence: 0,
    pagesWithDivergence: 0,
    pagesWithSkipLinks: 0,
    pagesWithFeedback: 0,
    linearPages: 0
  };

  perPage.forEach(function (stats) {
    Object.keys(stats.inDegrees).forEach(function (box) {
      const d = stats.inDegrees[box];
      if (d > stats.maxFanIn) stats.maxFanIn = d;
      if (d >= 2) stats.convergenceCount++;
    });
    Object.keys(stats.outDegrees).forEach(function (box) {
      const d = stats.outDegrees[box];
      if (d > stats.maxFanOut) stats.maxFanOut = d;
      if (d >= 2) stats.divergenceCount++;
    });
    stats.isLinear = !(stats.convergenceCount || stats.divergenceCount || stats.skipColumnLinkCount || stats.feedbackLinkCount);
    delete stats.inDegrees;
    delete stats.outDegrees;
    totals.withinPageLinkCount += stats.linkCount;
    totals.skipColumnLinkCount += stats.skipColumnLinkCount;
    totals.feedbackLinkCount += stats.feedbackLinkCount;
    totals.convergenceCount += stats.convergenceCount;
    totals.divergenceCount += stats.divergenceCount;
    if (stats.convergenceCount) totals.pagesWithConvergence++;
    if (stats.divergenceCount) totals.pagesWithDivergence++;
    if (stats.skipColumnLinkCount) totals.pagesWithSkipLinks++;
    if (stats.feedbackLinkCount) totals.pagesWithFeedback++;
    if (stats.isLinear) totals.linearPages++;
  });

  return {
    linkCount: links.length,
    crossPageLinkCount: crossPageLinkCount,
    otherLinkCount: otherLinkCount,
    perPage: perPage,
    totals: totals
  };
}

// --- Findings + score -------------------------------------------------------

function addFinding(findings, id, severity, message, pages) {
  const f = { id: id, severity: severity, message: message };
  if (pages && pages.length) f.pages = pages.map(function (p) { return p.label; });
  findings.push(f);
}

const RESTRUCTURE_HINT = ' Restructure the affected pages from domain logic (different step counts, branching, convergence, feedback) — do not thin or genericise content to pass.';

function collectFindings(pages, board) {
  const findings = [];
  const n = pages.length;

  if (n >= 4) {
    const colTop = board.columnCountEntries[0];
    if (colTop && colTop.count === n) {
      addFinding(findings, 'uniform-column-count', 'fail',
        'All ' + n + ' This–Then Pages have ' + colTop.key + ' columns.' + RESTRUCTURE_HINT, colTop.pages);
    } else if (colTop && colTop.count >= n - 1) {
      addFinding(findings, 'dominant-column-count', 'warn',
        colTop.count + ' of ' + n + ' This–Then Pages have ' + colTop.key + ' columns.', colTop.pages);
    } else if (colTop && colTop.count > n / 2) {
      addFinding(findings, 'dominant-column-count', 'warn',
        'Most This–Then Pages share the same column count (' + colTop.key + ' columns on ' + colTop.count + ' of ' + n + ' pages).', colTop.pages);
    }

    board.exactPatternEntries.forEach(function (entry) {
      if (entry.count > 2) {
        addFinding(findings, 'repeated-exact-pattern', entry.count >= n - 1 ? 'fail' : 'warn',
          entry.count + ' This–Then Pages share exact box-count pattern ' + entry.key + '.' + (entry.count >= n - 1 ? RESTRUCTURE_HINT : ''), entry.pages);
      }
    });

    board.nearPatternEntries.forEach(function (entry) {
      if (entry.count > 2) {
        addFinding(findings, 'repeated-near-pattern', entry.count >= n - 1 ? 'fail' : 'warn',
          entry.count + ' This–Then Pages share near-match shape signature ' + entry.key + ' (3- and 4-box columns bucket together).' + (entry.count >= n - 1 ? RESTRUCTURE_HINT : ''), entry.pages);
      }
    });

    if (board.exactPatternEntries.length > 1) {
      const cov = board.topTwoExactCoverage;
      if (cov === n) {
        addFinding(findings, 'top-two-exact-coverage', 'fail',
          'The two most common exact box-count patterns cover all ' + n + ' This–Then Pages — two-pattern alternation is still a template.' + RESTRUCTURE_HINT);
      } else if (cov > n / 2) {
        addFinding(findings, 'top-two-exact-coverage', 'warn',
          'The two most common exact box-count patterns cover ' + cov + ' of ' + n + ' This–Then Pages.');
      }
    }

    if (board.nearPatternEntries.length > 1 && board.topTwoNearCoverage / n > 0.7) {
      addFinding(findings, 'top-two-near-coverage', board.topTwoNearCoverage === n ? 'fail' : 'warn',
        'The two most common near-match shape signatures cover ' + board.topTwoNearCoverage + ' of ' + n + ' This–Then Pages.' + (board.topTwoNearCoverage === n ? RESTRUCTURE_HINT : ''));
    }

    if (board.mostlyThreeFourPages > n / 2) {
      addFinding(findings, 'mostly-three-four-columns', 'warn',
        board.mostlyThreeFourPages + ' of ' + n + ' This–Then Pages are made mostly of 3- or 4-box columns (tidy-grid geometry).');
    }

    const colTop0 = board.columnCountEntries[0];
    if (colTop0 && colTop0.count > n / 2 && board.exactPatternEntries.length <= 2) {
      addFinding(findings, 'cosmetic-variation', 'warn',
        'A dominant column count plus only ' + board.exactPatternEntries.length + ' exact pattern family/families covers the board — variation may be cosmetic rather than structural.');
    }

    const headTop = board.headingRhythm.entries[0];
    if (headTop && headTop.count >= 3) {
      addFinding(findings, 'repeated-heading-sequence', headTop.count === n ? 'fail' : 'warn',
        headTop.count + ' of ' + n + ' This–Then Pages share the same normalized column-heading sequence — the pages follow one heading rhythm.' + (headTop.count === n ? RESTRUCTURE_HINT : ''), headTop.pages);
    }
  }

  if (n) {
    const t = board.terminal;
    pages.forEach(function (p) {
      if (p.terminalBoxes >= 6) {
        addFinding(findings, 'terminal-overload-page', n >= 4 ? 'fail' : 'warn',
          'Page "' + p.label + '" has ' + p.terminalBoxes + ' terminal boxes; ordinary This–Then Pages usually end with 1–3 page-level outcomes. Move outcomes into the causal structure (intermediate columns, branching) rather than deleting them.');
      } else if (p.terminalBoxes === 5) {
        addFinding(findings, 'terminal-overload-page', 'warn',
          'Page "' + p.label + '" has 5 terminal boxes; five or more terminal outcomes should be rare and domain-driven.');
      } else if (p.terminalBoxes === 4) {
        addFinding(findings, 'terminal-four-boxes', 'info',
          'Page "' + p.label + '" has 4 terminal boxes; acceptable with a genuine domain reason.');
      }
    });
    if (t.averageTerminalBoxes > 3.5) {
      addFinding(findings, 'terminal-average-high', 'warn',
        'Average terminal-column count is ' + t.averageTerminalBoxes.toFixed(2) + ' across ' + n + ' This–Then Pages — variation may be coming from overloading final columns.');
    }
    if (t.pagesWithFivePlus > 1) {
      addFinding(findings, 'terminal-multiple-overload', n >= 4 ? 'fail' : 'warn',
        t.pagesWithFivePlus + ' This–Then Pages have 5 or more terminal boxes — final-column multiplication rather than domain-shaped variation.' + (n >= 4 ? RESTRUCTURE_HINT : ''));
    }
    if (t.pagesWithExactlyFour >= Math.ceil(n / 2) && n >= 2) {
      addFinding(findings, 'terminal-four-common', 'warn',
        'Most This–Then Pages have 4 terminal boxes; ordinary pages usually end with 1–3 page-level outcomes.');
    }
    if (t.pagesWhereTerminalDensest > n / 2 && n >= 2) {
      addFinding(findings, 'terminal-densest-common', 'warn',
        'Final/right-hand columns are often the densest columns — check variation is not mainly added terminal outcomes.');
    }
  }

  if (n >= 4) {
    if (!board.topology) {
      addFinding(findings, 'no-link-topology-data', 'info',
        'No savedState.ttLinks present; link-topology metrics unavailable.');
    } else if (board.topology.totals.withinPageLinkCount && board.topology.totals.linearPages === n) {
      addFinding(findings, 'all-pages-linear', 'warn',
        'Every This–Then Page has purely linear link topology (no branching, convergence, skip-column, or feedback links) — structural variation is unlikely to be genuine.');
    }
  }

  return findings;
}

const SEVERITY_PENALTY = { fail: 25, warn: 7, info: 1 };

function diversityScoreFromFindings(findings) {
  let score = 100;
  findings.forEach(function (f) {
    score -= SEVERITY_PENALTY[f.severity] || 0;
  });
  return Math.max(0, Math.min(100, score));
}

// --- Main entry point -------------------------------------------------------

function analyzeShapes(cfg) {
  const rawPages = thisThenPages(cfg);
  const pages = rawPages.map(pageShape);

  const columnMap = Object.create(null);
  const exactMap = Object.create(null);
  const nearMap = Object.create(null);
  const headingMap = Object.create(null);
  let mostlyThreeFourPages = 0;
  let totalTerminal = 0;
  let pagesWithExactlyFour = 0;
  let pagesWithFivePlus = 0;
  let pagesWithSixPlus = 0;
  let pagesWhereTerminalDensest = 0;

  pages.forEach(function (p) {
    tally(columnMap, String(p.columnCount), p);
    tally(exactMap, p.exactKey, p);
    tally(nearMap, p.nearKey, p);
    if (p.headingSequenceKey) tally(headingMap, p.headingSequenceKey, p);
    if (p.mostlyThreeFour) mostlyThreeFourPages++;
    totalTerminal += p.terminalBoxes;
    if (p.terminalBoxes === 4) pagesWithExactlyFour++;
    if (p.terminalBoxes >= 5) pagesWithFivePlus++;
    if (p.terminalBoxes >= 6) pagesWithSixPlus++;
    if (p.terminalIsDensest) pagesWhereTerminalDensest++;
  });

  const exactPatternEntries = sortedEntries(exactMap);
  const nearPatternEntries = sortedEntries(nearMap);
  const headingEntries = sortedEntries(headingMap);

  const board = {
    thisThenPageCount: pages.length,
    columnCountEntries: sortedEntries(columnMap),
    exactPatternEntries: exactPatternEntries,
    nearPatternEntries: nearPatternEntries,
    topTwoExactCoverage: topTwoCoverage(exactPatternEntries),
    topTwoNearCoverage: topTwoCoverage(nearPatternEntries),
    mostlyThreeFourPages: mostlyThreeFourPages,
    terminal: {
      totalTerminalBoxes: totalTerminal,
      averageTerminalBoxes: pages.length ? totalTerminal / pages.length : 0,
      pagesWithExactlyFour: pagesWithExactlyFour,
      pagesWithFivePlus: pagesWithFivePlus,
      pagesWithSixPlus: pagesWithSixPlus,
      pagesWhereTerminalDensest: pagesWhereTerminalDensest
    },
    headingRhythm: {
      entries: headingEntries,
      maxRepetition: headingEntries.length ? headingEntries[0].count : 0
    },
    topology: analyzeTopology(cfg, pages)
  };

  const findings = collectFindings(pages, board);

  return {
    pages: pages,
    board: board,
    findings: findings,
    diversityScore: diversityScoreFromFindings(findings)
  };
}

// --- Embedded-config extraction (for board.html inputs) ----------------------

function extractEmbeddedInitConfig(html) {
  const marker = 'DoView.init(';
  const start = String(html).lastIndexOf(marker);
  if (start < 0) return null;
  let i = start + marker.length;
  // Balanced scan over the JSON argument, respecting string literals and escapes.
  let depth = 0;
  let inString = false;
  let escaped = false;
  const from = i;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(from, i + 1));
        } catch (e) {
          return null;
        }
      }
    }
  }
  return null;
}

module.exports = {
  pageShapeBucket: pageShapeBucket,
  thisThenPages: thisThenPages,
  normalizeHeading: normalizeHeading,
  analyzeShapes: analyzeShapes,
  extractEmbeddedInitConfig: extractEmbeddedInitConfig
};
