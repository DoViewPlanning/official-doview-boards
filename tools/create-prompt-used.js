#!/usr/bin/env node
'use strict';

/*
DoView V1.4.3 prompt-used helper.
Creates the required user-visible prompt record without system/developer or hidden reasoning content.
No external packages.
*/

const fs = require('fs');

function usage() {
  return [
    'Usage:',
    '  node tools/create-prompt-used.js --out <file.md> --board <title> --step <Step 1|Step 2>',
    '    --generated <ISO-or-local-date-time> --timezone <zone> --model <name> --effort <value>',
    '    --prompt-file <user-prompt.txt> [--instructions-file <continued-user-instructions.txt>]',
    '    [--uploaded <filename> ...] [--excluded <filename-and-reason> ...] --package <package-name>',
    '    --engine <version> --builder <version> --validation <version> --schema <version>'
  ].join('\n');
}

function parse(argv) {
  const multi = { uploaded: [], excluded: [] };
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith('--')) throw new Error('Unexpected argument: ' + key);
    const name = key.slice(2);
    const value = argv[++i];
    if (value === undefined) throw new Error('Missing value for ' + key);
    if (name === 'uploaded') multi.uploaded.push(value);
    else if (name === 'excluded') multi.excluded.push(value);
    else out[name] = value;
  }
  out.uploaded = multi.uploaded;
  out.excluded = multi.excluded;
  return out;
}

function readOptional(file) {
  return file ? fs.readFileSync(file, 'utf8').trim() : '';
}

try {
  const a = parse(process.argv);
  const required = ['out','board','step','generated','timezone','model','effort','prompt-file','package','engine','builder','validation','schema'];
  const missing = required.filter(k => !a[k]);
  if (missing.length) throw new Error('Missing required options: ' + missing.join(', ') + '\n' + usage());
  if (a.step !== 'Step 1' && a.step !== 'Step 2') throw new Error('--step must be exactly Step 1 or Step 2');
  const prompt = readOptional(a['prompt-file']);
  const instructions = readOptional(a['instructions-file']);
  const uploads = a.uploaded.length ? a.uploaded.map(x => '- `' + x + '`').join('\n') : '- None';
  const excluded = a.excluded.length ? a.excluded.map(x => '- `' + x + '`').join('\n') : '- None';
  const text = `# Prompt used\n\n## Workflow information\n\n- Board: ${a.board}\n- Workflow Step: ${a.step}\n- Generated: ${a.generated}\n- Timezone: ${a.timezone}\n- AI model: ${a.model}\n- Effort level: ${a.effort}\n\n## User prompt\n\n${prompt}\n\n## Uploaded files actually used\n\n${uploads}\n\n## Uploaded files present but explicitly excluded\n\n${excluded}\n\n## Continuing user instructions\n\n${instructions || 'None beyond the initiating prompt.'}\n\n## Package used\n\n- Package: ${a.package}\n- Engine version: ${a.engine}\n- Builder version: ${a.builder}\n- Validation version: ${a.validation}\n- Saved schema version: ${a.schema}\n\n## Scope note\n\nThis file records user-visible instructions and filenames used for the build. It does not include hidden system/developer instructions or private reasoning.\n`;
  fs.writeFileSync(a.out, text, 'utf8');
  console.log('Wrote ' + a.out);
} catch (e) {
  console.error('ERROR: ' + e.message);
  process.exit(1);
}
