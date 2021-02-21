'use strict';

const simpleIcons = require('simple-icons');

const pathParse = require('./../src/index');

const main = function () {
  const commandsFrequencies = {};

  for (const iconName in simpleIcons) {
    const segments = pathParse(simpleIcons[iconName].path);

    for (let s = 0; s < segments.length; s++) {
      const cmd = segments[s].params[0];
      if (Object.prototype.hasOwnProperty.call(commandsFrequencies, cmd)) {
        commandsFrequencies[cmd]++;
      } else {
        commandsFrequencies[cmd] = 1;
      }
    }
  }

  let _max, _cmd;
  while (Object.keys(commandsFrequencies).length) {
    _max = -Infinity;
    _cmd = null;
    for (const cmd in commandsFrequencies) {
      if (_max < commandsFrequencies[cmd]) {
        _max = commandsFrequencies[cmd];
        _cmd = cmd;
      }
    }
    process.stdout.write(`${_cmd} -> ${_max}\n`);
    delete commandsFrequencies[_cmd];
  }
};

if (require.main === module) {
  main();
}
