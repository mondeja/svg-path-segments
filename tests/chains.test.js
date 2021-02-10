'use strict'

const pathParse = require("./../src/index.js");

const chainsCases = [
  // MmLl
  [
    "M5 6l3 4 1 2z",
    [
      {cmd: "M", raw: "M5 6", start: 0, end: 3, chained: false, params: [5, 6]},
      {cmd: "l", raw: "l3 4", start: 4, end: 7, chained: false, params: [3, 4]},
      {
        cmd: "l", raw: "1 2", start: 9, end: 11, chained: true,
        chainStart: 4, chainEnd: 11, params: [1, 2],
      },
      {cmd: "z", raw: "z", start: 12, end: 12, chained: false, params: []},
    ]
  ],
  
  // HhVv
  [
    "H3 4 1 2v3 .2.1z",
    [
      {cmd: "H", raw: "H3", start: 0, end: 1, chained: false, params: [3]},
      {
        cmd: "H", raw: "4", start: 3, end: 3, chained: true,
        chainStart: 0, chainEnd: 7, params: [4]
      },
      {
        cmd: "H", raw: "1", start: 5, end: 5, chained: true,
        chainStart: 0, chainEnd: 7, params: [1]
      },
      {
        cmd: "H", raw: "2", start: 7, end: 7, chained: true,
        chainStart: 0, chainEnd: 7, params: [2]
      },
      {cmd: "v", raw: "v3", start: 8, end: 9, chained: false, params: [3]},
      {
        cmd: "v", raw: ".2", start: 11, end: 12, chained: true,
        chainStart: 8, chainEnd: 14, params: [.2]
      },
      {
        cmd: "v", raw: ".1", start: 13, end: 14, chained: true,
        chainStart: 8, chainEnd: 14, params: [.1]
      },
      {cmd: "z", raw: "z", start: 15, end: 15, chained: false, params: []},
    ]
  ]
];

describe("pathParse(d) [Chains cases]", () => {
  test.each(chainsCases)(
    "parsePath(%p) ⇢ %p",
    (d, segments) => {
      expect(pathParse(d).segments).toEqual(segments);
    }
  );
});
