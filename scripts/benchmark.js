'use strict';

const {pathParse} = require('./../build/Release/svg-path-parser');
const svgPathParse = require('svgpath/lib/path_parse');

const LIBRARIES = {
  'svg-path-parser': {
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
  if (typeof paths === 'object') {
    for (const key in paths) {
      _paths.push([paths[key], key]);
    }
  } else {
    for (let _p = 0; _p < paths.length; _p++) {
      _paths.push([paths[_p], null]);
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

      if (_paths[p][1]) {
        process.stdout.write(`${_paths[p][1]} - `);
      }

      console.log(`${pathSub} (type ${pathType}) [${epochs[e]} epochs]`);
      for (const library in LIBRARIES) {
        //console.time(library);
        const begin = Date.now();
        const func = LIBRARIES[library]['func'];
        let _errorRaised = false, result;
        let _nSegments, err;
        for (let r = 0; r < epochs[e]; r++) {
          result = func(path[0]);
          _nSegments = result.segments.length;
          if (result.err) {
            err = result.err;
          }
        }
        if (err) {
          console.error(err);
        } else {
          console.log(` Number of segments: ${_nSegments}`)
        }
        //console.timeEnd(library);
        const end = Date.now();
        const timeSpent = end - begin;
        process.stdout.write('  ' + library + ': ' + timeSpent + 'ms\n');
        LIBRARIES[library]["total"] += timeSpent;
        /*if (result) {
          console.log('    + result:', result);
        }*/
      }
      console.log();
    }
  }
  
  for (const library in LIBRARIES) {
    console.log(library)
    console.log(`  total: ${LIBRARIES[library]["total"]}ms`)
    console.log(`  median: ${LIBRARIES[library]["total"] / _paths.length}ms`)
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
