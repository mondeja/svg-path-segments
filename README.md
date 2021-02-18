# svg-path-segments

[![NPM version][npm-version-image]][npm-link]
[![License][license-image]][license-link]
[![Tests][tests-image]][tests-link]
[![Coverage status][coverage-image]][coverage-link]

A fast SVG path parser implementation for Javascript. Does not perform checks
on input data, but allows to rebuild all SVG commands from the result.

## Install

```bash
npm install svg-path-segments
```

## Documentation

### Usage

```js
const parsePath = require("svg-path-segments");

const result = parsePath("M5 6 7 8l3 4z");
console.log(JSON.stringify(result, null, 2));
```

```json
[
  {
    "start": 0,
    "end": 4,
    "params": [
      "M",
      5,
      6
    ],
    "abs": true,
    "chained": true,
    "chainStart": 0,
    "chainEnd": 8
  },
  {
    "start": 5,
    "end": 8,
    "params": [
      "M",
      7,
      8
    ],
    "abs": true,
    "chained": true,
    "chainStart": 0,
    "chainEnd": 8
  },
  {
    "start": 8,
    "end": 12,
    "params": [
      "l",
      3,
      4
    ],
    "abs": false,
    "chained": false
  },
  {
    "start": 12,
    "end": 13,
    "params": [
      "z"
    ],
    "abs": false,
    "chained": false
  }
]
```

### Reference

<a name="svgPathParse" href="#svgPathParse">#</a> <b>svgPathParse</b>(<i>d</i>)
⇒ `Array`

- **d** (string) SVG path.

Returns the segments of the SVG path. The result is an array of objects which
contain next properties:

- **`start`** (*Integer*): Index of the first character of the segment.
- **`end`** (*Integer*): Index of the first character after the segment. Note
 that you can use `d.substring(result.start, result.end)` to get the raw string
 representation of the segment.
- **`params`** (*Array*): Parameters of the segment. The first parameter always
 is the command that draws the segment.
- **`abs`** (*Boolean*): Indicates that the segment has absolute coordinates.
- **`chained`** (*Boolean*): Indicates that the segment is part of a chained
 set of segments. If this property is `true`, the object will contain the
 properties `chainStart` and `chainEnd`.
- **`chainStart`** (*Integer*): Index of the first character of the chained set
 of segments to which the segment belongs.
- **`chainEnd`** (*Integer*): Index of the first character after the chained
 set of segments to which the segment belongs. Note that you can use
 `d.substring(result.chainStart, result.chainEnd)` to get the raw string
  representation of the chained set of segments.

[npm-link]: https://www.npmjs.com/package/svg-path-segments
[npm-version-image]: https://img.shields.io/npm/v/svg-path-segments
[tests-image]: https://img.shields.io/github/workflow/status/mondeja/svg-path-segments/CI
[tests-link]: https://github.com/mondeja/svg-path-segments/actions?query=workflow%3ACI
[coverage-image]: https://coveralls.io/repos/github/mondeja/svg-path-segments/badge.svg?branch=master
[coverage-link]: https://coveralls.io/github/mondeja/svg-path-segments?branch=master
[license-image]: https://img.shields.io/npm/l/svg-path-segments?color=brightgreen
[license-link]: https://github.com/mondeja/svg-path-segments/blob/master/LICENSE
