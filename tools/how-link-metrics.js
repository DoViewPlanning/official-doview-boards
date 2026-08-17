#!/usr/bin/env node
'use strict';

/*
DoView How-link metrics module V1.4.3
Deterministic measurement of the effective runtime How-link graph in a DoView
board config. The builder consumes this module, but all blocking policy remains
in doview-board-builder.js.

Plain Node.js, no dependencies.
*/

const fs = require('fs');
const COMPETENCY_HOW_PAGE_RE = /\b(?:competenc(?:y|ies)|cross[\s-]?cutting capabilit(?:y|ies))\b/i;

function isObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function runtimeUsesSavedStatePages(cfg) {
  const state = cfg && isObject(cfg.savedState) ? cfg.savedState : {};
  return !!(isObject(state.B) && Array.isArray(state.SP));
}

function rawEffectivePages(cfg) {
  const state = cfg && isObject(cfg.savedState) ? cfg.savedState : {};
  if (runtimeUsesSavedStatePages(cfg)) return state.SP;
  return cfg && Array.isArray(cfg.subpages) ? cfg.subpages : [];
}

// The runtime assigns an incrementing level to each How Page whose howLevel is
// absent. Mirror that compatibility behaviour for measurement without mutating
// the input. Strict generated boards are expected to declare levels explicitly.
function effectivePages(cfg) {
  let implicitLevel = 1;
  return rawEffectivePages(cfg).map(function (page) {
    if (!isObject(page)) return page;
    const copy = Object.assign({}, page);
    if ((copy.pageType || 'this_then') === 'how' && copy.howLevel === undefined) {
      copy.howLevel = implicitLevel++;
      copy.howLevelInferred = true;
    }
    return copy;
  });
}

function boxLabel(box) {
  if (typeof box === 'string') return box;
  if (box && typeof box.label === 'string') return box.label;
  return '';
}

function effectiveHowLinks(cfg) {
  const state = cfg && isObject(cfg.savedState) ? cfg.savedState : {};
  return Array.isArray(state.howLinks) ? state.howLinks : [];
}

function sortedUnique(values) {
  return Array.from(new Set(values)).sort();
}

function degreeDistribution(values) {
  const counts = Object.create(null);
  values.forEach(function (degree) {
    counts[degree] = (counts[degree] || 0) + 1;
  });
  return Object.keys(counts).map(function (degree) {
    return { degree: Number(degree), count: counts[degree] };
  }).sort(function (a, b) { return a.degree - b.degree; });
}

function modalDegree(distribution) {
  if (!distribution.length) return { degree: 0, count: 0 };
  return distribution.slice().sort(function (a, b) {
    if (b.count !== a.count) return b.count - a.count;
    return a.degree - b.degree;
  })[0];
}

function pageLevel(page) {
  return typeof page.howLevel === 'number' && Number.isFinite(page.howLevel) && Math.floor(page.howLevel) === page.howLevel
    ? page.howLevel
    : null;
}

function targetLayerFor(page, cfg) {
  const level = pageLevel(page);
  if (level === 1) return { kind: 'this_then', label: 'This–Then boxes' };
  if (level !== null && level >= 2) return { kind: 'how_level', level: level - 1, label: 'How Level ' + (level - 1) + ' boxes' };
  const review = cfg && cfg.generationChecks && cfg.generationChecks.competencyMappingReview;
  const stamp = cfg && cfg.builderValidation;
  const targetMode = review && review.targetMode ? review.targetMode : (stamp && stamp.competencyTargetMode);
  const permitted = review && Array.isArray(review.permittedTargetRefs)
    ? review.permittedTargetRefs
    : (stamp && Array.isArray(stamp.competencyPermittedTargetRefs) ? stamp.competencyPermittedTargetRefs : []);
  if (COMPETENCY_HOW_PAGE_RE.test(String(page.pageLabel || page.label || ''))) {
    if (targetMode === 'user-defined' && permitted.length) {
      return { kind: 'explicit_refs', refs: sortedUnique(permitted), label: 'User-selected competency target layer' };
    }
    if (targetMode === 'level-1-only-default' || (cfg && /^V1\.4\.3-rc1$/.test(String(cfg.engineVersion || '')))) {
      return { kind: 'how_level', level: 1, label: 'How Level 1 project boxes (V1.4.3 default competency target layer)' };
    }
  }
  return { kind: 'non_level', label: 'user-selected This–Then and How targets' };
}

