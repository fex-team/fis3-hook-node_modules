var process = require('node_modules/process/browser');
var a = {
	"packages": [{
		"name": "buffer",
		"main": "index.js",
		"location": "node_modules/buffer",
		"packages": [{
			"name": "base64-js",
			"main": "b64.js",
			"location": "node_modules/buffer/node_modules/base64-js",
			"packages": []
		}, {
			"name": "ieee754",
			"main": "index.js",
			"location": "node_modules/buffer/node_modules/ieee754",
			"packages": []
		}, {
			"name": "isarray",
			"main": "index.js",
			"location": "node_modules/buffer/node_modules/isarray",
			"packages": []
		}]
	}, {
		"name": "base64-js",
		"main": "b64.js",
		"location": "node_modules/buffer/node_modules/base64-js",
		"packages": []
	}, {
		"name": "ieee754",
		"main": "index.js",
		"location": "node_modules/buffer/node_modules/ieee754",
		"packages": []
	}, {
		"name": "isarray",
		"main": "index.js",
		"location": "node_modules/buffer/node_modules/isarray",
		"packages": []
	}, {
		"name": "history",
		"main": "index.js",
		"location": "node_modules/history",
		"packages": [{
			"name": "deep-equal",
			"main": "index.js",
			"location": "node_modules/history/node_modules/deep-equal"
		}, {
			"name": "invariant",
			"main": "invariant.js",
			"location": "node_modules/history/node_modules/invariant",
			"packages": [{
				"name": "loose-envify",
				"main": "index.js",
				"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify",
				"packages": [{
					"name": "js-tokens",
					"main": "index.js",
					"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify/node_modules/js-tokens"
				}]
			}]
		}, {
			"name": "query-string",
			"main": "index.js",
			"location": "node_modules/history/node_modules/query-string",
			"packages": [{
				"name": "strict-uri-encode",
				"main": "index.js",
				"location": "node_modules/history/node_modules/query-string/node_modules/strict-uri-encode"
			}]
		}, {
			"name": "warning",
			"main": "warning.js",
			"location": "node_modules/history/node_modules/warning",
			"packages": [{
				"name": "loose-envify",
				"main": "index.js",
				"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify",
				"packages": [{
					"name": "js-tokens",
					"main": "index.js",
					"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify/node_modules/js-tokens"
				}]
			}]
		}]
	}, {
		"name": "deep-equal",
		"main": "index.js",
		"location": "node_modules/history/node_modules/deep-equal"
	}, {
		"name": "invariant",
		"main": "invariant.js",
		"location": "node_modules/history/node_modules/invariant",
		"packages": [{
			"name": "loose-envify",
			"main": "index.js",
			"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify",
			"packages": [{
				"name": "js-tokens",
				"main": "index.js",
				"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify/node_modules/js-tokens"
			}]
		}]
	}, {
		"name": "loose-envify",
		"main": "index.js",
		"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify",
		"packages": [{
			"name": "js-tokens",
			"main": "index.js",
			"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify/node_modules/js-tokens"
		}]
	}, {
		"name": "js-tokens",
		"main": "index.js",
		"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify/node_modules/js-tokens"
	}, {
		"name": "query-string",
		"main": "index.js",
		"location": "node_modules/history/node_modules/query-string",
		"packages": [{
			"name": "strict-uri-encode",
			"main": "index.js",
			"location": "node_modules/history/node_modules/query-string/node_modules/strict-uri-encode"
		}]
	}, {
		"name": "strict-uri-encode",
		"main": "index.js",
		"location": "node_modules/history/node_modules/query-string/node_modules/strict-uri-encode"
	}, {
		"name": "warning",
		"main": "warning.js",
		"location": "node_modules/history/node_modules/warning",
		"packages": [{
			"name": "loose-envify",
			"main": "index.js",
			"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify",
			"packages": [{
				"name": "js-tokens",
				"main": "index.js",
				"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify/node_modules/js-tokens"
			}]
		}]
	}, {"name": "is-buffer", "main": "index.js", "location": "node_modules/is-buffer", "packages": []}, {
		"name": "process",
		"main": "index.js",
		"location": "node_modules/process"
	}, {
		"name": "react",
		"main": "react.js",
		"location": "node_modules/react",
		"packages": [{
			"name": "envify",
			"main": "index.js",
			"location": "node_modules/react/node_modules/envify",
			"packages": [{
				"name": "through",
				"main": "index.js",
				"location": "node_modules/react/node_modules/envify/node_modules/through"
			}, {
				"name": "jstransform",
				"main": "jstransform.js",
				"location": "node_modules/react/node_modules/envify/node_modules/jstransform",
				"packages": [{
					"name": "base62",
					"main": "base62.js",
					"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/base62"
				}, {
					"name": "esprima-fb",
					"main": "esprima.js",
					"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/esprima-fb"
				}, {
					"name": "source-map",
					"main": "source-map.js",
					"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/source-map",
					"packages": [{
						"name": "amdefine",
						"main": "amdefine.js",
						"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/source-map/node_modules/amdefine"
					}]
				}]
			}]
		}, {
			"name": "fbjs",
			"main": "index.js",
			"location": "node_modules/react/node_modules/fbjs",
			"packages": [{
				"name": "core-js",
				"main": "index.js",
				"location": "node_modules/react/node_modules/fbjs/node_modules/core-js"
			}, {
				"name": "loose-envify",
				"main": "index.js",
				"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify",
				"packages": [{
					"name": "js-tokens",
					"main": "index.js",
					"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify/node_modules/js-tokens"
				}]
			}, {
				"name": "promise",
				"main": "index.js",
				"location": "node_modules/react/node_modules/fbjs/node_modules/promise",
				"packages": [{
					"name": "asap",
					"main": "asap.js",
					"location": "node_modules/react/node_modules/fbjs/node_modules/promise/node_modules/asap"
				}]
			}, {
				"name": "ua-parser-js",
				"main": "ua-parser.js",
				"location": "node_modules/react/node_modules/fbjs/node_modules/ua-parser-js"
			}, {
				"name": "whatwg-fetch",
				"main": "fetch.js",
				"location": "node_modules/react/node_modules/fbjs/node_modules/whatwg-fetch"
			}]
		}]
	}, {
		"name": "envify",
		"main": "index.js",
		"location": "node_modules/react/node_modules/envify",
		"packages": [{
			"name": "through",
			"main": "index.js",
			"location": "node_modules/react/node_modules/envify/node_modules/through"
		}, {
			"name": "jstransform",
			"main": "jstransform.js",
			"location": "node_modules/react/node_modules/envify/node_modules/jstransform",
			"packages": [{
				"name": "base62",
				"main": "base62.js",
				"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/base62"
			}, {
				"name": "esprima-fb",
				"main": "esprima.js",
				"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/esprima-fb"
			}, {
				"name": "source-map",
				"main": "source-map.js",
				"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/source-map",
				"packages": [{
					"name": "amdefine",
					"main": "amdefine.js",
					"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/source-map/node_modules/amdefine"
				}]
			}]
		}]
	}, {
		"name": "through",
		"main": "index.js",
		"location": "node_modules/react/node_modules/envify/node_modules/through"
	}, {
		"name": "jstransform",
		"main": "jstransform.js",
		"location": "node_modules/react/node_modules/envify/node_modules/jstransform",
		"packages": [{
			"name": "base62",
			"main": "base62.js",
			"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/base62"
		}, {
			"name": "esprima-fb",
			"main": "esprima.js",
			"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/esprima-fb"
		}, {
			"name": "source-map",
			"main": "source-map.js",
			"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/source-map",
			"packages": [{
				"name": "amdefine",
				"main": "amdefine.js",
				"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/source-map/node_modules/amdefine"
			}]
		}]
	}, {
		"name": "base62",
		"main": "base62.js",
		"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/base62"
	}, {
		"name": "esprima-fb",
		"main": "esprima.js",
		"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/esprima-fb"
	}, {
		"name": "source-map",
		"main": "source-map.js",
		"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/source-map",
		"packages": [{
			"name": "amdefine",
			"main": "amdefine.js",
			"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/source-map/node_modules/amdefine"
		}]
	}, {
		"name": "amdefine",
		"main": "amdefine.js",
		"location": "node_modules/react/node_modules/envify/node_modules/jstransform/node_modules/source-map/node_modules/amdefine"
	}, {
		"name": "fbjs",
		"main": "index.js",
		"location": "node_modules/react/node_modules/fbjs",
		"packages": [{
			"name": "core-js",
			"main": "index.js",
			"location": "node_modules/react/node_modules/fbjs/node_modules/core-js"
		}, {
			"name": "loose-envify",
			"main": "index.js",
			"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify",
			"packages": [{
				"name": "js-tokens",
				"main": "index.js",
				"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify/node_modules/js-tokens"
			}]
		}, {
			"name": "promise",
			"main": "index.js",
			"location": "node_modules/react/node_modules/fbjs/node_modules/promise",
			"packages": [{
				"name": "asap",
				"main": "asap.js",
				"location": "node_modules/react/node_modules/fbjs/node_modules/promise/node_modules/asap"
			}]
		}, {
			"name": "ua-parser-js",
			"main": "ua-parser.js",
			"location": "node_modules/react/node_modules/fbjs/node_modules/ua-parser-js"
		}, {
			"name": "whatwg-fetch",
			"main": "fetch.js",
			"location": "node_modules/react/node_modules/fbjs/node_modules/whatwg-fetch"
		}]
	}, {
		"name": "core-js",
		"main": "index.js",
		"location": "node_modules/react/node_modules/fbjs/node_modules/core-js"
	}, {
		"name": "promise",
		"main": "index.js",
		"location": "node_modules/react/node_modules/fbjs/node_modules/promise",
		"packages": [{
			"name": "asap",
			"main": "asap.js",
			"location": "node_modules/react/node_modules/fbjs/node_modules/promise/node_modules/asap"
		}]
	}, {
		"name": "asap",
		"main": "asap.js",
		"location": "node_modules/react/node_modules/fbjs/node_modules/promise/node_modules/asap"
	}, {
		"name": "ua-parser-js",
		"main": "ua-parser.js",
		"location": "node_modules/react/node_modules/fbjs/node_modules/ua-parser-js"
	}, {
		"name": "whatwg-fetch",
		"main": "fetch.js",
		"location": "node_modules/react/node_modules/fbjs/node_modules/whatwg-fetch"
	}, {
		"name": "react-dom",
		"main": "index.js",
		"location": "node_modules/react-dom",
		"packages": []
	}, {
		"name": "react-router",
		"main": "index.js",
		"location": "node_modules/react-router",
		"packages": [{
			"name": "history",
			"main": "index.js",
			"location": "node_modules/react-router/node_modules/history",
			"packages": [{
				"name": "deep-equal",
				"main": "index.js",
				"location": "node_modules/history/node_modules/deep-equal"
			}, {
				"name": "invariant",
				"main": "invariant.js",
				"location": "node_modules/history/node_modules/invariant",
				"packages": [{
					"name": "loose-envify",
					"main": "index.js",
					"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify",
					"packages": [{
						"name": "js-tokens",
						"main": "index.js",
						"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify/node_modules/js-tokens"
					}]
				}]
			}, {
				"name": "query-string",
				"main": "index.js",
				"location": "node_modules/history/node_modules/query-string",
				"packages": [{
					"name": "strict-uri-encode",
					"main": "index.js",
					"location": "node_modules/history/node_modules/query-string/node_modules/strict-uri-encode"
				}]
			}, {
				"name": "warning",
				"main": "warning.js",
				"location": "node_modules/history/node_modules/warning",
				"packages": [{
					"name": "loose-envify",
					"main": "index.js",
					"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify",
					"packages": [{
						"name": "js-tokens",
						"main": "index.js",
						"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify/node_modules/js-tokens"
					}]
				}]
			}]
		}, {
			"name": "invariant",
			"main": "invariant.js",
			"location": "node_modules/history/node_modules/invariant",
			"packages": [{
				"name": "loose-envify",
				"main": "index.js",
				"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify",
				"packages": [{
					"name": "js-tokens",
					"main": "index.js",
					"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify/node_modules/js-tokens"
				}]
			}]
		}, {
			"name": "warning",
			"main": "warning.js",
			"location": "node_modules/history/node_modules/warning",
			"packages": [{
				"name": "loose-envify",
				"main": "index.js",
				"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify",
				"packages": [{
					"name": "js-tokens",
					"main": "index.js",
					"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify/node_modules/js-tokens"
				}]
			}]
		}]
	}, {
		"name": "redux",
		"main": "index.js",
		"location": "node_modules/redux",
		"packages": [{
			"name": "lodash",
			"main": "lodash.js",
			"location": "node_modules/redux/node_modules/lodash"
		}, {
			"name": "lodash-es",
			"main": "lodash.js",
			"location": "node_modules/redux/node_modules/lodash-es"
		}, {
			"name": "loose-envify",
			"main": "index.js",
			"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify",
			"packages": [{
				"name": "js-tokens",
				"main": "index.js",
				"location": "node_modules/history/node_modules/invariant/node_modules/loose-envify/node_modules/js-tokens"
			}]
		}]
	}, {"name": "lodash-es", "main": "lodash.js", "location": "node_modules/redux/node_modules/lodash-es"}]
}