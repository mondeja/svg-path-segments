#!/usr/bin/env node
'use strict';

/* eslint no-process-exit: 0 */
/* eslint global-require: 0 */

function printHelp() {
  process.stderr.write(
    `Usage: svg-path-segments [-h] [-v] [-p] [-i N] [PATH]

Fast SVG path parser. Prints the information about the segments of a SVG path in JSON format. 

Positional arguments:
  PATH                  SVG path to parse.

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program version number and exit.
  -p, --pretty          Pretty-print JSON output.
  -i N, --indent N      Number of spaces for indentation used pretty-printing JSON output. Only takes effect passing '--pretty' option.
`
  );
  process.exit(1);
}

function printVersion() {
  const version = require('./../package.json').version;
  process.stderr.write(`${version}\n`);
  process.exit(1);
}

if (require.main === module) {
  let sliceN = 1;
  if (process.argv.indexOf(module.filename) > -1 || require('path').basename(process.argv[1]) === 'svg-path-bbox') {
    sliceN = 2;
  }
  const args = process.argv.slice(sliceN, process.argv.length);

  if (args.indexOf('-h') > -1 || args.indexOf('--help') > -1) {
    printHelp();
  } else if (args.indexOf('-v') > -1 || args.indexOf('--version') > -1) {
    printVersion();
  }

  let arg = args.shift(),
    pretty = false,
    _parsingIndent = false,
    indent = 2,
    d = null;
  while (arg) {
    switch (arg) {
    case '-p':
    case '--pretty':
      pretty = true;
      break;
    case '-i':
    case '--indent':
      _parsingIndent = true;
      break;
    default:
      if (_parsingIndent) {
        _parsingIndent = false;
        indent = parseInt(arg);
      } else {
        d = arg;
      }
    }
    arg = args.shift();
  }

  if (Number.isNaN(indent) || d === null) {
    printHelp();
  }

  const parsePath = require('./index.js');
  const segments = parsePath(d);

  if (pretty) {
    process.stdout.write(`${JSON.stringify(segments, null, indent)}\n`);
  } else {
    process.stdout.write(`${JSON.stringify(segments)}\n`);
  }
  process.exit(0);
}
