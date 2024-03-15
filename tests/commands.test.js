'use strict';

const pathParse = require('./../src/index.js');

const commandCases = [
  // Mm
  [
    'M5 3',
    [
      {start: 0, end: 4, params: ['M', 5, 3]},
    ]
  ],
  [
    'm5 3',
    [
      {start: 0, end: 4, params: ['m', 5, 3]},
    ]
  ],

  // Ll
  [
    'L5 3',
    [
      {start: 0, end: 4, params: ['L', 5, 3]},
    ]
  ],
  [
    'l5 3',
    [
      {start: 0, end: 4, params: ['l', 5, 3]},
    ]
  ],

  // Hh
  [
    'H5',
    [
      {start: 0, end: 2, params: ['H', 5]},
    ]
  ],
  [
    'h5',
    [
      {start: 0, end: 2, params: ['h', 5]},
    ]
  ],

  // Vv
  [
    'V5',
    [
      {start: 0, end: 2, params: ['V', 5]},
    ]
  ],
  [
    'v5',
    [
      {start: 0, end: 2, params: ['v', 5]},
    ]
  ],

  // Zz
  [
    'Z',
    [
      {start: 0, end: 1, params: ['Z']},
    ]
  ],
  [
    'z',
    [
      {start: 0, end: 1, params: ['z']},
    ]
  ],

  // Cc
  [
    'C-.805.062-1.434.77-1.434 1.61',
    [
      {
        start: 0, end: 30, params: ['C', -.805, .062, -1.434, .77, -1.434, 1.61],
      }
    ]
  ],
  [
    'c-.805.062-.429-.893-1.034-1.284',
    [
      {
        start: 0, end: 32, params: ['c', -.805, .062, -.429, -.893, -1.034, -1.284],
      }
    ]
  ],

  // Tt
  [
    'T.11-.33',
    [
      {start: 0, end: 8, params: ['T', .11, -.33]}
    ]
  ],
  [
    't.11-.33',
    [
      {
        start: 0, end: 8, params: ['t', .11, -.33]}
    ]
  ],

  // Aa
  [
    'A.72.72 0 0023.28 0',
    [
      {
        start: 0, end: 19, params: ['A', .72, .72, 0, 0, 0, 23.28, 0],
      }
    ]
  ],
  [
    'a.72.72 90 1023.28 0',
    [
      {
        start: 0, end: 20, params: ['a', .72, .72, 90, 1, 0, 23.28, 0],
      }
    ]
  ],

  // Ss
  [
    'S.036 18.858 0 17.347',
    [
      {
        start: 0, end: 21,
        params: ['S', .036, 18.858, 0, 17.347]
      }
    ]
  ],
  [
    's.036 18.858 0 17.347',
    [
      {
        start: 0, end: 21,
        params: ['s', .036, 18.858, 0, 17.347]
      }
    ]
  ],

  // Qq
  [
    'Q.14 0 .25.12',
    [
      {
        start: 0, end: 13, params: ['Q', .14, 0, .25, .12],
      }
    ]
  ],
  [
    'q.14 0 .25.12',
    [
      {
        start: 0, end: 13,
        params: ['q', .14, 0, .25, .12]
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
