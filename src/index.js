'use strict';

const COMMANDS_PARAMS_COUNTS = {
  0x61: 7,  // a
  0x63: 6,  // c
  0x68: 1,  // h
  0x6C: 2,  // l
  0x6D: 2,  // m
  0x76: 1,  // v
  0x71: 4,  // q
  0x73: 4,  // s
  0x74: 2,  // t
  0x7A: 0,  // z

  0x41: 7,  // A
  0x43: 6,  // C
  0x48: 1,  // H
  0x4C: 2,  // L
  0x4D: 2,  // M
  0x56: 1,  // V
  0x51: 4,  // Q
  0x53: 4,  // S
  0x54: 2,  // T
  0x5A: 0,  // Z
};

const ADVANCE_INDEX_BY_PARAM_COUNTS = {
  0x41: 11,  // A
  0x61: 11,  // a
  0x43: 11,  // C
  0x63: 11,  // c
  0x48: 1,   // H
  0x68: 1,   // h
  0x56: 1,   // V
  0x76: 1,   // v
  0x4C: 3,   // L
  0x6C: 3,   // L
  0x4D: 3,   // M
  0x6D: 3,   // m
  0x54: 3,   // T
  0x74: 3,   // t
  0x51: 7,   // Q
  0x71: 7,   // q
  0x53: 7,   // S
  0x73: 7,   // s
  0x5A: 0,   // Z
  0x7A: 0,   // z
};

const isSpaceOrComma = function (code) {
  switch (code) {
  case 0x20:    // white space
  case 0x2C:    // comma
  case 0x0A:    // newline
  case 0x09:    // tabulator
  case 0x0D:    // carriage return
  case 0x0B:    // other white spaces
  case 0x0C:
  case 0xA0:
    return true;
  }
  return (
    (code > 0x180D) &&
    (
      (code === 0x180E) ||  // other special spaces
      (code === 0x2029) ||
      (code > 0x1FFF && code < 0x200B) ||
      (code === 0x202F) ||
      (code === 0x205F) ||
      (code === 0x3000) ||
      (code === 0xFEFF)
    )
  );
};

const skipSpacesAndCommas = function (d, state, end, code) {
  while (state.index < end && isSpaceOrComma(code)) {
    state.index++;
    code = d.charCodeAt(state.index);
  }
};

const scanSegment = function (d, needParams, abs, start, end, segments) {
  let params = [d[start]];

  if (needParams) {  // not Zz (not zero parameters)
    const state = {index: start + 1},
      subSegments = [],
      isArc = !(needParams ^ 7);  // bitwise `needParams === 7`
    let _subsegmentStart, _lastNumIndex;

    for (;;) {
      for (let i = needParams; i > 0; i--) {
        skipSpacesAndCommas(d, state, end, d.charCodeAt(state.index));

        if (i === needParams) {
          _subsegmentStart = _subsegmentStart === undefined ? start : state.index;
        }
        if (isArc && (i === 4 || i === 3)) {
          // bitwise is odd (code === 48 is 0 and code === 49 is 1):
          params.push(d.charCodeAt(state.index) & 1);
          state.index++;
        } else {
          let _numberAsString = '',
            _foundOp = false,     // +-
            _foundPoint = false,  // .
            _foundExp = false,    // Ee
            code;
          while (state.index <= end) {
            code = d.charCodeAt(state.index);
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
        abs,
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
      abs,
      chained: false,
    });
  }
};

const svgPathParse = function (d) {
  const segments = [];

  let _currStartIndex, code, _previousCode, needParams, _previousNeedParams;
  for (let i = 0; i < d.length; i++) {
    code = d.charCodeAt(i);
    needParams = COMMANDS_PARAMS_COUNTS[code];
    if (needParams !== undefined) {
      if (_currStartIndex !== undefined) {
        scanSegment(
          d, _previousNeedParams,
          _previousCode < 0x5B,  // is uppercase
          _currStartIndex,
          i - 1,
          segments
        );
      }
      _currStartIndex = i;
      i += ADVANCE_INDEX_BY_PARAM_COUNTS[code];
      _previousCode = code;
      _previousNeedParams = needParams;
    }
  }
  scanSegment(
    d,
    _previousNeedParams,
    _previousCode < 0x5B,
    _currStartIndex,
    d.length - 1,
    segments
  );

  return segments;
};

module.exports = svgPathParse;
