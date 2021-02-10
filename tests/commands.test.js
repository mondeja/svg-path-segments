"use strict"

const pathParse = require("./../src/index.js");

const commandCases = [
  // Mm
  [
    "M5 3",
    [
      {cmd: "M", raw: "M5 3", start: 0, end: 3, chained: false, params: [5, 3]},
    ]
  ],
  [
    "m5 3",
    [
      {cmd: "m", raw: "m5 3", start: 0, end: 3, chained: false, params: [5, 3]},
    ]
  ],
  
  // Ll
  [
    "L5 3",
    [
      {cmd: "L", raw: "L5 3", start: 0, end: 3, chained: false, params: [5, 3]},
    ]
  ],
  [
    "l5 3",
    [
      {cmd: "l", raw: "l5 3", start: 0, end: 3, chained: false, params: [5, 3]},
    ]
  ],
  
  // Hh
  [
    "H5",
    [
      {cmd: "H", raw: "H5", start: 0, end: 1, chained: false, params: [5]},
    ]
  ],
  [
    "h5",
    [
      {cmd: "h", raw: "h5", start: 0, end: 1, chained: false, params: [5]},
    ]
  ],
  
  // Vv
  [
    "V5",
    [
      {cmd: "V", raw: "V5", start: 0, end: 1, chained: false, params: [5]},
    ]
  ],
  [
    "v5",
    [
      {cmd: "v", raw: "v5", start: 0, end: 1, chained: false, params: [5]},
    ]
  ],
  
  // Zz
  [
    "Z",
    [
      {cmd: "Z", raw: "Z", start: 0, end: 0, chained: false, params: []},
    ]
  ],
  [
    "z",
    [
      {cmd: "z", raw: "z", start: 0, end: 0, chained: false, params: []},
    ]
  ],
  
  // Cc
  [
    "C-.805.062-1.434.77-1.434 1.61",
    [
      {
        cmd: "C", raw: "C-.805.062-1.434.77-1.434 1.61", start: 0, end: 29,
        chained: false, params: [-.805, .062, -1.434, .77, -1.434, 1.61]
      }
    ]
  ],
  [
    "c-.429-.893-1.034-1.284",
    [
      {
        cmd: "c", raw: "c-.429-.893-1.034-1.284", start: 0, end: 22,
        chained: false, params: [-.429, -.893, -1.034, -1.284]
      }
    ]
  ],
  
  // Tt
  [
    "T.11-.33",
    [
      {
        cmd: "T", raw: "T.11-.33", start: 0, end: 7, chained: false,
        params: [.11, -.33]
      }
    ]
  ],
  [
    "t.11-.33",
    [
      {
        cmd: "t", raw: "t.11-.33", start: 0, end: 7, chained: false,
        params: [.11, -.33]
      }
    ]
  ],
  
  // Aa
  [
    "A.72.72 0 0023.28 0",
    [
      {
        cmd: "A", raw: "A.72.72 0 0023.28 0", start: 0, end: 18,
        chained: false, params: [.72, .72, 0, 0, 0, 23.28, 0]
      }
    ]
  ],
  [
    "a0 0023.28 0",
    [
      {
        cmd: "a", raw: "a0 0023.28 0", start: 0, end: 11,
        chained: false, params: [0, 0, 0, 23.28, 0]
      }
    ]
  ],
  
  // Ss
  [
    "S.036 18.858 0 17.347",
    [
      {
        cmd: "S", raw: "S.036 18.858 0 17.347", start: 0, end: 20,
        chained: false, params: [.036, 18.858, 0, 17.347]
      }
    ]
  ],
  [
    "s.036 18.858 0 17.347",
    [
      {
        cmd: "s", raw: "s.036 18.858 0 17.347", start: 0, end: 20,
        chained: false, params: [.036, 18.858, 0, 17.347]
      }
    ]
  ],
  
  // Qq
  [
    "Q.14 0 .25.12",
    [
      {
        cmd: "Q", raw: "Q.14 0 .25.12", start: 0, end: 12,
        chained: false, params: [.14, 0, .25, .12]
      }
    ]
  ],
  [
    "q.14 0 .25.12",
    [
      {
        cmd: "q", raw: "q.14 0 .25.12", start: 0, end: 12,
        chained: false, params: [.14, 0, .25, .12]
      }
    ]
  ],
];

describe("pathParse(d) [Command cases]", () => {
  test.each(commandCases)(
    "parsePath(%p) ⇢ %p",
    (d, segments) => {
      expect(pathParse(d).segments).toEqual(segments);
    }
  );
});
