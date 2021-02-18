'use strict';

const simpleIcons = require('simple-icons');

const {runLibrariesBenchmarkComparison} = require('./benchmark.js');

const EPOCHS = [1000];

const MAX_ICONS = 50;

const main = function () {
  const paths = {};

  let counter = 1;
  for (const iconName in simpleIcons) {
    const path = simpleIcons[iconName].path;
    paths[iconName] = path;

    if (counter > MAX_ICONS) {
      break;
    }
    counter++;
  }

  runLibrariesBenchmarkComparison(paths, EPOCHS);
};

if (require.main === module) {
  main();
}
