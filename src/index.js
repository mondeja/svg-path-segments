'use strict';

const COMMANDS_PARAMS_COUNTS = {
  // lowercase commands
  0x61: 7,
  0x63: 6,
  0x68: 1,
  0x6C: 2,
  0x6D: 2,
  0x76: 1,
  0x71: 4,
  0x73: 4,
  0x74: 2,
  0x7A: 0,

  // uppercase commands
  0x41: 7,
  0x43: 6,
  0x48: 1,
  0x4C: 2,
  0x4D: 2,
  0x56: 1,
  0x51: 4,
  0x53: 4,
  0x54: 2,
  0x5A: 0,
};

const ADVANCE_INDEX_BY_PARAM_COUNTS = {
  0x41: 11,
  0x61: 11,
  0x63: 11,
  0x43: 11,
  0x68: 1,
  0x76: 1,
  0x48: 1,
  0x56: 1,
  0x6C: 3,
  0x6D: 3,
  0x74: 3,
  0x4C: 3,
  0x4D: 3,
  0x54: 3,
  0x71: 7,
  0x73: 7,
  0x51: 7,
  0x53: 7,
  0x7A: 0,
  0x5A: 0,
};

const isSpace = function (code) {
  switch (code) {
  case 0x20:    // white space
  case 0x0A:    // newline
  case 0x09:    // tabulator
  case 0x0D:    // carriage return
  case 0x0B:    // other white spaces
  case 0x0C:
  case 0xA0:
    return true;
  }
  return (
    (code >= 0x180E) &&
    (
      (code === 0x180E) ||  // other special spaces
      (code === 0x2029) ||
      ((code >= 0x2000) && (code <= 0x200A)) ||
      (code === 0x202F) ||
      (code === 0x205F) ||
      (code === 0x3000) ||
      (code === 0xFEFF)
    )
  );
};

const skipSpacesAndCommas = function (d, state, end) {
  let code = d.charCodeAt(state.index);
  while (state.index < end && (isSpace(code) || code === 0x2C)) {
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
        skipSpacesAndCommas(d, state, end);

        if (i === needParams) {
          _subsegmentStart = _subsegmentStart === undefined ? start : state.index;
        }
        if (isArc && (i === 4 || i === 3)) {
          params.push(d[state.index] === '0' ? 0 : 1);
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

    if (subSegments.length > 1) {
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
    // console.log(i, d[i])
    code = d.charCodeAt(i);
    needParams = COMMANDS_PARAMS_COUNTS[code];
    if (needParams !== undefined) {
      if (_currStartIndex !== undefined) {
        scanSegment(
          d, _previousNeedParams,
          (_previousCode < 0x5B),  // is uppercase
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
    (_previousCode < 0x5B),
    _currStartIndex,
    d.length - 1,
    segments
  );

  return segments;
};

module.exports = svgPathParse;
