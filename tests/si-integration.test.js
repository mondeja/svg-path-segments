'use strict';

/**
 * Compares svg-path-segments against fontello svgpath parser.
 **/

const pathParse = require('./../src/index');

const svgPathParse = require('svgpath/lib/path_parse');
const simpleIcons = require('simple-icons');

const getSimpleIconsPaths = () => {
  const paths = [];
  for (const iconName in simpleIcons) {
    paths.push([iconName, simpleIcons[iconName].path]);
  }
  return paths;
};

describe('pathParse(d) [Command cases]', () => {
  test.each(getSimpleIconsPaths())(
    '%p | parsePath(%p)',
    (iconName, d) => {
      const svgpathParams = svgPathParse(d).segments;
      const segments = pathParse(d);
      const segmentsParams = segments.map(segment => segment.params);

      // svgpath converts to absolute "M" if "m" was found as first segment
      if (svgpathParams[0][0] === 'M' && segmentsParams[0][0] === 'm') {
        svgpathParams[0][0] = 'm';
      }

      // svgpath convert subsequent chained "M" commands to "l" or "L",
      // but SVG path specification says that are "implicit". We respect
      // original notation so in this test this must be normalized
      // https://www.w3.org/TR/SVG/paths.html#PathDataMovetoCommands
      for (let s = 0; s < svgpathParams.length; s++) {
        if (
          segments[s].chained &&
            ['m', 'M'].indexOf(segmentsParams[s][0]) > -1 &&
            ['l', 'L'].indexOf(svgpathParams[s][0]) > -1
        ) {
          svgpathParams[s][0] = segmentsParams[s][0];
        }
      }

      expect(svgpathParams).toEqual(segmentsParams);
    }
  );
});
