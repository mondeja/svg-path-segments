'use strict';

const pathParse = require('./../src/index.js');

const skipsCases = [
  // spaces between parameters
  [
    'M 5 6z',
    [
      {start: 0, end: 5, chained: false, params: ['M', 5, 6]},
      {start: 5, end: 6, chained: false, params: ['z']},
    ],
  ],
  [
    'M   5   6z',
    [
      {start: 0, end: 9, chained: false, params: ['M', 5, 6]},
      {start: 9, end: 10, chained: false, params: ['z']},
    ]
  ],
  [
    '   M   5   6z',
    [
      {start: 3, end: 12, chained: false, params: ['M', 5, 6]},
      {start: 12, end: 13, chained: false, params: ['z']},
    ]
  ],
  [
    'M5   6  z',  // example of ignored failure with bad SVG syntax
    [
      {
        start: 0, end: 6, params: ['M', 5, 6],
        chained: true, chainStart: 0, chainEnd: 6
      },
      {
        start: 7, end: 6, params: ['M', NaN, NaN],
        chained: true, chainStart: 0, chainEnd: 6
      },
      {
        start: 8, end: 9, params: ['z'], chained: false
      }
    ]
  ],
  [
    '   M   5   6z  ',  // assumed end of string as end of "z" command
    [
      {start: 3, end: 12, chained: false, params: ['M', 5, 6]},
      {start: 12, end: 15, chained: false, params: ['z']},
    ]
  ],

  // commas between parameters
  [
    'M 5,6z',
    [
      {start: 0, end: 5, chained: false, params: ['M', 5, 6]},
      {start: 5, end: 6, chained: false, params: ['z']},
    ],
  ],
  [
    'M 5,6,z',
    [
      {start: 0, end: 5, chained: false, params: ['M', 5, 6]},
      {start: 6, end: 7, chained: false, params: ['z']},
    ],
  ],
  [
    'M,5,6,z',
    [
      {start: 0, end: 5, chained: false, params: ['M', 5, 6]},
      {start: 6, end: 7, chained: false, params: ['z']},
    ],
  ],

  // exponentials
  [
    'M5.56789e+0 6z',
    [
      {start: 0, end: 13, chained: false, params: ['M', 5.56789, 6]},
      {start: 13, end: 14, chained: false, params: ['z']},
    ],
  ],
  [
    'M-1.15544787656789e+2 6',
    [
      {
        start: 0, end: 23, chained: false, params: ['M', -115.544787656789, 6]
      },
    ],
  ],
  [
    'M-1.15544787656789e-2 6',
    [
      {
        start: 0, end: 23, chained: false,
        params: ['M', -0.0115544787656789, 6],
      },
    ],
  ],
  [
    'M-1.6789e+5e5',  // malformed exponential notation
    [
      {
        start: 0, end: 13, chained: false, params: ['M', -167890, NaN]
      },
    ],
  ],

  // "chained" operators
  [
    'M-6-5',
    [{start: 0, end: 5, chained: false, params: ['M', -6, -5]}],
  ],
];


describe('pathParse(d) [Skips cases]', () => {
  test.each(skipsCases)(
    'parsePath(%p) ⇢ %p',
    (d, segments) => expect(pathParse(d)).toEqual(segments)
  );
});
