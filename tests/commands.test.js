'use strict';

const pathParse = require('./../src/index.js');

const commandCases = [
  // Mm
  [
    'M5 3',
    [
      {start: 0, end: 4, chained: false, params: ['M', 5, 3], abs: true},
    ]
  ],
  [
    'm5 3',
    [
      {start: 0, end: 4, chained: false, params: ['m', 5, 3], abs: false},
    ]
  ],

  // Ll
  [
    'L5 3',
    [
      {start: 0, end: 4, chained: false, params: ['L', 5, 3], abs: true},
    ]
  ],
  [
    'l5 3',
    [
      {start: 0, end: 4, chained: false, params: ['l', 5, 3], abs: false},
    ]
  ],

  // Hh
  [
    'H5',
    [
      {start: 0, end: 2, chained: false, params: ['H', 5], abs: true},
    ]
  ],
  [
    'h5',
    [
      {start: 0, end: 2, chained: false, params: ['h', 5], abs: false},
    ]
  ],

  // Vv
  [
    'V5',
    [
      {start: 0, end: 2, chained: false, params: ['V', 5], abs: true},
    ]
  ],
  [
    'v5',
    [
      {start: 0, end: 2, chained: false, params: ['v', 5], abs: false},
    ]
  ],

  // Zz
  [
    'Z',
    [
      {start: 0, end: 1, chained: false, params: ['Z'], abs: true},
    ]
  ],
  [
    'z',
    [
      {start: 0, end: 1, chained: false, params: ['z'], abs: false},
    ]
  ],

  // Cc
  [
    'C-.805.062-1.434.77-1.434 1.61',
    [
      {
        start: 0, end: 30, params: ['C', -.805, .062, -1.434, .77, -1.434, 1.61],
        chained: false, abs: true,
      }
    ]
  ],
  [
    'c-.805.062-.429-.893-1.034-1.284',
    [
      {
        start: 0, end: 32, params: ['c', -.805, .062, -.429, -.893, -1.034, -1.284],
        chained: false, abs: false,
      }
    ]
  ],

  // Tt
  [
    'T.11-.33',
    [
      {start: 0, end: 8, chained: false, params: ['T', .11, -.33], abs: true}
    ]
  ],
  [
    't.11-.33',
    [
      {
        start: 0, end: 8, chained: false, params: ['t', .11, -.33], abs: false}
    ]
  ],

  // Aa
  [
    'A.72.72 0 0023.28 0',
    [
      {
        start: 0, end: 19, params: ['A', .72, .72, 0, 0, 0, 23.28, 0],
        chained: false, abs: true,
      }
    ]
  ],
  [
    'a.72.72 90 1023.28 0',
    [
      {
        start: 0, end: 20, params: ['a', .72, .72, 90, 1, 0, 23.28, 0],
        chained: false, abs: false,
      }
    ]
  ],

  // Ss
  [
    'S.036 18.858 0 17.347',
    [
      {
        start: 0, end: 21, abs: true,
        chained: false, params: ['S', .036, 18.858, 0, 17.347]
      }
    ]
  ],
  [
    's.036 18.858 0 17.347',
    [
      {
        start: 0, end: 21, abs: false,
        chained: false, params: ['s', .036, 18.858, 0, 17.347]
      }
    ]
  ],

  // Qq
  [
    'Q.14 0 .25.12',
    [
      {
        start: 0, end: 13, abs: true, params: ['Q', .14, 0, .25, .12],
        chained: false,
      }
    ]
  ],
  [
    'q.14 0 .25.12',
    [
      {
        start: 0, end: 13, abs: false,
        chained: false, params: ['q', .14, 0, .25, .12]
      }
    ]
  ],
];

describe('pathParse(d) [Command cases]', () => {
  test.each(commandCases)(
    'parsePath(%p) ⇢ %p',
    (d, segments) => expect(pathParse(d)).toEqual(segments)
  );
});
