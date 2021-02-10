#pragma GCC optimize("O1") 

#include <iostream>
#include <typeinfo>
#include <chrono> 

// -----------------

#include <string>

#include <napi.h>

using namespace std;
using namespace std::chrono; 

const char* cmdCodeToString(const char ch) {
  switch (ch) {
    case 0x68:
      return "h";
    case 0x48:
      return "H";
    case 0x76:
      return "v";
    case 0x56:
      return "V";
    case 0x6D:
      return "m";
    case 0x4D:
      return "M";
    case 0x6C:
      return "l";
    case 0x4C:
      return "L";
    case 0x7A:
      return "z";
    case 0x5A:
      return "Z";
    case 0x63:
      return "c";
    case 0x43:
      return "C";
    case 0x61:
      return "a";
    case 0x74:
      return "t";
    case 0x54:
      return "T";
    case 0x73:
      return "s";
    case 0x71:
      return "q";
    case 0x53:
      return "S";
    case 0x51:
      return "Q";
    default:
      return "";
  }
}

char commandToNumberOfParams (const unsigned short ch) {
  switch (ch) {
    case 0x7A:  // z
    case 0x5A:  // Z
      return 0;
    case 0x68:  // h
    case 0x48:  // H
    case 0x76:  // v
    case 0x56:  // V
      return 1;
    case 0x6D:  // m
    case 0x4D:  // M
    case 0x6C:  // l
    case 0x4C:  // L
      return 2;
    case 0x63:  // c
    case 0x43:  // C
      return 6;
    case 0x61:  // a
    case 0x41:  // A
      return 7;
    case 0x74:  // t
    case 0x54:  // T
      return 2;
    case 0x73:  // s
    case 0x71:  // q
    case 0x53:  // S
    case 0x51:  // Q
      return 4;
  }
  return 32;
}

/**
 * Indicates if a character is a space given their code.
 *
 * @param {int} Code of the character.
 **/
bool isSpace(const unsigned int ch) {
  switch(ch) {
    case 0x20:    // white space
    case 0x0A:    // newline
    case 0x09:    // tabulator
    case 0x0D:    // carriage return
    case 0x0B:    // other white spaces
    case 0x0C:
    case 0xA0:
      return 1;
    default:
      return (
        (ch >= 0x1680) &&
        (
          (ch == 0x2028) ||  // other line terminators and special spaces
          (ch == 0x2029) ||
          (ch == 0x1680) ||
          (ch == 0x180E) ||
          ((ch >= 0x2000) && (ch <= 0x200A)) ||
          (ch == 0x202F) ||
          (ch == 0x205F) ||
          (ch == 0x3000) ||
          (ch == 0xFEFF)
        )
      );
  }
}

bool isDigit(const unsigned short ch) {
  return (ch > 47 && ch < 58);  // 0..9
}

bool isParamStart(const unsigned short ch) {
  return (ch > 47 && ch < 58) ||  // 0..9
         (ch == 0x2E) ||          // .
         (ch == 0x2D) ||          // -
         (ch == 0x2B);            // +
}

/**
 * Parameters structure.
 **/
struct Param {
  double value;
  struct Param *next;
};

/**
 * Segments structure.
 **/
struct Segment {
  struct Param *_firstParam;  // pointer to first parameter
  unsigned int _cmdIndex;     // index of command inside path
  unsigned int start;
  unsigned int end;
  bool chained;
  unsigned int chainStart;
  unsigned int chainEnd;

  struct Segment *next;
};

class SvgPathParser {
    unsigned int index = 0;
    unsigned int maxIndex = 0;
    unsigned int _segmentStart;
    struct Segment *_previousSegment;
    struct Segment *_previousFirstNonChainedSegment;
    struct Param *_firstParamInCurrentSegment;
    struct Param *_previousParamInCurrentSegment;

    const char *path;
    
    void _raiseError(string err);
    void skipSpaces();
    void scanSegment();
    void scanFlag();
    void scanParam();
  public:
    Napi::Array segments;
    string err = "";
    struct Segment *_firstSegment = NULL;

    void parse(string path);
    void clean();
};

/**
 * Clean parser state, all pointers to segments and their parameters.
 **/
void SvgPathParser::clean() {
  struct Segment *headSegment = _firstSegment,
                 *nextSegment;
  struct Param *headParam, *nextParam;
  headSegment = _firstSegment;
  while (headSegment) {
    headParam = headSegment->_firstParam;
    while (headParam) {
      nextParam = headParam->next;
      free(headParam);
      headParam = nextParam;
    }
    
    nextSegment = headSegment->next;
    free(headSegment);
    headSegment = nextSegment;
  }
}

