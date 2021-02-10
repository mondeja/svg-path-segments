'use strict';

const simpleIcons = require('simple-icons');

const {runLibrariesBenchmarkComparison} = require('./benchmark.js');

const EPOCHS = [1000];

const main = function () {
  const paths = {};

  var counter = 1;
  for (const iconName in simpleIcons) {
    const path = simpleIcons[iconName].path;
    paths[iconName] = path;
    
    if (counter > 10) {
      break;
    }
    counter++;
  }

  runLibrariesBenchmarkComparison(paths, EPOCHS);
};

if (require.main === module) {
  main();
}
