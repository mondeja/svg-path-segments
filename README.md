# svg-path-segments

[![NPM version][npm-version-image]][npm-link]
[![Tests][tests-image]][tests-link]
[![Coverage status][coverage-image]][coverage-link]

A fast SVG path parser implementation for Javascript. Does not perform checks
on input data, but allows to rebuild original path segments from the result.
To avoid errors, check first that your paths are made up of ASCII characters
supported by the [SVG 1.1 specification][svg11-spec-link].

[![License][license-image]][license-link]

## Install

```bash
npm install svg-path-segments
```

## Documentation

### Public API

```js
const parsePath = require("svg-path-segments");

const segments = parsePath("M5 6 7 8l3 4z");
console.log(JSON.stringify(segments, null, 2));
```

```json
[
  {
    "start": 0,
    "end": 4,
    "params": ["M", 5, 6],
    "chain": {
      "start": 0,
      "end": 8
    },
  },
  {
    "start": 5,
    "end": 8,
    "params": ["M", 7, 8],
    "chain": {
      "start": 0,
      "end": 8
    },
  },
  {
    "start": 8,
    "end": 12,
    "params": ["l", 3, 4],
  },
  {
    "start": 12,
    "end": 13,
    "params": ["z"],
  }
]
```

### CLI

```bash
svg-path-segments --pretty "M5 6 7 8l3 4z"
```

### Reference

<a name="svgPathParse" href="#svgPathParse">#</a> **svgPathParse**(d: _string_)
⇒ _Segment[]_

Returns the segments of the SVG path. The result is an array of objects, one
per segment, which contain next properties:

- **`start`** (_number_): Index of the first character of the segment.
- **`end`** (_number_): Index of the first character after the segment. Note
 that you can use `d.substring(result.start, result.end)` to get the raw string
 representation of the segment.
- **`params`** (_number[]_): Parameters of the segment. The first parameter always
 is the command that draws the segment.
- **`chain`** (_object?_): If present, indicates that the segment is part of a
 chained set of segments.
  - **`start`** (_number_): Index of the first character of the chained set of
  segments to which the segment belongs.
  - **`end`** (_number_): Index of the first character after the chained set of
  segments to which the segment belongs. Note that you can use
  `d.substring(result.chain.start, result.chain.end)` to get the raw string
  representation of the chained set of segments to which the segment belongs.

### Comparison against other implementations

|  | svg-path-segments | svgpath |
|---|---|---|
| Require | `require("svg-path-segments")` | `require("svgpath/lib/path_parse")` |
| Benchmark\* | ~46ms | ~76ms |
| Absolutes | YES | NO |
| Segments indexing | YES | NO |
| Chained commands | YES | NO |
| Catmull-Rom curve commands (`R`/`r`) | NO | YES |
| Bearing commands (`B`/`b`) | NO | NO |
| First `m` converted to `M` | NO | YES |
| Chained `M`/`m` converted to `L`/`l` | NO | YES |
| Check path should start with `m`/`M` | NO | YES |
| Check bad command characters | NO | YES |
| Check missing parameters | NO | YES |
| Check leading zeros in numbers | NO | YES |
| Check arc flag `0` or `1` | NO | YES |
| Check invalid float exponents | NO | YES |
| Unicode support | NO | PARTIAL |

> \* Benchmarks are orientative, if you want to perform your own, see
  [scripts/\*-benchmark.js][scripts-link].

### Usage with [fontello/svgpath](https://github.com/fontello/svgpath)

```js
const svgpath = require("svgpath");
const parsePath = require("svg-path-segments");

const segments = parsePath(iconPath);
const SVGPath = svgpath("");
SVGPath.segments = segments.map(segment => segment.params);
```

[npm-link]: https://www.npmjs.com/package/svg-path-segments
[npm-version-image]: https://img.shields.io/npm/v/svg-path-segments?logo=NPM
[tests-image]: https://img.shields.io/github/actions/workflow/status/mondeja/svg-path-segments/ci.yml?branch=master&logo=github&label=tests
[tests-link]: https://github.com/mondeja/svg-path-segments/actions?query=workflow%3ACI
[coverage-image]: https://img.shields.io/coveralls/github/mondeja/svg-path-segments?logo=coverallss&color=brightgreen
[coverage-link]: https://coveralls.io/github/mondeja/svg-path-segments?branch=master
[license-image]: https://img.shields.io/npm/l/svg-path-segments?color=blue
[license-link]: https://github.com/mondeja/svg-path-segments/blob/master/LICENSE
[scripts-link]: https://github.com/mondeja/svg-path-segments/tree/master/scripts
[svg11-spec-link]: https://www.w3.org/TR/SVG11/paths.html