void SvgPathParser::parse(Napi::Env env, const string _path) {
  segments = Napi::Array::New(env);
  
  path = _path.c_str();
  maxIndex = _path.length();
  skipSpaces();
  
  while (index < maxIndex) {
    scanSegment();
  }
};

void SvgPathParser::_raiseError(string _err) {
  err = _err;
  // increment index, so the parser stops scanning segments
  index = maxIndex;
}

void SvgPathParser::scanFlag() {
  struct Param *param = (struct Param*) malloc(sizeof(struct Param));
  param->value = path[index] & 1;
  _previousParamInCurrentSegment->next = param;
  _previousParamInCurrentSegment = param;
  index++;
}

void SvgPathParser::scanParam() {
  
  /*
  if (index >= maxIndex) {
    return _raiseError(
      "Missed parameter (at pos " + to_string(index) + ")"
    );
  }
  */

  char ch = path[index];
  
  
  if (!isParamStart(ch)) {
    return _raiseError(
      "Parameter should start with '0..9', '+', '-', '.' (at pos " +
      to_string(index) + ")"
    );
  }
  
  unsigned int startIndex = index;
  
  if (ch == 0x2B || ch == 0x2D) {  // + -
    index++;
  }
  
  ch = path[index];
  
  /*
  if ((ch == 0x30) && (index < maxIndex - 1) && isDigit(int(path[index + 1])) ) {  // 00..9
    return _raiseError(
      "Numbers started with '0' such as '09' are illegal (at pos "
      + to_string(index) + ")"
    );
  }
  */
  
  bool _firstDotFound = false;
  
  while (isParamStart(ch) || ch == 0x65 || ch == 0x45) { // e E
    if (ch == 0x2E) { // .
      if (!_firstDotFound) {
        _firstDotFound = true;
      } else {
        break;
      }
    } else if (ch == 0x2D || ch == 0x2B) {  // - +
      break;
    }
    index++;
    ch = path[index];
  }
 
  // save parameter
  struct Param *param = (struct Param*) malloc(sizeof(struct Param));
  
  // copy substring
  short int paramLength = index - startIndex;
  char paramString[paramLength];
  for (unsigned short i=0; i<paramLength; i++) {
    paramString[i] = path[startIndex + i];
  }

  param->value = stod(paramString);
  if (_firstParamInCurrentSegment == NULL) {
    _firstParamInCurrentSegment = param;
    _previousParamInCurrentSegment = param;
  } else {
    _previousParamInCurrentSegment->next = param;
    _previousParamInCurrentSegment = param;
  }
}

void SvgPathParser::skipSpaces() {
  while (isSpace(path[index])) {
    index++;
  }
}

