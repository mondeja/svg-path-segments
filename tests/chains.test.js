'use strict';

const pathParse = require('./../src/index.js');

const chainsCases = [
  // MmLl
  [
    'M5 6l3 4 1 2z',
    [
      {start: 0, end: 4, chained: false, params: ['M', 5, 6]},
      {
        start: 4, end: 8, params: ['l', 3, 4],
        chained: true, chainStart: 4, chainEnd: 12
      },
      {
        start: 9, end: 12, params: ['l', 1, 2],
        chained: true, chainStart: 4, chainEnd: 12,
      },
      {start: 12, end: 13, chained: false, params: ['z']},
    ]
  ],

  // HhVv
  [
    'H3 4 1 2v3 .2.1z',
    [
      {
        start: 0, end: 2, chained: true, params: ['H', 3],
        chainStart: 0, chainEnd: 8,
      },
      {
        start: 3, end: 4, chained: true,
        chainStart: 0, chainEnd: 8, params: ['H', 4]
      },
      {
        start: 5, end: 6, chained: true,
        chainStart: 0, chainEnd: 8, params: ['H', 1]
      },
      {
        start: 7, end: 8, chained: true,
        chainStart: 0, chainEnd: 8, params: ['H', 2]
      },
      {
        start: 8, end: 10, params: ['v', 3],
        chained: true, chainStart: 8, chainEnd: 15,
      },
      {
        start: 11, end: 13, chained: true,
        chainStart: 8, chainEnd: 15, params: ['v', .2]
      },
      {
        start: 13, end: 15, chained: true,
        chainStart: 8, chainEnd: 15, params: ['v', .1]
      },
      {start: 15, end: 16, chained: false, params: ['z']},
    ]
  ]
];

describe('pathParse(d) [Chains cases]', () => {
  test.each(chainsCases)(
    'parsePath(%p) ⇢ %p',
    (d, segments) => expect(pathParse(d)).toEqual(segments)
  );
});
