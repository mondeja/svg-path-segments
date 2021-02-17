#pragma GCC optimize("O2") 

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

class SvgPathParser {
    unsigned int index = 0;
    unsigned int maxIndex = 0;
    unsigned int segmentsCounter = 0;
    napi_env env;
    
    unsigned int _segmentStart;
    unsigned int _previousFirstNonChainedSegmentIndex;
    struct Param *_firstParamInCurrentSegment;
    struct Param *_previousParamInCurrentSegment;

    const char *path;

    void skipSpaces();
    void scanSegment();
    void scanFlag();
    void scanParam();
  public:
    Napi::Array segments;
    string err = "";
    struct Segment *_firstSegment = NULL;

    void parse(napi_env _env, string path);
};

void SvgPathParser::parse(napi_env _env, const string _path) {
  segments = Napi::Array::New(_env);
  env = _env;
  
  path = _path.c_str();
  maxIndex = _path.length();
  skipSpaces();
  
  while (index < maxIndex) {
    scanSegment();
  }
};

void SvgPathParser::scanFlag() {
  struct Param *param = (struct Param*) malloc(sizeof(struct Param));
  param->value = path[index] & 1;
  _previousParamInCurrentSegment->next = param;
  _previousParamInCurrentSegment = param;
  index++;
}

void SvgPathParser::scanParam() {
  char ch = path[index];

  if (!isParamStart(ch)) {
    err = (
      "Parameter should start with '0..9', '+', '-', '.' (at pos " +
      to_string(index) + ")"
    );
    index = maxIndex;
    return;
  }
  
  unsigned int startIndex = index;
  
  if (ch == 0x2B || ch == 0x2D) {  // + -
    index++;
  }
  
  ch = path[index];
  
  
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
  param->next = NULL;
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
    Napi::Object segment = Napi::Object::New(env);
    
    // segment start and end
    segment.Set("start", index);
    segment.Set("end", index);
    
    // segment parameter
    Napi::Array params = Napi::Array::New(env);
    params.Set(uint32_t(0), path[index] == 0x7A ? "z" : "Z");
    segment.Set("params", params);
    
    segments.Set(segmentsCounter, segment);
    segmentsCounter++;
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
    Napi::Object segment = Napi::Object::New(env);
    if (_subSegmentsCounter == 0) {
      _previousFirstNonChainedSegmentIndex = segmentsCounter;
      segment.Set("start", _segmentStart);
    } else {
      segment.Set("start", _subSegmentStart);
    }
    segment.Set(
      "end",
      _lastNotSpaceIndex == 0 ? (index - 1) : (_lastNotSpaceIndex - 1)
    );
    if (_subSegmentsCounter > 0) {
      segment.Set("chainStart", _segmentStart);
    }
    
    Napi::Array params = Napi::Array::New(env);
    params.Set(uint32_t(0), cmdCodeToString(path[_segmentStart]));

    struct Param *headParam = _firstParamInCurrentSegment,
                 *nextParam;
    unsigned short _paramsCounter = 1;
    while (headParam) {
      params.Set(uint32_t(_paramsCounter), headParam->value);
      _paramsCounter++;

      nextParam = headParam->next;
      free(headParam);
      headParam = nextParam;
    }
    _firstParamInCurrentSegment = NULL;
    
    segment.Set("params", params);
    segments.Set(segmentsCounter, segment);    
    
    _subSegmentsCounter++;
    segmentsCounter++;
    
    // after ',' param is mandatory (next is a chained segment)
    if (_commaFound) {
      continue;
    }
    
    // stop on next segment
    if (!isParamStart(path[index])) {
      break;
    }
  }
  
  // Set chain endings for 
  unsigned int _nChainedSegments = segmentsCounter - (_previousFirstNonChainedSegmentIndex + 1);
  for (unsigned int i=0; i<_nChainedSegments; i++) {
    Napi::Object segment = segments.Get(
      uint32_t(_previousFirstNonChainedSegmentIndex + 1 + i)
    ).As<Napi::Object>();
    segment.Set("chainEnd", index - 1);
  }
}

Napi::Object pathParse(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  //auto start = high_resolution_clock::now(); 
  
  SvgPathParser parser;  
  parser.parse(env, info[0].As<Napi::String>());
  
  // build response
  Napi::Object response = Napi::Object::New(env);
  //   set segments
  response.Set(Napi::String::New(env, "segments"), parser.segments);

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