void SvgPathParser::scanSegment() {
  unsigned short _paramsNeeded = commandToNumberOfParams(path[index]);
  
  if (_paramsNeeded == 0) {  // Zz
    // save the segment Z
    struct Segment *segment = (struct Segment*) malloc(sizeof(struct Segment));
    segment->_cmdIndex = index;
    segment->start = index;
    segment->end = index;
    segment->chained = false;
    segment->next = NULL;
    segment->_firstParam = NULL;
    if (_firstSegment == NULL) {
      _firstSegment = segment;
    } else {
      _previousSegment->next = segment;
    }
    _previousSegment = segment;
    index++;
    return;
  }
  
  // initialize parameters pointers
  _firstParamInCurrentSegment = NULL;
  _previousParamInCurrentSegment = NULL;
  
  _segmentStart = index;
  index++;

  skipSpaces();

  bool _commaFound;
  unsigned int _subSegmentsCounter = 0,
               _subSegmentStart,
               _lastNotSpaceIndex = 0;
  
  while (1) {
    _subSegmentStart = index;

    for (unsigned short i = _paramsNeeded; i > 0; i--) {
      // if is arc, we must handle flags
      if (_paramsNeeded == 7 && (i == 3 || i == 4)) {
        scanFlag();
      } else {
        scanParam();
      }
      
      if (err != "") {
        return;
      }
      
      _lastNotSpaceIndex = index;
      
      skipSpaces();
      _commaFound = false;
      
      if (path[index] == 0x2C) {  // ,
        index++;
        skipSpaces();
        _commaFound = true;
      }
    }
    
    // after parse segment parameters, save the segment    
    struct Segment *segment = (struct Segment*) malloc(sizeof(struct Segment));
    segment->_cmdIndex = _segmentStart;
    if (_subSegmentsCounter == 0) {
      segment->start = _segmentStart;
      _previousFirstNonChainedSegment = segment;
    } else {
      segment->start = _subSegmentStart;
    }
    segment->end = _lastNotSpaceIndex == 0 ? (index - 1) : (_lastNotSpaceIndex - 1);
    segment->next = NULL;
    segment->_firstParam = _firstParamInCurrentSegment;
    if (_firstSegment == NULL) {
      _firstSegment = segment;
    } else {
      _previousSegment->next = segment;
    }
    _previousSegment = segment;
    
    _firstParamInCurrentSegment = NULL;
    if (_previousParamInCurrentSegment) {
      _previousParamInCurrentSegment->next = NULL;
      _previousParamInCurrentSegment = NULL;
    }
    
    _subSegmentsCounter++;
    
    if (_subSegmentsCounter > 1) {
      _previousSegment->chained = true;
      _previousSegment->chainStart = _segmentStart;
    } else {
      _previousSegment->chained = false;
    }
    
    // after ',' param is mandatory (next is a chained segment)
    if (_commaFound) {
      continue;
    }
    
    // stop on next segment
    if (!isParamStart(path[index])) {
      break;
    }
    
    /*
    if (index == maxIndex) {
      break;
    }
    */
  }
  
  // set chainEnd for all chained segments
  if (_previousSegment->chained) {
    unsigned int chainEnd = index - 1;
    struct Segment *headSegment = _previousFirstNonChainedSegment->next;
    while (headSegment) {
      headSegment->chainEnd = chainEnd;
      headSegment = headSegment->next;
    }
  }
}

Napi::Object pathParse(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  //auto start = high_resolution_clock::now(); 
  
  SvgPathParser parser;
  //cout << typeid(info[0].ToString()).name() << endl;
  
  string path = info[0].As<Napi::String>();

  parser.parse(path);
  //auto conversion_start = high_resolution_clock::now(); 
  
  // convert segments from C++ to JS
  /*
  Napi::Array segments = Napi::Array::New(env);
  struct Segment *headSegment = parser._firstSegment;
  unsigned int _segmentsCounter = 0;
  while (headSegment) {
    Napi::Object segment = Napi::Object::New(env);
    
    // segment start and end
    segment.Set(Napi::String::New(env, "start"), headSegment->start);
    segment.Set(Napi::String::New(env, "end"), headSegment->end);
    
    // is a chained segment?
    //segment.Set(Napi::String::New(env, "chained"), headSegment->chained);
    if (headSegment->chained) {
      // chain start and end
      segment.Set(Napi::String::New(env, "chainStart"), headSegment->chainStart);
      segment.Set(Napi::String::New(env, "chainEnd"), headSegment->chainEnd);
    }

    // add parameters
    Napi::Array params = Napi::Array::New(env);
    params.Set(uint32_t(0), cmdCodeToString(path[headSegment->_cmdIndex]));
    struct Param *headParam = headSegment->_firstParam;
    unsigned int _paramsCounter = 1;
    while (headParam) {
      params.Set(uint32_t(_paramsCounter), headParam->value);
      headParam = headParam->next;
      _paramsCounter++;
    }
    
    // free iteration pointer
    free(headParam);

    segment.Set(Napi::String::New(env, "params"), params);

    // add segment to segments array
    segments.Set(uint32_t(_segmentsCounter), segment);

    headSegment = headSegment->next;
    _segmentsCounter++;
  }
  
  // free iteration pointer
  free(headSegment);
  */

  // free parser state
  parser.clean();
  
  // build response
  Napi::Object response = Napi::Object::New(env);
  //   set segments
  //response.Set(Napi::String::New(env, "segments"), segments);

  //   set error
  Napi::String errString = Napi::String::New(env, "err");
  if (parser.err == "") {
    response.Set(errString, env.Null());
  } else {
    response.Set(errString, parser.err);
  }
  
  //auto end = high_resolution_clock::now();
  //auto conversion_duration = duration_cast<microseconds>(end - conversion_start); 
  //auto total_duration = duration_cast<microseconds>(end - start); 
  //cout << "Conversion to JS -> " << conversion_duration.count() << "ms" << endl;
  //cout << "Total -> " << total_duration.count() << "ms" << endl;
  return response;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "pathParse"),
              Napi::Function::New(env, pathParse));
  return exports;
}

NODE_API_MODULE(svgPathParser, Init)
