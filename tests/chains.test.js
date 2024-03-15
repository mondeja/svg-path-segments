'use strict';

const pathParse = require('./../src/index.js');

const chainsCases = [
  // MmLl
  [
    'M5 6l3 4 1 2z',
    [
      {start: 0, end: 4, params: ['M', 5, 6]},
      {
        start: 4, end: 8, params: ['l', 3, 4],
        chain: {start: 4, end: 12}
      },
      {
        start: 9, end: 12, params: ['l', 1, 2],
        chain: {start: 4, end: 12}
      },
      {start: 12, end: 13, params: ['z']},
    ]
  ],

  // HhVv
  [
    'H3 4 1 2v3 .2.1z',
    [
      {
        start: 0, end: 2, params: ['H', 3],
        chain: {start: 0, end: 8}
      },
      {
        start: 3, end: 4, params: ['H', 4],
        chain: {start: 0, end: 8}
      },
      {
        start: 5, end: 6, params: ['H', 1],
        chain: {start: 0, end: 8},
      },
      {
        start: 7, end: 8, params: ['H', 2],
        chain: {start: 0, end: 8},
      },
      {
        start: 8, end: 10, params: ['v', 3],
        chain: {start: 8, end: 15},
      },
      {
        start: 11, end: 13, params: ['v', .2],
        chain: {start: 8, end: 15},
      },
      {
        start: 13, end: 15, params: ['v', .1],
        chain: {start: 8, end: 15},
      },
      {start: 15, end: 16, params: ['z']},
    ]
  ]
];

describe('pathParse(d) [Chains cases]', () => {
  test.each(chainsCases)(
    'parsePath(%p) ⇢ %p',
    (d, segments) => expect(pathParse(d)).toEqual(segments)
  );
});
