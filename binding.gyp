{
  "targets": [
    {
      "target_name": "svg-path-parser",
      "sources": ["src/svg-path-parser.cc"],
      'include_dirs': [
        "<!(node -p \"require('node-addon-api').include_dir\")"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions", "-fno-rtti" ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ]
    }
  ]
}
