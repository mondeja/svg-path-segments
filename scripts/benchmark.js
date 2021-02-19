'use strict';

const pathParse = require('./../src/index');
const svgPathParse = require('svgpath/lib/path_parse');

const LIBRARIES = {
  'svg-path-segments': {
    func: pathParse,
    total: 0
  },
  'svgpath': {
    func: svgPathParse,
    total: 0
  },
};

const PATHS = [
  'M0 0L10 10 20 0Z',
  'M100,250 c0,-150 300,-150 300,0',
  'M 10 20 C 50 -15 90 45 10 80 L 60 80',
];

const EPOCHS = [10000, 100000];

const runLibrariesBenchmarkComparison = function (paths, epochs) {
  const _paths = [];
  if (Object.prototype.toString.call(paths) === '[object Array]') {
    for (let _p = 0; _p < paths.length; _p++) {
      _paths.push([paths[_p], null]);
    }
  } else {
    // identifier -> path
    for (const key in paths) {
      _paths.push([paths[key], key]);
    }
  }

  for (let p = 0; p < _paths.length; p++) {
    for (let e = 0; e < epochs.length; e++) {
      const path = _paths[p];
      let pathType = path[0].replace(/[0-9\-.\s,]/g, '');
      pathType = pathType.length > 25 ?
        `${pathType.substring(0, 25)}...` : pathType;
      const pathSub = path[0].length > 25 ?
        `${path[0].substring(0, 25)}...` : path;

      if (_paths[p][1]) {  // paths with identifier
        process.stdout.write(`${_paths[p][1]} - `);
      }

      process.stdout.write(
        `${pathSub} (type ${pathType}) [${epochs[e]} epochs]\n`
      );
      for (const library in LIBRARIES) {
        // console.time(library);
        const begin = Date.now();
        const func = LIBRARIES[library]['func'];

        let result;
        let _nSegments, err;
        for (let r = 0; r < epochs[e]; r++) {
          result = func(path[0]);
          if (Object.prototype.toString.call(result) === '[object Array]') {
            _nSegments = result.length;
          } else {
            _nSegments = result.segments.length;
          }
          if (result.err) {
            err = result.err;
          }
        }

        // console.timeEnd(library);
        const end = Date.now();
        const timeSpent = end - begin;
        process.stdout.write(`  ${library}: ${timeSpent} ms\n`);
        if (err) {
          process.stderr.write(`    ${err}\n`);
        } else {
          process.stdout.write(`    Number of segments: ${_nSegments}\n`);
        }
        LIBRARIES[library]['total'] += timeSpent;
      }
      process.stdout.write('\n');
    }
  }

  for (const library in LIBRARIES) {
    process.stdout.write(`${library}\n`);
    process.stdout.write(`  total: ${LIBRARIES[library]['total']} ms\n`);
    process.stdout.write(`  median: ${LIBRARIES[library]['total'] / _paths.length} ms\n`);
  }
};

const main = function () {
  runLibrariesBenchmarkComparison(PATHS, EPOCHS);
};

if (require.main === module) {
  main();
} else {
  module.exports = {runLibrariesBenchmarkComparison};
}