function analyzeHowLinks(cfg) {
  cfg = cfg || {};
  const pages = effectivePages(cfg);
  const state = isObject(cfg.savedState) ? cfg.savedState : {};
  const savedBoxes = isObject(state.B) ? state.B : {};
  const endpoints = Object.create(null);
  const howSources = [];
  const thisThenRefs = [];
  const howRefsByLevel = Object.create(null);
  const howPages = [];

  pages.forEach(function (page, pageIndex) {
    if (!page || !page.id) return;
    const type = page.pageType || 'this_then';
    if (type === 'this_then') {
      (Array.isArray(page.cols) ? page.cols : []).forEach(function (col, columnIndex) {
        (col && Array.isArray(col.boxes) ? col.boxes : []).forEach(function (box, boxIndex) {
          const ref = page.id + '-c' + columnIndex + '-b' + boxIndex;
          const saved = savedBoxes[ref];
          endpoints[ref] = {
            ref: ref,
            type: 'this_then',
            pageId: page.id,
            pageLabel: page.label || page.id,
            label: saved && typeof saved.label === 'string' ? saved.label : boxLabel(box)
          };
          thisThenRefs.push(ref);
        });
      });
      return;
    }
    if (type !== 'how') return;
    const level = pageLevel(page);
    const pageInfo = {
      id: page.id,
      label: page.label || page.id,
      howLevel: level,
      howLevelInferred: page.howLevelInferred === true,
      sourceCount: 0,
      pageIndex: pageIndex
    };
    howPages.push(pageInfo);
    (Array.isArray(page.howBoxes) ? page.howBoxes : []).forEach(function (box, boxIndex) {
      if (!box || !box.id) return;
      const ref = page.id + '-' + box.id;
      const saved = savedBoxes[ref];
      const source = {
        ref: ref,
        id: box.id,
        label: saved && typeof saved.label === 'string' ? saved.label : boxLabel(box),
        pageId: page.id,
        pageLabel: page.label || page.id,
        pageIndex: pageIndex,
        howLevel: level,
        howLevelInferred: page.howLevelInferred === true,
        boxIndex: boxIndex
      };
      endpoints[ref] = Object.assign({ type: 'how' }, source);
      howSources.push(source);
      pageInfo.sourceCount++;
      const key = level === null ? 'none' : String(level);
      if (!howRefsByLevel[key]) howRefsByLevel[key] = [];
      howRefsByLevel[key].push(ref);
    });
  });

  const allHowRefs = howSources.map(function (source) { return source.ref; });
  const outgoing = Object.create(null);
  const incoming = Object.create(null);
  const duplicateMap = Object.create(null);
  const unresolvedEndpoints = [];
  const wrongSourceLinks = [];
  const links = effectiveHowLinks(cfg);
  const directionCounts = {
    level1ToThisThen: 0,
    deeperToAdjacentHigher: 0,
    shallowerToAdjacentDeeper: 0,
    deeperToThisThen: 0,
    nonLevelToThisThen: 0,
    nonLevelToHow: 0,
    otherNumberedToHow: 0,
    numberedToNonLevelHow: 0
  };
  const shallowerToDeeperLinks = [];

  links.forEach(function (link, index) {
    const from = link && typeof link.from === 'string' ? link.from : '';
    const to = link && typeof link.to === 'string' ? link.to : '';
    if (from && to) {
      const pair = from + '\u0000' + to;
      if (!duplicateMap[pair]) duplicateMap[pair] = [];
      duplicateMap[pair].push({ index: index, id: link && link.id ? link.id : '' });
    }
    const fromEndpoint = endpoints[from];
    const toEndpoint = endpoints[to];
    const missing = [];
    if (!fromEndpoint) missing.push('from');
    if (!toEndpoint) missing.push('to');
    if (missing.length) {
      unresolvedEndpoints.push({ index: index, id: link && link.id ? link.id : '', from: from, to: to, missing: missing });
      return;
    }
    if (fromEndpoint.type !== 'how') {
      wrongSourceLinks.push({ index: index, id: link && link.id ? link.id : '', from: from, to: to, sourceType: fromEndpoint.type });
      return;
    }
    if (!outgoing[from]) outgoing[from] = [];
    if (!incoming[to]) incoming[to] = [];
    outgoing[from].push({ index: index, id: link && link.id ? link.id : '', from: from, to: to });
    incoming[to].push({ index: index, id: link && link.id ? link.id : '', from: from, to: to });
    const fromLevel = fromEndpoint.howLevel;
    if (toEndpoint.type === 'this_then') {
      if (fromLevel === 1) directionCounts.level1ToThisThen++;
      else if (fromLevel !== null && fromLevel >= 2) directionCounts.deeperToThisThen++;
      else directionCounts.nonLevelToThisThen++;
      return;
    }
    if (toEndpoint.type !== 'how') return;
    const toLevel = toEndpoint.howLevel;
    if (fromLevel === null) {
      directionCounts.nonLevelToHow++;
    } else if (toLevel === null) {
      directionCounts.numberedToNonLevelHow++;
    } else if (fromLevel >= 2 && toLevel === fromLevel - 1) {
      directionCounts.deeperToAdjacentHigher++;
    } else if (toLevel === fromLevel + 1) {
      directionCounts.shallowerToAdjacentDeeper++;
      shallowerToDeeperLinks.push({ index: index, id: link && link.id ? link.id : '', from: from, to: to, fromLevel: fromLevel, toLevel: toLevel });
    } else {
      directionCounts.otherNumberedToHow++;
    }
  });

  const duplicatePairs = Object.keys(duplicateMap).filter(function (pair) {
    return duplicateMap[pair].length > 1;
  }).map(function (pair) {
    const split = pair.split('\u0000');
    return { from: split[0], to: split[1], count: duplicateMap[pair].length, links: duplicateMap[pair] };
  }).sort(function (a, b) {
    return (a.from + '\u0000' + a.to).localeCompare(b.from + '\u0000' + b.to);
  });

  const noApplicableTargetSources = [];
  const missingApplicableLayerSources = [];
  const deeperOnlyToThisThenSources = [];
  const groupsByPage = Object.create(null);
  const sourceMetrics = [];

  howSources.forEach(function (source) {
    const layer = targetLayerFor(source, cfg);
    let candidates;
    if (layer.kind === 'this_then') candidates = thisThenRefs.slice();
    else if (layer.kind === 'how_level') candidates = (howRefsByLevel[String(layer.level)] || []).slice();
    else if (layer.kind === 'explicit_refs') candidates = layer.refs.slice();
    else candidates = thisThenRefs.concat(allHowRefs.filter(function (ref) { return ref !== source.ref; }));
    candidates = sortedUnique(candidates);
    const candidateSet = new Set(candidates);
    const sourceOutgoing = outgoing[source.ref] || [];
    const applicableTargets = sortedUnique(sourceOutgoing.map(function (link) { return link.to; }).filter(function (to) { return candidateSet.has(to); }));
    const thisThenTargets = sortedUnique(sourceOutgoing.map(function (link) { return link.to; }).filter(function (to) {
      return endpoints[to] && endpoints[to].type === 'this_then';
    }));
    const metric = {
      ref: source.ref,
      label: source.label,
      pageId: source.pageId,
      pageLabel: source.pageLabel,
      howLevel: source.howLevel,
      applicableTargetLayer: layer,
      candidateTargetCount: candidates.length,
      candidateTargets: candidates,
      applicableDegree: applicableTargets.length,
      applicableTargets: applicableTargets,
      totalOutgoingDegree: sourceOutgoing.length,
      thisThenTargets: thisThenTargets
    };
    sourceMetrics.push(metric);
    if (candidates.length && !applicableTargets.length) noApplicableTargetSources.push(source.ref);
    if (layer.kind === 'how_level' && !candidates.length) missingApplicableLayerSources.push(source.ref);
    if (source.howLevel !== null && source.howLevel >= 2 && candidates.length && !applicableTargets.length && thisThenTargets.length) {
      deeperOnlyToThisThenSources.push(source.ref);
    }
    if (!groupsByPage[source.pageId]) {
      groupsByPage[source.pageId] = {
        key: source.howLevel === null ? 'page:' + source.pageId : 'level:' + source.howLevel,
        pageId: source.pageId,
        pageLabel: source.pageLabel,
        howLevel: source.howLevel,
        applicableTargetLayer: layer,
        candidateTargetCount: candidates.length,
        sources: []
      };
    }
    groupsByPage[source.pageId].sources.push(metric);
  });

  const groups = Object.keys(groupsByPage).map(function (pageId) {
    const group = groupsByPage[pageId];
    const distribution = degreeDistribution(group.sources.map(function (source) { return source.applicableDegree; }));
    const mode = modalDegree(distribution);
    const share = group.sources.length ? mode.count / group.sources.length : 0;
    const mechanical = group.sources.length >= 8 && group.candidateTargetCount >= 8 && mode.degree <= 2 && share >= 0.8;
    const reverseSubstituteLinks = [];
    if (group.howLevel !== null && group.howLevel >= 2) {
      const groupRefs = new Set(group.sources.map(function (source) { return source.ref; }));
      shallowerToDeeperLinks.forEach(function (link) {
        if (link.toLevel === group.howLevel && groupRefs.has(link.to)) reverseSubstituteLinks.push(link);
      });
    }
    group.sourceCount = group.sources.length;
    group.degreeDistribution = distribution;
    group.modalApplicableDegree = mode.degree;
    group.modalSourceCount = mode.count;
    group.modalShare = share;
    group.mechanicalLowDegree = mechanical;
    group.mechanicalSourceRefs = mechanical ? group.sources.filter(function (source) {
      return source.applicableDegree === mode.degree;
    }).map(function (source) { return source.ref; }) : [];
    group.reverseSubstituteLinks = group.sources.some(function (source) { return source.applicableDegree > 0; }) ? [] : reverseSubstituteLinks;
    return group;
  }).sort(function (a, b) {
    const aLevel = a.howLevel === null ? Number.MAX_SAFE_INTEGER : a.howLevel;
    const bLevel = b.howLevel === null ? Number.MAX_SAFE_INTEGER : b.howLevel;
    if (aLevel !== bLevel) return aLevel - bLevel;
    return a.pageId.localeCompare(b.pageId);
  });

  const findings = [];
  if (shallowerToDeeperLinks.length) findings.push({
    id: 'shallower-to-deeper-adjacent', severity: 'fail', count: shallowerToDeeperLinks.length,
    message: 'Adjacent numbered hierarchy links run from a shallower How level to a deeper How level.', links: shallowerToDeeperLinks
  });
  groups.forEach(function (group) {
    if (group.reverseSubstituteLinks.length) findings.push({
      id: 'reverse-adjacent-substitute', severity: 'fail', pageId: group.pageId, howLevel: group.howLevel,
      message: 'Reverse adjacent links reach this deeper layer while it has no direct mapping to the adjacent higher layer.', links: group.reverseSubstituteLinks
    });
    if (group.mechanicalLowDegree) findings.push({
      id: 'mechanical-low-degree', severity: 'warn', pageId: group.pageId, howLevel: group.howLevel,
      sourceRefs: group.mechanicalSourceRefs,
      message: group.modalSourceCount + ' of ' + group.sourceCount + ' sources share an applicable-layer degree of ' + group.modalApplicableDegree + ' despite ' + group.candidateTargetCount + ' available targets.'
    });
  });
  if (deeperOnlyToThisThenSources.length) findings.push({
    id: 'deeper-only-to-this-then', severity: 'fail', sourceRefs: deeperOnlyToThisThenSources,
    message: 'Deeper numbered How sources map to This–Then boxes but not to their existing adjacent higher How layer.'
  });
  if (duplicatePairs.length) findings.push({
    id: 'duplicate-source-target-pairs', severity: 'fail', count: duplicatePairs.length,
    message: 'The effective How-link graph contains duplicate source-target pairs.'
  });

  return {
    metricsVersion: 'V1.4.3',
    title: typeof cfg.title === 'string' ? cfg.title : '',
    effectivePageSource: runtimeUsesSavedStatePages(cfg) ? 'savedState.SP' : 'subpages',
    effectiveLinkSource: 'savedState.howLinks',
    totals: {
      pageCount: pages.length,
      howPageCount: howPages.length,
      thisThenBoxCount: thisThenRefs.length,
      howSourceCount: howSources.length,
      howLinkCount: links.length
    },
    howPages: howPages,
    directionCounts: directionCounts,
    groups: groups,
    sources: sourceMetrics,
    shallowerToDeeperLinks: shallowerToDeeperLinks,
    noApplicableTargetSources: noApplicableTargetSources.sort(),
    missingApplicableLayerSources: missingApplicableLayerSources.sort(),
    deeperOnlyToThisThenSources: deeperOnlyToThisThenSources.sort(),
    unresolvedEndpoints: unresolvedEndpoints,
    wrongSourceLinks: wrongSourceLinks,
    duplicatePairs: duplicatePairs,
    findings: findings
  };
}

