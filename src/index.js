'use strict';

/**
 * @typedef {{
 *  start: number,
 *  end: number,
 *  params: number[],
 *  chained: boolean,
 *  chainStart?: number,
 *  chainEnd?: number
 * }} Segment
 */

/**
 * @param {Number} code
 * @returns {Number|undefined}
 */
const paramCountsByCommand = function (code) {
  switch (code) {
  case 0x63:  // c
    return 6;
  case 0x6C:  // l
    return 2;
  case 0x61:  // a
    return 7;
  case 0x7A:  // z
    return 0;
  case 0x68:  // h
    return 1;
  case 0x76:  // v
    return 1;
  case 0x6D:  // m
    return 2;
  case 0x4D:  // M
    return 2;
  case 0x48:  // H
    return 1;
  case 0x56:  // V
    return 1;
  case 0x4C:  // L
    return 2;
  case 0x73:  // s
    return 4;
  case 0x43:  // C
    return 6;
  case 0x41:  // A
    return 7;
  case 0x71:  // q
    return 4;
  case 0x5A:  // Z
    return 0;
  case 0x53:  // S
    return 4;
  case 0x51:  // Q
    return 4;
  case 0x74:  // t
    return 2;
  case 0x54:  // T
    return 2;
  }
  return undefined;
};

/**
 * @param {Number} code
 * @returns {Number}
 */
const advanceIndexByCommand = function (code) {
  switch (code) {
  case 0x63:  // c
    return 11;
  case 0x6C:  // l
    return 3;
  case 0x61:  // a
    return 11;
  case 0x7A:  // z
    return 0;
  case 0x68:  // h
    return 1;
  case 0x76:  // v
    return 1;
  case 0x6D:  // m
    return 3;
  case 0x4D:  // M
    return 3;
  case 0x48:  // H
    return 1;
  case 0x56:  // V
    return 1;
  case 0x4C:  // L
    return 3;
  case 0x73:  // s
    return 7;
  case 0x43:  // C
    return 11;
  case 0x41:  // A
    return 11;
  case 0x71:  // q
    return 7;
  case 0x5A:  // Z
    return 0;
  case 0x53:  // S
    return 7;
  case 0x51:  // Q
    return 7;
  case 0x74:  // t
    return 3;
  case 0x54:  // T
    return 3;
  }
  throw new Error('Invalid command code ' + code);
};


const skipSpecialChars = function (buffer, state, end, code) {
  // if the code is lower than '-' character, assume that is a special character
  while (state.index < end && code < 0b101101) {
    state.index++;
    code = buffer[state.index];
  }
};

const scanSegment = function (d, buffer, needParams, start, end, segments) {
  let params = [d[start]];

  if (needParams) {  // not Zz (not zero parameters)
    const state = {index: start + 1},
      subSegments = [],
      isArc = needParams === 7;
    let _subsegmentStart, _lastNumIndex;

    for (;;) {
      for (let i = needParams; i > 0; i--) {
        skipSpecialChars(buffer, state, end, buffer[state.index]);

        if (i === needParams) {
          _subsegmentStart = _subsegmentStart === undefined ? start : state.index;
        }
        if (isArc && (i === 4 || i === 3)) {
          // bitwise is odd (code === 48 is 0 and code === 49 is 1):
          params.push(buffer[state.index] & 1);
          state.index++;
        } else {
          let _numberAsString = '',
            _foundOp = false,     // +-
            _foundPoint = false,  // .
            _foundExp = false,    // Ee
            code;
          while (state.index <= end) {
            code = buffer[state.index];
            if (code >= 0x30 && code <= 0x39) {  // 0..9
              _lastNumIndex = state.index;
            } else if (code === 0x2E) {  // .
              if (_foundPoint || _foundExp) {
                break;
              }
              _foundPoint = true;
            } else if (code === 0x2D || code === 0x2B) {  // + -
              if (!_foundExp && (_numberAsString.length > 0 || _foundPoint || _foundOp)) {
                break;
              }
              _foundOp = true;
            } else if (code === 0x65 || code === 0x45) {  // eE
              if (_foundExp) {
                break;
              }
              _foundExp = true;
            } else {
              state.index++;
              break;
            }
            _numberAsString += d[state.index];
            state.index++;
          }
          params.push(parseFloat(_numberAsString));
        }
      }

      subSegments.push({
        start: _subsegmentStart,
        end: _lastNumIndex + 1,
        params,
      });
      params = [d[start]];

      if (state.index > end) {
        break;
      }
    }

    if (subSegments.length >> 1) {  // bitwise 'subSegments.length > 1'
      for (let s = 0; s < subSegments.length; s++) {
        subSegments[s].chained = true;
        subSegments[s].chainStart = start;
        subSegments[s].chainEnd = _lastNumIndex + 1;
        segments.push(subSegments[s]);
      }
    } else {
      subSegments[0].chained = false;
      segments.push(subSegments[0]);
    }
  } else {  // zZ
    segments.push({
      start,
      end: end + 1,
      params,
      chained: false,
    });
  }
};

/**
 * Extract segments from SVG path data.
 * @param {String} d Path data
 * @returns {Segment[]}
 */
const svgPathParse = function (d) {
  const segments = [],
    buffer = Buffer.from(d, 'ascii'),
    pathLength = buffer.length;
  let _currStartIndex, code, _previousCode, needParams, _previousNeedParams,
    i = 0;

  while (i < pathLength) {
    code = buffer[i];
    needParams = paramCountsByCommand(code);
    if (needParams !== undefined) {
      if (_currStartIndex !== undefined) {
        scanSegment(
          d,
          buffer,
          _previousNeedParams,
          _currStartIndex,
          i - 1,
          segments
        );
      }
      _currStartIndex = i;
      i += advanceIndexByCommand(code);
      _previousCode = code;
      _previousNeedParams = needParams;
    }
    i++;
  }
  scanSegment(
    d,
    buffer,
    _previousNeedParams,
    _currStartIndex,
    pathLength - 1,
    segments
  );

  return segments;
};

module.exports = svgPathParse;
