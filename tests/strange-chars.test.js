'use strict';

const pathParse = require('./../src/index.js');

const strangeCharacterCases = [
  [
    'M5 6',  // white space (0x20)
    [
      {start: 0, end: 4, chained: false, params: ['M', 5, 6], abs: true},
    ]
  ],
  [
    'M5\n6',  // newline (0x0A)
    [
      {start: 0, end: 4, chained: false, params: ['M', 5, 6], abs: true},
    ]
  ],
  [
    'M5 6',  // tabulator (0x09)
    [
      {start: 0, end: 4, chained: false, params: ['M', 5, 6], abs: true},
    ]
  ],
  [
    'M5\r6',  // carriage return (0x0D)
    [
      {start: 0, end: 4, chained: false, params: ['M', 5, 6], abs: true},
    ]
  ],

  // other white spaces
  [
    `M5
 6`,  // 0x0B
    [
      {start: 0, end: 5, chained: false, params: ['M', 5, 6], abs: true},
    ]
  ],
  [
    'M5 6',  // 0xA0
    [
      {start: 0, end: 4, chained: false, params: ['M', 5, 6], abs: true},
    ]
  ],
];

describe('pathParse(d) [Strange character cases]', () => {
  test.each(strangeCharacterCases)(
    'parsePath(%p) ⇢ %p',
    (d, segments) => expect(pathParse(d)).toEqual(segments)
  );
});