function extractEmbeddedConfig(html) {
  const marker = 'DoView.init(';
  const start = String(html).lastIndexOf(marker);
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  const from = start + marker.length;
  for (let i = from; i < html.length; i++) {
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
      if (depth === 0) return JSON.parse(html.slice(from, i + 1));
    }
  }
  return null;
}

function loadConfig(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (/\.html?$/i.test(file)) {
    const cfg = extractEmbeddedConfig(text);
    if (!cfg) throw new Error('No parseable DoView.init(...) config was found in ' + file);
    return cfg;
  }
  return JSON.parse(text);
}

function cli(argv) {
  let input = '';
  let output = '';
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--input') input = argv[++i] || '';
    else if (arg === '--out') output = argv[++i] || '';
    else if (!input) input = arg;
    else throw new Error('Unknown argument: ' + arg);
  }
  if (!input) throw new Error('Usage: node tools/how-link-metrics.js --input <board.json|board.html> [--out <metrics.json>]');
  const json = JSON.stringify(analyzeHowLinks(loadConfig(input)), null, 2) + '\n';
  if (output) fs.writeFileSync(output, json, 'utf8');
  else process.stdout.write(json);
}

if (require.main === module) {
  try {
    cli(process.argv);
  } catch (error) {
    console.error('ERROR: ' + error.message);
    process.exit(1);
  }
}

module.exports = {
  analyzeHowLinks: analyzeHowLinks,
  effectivePages: effectivePages,
  effectiveHowLinks: effectiveHowLinks,
  extractEmbeddedConfig: extractEmbeddedConfig,
  targetLayerFor: targetLayerFor
};
