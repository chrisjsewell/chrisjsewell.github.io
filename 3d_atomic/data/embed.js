/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "https://unpkg.com/@jupyter-widgets/htmlmanager@0.5.2/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	// Copyright (c) Jupyter Development Team.
	// Distributed under the terms of the Modified BSD License.
	Object.defineProperty(exports, "__esModule", { value: true });
	// ES6 Promise polyfill
	__webpack_require__(1).polyfill();
	__webpack_require__(4);
	__webpack_require__(15);
	__webpack_require__(17);
	var scriptPromise = function (pkg) {
	    return new Promise(function (resolve, reject) {
	        // If requirejs is not on the page on page load, load it from cdn.
	        var scriptjs = __webpack_require__(19);
	        scriptjs(pkg, resolve, reject);
	    });
	};
	// Element.prototype.matches polyfill
	if (Element && !Element.prototype.matches) {
	    var proto = Element.prototype;
	    proto.matches = proto.matchesSelector ||
	        proto.mozMatchesSelector || proto.msMatchesSelector ||
	        proto.oMatchesSelector || proto.webkitMatchesSelector;
	}
	// Load json schema validator
	var Ajv = __webpack_require__(20);
	var widget_state_schema = __webpack_require__(74).v2.state;
	var widget_view_schema = __webpack_require__(74).v2.view;
	// BEGIN: Ajv config for json-schema draft 4, from https://github.com/epoberezkin/ajv/releases/tag/5.0.0
	// This can be deleted when the schema is moved to draft 6
	var ajv = new Ajv({
	    meta: false,
	    extendRefs: true,
	    unknownFormats: 'ignore',
	});
	var metaSchema = __webpack_require__(79);
	ajv.addMetaSchema(metaSchema);
	ajv._opts.defaultMeta = metaSchema.id;
	// optional, using unversioned URI is out of spec, see https://github.com/json-schema-org/json-schema-spec/issues/216
	ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema';
	// Optionally you can also disable keywords defined in draft-06
	ajv.removeKeyword('propertyNames');
	ajv.removeKeyword('contains');
	ajv.removeKeyword('const');
	// END: Ajv config for json-schema draft 4, from https://github.com/epoberezkin/ajv/releases/tag/5.0.0
	var model_validate = ajv.compile(widget_state_schema);
	var view_validate = ajv.compile(widget_view_schema);
	exports.loadRequire = new Promise(function (resolve, reject) {
	    if (window.requirejs) {
	        resolve();
	    }
	    else {
	        // If requirejs is not on the page on page load, load it from cdn.
	        resolve(scriptPromise('https://unpkg.com/requirejs/require.js'));
	    }
	}).then(function () {
	    // Load the base, controls, and html manager amd modules
	    var toLoad = ['base.js', 'controls.js', 'index.js'];
	    return scriptPromise(toLoad.map(function (f) { return "https://unpkg.com/@jupyter-widgets/html-manager/dist/" + f; }));
	});
	// `LoadInlineWidget` is the main function called on load of the web page. All
	// it does is ensure requirejs is on the page and call `renderInlineWidgets`
	function loadInlineWidgets(event) {
	    exports.loadRequire.then(function () {
	        renderInlineWidgets(event);
	    });
	}
	// `renderInlineWidget` will call `renderManager(element, tag)` on each <script>
	// tag of mime type
	//     "application/vnd.jupyter.widget-state+json"
	// contained in `event.element`.
	function renderInlineWidgets(event) {
	    var element = event.target || document;
	    var tags = element.querySelectorAll('script[type="application/vnd.jupyter.widget-state+json"]');
	    for (var i = 0; i != tags.length; ++i) {
	        renderManager(element, tags[i]);
	    }
	}
	exports.renderInlineWidgets = renderInlineWidgets;
	// Function `renderManager(element, tag)` creates a widget embed manager for the
	// specified <script> tag (which must have mime type)
	//     "application/vnd.jupyter.widget-state+json".
	// Then it performs a look up of all script tags under the specified DOM
	// element with the mime type
	//     "application/vnd.jupyter.widget-view+json".
	// For each one of these <script> tags, if the contained json specifies a model id
	// known to the aforementioned manager, it is replaced with a view of the model.
	//
	// Besides, if the view script tag has an <img> sibling DOM node with class `jupyter-widget`,
	// the <img> tag is deleted.
	function renderManager(element, tag) {
	    window.require(['@jupyter-widgets/html-manager'], function (htmlmanager) {
	        var widgetStateObject = JSON.parse(tag.innerHTML);
	        var valid = model_validate(widgetStateObject);
	        if (!valid) {
	            console.log(model_validate.errors);
	        }
	        var manager = new htmlmanager.HTMLManager();
	        manager.set_state(widgetStateObject).then(function (models) {
	            var tags = element.querySelectorAll('script[type="application/vnd.jupyter.widget-view+json"]');
	            var _loop_1 = function (i) {
	                // TODO: validate view schema
	                var viewtag = tags[i];
	                var widgetViewObject = JSON.parse(viewtag.innerHTML);
	                var valid_1 = view_validate(widgetViewObject);
	                if (!valid_1) {
	                    console.error('View state has errors.', view_validate.errors);
	                }
	                var model_id = widgetViewObject.model_id;
	                // should use .find, but IE doesn't support .find
	                var model = models.filter(function (item) {
	                    return item.model_id == model_id;
	                })[0];
	                if (model !== undefined) {
	                    if (viewtag.previousElementSibling &&
	                        viewtag.previousElementSibling.matches('img.jupyter-widget')) {
	                        viewtag.parentElement.removeChild(viewtag.previousElementSibling);
	                    }
	                    var widgetTag = document.createElement('div');
	                    widgetTag.className = 'widget-subarea';
	                    viewtag.parentElement.insertBefore(widgetTag, viewtag);
	                    manager.display_model(undefined, model, { el: widgetTag });
	                }
	            };
	            for (var i = 0; i != tags.length; ++i) {
	                _loop_1(i);
	            }
	        });
	    });
	}
	// Prevent the embedder to be defined twice.
	if (!window._jupyter_widget_embedder) {
	    window._jupyter_widget_embedder = true;
	    window.addEventListener('load', loadInlineWidgets);
	}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var require;/* WEBPACK VAR INJECTION */(function(process, global) {/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
	 * @version   4.1.1
	 */
	
	(function (global, factory) {
		 true ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
		(global.ES6Promise = factory());
	}(this, (function () { 'use strict';
	
	function objectOrFunction(x) {
	  var type = typeof x;
	  return x !== null && (type === 'object' || type === 'function');
	}
	
	function isFunction(x) {
	  return typeof x === 'function';
	}
	
	var _isArray = undefined;
	if (Array.isArray) {
	  _isArray = Array.isArray;
	} else {
	  _isArray = function (x) {
	    return Object.prototype.toString.call(x) === '[object Array]';
	  };
	}
	
	var isArray = _isArray;
	
	var len = 0;
	var vertxNext = undefined;
	var customSchedulerFn = undefined;
	
	var asap = function asap(callback, arg) {
	  queue[len] = callback;
	  queue[len + 1] = arg;
	  len += 2;
	  if (len === 2) {
	    // If len is 2, that means that we need to schedule an async flush.
	    // If additional callbacks are queued before the queue is flushed, they
	    // will be processed by this flush that we are scheduling.
	    if (customSchedulerFn) {
	      customSchedulerFn(flush);
	    } else {
	      scheduleFlush();
	    }
	  }
	};
	
	function setScheduler(scheduleFn) {
	  customSchedulerFn = scheduleFn;
	}
	
	function setAsap(asapFn) {
	  asap = asapFn;
	}
	
	var browserWindow = typeof window !== 'undefined' ? window : undefined;
	var browserGlobal = browserWindow || {};
	var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
	var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';
	
	// test for web worker but not in IE10
	var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
	
	// node
	function useNextTick() {
	  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	  // see https://github.com/cujojs/when/issues/410 for details
	  return function () {
	    return process.nextTick(flush);
	  };
	}
	
	// vertx
	function useVertxTimer() {
	  if (typeof vertxNext !== 'undefined') {
	    return function () {
	      vertxNext(flush);
	    };
	  }
	
	  return useSetTimeout();
	}
	
	function useMutationObserver() {
	  var iterations = 0;
	  var observer = new BrowserMutationObserver(flush);
	  var node = document.createTextNode('');
	  observer.observe(node, { characterData: true });
	
	  return function () {
	    node.data = iterations = ++iterations % 2;
	  };
	}
	
	// web worker
	function useMessageChannel() {
	  var channel = new MessageChannel();
	  channel.port1.onmessage = flush;
	  return function () {
	    return channel.port2.postMessage(0);
	  };
	}
	
	function useSetTimeout() {
	  // Store setTimeout reference so es6-promise will be unaffected by
	  // other code modifying setTimeout (like sinon.useFakeTimers())
	  var globalSetTimeout = setTimeout;
	  return function () {
	    return globalSetTimeout(flush, 1);
	  };
	}
	
	var queue = new Array(1000);
	function flush() {
	  for (var i = 0; i < len; i += 2) {
	    var callback = queue[i];
	    var arg = queue[i + 1];
	
	    callback(arg);
	
	    queue[i] = undefined;
	    queue[i + 1] = undefined;
	  }
	
	  len = 0;
	}
	
	function attemptVertx() {
	  try {
	    var r = require;
	    var vertx = __webpack_require__(3);
	    vertxNext = vertx.runOnLoop || vertx.runOnContext;
	    return useVertxTimer();
	  } catch (e) {
	    return useSetTimeout();
	  }
	}
	
	var scheduleFlush = undefined;
	// Decide what async method to use to triggering processing of queued callbacks:
	if (isNode) {
	  scheduleFlush = useNextTick();
	} else if (BrowserMutationObserver) {
	  scheduleFlush = useMutationObserver();
	} else if (isWorker) {
	  scheduleFlush = useMessageChannel();
	} else if (browserWindow === undefined && "function" === 'function') {
	  scheduleFlush = attemptVertx();
	} else {
	  scheduleFlush = useSetTimeout();
	}
	
	function then(onFulfillment, onRejection) {
	  var _arguments = arguments;
	
	  var parent = this;
	
	  var child = new this.constructor(noop);
	
	  if (child[PROMISE_ID] === undefined) {
	    makePromise(child);
	  }
	
	  var _state = parent._state;
	
	  if (_state) {
	    (function () {
	      var callback = _arguments[_state - 1];
	      asap(function () {
	        return invokeCallback(_state, child, callback, parent._result);
	      });
	    })();
	  } else {
	    subscribe(parent, child, onFulfillment, onRejection);
	  }
	
	  return child;
	}
	
	/**
	  `Promise.resolve` returns a promise that will become resolved with the
	  passed `value`. It is shorthand for the following:
	
	  ```javascript
	  let promise = new Promise(function(resolve, reject){
	    resolve(1);
	  });
	
	  promise.then(function(value){
	    // value === 1
	  });
	  ```
	
	  Instead of writing the above, your code now simply becomes the following:
	
	  ```javascript
	  let promise = Promise.resolve(1);
	
	  promise.then(function(value){
	    // value === 1
	  });
	  ```
	
	  @method resolve
	  @static
	  @param {Any} value value that the returned promise will be resolved with
	  Useful for tooling.
	  @return {Promise} a promise that will become fulfilled with the given
	  `value`
	*/
	function resolve$1(object) {
	  /*jshint validthis:true */
	  var Constructor = this;
	
	  if (object && typeof object === 'object' && object.constructor === Constructor) {
	    return object;
	  }
	
	  var promise = new Constructor(noop);
	  resolve(promise, object);
	  return promise;
	}
	
	var PROMISE_ID = Math.random().toString(36).substring(16);
	
	function noop() {}
	
	var PENDING = void 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	
	var GET_THEN_ERROR = new ErrorObject();
	
	function selfFulfillment() {
	  return new TypeError("You cannot resolve a promise with itself");
	}
	
	function cannotReturnOwn() {
	  return new TypeError('A promises callback cannot return that same promise.');
	}
	
	function getThen(promise) {
	  try {
	    return promise.then;
	  } catch (error) {
	    GET_THEN_ERROR.error = error;
	    return GET_THEN_ERROR;
	  }
	}
	
	function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
	  try {
	    then$$1.call(value, fulfillmentHandler, rejectionHandler);
	  } catch (e) {
	    return e;
	  }
	}
	
	function handleForeignThenable(promise, thenable, then$$1) {
	  asap(function (promise) {
	    var sealed = false;
	    var error = tryThen(then$$1, thenable, function (value) {
	      if (sealed) {
	        return;
	      }
	      sealed = true;
	      if (thenable !== value) {
	        resolve(promise, value);
	      } else {
	        fulfill(promise, value);
	      }
	    }, function (reason) {
	      if (sealed) {
	        return;
	      }
	      sealed = true;
	
	      reject(promise, reason);
	    }, 'Settle: ' + (promise._label || ' unknown promise'));
	
	    if (!sealed && error) {
	      sealed = true;
	      reject(promise, error);
	    }
	  }, promise);
	}
	
	function handleOwnThenable(promise, thenable) {
	  if (thenable._state === FULFILLED) {
	    fulfill(promise, thenable._result);
	  } else if (thenable._state === REJECTED) {
	    reject(promise, thenable._result);
	  } else {
	    subscribe(thenable, undefined, function (value) {
	      return resolve(promise, value);
	    }, function (reason) {
	      return reject(promise, reason);
	    });
	  }
	}
	
	function handleMaybeThenable(promise, maybeThenable, then$$1) {
	  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
	    handleOwnThenable(promise, maybeThenable);
	  } else {
	    if (then$$1 === GET_THEN_ERROR) {
	      reject(promise, GET_THEN_ERROR.error);
	      GET_THEN_ERROR.error = null;
	    } else if (then$$1 === undefined) {
	      fulfill(promise, maybeThenable);
	    } else if (isFunction(then$$1)) {
	      handleForeignThenable(promise, maybeThenable, then$$1);
	    } else {
	      fulfill(promise, maybeThenable);
	    }
	  }
	}
	
	function resolve(promise, value) {
	  if (promise === value) {
	    reject(promise, selfFulfillment());
	  } else if (objectOrFunction(value)) {
	    handleMaybeThenable(promise, value, getThen(value));
	  } else {
	    fulfill(promise, value);
	  }
	}
	
	function publishRejection(promise) {
	  if (promise._onerror) {
	    promise._onerror(promise._result);
	  }
	
	  publish(promise);
	}
	
	function fulfill(promise, value) {
	  if (promise._state !== PENDING) {
	    return;
	  }
	
	  promise._result = value;
	  promise._state = FULFILLED;
	
	  if (promise._subscribers.length !== 0) {
	    asap(publish, promise);
	  }
	}
	
	function reject(promise, reason) {
	  if (promise._state !== PENDING) {
	    return;
	  }
	  promise._state = REJECTED;
	  promise._result = reason;
	
	  asap(publishRejection, promise);
	}
	
	function subscribe(parent, child, onFulfillment, onRejection) {
	  var _subscribers = parent._subscribers;
	  var length = _subscribers.length;
	
	  parent._onerror = null;
	
	  _subscribers[length] = child;
	  _subscribers[length + FULFILLED] = onFulfillment;
	  _subscribers[length + REJECTED] = onRejection;
	
	  if (length === 0 && parent._state) {
	    asap(publish, parent);
	  }
	}
	
	function publish(promise) {
	  var subscribers = promise._subscribers;
	  var settled = promise._state;
	
	  if (subscribers.length === 0) {
	    return;
	  }
	
	  var child = undefined,
	      callback = undefined,
	      detail = promise._result;
	
	  for (var i = 0; i < subscribers.length; i += 3) {
	    child = subscribers[i];
	    callback = subscribers[i + settled];
	
	    if (child) {
	      invokeCallback(settled, child, callback, detail);
	    } else {
	      callback(detail);
	    }
	  }
	
	  promise._subscribers.length = 0;
	}
	
	function ErrorObject() {
	  this.error = null;
	}
	
	var TRY_CATCH_ERROR = new ErrorObject();
	
	function tryCatch(callback, detail) {
	  try {
	    return callback(detail);
	  } catch (e) {
	    TRY_CATCH_ERROR.error = e;
	    return TRY_CATCH_ERROR;
	  }
	}
	
	function invokeCallback(settled, promise, callback, detail) {
	  var hasCallback = isFunction(callback),
	      value = undefined,
	      error = undefined,
	      succeeded = undefined,
	      failed = undefined;
	
	  if (hasCallback) {
	    value = tryCatch(callback, detail);
	
	    if (value === TRY_CATCH_ERROR) {
	      failed = true;
	      error = value.error;
	      value.error = null;
	    } else {
	      succeeded = true;
	    }
	
	    if (promise === value) {
	      reject(promise, cannotReturnOwn());
	      return;
	    }
	  } else {
	    value = detail;
	    succeeded = true;
	  }
	
	  if (promise._state !== PENDING) {
	    // noop
	  } else if (hasCallback && succeeded) {
	      resolve(promise, value);
	    } else if (failed) {
	      reject(promise, error);
	    } else if (settled === FULFILLED) {
	      fulfill(promise, value);
	    } else if (settled === REJECTED) {
	      reject(promise, value);
	    }
	}
	
	function initializePromise(promise, resolver) {
	  try {
	    resolver(function resolvePromise(value) {
	      resolve(promise, value);
	    }, function rejectPromise(reason) {
	      reject(promise, reason);
	    });
	  } catch (e) {
	    reject(promise, e);
	  }
	}
	
	var id = 0;
	function nextId() {
	  return id++;
	}
	
	function makePromise(promise) {
	  promise[PROMISE_ID] = id++;
	  promise._state = undefined;
	  promise._result = undefined;
	  promise._subscribers = [];
	}
	
	function Enumerator$1(Constructor, input) {
	  this._instanceConstructor = Constructor;
	  this.promise = new Constructor(noop);
	
	  if (!this.promise[PROMISE_ID]) {
	    makePromise(this.promise);
	  }
	
	  if (isArray(input)) {
	    this.length = input.length;
	    this._remaining = input.length;
	
	    this._result = new Array(this.length);
	
	    if (this.length === 0) {
	      fulfill(this.promise, this._result);
	    } else {
	      this.length = this.length || 0;
	      this._enumerate(input);
	      if (this._remaining === 0) {
	        fulfill(this.promise, this._result);
	      }
	    }
	  } else {
	    reject(this.promise, validationError());
	  }
	}
	
	function validationError() {
	  return new Error('Array Methods must be provided an Array');
	}
	
	Enumerator$1.prototype._enumerate = function (input) {
	  for (var i = 0; this._state === PENDING && i < input.length; i++) {
	    this._eachEntry(input[i], i);
	  }
	};
	
	Enumerator$1.prototype._eachEntry = function (entry, i) {
	  var c = this._instanceConstructor;
	  var resolve$$1 = c.resolve;
	
	  if (resolve$$1 === resolve$1) {
	    var _then = getThen(entry);
	
	    if (_then === then && entry._state !== PENDING) {
	      this._settledAt(entry._state, i, entry._result);
	    } else if (typeof _then !== 'function') {
	      this._remaining--;
	      this._result[i] = entry;
	    } else if (c === Promise$2) {
	      var promise = new c(noop);
	      handleMaybeThenable(promise, entry, _then);
	      this._willSettleAt(promise, i);
	    } else {
	      this._willSettleAt(new c(function (resolve$$1) {
	        return resolve$$1(entry);
	      }), i);
	    }
	  } else {
	    this._willSettleAt(resolve$$1(entry), i);
	  }
	};
	
	Enumerator$1.prototype._settledAt = function (state, i, value) {
	  var promise = this.promise;
	
	  if (promise._state === PENDING) {
	    this._remaining--;
	
	    if (state === REJECTED) {
	      reject(promise, value);
	    } else {
	      this._result[i] = value;
	    }
	  }
	
	  if (this._remaining === 0) {
	    fulfill(promise, this._result);
	  }
	};
	
	Enumerator$1.prototype._willSettleAt = function (promise, i) {
	  var enumerator = this;
	
	  subscribe(promise, undefined, function (value) {
	    return enumerator._settledAt(FULFILLED, i, value);
	  }, function (reason) {
	    return enumerator._settledAt(REJECTED, i, reason);
	  });
	};
	
	/**
	  `Promise.all` accepts an array of promises, and returns a new promise which
	  is fulfilled with an array of fulfillment values for the passed promises, or
	  rejected with the reason of the first passed promise to be rejected. It casts all
	  elements of the passed iterable to promises as it runs this algorithm.
	
	  Example:
	
	  ```javascript
	  let promise1 = resolve(1);
	  let promise2 = resolve(2);
	  let promise3 = resolve(3);
	  let promises = [ promise1, promise2, promise3 ];
	
	  Promise.all(promises).then(function(array){
	    // The array here would be [ 1, 2, 3 ];
	  });
	  ```
	
	  If any of the `promises` given to `all` are rejected, the first promise
	  that is rejected will be given as an argument to the returned promises's
	  rejection handler. For example:
	
	  Example:
	
	  ```javascript
	  let promise1 = resolve(1);
	  let promise2 = reject(new Error("2"));
	  let promise3 = reject(new Error("3"));
	  let promises = [ promise1, promise2, promise3 ];
	
	  Promise.all(promises).then(function(array){
	    // Code here never runs because there are rejected promises!
	  }, function(error) {
	    // error.message === "2"
	  });
	  ```
	
	  @method all
	  @static
	  @param {Array} entries array of promises
	  @param {String} label optional string for labeling the promise.
	  Useful for tooling.
	  @return {Promise} promise that is fulfilled when all `promises` have been
	  fulfilled, or rejected if any of them become rejected.
	  @static
	*/
	function all$1(entries) {
	  return new Enumerator$1(this, entries).promise;
	}
	
	/**
	  `Promise.race` returns a new promise which is settled in the same way as the
	  first passed promise to settle.
	
	  Example:
	
	  ```javascript
	  let promise1 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 1');
	    }, 200);
	  });
	
	  let promise2 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 2');
	    }, 100);
	  });
	
	  Promise.race([promise1, promise2]).then(function(result){
	    // result === 'promise 2' because it was resolved before promise1
	    // was resolved.
	  });
	  ```
	
	  `Promise.race` is deterministic in that only the state of the first
	  settled promise matters. For example, even if other promises given to the
	  `promises` array argument are resolved, but the first settled promise has
	  become rejected before the other promises became fulfilled, the returned
	  promise will become rejected:
	
	  ```javascript
	  let promise1 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 1');
	    }, 200);
	  });
	
	  let promise2 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      reject(new Error('promise 2'));
	    }, 100);
	  });
	
	  Promise.race([promise1, promise2]).then(function(result){
	    // Code here never runs
	  }, function(reason){
	    // reason.message === 'promise 2' because promise 2 became rejected before
	    // promise 1 became fulfilled
	  });
	  ```
	
	  An example real-world use case is implementing timeouts:
	
	  ```javascript
	  Promise.race([ajax('foo.json'), timeout(5000)])
	  ```
	
	  @method race
	  @static
	  @param {Array} promises array of promises to observe
	  Useful for tooling.
	  @return {Promise} a promise which settles in the same way as the first passed
	  promise to settle.
	*/
	function race$1(entries) {
	  /*jshint validthis:true */
	  var Constructor = this;
	
	  if (!isArray(entries)) {
	    return new Constructor(function (_, reject) {
	      return reject(new TypeError('You must pass an array to race.'));
	    });
	  } else {
	    return new Constructor(function (resolve, reject) {
	      var length = entries.length;
	      for (var i = 0; i < length; i++) {
	        Constructor.resolve(entries[i]).then(resolve, reject);
	      }
	    });
	  }
	}
	
	/**
	  `Promise.reject` returns a promise rejected with the passed `reason`.
	  It is shorthand for the following:
	
	  ```javascript
	  let promise = new Promise(function(resolve, reject){
	    reject(new Error('WHOOPS'));
	  });
	
	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```
	
	  Instead of writing the above, your code now simply becomes the following:
	
	  ```javascript
	  let promise = Promise.reject(new Error('WHOOPS'));
	
	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```
	
	  @method reject
	  @static
	  @param {Any} reason value that the returned promise will be rejected with.
	  Useful for tooling.
	  @return {Promise} a promise rejected with the given `reason`.
	*/
	function reject$1(reason) {
	  /*jshint validthis:true */
	  var Constructor = this;
	  var promise = new Constructor(noop);
	  reject(promise, reason);
	  return promise;
	}
	
	function needsResolver() {
	  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	}
	
	function needsNew() {
	  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	}
	
	/**
	  Promise objects represent the eventual result of an asynchronous operation. The
	  primary way of interacting with a promise is through its `then` method, which
	  registers callbacks to receive either a promise's eventual value or the reason
	  why the promise cannot be fulfilled.
	
	  Terminology
	  -----------
	
	  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	  - `thenable` is an object or function that defines a `then` method.
	  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	  - `exception` is a value that is thrown using the throw statement.
	  - `reason` is a value that indicates why a promise was rejected.
	  - `settled` the final resting state of a promise, fulfilled or rejected.
	
	  A promise can be in one of three states: pending, fulfilled, or rejected.
	
	  Promises that are fulfilled have a fulfillment value and are in the fulfilled
	  state.  Promises that are rejected have a rejection reason and are in the
	  rejected state.  A fulfillment value is never a thenable.
	
	  Promises can also be said to *resolve* a value.  If this value is also a
	  promise, then the original promise's settled state will match the value's
	  settled state.  So a promise that *resolves* a promise that rejects will
	  itself reject, and a promise that *resolves* a promise that fulfills will
	  itself fulfill.
	
	
	  Basic Usage:
	  ------------
	
	  ```js
	  let promise = new Promise(function(resolve, reject) {
	    // on success
	    resolve(value);
	
	    // on failure
	    reject(reason);
	  });
	
	  promise.then(function(value) {
	    // on fulfillment
	  }, function(reason) {
	    // on rejection
	  });
	  ```
	
	  Advanced Usage:
	  ---------------
	
	  Promises shine when abstracting away asynchronous interactions such as
	  `XMLHttpRequest`s.
	
	  ```js
	  function getJSON(url) {
	    return new Promise(function(resolve, reject){
	      let xhr = new XMLHttpRequest();
	
	      xhr.open('GET', url);
	      xhr.onreadystatechange = handler;
	      xhr.responseType = 'json';
	      xhr.setRequestHeader('Accept', 'application/json');
	      xhr.send();
	
	      function handler() {
	        if (this.readyState === this.DONE) {
	          if (this.status === 200) {
	            resolve(this.response);
	          } else {
	            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	          }
	        }
	      };
	    });
	  }
	
	  getJSON('/posts.json').then(function(json) {
	    // on fulfillment
	  }, function(reason) {
	    // on rejection
	  });
	  ```
	
	  Unlike callbacks, promises are great composable primitives.
	
	  ```js
	  Promise.all([
	    getJSON('/posts'),
	    getJSON('/comments')
	  ]).then(function(values){
	    values[0] // => postsJSON
	    values[1] // => commentsJSON
	
	    return values;
	  });
	  ```
	
	  @class Promise
	  @param {function} resolver
	  Useful for tooling.
	  @constructor
	*/
	function Promise$2(resolver) {
	  this[PROMISE_ID] = nextId();
	  this._result = this._state = undefined;
	  this._subscribers = [];
	
	  if (noop !== resolver) {
	    typeof resolver !== 'function' && needsResolver();
	    this instanceof Promise$2 ? initializePromise(this, resolver) : needsNew();
	  }
	}
	
	Promise$2.all = all$1;
	Promise$2.race = race$1;
	Promise$2.resolve = resolve$1;
	Promise$2.reject = reject$1;
	Promise$2._setScheduler = setScheduler;
	Promise$2._setAsap = setAsap;
	Promise$2._asap = asap;
	
	Promise$2.prototype = {
	  constructor: Promise$2,
	
	  /**
	    The primary way of interacting with a promise is through its `then` method,
	    which registers callbacks to receive either a promise's eventual value or the
	    reason why the promise cannot be fulfilled.
	  
	    ```js
	    findUser().then(function(user){
	      // user is available
	    }, function(reason){
	      // user is unavailable, and you are given the reason why
	    });
	    ```
	  
	    Chaining
	    --------
	  
	    The return value of `then` is itself a promise.  This second, 'downstream'
	    promise is resolved with the return value of the first promise's fulfillment
	    or rejection handler, or rejected if the handler throws an exception.
	  
	    ```js
	    findUser().then(function (user) {
	      return user.name;
	    }, function (reason) {
	      return 'default name';
	    }).then(function (userName) {
	      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	      // will be `'default name'`
	    });
	  
	    findUser().then(function (user) {
	      throw new Error('Found user, but still unhappy');
	    }, function (reason) {
	      throw new Error('`findUser` rejected and we're unhappy');
	    }).then(function (value) {
	      // never reached
	    }, function (reason) {
	      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	    });
	    ```
	    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
	  
	    ```js
	    findUser().then(function (user) {
	      throw new PedagogicalException('Upstream error');
	    }).then(function (value) {
	      // never reached
	    }).then(function (value) {
	      // never reached
	    }, function (reason) {
	      // The `PedgagocialException` is propagated all the way down to here
	    });
	    ```
	  
	    Assimilation
	    ------------
	  
	    Sometimes the value you want to propagate to a downstream promise can only be
	    retrieved asynchronously. This can be achieved by returning a promise in the
	    fulfillment or rejection handler. The downstream promise will then be pending
	    until the returned promise is settled. This is called *assimilation*.
	  
	    ```js
	    findUser().then(function (user) {
	      return findCommentsByAuthor(user);
	    }).then(function (comments) {
	      // The user's comments are now available
	    });
	    ```
	  
	    If the assimliated promise rejects, then the downstream promise will also reject.
	  
	    ```js
	    findUser().then(function (user) {
	      return findCommentsByAuthor(user);
	    }).then(function (comments) {
	      // If `findCommentsByAuthor` fulfills, we'll have the value here
	    }, function (reason) {
	      // If `findCommentsByAuthor` rejects, we'll have the reason here
	    });
	    ```
	  
	    Simple Example
	    --------------
	  
	    Synchronous Example
	  
	    ```javascript
	    let result;
	  
	    try {
	      result = findResult();
	      // success
	    } catch(reason) {
	      // failure
	    }
	    ```
	  
	    Errback Example
	  
	    ```js
	    findResult(function(result, err){
	      if (err) {
	        // failure
	      } else {
	        // success
	      }
	    });
	    ```
	  
	    Promise Example;
	  
	    ```javascript
	    findResult().then(function(result){
	      // success
	    }, function(reason){
	      // failure
	    });
	    ```
	  
	    Advanced Example
	    --------------
	  
	    Synchronous Example
	  
	    ```javascript
	    let author, books;
	  
	    try {
	      author = findAuthor();
	      books  = findBooksByAuthor(author);
	      // success
	    } catch(reason) {
	      // failure
	    }
	    ```
	  
	    Errback Example
	  
	    ```js
	  
	    function foundBooks(books) {
	  
	    }
	  
	    function failure(reason) {
	  
	    }
	  
	    findAuthor(function(author, err){
	      if (err) {
	        failure(err);
	        // failure
	      } else {
	        try {
	          findBoooksByAuthor(author, function(books, err) {
	            if (err) {
	              failure(err);
	            } else {
	              try {
	                foundBooks(books);
	              } catch(reason) {
	                failure(reason);
	              }
	            }
	          });
	        } catch(error) {
	          failure(err);
	        }
	        // success
	      }
	    });
	    ```
	  
	    Promise Example;
	  
	    ```javascript
	    findAuthor().
	      then(findBooksByAuthor).
	      then(function(books){
	        // found books
	    }).catch(function(reason){
	      // something went wrong
	    });
	    ```
	  
	    @method then
	    @param {Function} onFulfilled
	    @param {Function} onRejected
	    Useful for tooling.
	    @return {Promise}
	  */
	  then: then,
	
	  /**
	    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	    as the catch block of a try/catch statement.
	  
	    ```js
	    function findAuthor(){
	      throw new Error('couldn't find that author');
	    }
	  
	    // synchronous
	    try {
	      findAuthor();
	    } catch(reason) {
	      // something went wrong
	    }
	  
	    // async with promises
	    findAuthor().catch(function(reason){
	      // something went wrong
	    });
	    ```
	  
	    @method catch
	    @param {Function} onRejection
	    Useful for tooling.
	    @return {Promise}
	  */
	  'catch': function _catch(onRejection) {
	    return this.then(null, onRejection);
	  }
	};
	
	/*global self*/
	function polyfill$1() {
	    var local = undefined;
	
	    if (typeof global !== 'undefined') {
	        local = global;
	    } else if (typeof self !== 'undefined') {
	        local = self;
	    } else {
	        try {
	            local = Function('return this')();
	        } catch (e) {
	            throw new Error('polyfill failed because global object is unavailable in this environment');
	        }
	    }
	
	    var P = local.Promise;
	
	    if (P) {
	        var promiseToString = null;
	        try {
	            promiseToString = Object.prototype.toString.call(P.resolve());
	        } catch (e) {
	            // silently ignored
	        }
	
	        if (promiseToString === '[object Promise]' && !P.cast) {
	            return;
	        }
	    }
	
	    local.Promise = Promise$2;
	}
	
	// Strange compat..
	Promise$2.polyfill = polyfill$1;
	Promise$2.Promise = Promise$2;
	
	return Promise$2;
	
	})));
	
	//# sourceMappingURL=es6-promise.map
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2), (function() { return this; }())))

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;
	
	process.listeners = function (name) { return [] }
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 3 */
/***/ (function(module, exports) {

	/* (ignored) */

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(5);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// Prepare cssTransformation
	var transform;
	
	var options = {}
	options.transform = transform
	// add the styles to the DOM
	var update = __webpack_require__(13)(content, options);
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../css-loader/index.js!../../postcss-loader/index.js!./font-awesome.css", function() {
				var newContent = require("!!../../css-loader/index.js!../../postcss-loader/index.js!./font-awesome.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)(undefined);
	// imports
	exports.push([module.id, "@import url(https://fonts.googleapis.com/css?family=Roboto+Mono);", ""]);
	
	// module
	exports.push([module.id, "\n/*-----------------------------------------------------------------------------\n| Copyright (c) Jupyter Development Team.\n| Distributed under the terms of the Modified BSD License.\n|----------------------------------------------------------------------------*/\n/**\n * The material design colors are adapted from google-material-color v1.2.6\n * https://github.com/danlevan/google-material-color\n * https://github.com/danlevan/google-material-color/blob/f67ca5f4028b2f1b34862f64b0ca67323f91b088/dist/palette.var.css\n *\n * The license for the material design color CSS variables is as follows (see\n * https://github.com/danlevan/google-material-color/blob/f67ca5f4028b2f1b34862f64b0ca67323f91b088/LICENSE)\n *\n * The MIT License (MIT)\n *\n * Copyright (c) 2014 Dan Le Van\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n * SOFTWARE.\n */\n/*\nThe following CSS variables define the main, public API for styling JupyterLab.\nThese variables should be used by all plugins wherever possible. In other\nwords, plugins should not define custom colors, sizes, etc unless absolutely\nnecessary. This enables users to change the visual theme of JupyterLab\nby changing these variables.\n\nMany variables appear in an ordered sequence (0,1,2,3). These sequences\nare designed to work well together, so for example, `--jp-border-color1` should\nbe used with `--jp-layout-color1`. The numbers have the following meanings:\n\n* 0: super-primary, reserved for special emphasis\n* 1: primary, most important under normal situations\n* 2: secondary, next most important under normal situations\n* 3: tertiary, next most important under normal situations\n\nThroughout JupyterLab, we are mostly following principles from Google's\nMaterial Design when selecting colors. We are not, however, following\nall of MD as it is not optimized for dense, information rich UIs.\n*/\n/*\n * Optional monospace font for input/output prompt.\n */\n/*\n * Added for compabitility with output area\n */\n:root {\n\n  /* Borders\n\n  The following variables, specify the visual styling of borders in JupyterLab.\n   */\n\n  /* UI Fonts\n\n  The UI font CSS variables are used for the typography all of the JupyterLab\n  user interface elements that are not directly user generated content.\n  */ /* Base font size */ /* Ensures px perfect FontAwesome icons */\n\n  /* Use these font colors against the corresponding main layout colors.\n     In a light theme, these go from dark to light.\n  */\n\n  /* Use these against the brand/accent/warn/error colors.\n     These will typically go from light to darker, in both a dark and light theme\n   */\n\n  /* Content Fonts\n\n  Content font variables are used for typography of user generated content.\n  */ /* Base font size */\n\n\n  /* Layout\n\n  The following are the main layout colors use in JupyterLab. In a light\n  theme these would go from light to dark.\n  */\n\n  /* Brand/accent */\n\n  /* State colors (warn, error, success, info) */\n\n  /* Cell specific styles */\n  /* A custom blend of MD grey and blue 600\n   * See https://meyerweb.com/eric/tools/color-blend/#546E7A:1E88E5:5:hex */\n  /* A custom blend of MD grey and orange 600\n   * https://meyerweb.com/eric/tools/color-blend/#546E7A:F4511E:5:hex */\n\n  /* Notebook specific styles */\n\n  /* Console specific styles */\n\n  /* Toolbar specific styles */\n}\n/*!\n *  Font Awesome 4.7.0 by @davegandy - http://fontawesome.io - @fontawesome\n *  License - http://fontawesome.io/license (Font: SIL OFL 1.1, CSS: MIT License)\n */\n/* FONT PATH\n * -------------------------- */\n@font-face {\n  font-family: 'FontAwesome';\n  src: url(" + __webpack_require__(7) + ");\n  src: url(" + __webpack_require__(8) + "?#iefix&v=4.7.0) format('embedded-opentype'), url(" + __webpack_require__(9) + ") format('woff2'), url(" + __webpack_require__(10) + ") format('woff'), url(" + __webpack_require__(11) + ") format('truetype'), url(" + __webpack_require__(12) + "#fontawesomeregular) format('svg');\n  font-weight: normal;\n  font-style: normal;\n}\n.fa {\n  display: inline-block;\n  font: normal normal normal 14px/1 FontAwesome;\n  font-size: inherit;\n  text-rendering: auto;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n/* makes the font 33% larger relative to the icon container */\n.fa-lg {\n  font-size: 1.33333333em;\n  line-height: 0.75em;\n  vertical-align: -15%;\n}\n.fa-2x {\n  font-size: 2em;\n}\n.fa-3x {\n  font-size: 3em;\n}\n.fa-4x {\n  font-size: 4em;\n}\n.fa-5x {\n  font-size: 5em;\n}\n.fa-fw {\n  width: 1.28571429em;\n  text-align: center;\n}\n.fa-ul {\n  padding-left: 0;\n  margin-left: 2.14285714em;\n  list-style-type: none;\n}\n.fa-ul > li {\n  position: relative;\n}\n.fa-li {\n  position: absolute;\n  left: -2.14285714em;\n  width: 2.14285714em;\n  top: 0.14285714em;\n  text-align: center;\n}\n.fa-li.fa-lg {\n  left: -1.85714286em;\n}\n.fa-border {\n  padding: .2em .25em .15em;\n  border: solid 0.08em #eeeeee;\n  border-radius: .1em;\n}\n.fa-pull-left {\n  float: left;\n}\n.fa-pull-right {\n  float: right;\n}\n.fa.fa-pull-left {\n  margin-right: .3em;\n}\n.fa.fa-pull-right {\n  margin-left: .3em;\n}\n/* Deprecated as of 4.4.0 */\n.pull-right {\n  float: right;\n}\n.pull-left {\n  float: left;\n}\n.fa.pull-left {\n  margin-right: .3em;\n}\n.fa.pull-right {\n  margin-left: .3em;\n}\n.fa-spin {\n  -webkit-animation: fa-spin 2s infinite linear;\n  animation: fa-spin 2s infinite linear;\n}\n.fa-pulse {\n  -webkit-animation: fa-spin 1s infinite steps(8);\n  animation: fa-spin 1s infinite steps(8);\n}\n@-webkit-keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(359deg);\n    transform: rotate(359deg);\n  }\n}\n@keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(359deg);\n    transform: rotate(359deg);\n  }\n}\n.fa-rotate-90 {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=1)\";\n  -webkit-transform: rotate(90deg);\n  transform: rotate(90deg);\n}\n.fa-rotate-180 {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=2)\";\n  -webkit-transform: rotate(180deg);\n  transform: rotate(180deg);\n}\n.fa-rotate-270 {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=3)\";\n  -webkit-transform: rotate(270deg);\n  transform: rotate(270deg);\n}\n.fa-flip-horizontal {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)\";\n  -webkit-transform: scale(-1, 1);\n  transform: scale(-1, 1);\n}\n.fa-flip-vertical {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)\";\n  -webkit-transform: scale(1, -1);\n  transform: scale(1, -1);\n}\n:root .fa-rotate-90,\n:root .fa-rotate-180,\n:root .fa-rotate-270,\n:root .fa-flip-horizontal,\n:root .fa-flip-vertical {\n  -webkit-filter: none;\n          filter: none;\n}\n.fa-stack {\n  position: relative;\n  display: inline-block;\n  width: 2em;\n  height: 2em;\n  line-height: 2em;\n  vertical-align: middle;\n}\n.fa-stack-1x,\n.fa-stack-2x {\n  position: absolute;\n  left: 0;\n  width: 100%;\n  text-align: center;\n}\n.fa-stack-1x {\n  line-height: inherit;\n}\n.fa-stack-2x {\n  font-size: 2em;\n}\n.fa-inverse {\n  color: #ffffff;\n}\n/* Font Awesome uses the Unicode Private Use Area (PUA) to ensure screen\n   readers do not read off random characters that represent icons */\n.fa-glass:before {\n  content: \"\\F000\";\n}\n.fa-music:before {\n  content: \"\\F001\";\n}\n.fa-search:before {\n  content: \"\\F002\";\n}\n.fa-envelope-o:before {\n  content: \"\\F003\";\n}\n.fa-heart:before {\n  content: \"\\F004\";\n}\n.fa-star:before {\n  content: \"\\F005\";\n}\n.fa-star-o:before {\n  content: \"\\F006\";\n}\n.fa-user:before {\n  content: \"\\F007\";\n}\n.fa-film:before {\n  content: \"\\F008\";\n}\n.fa-th-large:before {\n  content: \"\\F009\";\n}\n.fa-th:before {\n  content: \"\\F00A\";\n}\n.fa-th-list:before {\n  content: \"\\F00B\";\n}\n.fa-check:before {\n  content: \"\\F00C\";\n}\n.fa-remove:before,\n.fa-close:before,\n.fa-times:before {\n  content: \"\\F00D\";\n}\n.fa-search-plus:before {\n  content: \"\\F00E\";\n}\n.fa-search-minus:before {\n  content: \"\\F010\";\n}\n.fa-power-off:before {\n  content: \"\\F011\";\n}\n.fa-signal:before {\n  content: \"\\F012\";\n}\n.fa-gear:before,\n.fa-cog:before {\n  content: \"\\F013\";\n}\n.fa-trash-o:before {\n  content: \"\\F014\";\n}\n.fa-home:before {\n  content: \"\\F015\";\n}\n.fa-file-o:before {\n  content: \"\\F016\";\n}\n.fa-clock-o:before {\n  content: \"\\F017\";\n}\n.fa-road:before {\n  content: \"\\F018\";\n}\n.fa-download:before {\n  content: \"\\F019\";\n}\n.fa-arrow-circle-o-down:before {\n  content: \"\\F01A\";\n}\n.fa-arrow-circle-o-up:before {\n  content: \"\\F01B\";\n}\n.fa-inbox:before {\n  content: \"\\F01C\";\n}\n.fa-play-circle-o:before {\n  content: \"\\F01D\";\n}\n.fa-rotate-right:before,\n.fa-repeat:before {\n  content: \"\\F01E\";\n}\n.fa-refresh:before {\n  content: \"\\F021\";\n}\n.fa-list-alt:before {\n  content: \"\\F022\";\n}\n.fa-lock:before {\n  content: \"\\F023\";\n}\n.fa-flag:before {\n  content: \"\\F024\";\n}\n.fa-headphones:before {\n  content: \"\\F025\";\n}\n.fa-volume-off:before {\n  content: \"\\F026\";\n}\n.fa-volume-down:before {\n  content: \"\\F027\";\n}\n.fa-volume-up:before {\n  content: \"\\F028\";\n}\n.fa-qrcode:before {\n  content: \"\\F029\";\n}\n.fa-barcode:before {\n  content: \"\\F02A\";\n}\n.fa-tag:before {\n  content: \"\\F02B\";\n}\n.fa-tags:before {\n  content: \"\\F02C\";\n}\n.fa-book:before {\n  content: \"\\F02D\";\n}\n.fa-bookmark:before {\n  content: \"\\F02E\";\n}\n.fa-print:before {\n  content: \"\\F02F\";\n}\n.fa-camera:before {\n  content: \"\\F030\";\n}\n.fa-font:before {\n  content: \"\\F031\";\n}\n.fa-bold:before {\n  content: \"\\F032\";\n}\n.fa-italic:before {\n  content: \"\\F033\";\n}\n.fa-text-height:before {\n  content: \"\\F034\";\n}\n.fa-text-width:before {\n  content: \"\\F035\";\n}\n.fa-align-left:before {\n  content: \"\\F036\";\n}\n.fa-align-center:before {\n  content: \"\\F037\";\n}\n.fa-align-right:before {\n  content: \"\\F038\";\n}\n.fa-align-justify:before {\n  content: \"\\F039\";\n}\n.fa-list:before {\n  content: \"\\F03A\";\n}\n.fa-dedent:before,\n.fa-outdent:before {\n  content: \"\\F03B\";\n}\n.fa-indent:before {\n  content: \"\\F03C\";\n}\n.fa-video-camera:before {\n  content: \"\\F03D\";\n}\n.fa-photo:before,\n.fa-image:before,\n.fa-picture-o:before {\n  content: \"\\F03E\";\n}\n.fa-pencil:before {\n  content: \"\\F040\";\n}\n.fa-map-marker:before {\n  content: \"\\F041\";\n}\n.fa-adjust:before {\n  content: \"\\F042\";\n}\n.fa-tint:before {\n  content: \"\\F043\";\n}\n.fa-edit:before,\n.fa-pencil-square-o:before {\n  content: \"\\F044\";\n}\n.fa-share-square-o:before {\n  content: \"\\F045\";\n}\n.fa-check-square-o:before {\n  content: \"\\F046\";\n}\n.fa-arrows:before {\n  content: \"\\F047\";\n}\n.fa-step-backward:before {\n  content: \"\\F048\";\n}\n.fa-fast-backward:before {\n  content: \"\\F049\";\n}\n.fa-backward:before {\n  content: \"\\F04A\";\n}\n.fa-play:before {\n  content: \"\\F04B\";\n}\n.fa-pause:before {\n  content: \"\\F04C\";\n}\n.fa-stop:before {\n  content: \"\\F04D\";\n}\n.fa-forward:before {\n  content: \"\\F04E\";\n}\n.fa-fast-forward:before {\n  content: \"\\F050\";\n}\n.fa-step-forward:before {\n  content: \"\\F051\";\n}\n.fa-eject:before {\n  content: \"\\F052\";\n}\n.fa-chevron-left:before {\n  content: \"\\F053\";\n}\n.fa-chevron-right:before {\n  content: \"\\F054\";\n}\n.fa-plus-circle:before {\n  content: \"\\F055\";\n}\n.fa-minus-circle:before {\n  content: \"\\F056\";\n}\n.fa-times-circle:before {\n  content: \"\\F057\";\n}\n.fa-check-circle:before {\n  content: \"\\F058\";\n}\n.fa-question-circle:before {\n  content: \"\\F059\";\n}\n.fa-info-circle:before {\n  content: \"\\F05A\";\n}\n.fa-crosshairs:before {\n  content: \"\\F05B\";\n}\n.fa-times-circle-o:before {\n  content: \"\\F05C\";\n}\n.fa-check-circle-o:before {\n  content: \"\\F05D\";\n}\n.fa-ban:before {\n  content: \"\\F05E\";\n}\n.fa-arrow-left:before {\n  content: \"\\F060\";\n}\n.fa-arrow-right:before {\n  content: \"\\F061\";\n}\n.fa-arrow-up:before {\n  content: \"\\F062\";\n}\n.fa-arrow-down:before {\n  content: \"\\F063\";\n}\n.fa-mail-forward:before,\n.fa-share:before {\n  content: \"\\F064\";\n}\n.fa-expand:before {\n  content: \"\\F065\";\n}\n.fa-compress:before {\n  content: \"\\F066\";\n}\n.fa-plus:before {\n  content: \"\\F067\";\n}\n.fa-minus:before {\n  content: \"\\F068\";\n}\n.fa-asterisk:before {\n  content: \"\\F069\";\n}\n.fa-exclamation-circle:before {\n  content: \"\\F06A\";\n}\n.fa-gift:before {\n  content: \"\\F06B\";\n}\n.fa-leaf:before {\n  content: \"\\F06C\";\n}\n.fa-fire:before {\n  content: \"\\F06D\";\n}\n.fa-eye:before {\n  content: \"\\F06E\";\n}\n.fa-eye-slash:before {\n  content: \"\\F070\";\n}\n.fa-warning:before,\n.fa-exclamation-triangle:before {\n  content: \"\\F071\";\n}\n.fa-plane:before {\n  content: \"\\F072\";\n}\n.fa-calendar:before {\n  content: \"\\F073\";\n}\n.fa-random:before {\n  content: \"\\F074\";\n}\n.fa-comment:before {\n  content: \"\\F075\";\n}\n.fa-magnet:before {\n  content: \"\\F076\";\n}\n.fa-chevron-up:before {\n  content: \"\\F077\";\n}\n.fa-chevron-down:before {\n  content: \"\\F078\";\n}\n.fa-retweet:before {\n  content: \"\\F079\";\n}\n.fa-shopping-cart:before {\n  content: \"\\F07A\";\n}\n.fa-folder:before {\n  content: \"\\F07B\";\n}\n.fa-folder-open:before {\n  content: \"\\F07C\";\n}\n.fa-arrows-v:before {\n  content: \"\\F07D\";\n}\n.fa-arrows-h:before {\n  content: \"\\F07E\";\n}\n.fa-bar-chart-o:before,\n.fa-bar-chart:before {\n  content: \"\\F080\";\n}\n.fa-twitter-square:before {\n  content: \"\\F081\";\n}\n.fa-facebook-square:before {\n  content: \"\\F082\";\n}\n.fa-camera-retro:before {\n  content: \"\\F083\";\n}\n.fa-key:before {\n  content: \"\\F084\";\n}\n.fa-gears:before,\n.fa-cogs:before {\n  content: \"\\F085\";\n}\n.fa-comments:before {\n  content: \"\\F086\";\n}\n.fa-thumbs-o-up:before {\n  content: \"\\F087\";\n}\n.fa-thumbs-o-down:before {\n  content: \"\\F088\";\n}\n.fa-star-half:before {\n  content: \"\\F089\";\n}\n.fa-heart-o:before {\n  content: \"\\F08A\";\n}\n.fa-sign-out:before {\n  content: \"\\F08B\";\n}\n.fa-linkedin-square:before {\n  content: \"\\F08C\";\n}\n.fa-thumb-tack:before {\n  content: \"\\F08D\";\n}\n.fa-external-link:before {\n  content: \"\\F08E\";\n}\n.fa-sign-in:before {\n  content: \"\\F090\";\n}\n.fa-trophy:before {\n  content: \"\\F091\";\n}\n.fa-github-square:before {\n  content: \"\\F092\";\n}\n.fa-upload:before {\n  content: \"\\F093\";\n}\n.fa-lemon-o:before {\n  content: \"\\F094\";\n}\n.fa-phone:before {\n  content: \"\\F095\";\n}\n.fa-square-o:before {\n  content: \"\\F096\";\n}\n.fa-bookmark-o:before {\n  content: \"\\F097\";\n}\n.fa-phone-square:before {\n  content: \"\\F098\";\n}\n.fa-twitter:before {\n  content: \"\\F099\";\n}\n.fa-facebook-f:before,\n.fa-facebook:before {\n  content: \"\\F09A\";\n}\n.fa-github:before {\n  content: \"\\F09B\";\n}\n.fa-unlock:before {\n  content: \"\\F09C\";\n}\n.fa-credit-card:before {\n  content: \"\\F09D\";\n}\n.fa-feed:before,\n.fa-rss:before {\n  content: \"\\F09E\";\n}\n.fa-hdd-o:before {\n  content: \"\\F0A0\";\n}\n.fa-bullhorn:before {\n  content: \"\\F0A1\";\n}\n.fa-bell:before {\n  content: \"\\F0F3\";\n}\n.fa-certificate:before {\n  content: \"\\F0A3\";\n}\n.fa-hand-o-right:before {\n  content: \"\\F0A4\";\n}\n.fa-hand-o-left:before {\n  content: \"\\F0A5\";\n}\n.fa-hand-o-up:before {\n  content: \"\\F0A6\";\n}\n.fa-hand-o-down:before {\n  content: \"\\F0A7\";\n}\n.fa-arrow-circle-left:before {\n  content: \"\\F0A8\";\n}\n.fa-arrow-circle-right:before {\n  content: \"\\F0A9\";\n}\n.fa-arrow-circle-up:before {\n  content: \"\\F0AA\";\n}\n.fa-arrow-circle-down:before {\n  content: \"\\F0AB\";\n}\n.fa-globe:before {\n  content: \"\\F0AC\";\n}\n.fa-wrench:before {\n  content: \"\\F0AD\";\n}\n.fa-tasks:before {\n  content: \"\\F0AE\";\n}\n.fa-filter:before {\n  content: \"\\F0B0\";\n}\n.fa-briefcase:before {\n  content: \"\\F0B1\";\n}\n.fa-arrows-alt:before {\n  content: \"\\F0B2\";\n}\n.fa-group:before,\n.fa-users:before {\n  content: \"\\F0C0\";\n}\n.fa-chain:before,\n.fa-link:before {\n  content: \"\\F0C1\";\n}\n.fa-cloud:before {\n  content: \"\\F0C2\";\n}\n.fa-flask:before {\n  content: \"\\F0C3\";\n}\n.fa-cut:before,\n.fa-scissors:before {\n  content: \"\\F0C4\";\n}\n.fa-copy:before,\n.fa-files-o:before {\n  content: \"\\F0C5\";\n}\n.fa-paperclip:before {\n  content: \"\\F0C6\";\n}\n.fa-save:before,\n.fa-floppy-o:before {\n  content: \"\\F0C7\";\n}\n.fa-square:before {\n  content: \"\\F0C8\";\n}\n.fa-navicon:before,\n.fa-reorder:before,\n.fa-bars:before {\n  content: \"\\F0C9\";\n}\n.fa-list-ul:before {\n  content: \"\\F0CA\";\n}\n.fa-list-ol:before {\n  content: \"\\F0CB\";\n}\n.fa-strikethrough:before {\n  content: \"\\F0CC\";\n}\n.fa-underline:before {\n  content: \"\\F0CD\";\n}\n.fa-table:before {\n  content: \"\\F0CE\";\n}\n.fa-magic:before {\n  content: \"\\F0D0\";\n}\n.fa-truck:before {\n  content: \"\\F0D1\";\n}\n.fa-pinterest:before {\n  content: \"\\F0D2\";\n}\n.fa-pinterest-square:before {\n  content: \"\\F0D3\";\n}\n.fa-google-plus-square:before {\n  content: \"\\F0D4\";\n}\n.fa-google-plus:before {\n  content: \"\\F0D5\";\n}\n.fa-money:before {\n  content: \"\\F0D6\";\n}\n.fa-caret-down:before {\n  content: \"\\F0D7\";\n}\n.fa-caret-up:before {\n  content: \"\\F0D8\";\n}\n.fa-caret-left:before {\n  content: \"\\F0D9\";\n}\n.fa-caret-right:before {\n  content: \"\\F0DA\";\n}\n.fa-columns:before {\n  content: \"\\F0DB\";\n}\n.fa-unsorted:before,\n.fa-sort:before {\n  content: \"\\F0DC\";\n}\n.fa-sort-down:before,\n.fa-sort-desc:before {\n  content: \"\\F0DD\";\n}\n.fa-sort-up:before,\n.fa-sort-asc:before {\n  content: \"\\F0DE\";\n}\n.fa-envelope:before {\n  content: \"\\F0E0\";\n}\n.fa-linkedin:before {\n  content: \"\\F0E1\";\n}\n.fa-rotate-left:before,\n.fa-undo:before {\n  content: \"\\F0E2\";\n}\n.fa-legal:before,\n.fa-gavel:before {\n  content: \"\\F0E3\";\n}\n.fa-dashboard:before,\n.fa-tachometer:before {\n  content: \"\\F0E4\";\n}\n.fa-comment-o:before {\n  content: \"\\F0E5\";\n}\n.fa-comments-o:before {\n  content: \"\\F0E6\";\n}\n.fa-flash:before,\n.fa-bolt:before {\n  content: \"\\F0E7\";\n}\n.fa-sitemap:before {\n  content: \"\\F0E8\";\n}\n.fa-umbrella:before {\n  content: \"\\F0E9\";\n}\n.fa-paste:before,\n.fa-clipboard:before {\n  content: \"\\F0EA\";\n}\n.fa-lightbulb-o:before {\n  content: \"\\F0EB\";\n}\n.fa-exchange:before {\n  content: \"\\F0EC\";\n}\n.fa-cloud-download:before {\n  content: \"\\F0ED\";\n}\n.fa-cloud-upload:before {\n  content: \"\\F0EE\";\n}\n.fa-user-md:before {\n  content: \"\\F0F0\";\n}\n.fa-stethoscope:before {\n  content: \"\\F0F1\";\n}\n.fa-suitcase:before {\n  content: \"\\F0F2\";\n}\n.fa-bell-o:before {\n  content: \"\\F0A2\";\n}\n.fa-coffee:before {\n  content: \"\\F0F4\";\n}\n.fa-cutlery:before {\n  content: \"\\F0F5\";\n}\n.fa-file-text-o:before {\n  content: \"\\F0F6\";\n}\n.fa-building-o:before {\n  content: \"\\F0F7\";\n}\n.fa-hospital-o:before {\n  content: \"\\F0F8\";\n}\n.fa-ambulance:before {\n  content: \"\\F0F9\";\n}\n.fa-medkit:before {\n  content: \"\\F0FA\";\n}\n.fa-fighter-jet:before {\n  content: \"\\F0FB\";\n}\n.fa-beer:before {\n  content: \"\\F0FC\";\n}\n.fa-h-square:before {\n  content: \"\\F0FD\";\n}\n.fa-plus-square:before {\n  content: \"\\F0FE\";\n}\n.fa-angle-double-left:before {\n  content: \"\\F100\";\n}\n.fa-angle-double-right:before {\n  content: \"\\F101\";\n}\n.fa-angle-double-up:before {\n  content: \"\\F102\";\n}\n.fa-angle-double-down:before {\n  content: \"\\F103\";\n}\n.fa-angle-left:before {\n  content: \"\\F104\";\n}\n.fa-angle-right:before {\n  content: \"\\F105\";\n}\n.fa-angle-up:before {\n  content: \"\\F106\";\n}\n.fa-angle-down:before {\n  content: \"\\F107\";\n}\n.fa-desktop:before {\n  content: \"\\F108\";\n}\n.fa-laptop:before {\n  content: \"\\F109\";\n}\n.fa-tablet:before {\n  content: \"\\F10A\";\n}\n.fa-mobile-phone:before,\n.fa-mobile:before {\n  content: \"\\F10B\";\n}\n.fa-circle-o:before {\n  content: \"\\F10C\";\n}\n.fa-quote-left:before {\n  content: \"\\F10D\";\n}\n.fa-quote-right:before {\n  content: \"\\F10E\";\n}\n.fa-spinner:before {\n  content: \"\\F110\";\n}\n.fa-circle:before {\n  content: \"\\F111\";\n}\n.fa-mail-reply:before,\n.fa-reply:before {\n  content: \"\\F112\";\n}\n.fa-github-alt:before {\n  content: \"\\F113\";\n}\n.fa-folder-o:before {\n  content: \"\\F114\";\n}\n.fa-folder-open-o:before {\n  content: \"\\F115\";\n}\n.fa-smile-o:before {\n  content: \"\\F118\";\n}\n.fa-frown-o:before {\n  content: \"\\F119\";\n}\n.fa-meh-o:before {\n  content: \"\\F11A\";\n}\n.fa-gamepad:before {\n  content: \"\\F11B\";\n}\n.fa-keyboard-o:before {\n  content: \"\\F11C\";\n}\n.fa-flag-o:before {\n  content: \"\\F11D\";\n}\n.fa-flag-checkered:before {\n  content: \"\\F11E\";\n}\n.fa-terminal:before {\n  content: \"\\F120\";\n}\n.fa-code:before {\n  content: \"\\F121\";\n}\n.fa-mail-reply-all:before,\n.fa-reply-all:before {\n  content: \"\\F122\";\n}\n.fa-star-half-empty:before,\n.fa-star-half-full:before,\n.fa-star-half-o:before {\n  content: \"\\F123\";\n}\n.fa-location-arrow:before {\n  content: \"\\F124\";\n}\n.fa-crop:before {\n  content: \"\\F125\";\n}\n.fa-code-fork:before {\n  content: \"\\F126\";\n}\n.fa-unlink:before,\n.fa-chain-broken:before {\n  content: \"\\F127\";\n}\n.fa-question:before {\n  content: \"\\F128\";\n}\n.fa-info:before {\n  content: \"\\F129\";\n}\n.fa-exclamation:before {\n  content: \"\\F12A\";\n}\n.fa-superscript:before {\n  content: \"\\F12B\";\n}\n.fa-subscript:before {\n  content: \"\\F12C\";\n}\n.fa-eraser:before {\n  content: \"\\F12D\";\n}\n.fa-puzzle-piece:before {\n  content: \"\\F12E\";\n}\n.fa-microphone:before {\n  content: \"\\F130\";\n}\n.fa-microphone-slash:before {\n  content: \"\\F131\";\n}\n.fa-shield:before {\n  content: \"\\F132\";\n}\n.fa-calendar-o:before {\n  content: \"\\F133\";\n}\n.fa-fire-extinguisher:before {\n  content: \"\\F134\";\n}\n.fa-rocket:before {\n  content: \"\\F135\";\n}\n.fa-maxcdn:before {\n  content: \"\\F136\";\n}\n.fa-chevron-circle-left:before {\n  content: \"\\F137\";\n}\n.fa-chevron-circle-right:before {\n  content: \"\\F138\";\n}\n.fa-chevron-circle-up:before {\n  content: \"\\F139\";\n}\n.fa-chevron-circle-down:before {\n  content: \"\\F13A\";\n}\n.fa-html5:before {\n  content: \"\\F13B\";\n}\n.fa-css3:before {\n  content: \"\\F13C\";\n}\n.fa-anchor:before {\n  content: \"\\F13D\";\n}\n.fa-unlock-alt:before {\n  content: \"\\F13E\";\n}\n.fa-bullseye:before {\n  content: \"\\F140\";\n}\n.fa-ellipsis-h:before {\n  content: \"\\F141\";\n}\n.fa-ellipsis-v:before {\n  content: \"\\F142\";\n}\n.fa-rss-square:before {\n  content: \"\\F143\";\n}\n.fa-play-circle:before {\n  content: \"\\F144\";\n}\n.fa-ticket:before {\n  content: \"\\F145\";\n}\n.fa-minus-square:before {\n  content: \"\\F146\";\n}\n.fa-minus-square-o:before {\n  content: \"\\F147\";\n}\n.fa-level-up:before {\n  content: \"\\F148\";\n}\n.fa-level-down:before {\n  content: \"\\F149\";\n}\n.fa-check-square:before {\n  content: \"\\F14A\";\n}\n.fa-pencil-square:before {\n  content: \"\\F14B\";\n}\n.fa-external-link-square:before {\n  content: \"\\F14C\";\n}\n.fa-share-square:before {\n  content: \"\\F14D\";\n}\n.fa-compass:before {\n  content: \"\\F14E\";\n}\n.fa-toggle-down:before,\n.fa-caret-square-o-down:before {\n  content: \"\\F150\";\n}\n.fa-toggle-up:before,\n.fa-caret-square-o-up:before {\n  content: \"\\F151\";\n}\n.fa-toggle-right:before,\n.fa-caret-square-o-right:before {\n  content: \"\\F152\";\n}\n.fa-euro:before,\n.fa-eur:before {\n  content: \"\\F153\";\n}\n.fa-gbp:before {\n  content: \"\\F154\";\n}\n.fa-dollar:before,\n.fa-usd:before {\n  content: \"\\F155\";\n}\n.fa-rupee:before,\n.fa-inr:before {\n  content: \"\\F156\";\n}\n.fa-cny:before,\n.fa-rmb:before,\n.fa-yen:before,\n.fa-jpy:before {\n  content: \"\\F157\";\n}\n.fa-ruble:before,\n.fa-rouble:before,\n.fa-rub:before {\n  content: \"\\F158\";\n}\n.fa-won:before,\n.fa-krw:before {\n  content: \"\\F159\";\n}\n.fa-bitcoin:before,\n.fa-btc:before {\n  content: \"\\F15A\";\n}\n.fa-file:before {\n  content: \"\\F15B\";\n}\n.fa-file-text:before {\n  content: \"\\F15C\";\n}\n.fa-sort-alpha-asc:before {\n  content: \"\\F15D\";\n}\n.fa-sort-alpha-desc:before {\n  content: \"\\F15E\";\n}\n.fa-sort-amount-asc:before {\n  content: \"\\F160\";\n}\n.fa-sort-amount-desc:before {\n  content: \"\\F161\";\n}\n.fa-sort-numeric-asc:before {\n  content: \"\\F162\";\n}\n.fa-sort-numeric-desc:before {\n  content: \"\\F163\";\n}\n.fa-thumbs-up:before {\n  content: \"\\F164\";\n}\n.fa-thumbs-down:before {\n  content: \"\\F165\";\n}\n.fa-youtube-square:before {\n  content: \"\\F166\";\n}\n.fa-youtube:before {\n  content: \"\\F167\";\n}\n.fa-xing:before {\n  content: \"\\F168\";\n}\n.fa-xing-square:before {\n  content: \"\\F169\";\n}\n.fa-youtube-play:before {\n  content: \"\\F16A\";\n}\n.fa-dropbox:before {\n  content: \"\\F16B\";\n}\n.fa-stack-overflow:before {\n  content: \"\\F16C\";\n}\n.fa-instagram:before {\n  content: \"\\F16D\";\n}\n.fa-flickr:before {\n  content: \"\\F16E\";\n}\n.fa-adn:before {\n  content: \"\\F170\";\n}\n.fa-bitbucket:before {\n  content: \"\\F171\";\n}\n.fa-bitbucket-square:before {\n  content: \"\\F172\";\n}\n.fa-tumblr:before {\n  content: \"\\F173\";\n}\n.fa-tumblr-square:before {\n  content: \"\\F174\";\n}\n.fa-long-arrow-down:before {\n  content: \"\\F175\";\n}\n.fa-long-arrow-up:before {\n  content: \"\\F176\";\n}\n.fa-long-arrow-left:before {\n  content: \"\\F177\";\n}\n.fa-long-arrow-right:before {\n  content: \"\\F178\";\n}\n.fa-apple:before {\n  content: \"\\F179\";\n}\n.fa-windows:before {\n  content: \"\\F17A\";\n}\n.fa-android:before {\n  content: \"\\F17B\";\n}\n.fa-linux:before {\n  content: \"\\F17C\";\n}\n.fa-dribbble:before {\n  content: \"\\F17D\";\n}\n.fa-skype:before {\n  content: \"\\F17E\";\n}\n.fa-foursquare:before {\n  content: \"\\F180\";\n}\n.fa-trello:before {\n  content: \"\\F181\";\n}\n.fa-female:before {\n  content: \"\\F182\";\n}\n.fa-male:before {\n  content: \"\\F183\";\n}\n.fa-gittip:before,\n.fa-gratipay:before {\n  content: \"\\F184\";\n}\n.fa-sun-o:before {\n  content: \"\\F185\";\n}\n.fa-moon-o:before {\n  content: \"\\F186\";\n}\n.fa-archive:before {\n  content: \"\\F187\";\n}\n.fa-bug:before {\n  content: \"\\F188\";\n}\n.fa-vk:before {\n  content: \"\\F189\";\n}\n.fa-weibo:before {\n  content: \"\\F18A\";\n}\n.fa-renren:before {\n  content: \"\\F18B\";\n}\n.fa-pagelines:before {\n  content: \"\\F18C\";\n}\n.fa-stack-exchange:before {\n  content: \"\\F18D\";\n}\n.fa-arrow-circle-o-right:before {\n  content: \"\\F18E\";\n}\n.fa-arrow-circle-o-left:before {\n  content: \"\\F190\";\n}\n.fa-toggle-left:before,\n.fa-caret-square-o-left:before {\n  content: \"\\F191\";\n}\n.fa-dot-circle-o:before {\n  content: \"\\F192\";\n}\n.fa-wheelchair:before {\n  content: \"\\F193\";\n}\n.fa-vimeo-square:before {\n  content: \"\\F194\";\n}\n.fa-turkish-lira:before,\n.fa-try:before {\n  content: \"\\F195\";\n}\n.fa-plus-square-o:before {\n  content: \"\\F196\";\n}\n.fa-space-shuttle:before {\n  content: \"\\F197\";\n}\n.fa-slack:before {\n  content: \"\\F198\";\n}\n.fa-envelope-square:before {\n  content: \"\\F199\";\n}\n.fa-wordpress:before {\n  content: \"\\F19A\";\n}\n.fa-openid:before {\n  content: \"\\F19B\";\n}\n.fa-institution:before,\n.fa-bank:before,\n.fa-university:before {\n  content: \"\\F19C\";\n}\n.fa-mortar-board:before,\n.fa-graduation-cap:before {\n  content: \"\\F19D\";\n}\n.fa-yahoo:before {\n  content: \"\\F19E\";\n}\n.fa-google:before {\n  content: \"\\F1A0\";\n}\n.fa-reddit:before {\n  content: \"\\F1A1\";\n}\n.fa-reddit-square:before {\n  content: \"\\F1A2\";\n}\n.fa-stumbleupon-circle:before {\n  content: \"\\F1A3\";\n}\n.fa-stumbleupon:before {\n  content: \"\\F1A4\";\n}\n.fa-delicious:before {\n  content: \"\\F1A5\";\n}\n.fa-digg:before {\n  content: \"\\F1A6\";\n}\n.fa-pied-piper-pp:before {\n  content: \"\\F1A7\";\n}\n.fa-pied-piper-alt:before {\n  content: \"\\F1A8\";\n}\n.fa-drupal:before {\n  content: \"\\F1A9\";\n}\n.fa-joomla:before {\n  content: \"\\F1AA\";\n}\n.fa-language:before {\n  content: \"\\F1AB\";\n}\n.fa-fax:before {\n  content: \"\\F1AC\";\n}\n.fa-building:before {\n  content: \"\\F1AD\";\n}\n.fa-child:before {\n  content: \"\\F1AE\";\n}\n.fa-paw:before {\n  content: \"\\F1B0\";\n}\n.fa-spoon:before {\n  content: \"\\F1B1\";\n}\n.fa-cube:before {\n  content: \"\\F1B2\";\n}\n.fa-cubes:before {\n  content: \"\\F1B3\";\n}\n.fa-behance:before {\n  content: \"\\F1B4\";\n}\n.fa-behance-square:before {\n  content: \"\\F1B5\";\n}\n.fa-steam:before {\n  content: \"\\F1B6\";\n}\n.fa-steam-square:before {\n  content: \"\\F1B7\";\n}\n.fa-recycle:before {\n  content: \"\\F1B8\";\n}\n.fa-automobile:before,\n.fa-car:before {\n  content: \"\\F1B9\";\n}\n.fa-cab:before,\n.fa-taxi:before {\n  content: \"\\F1BA\";\n}\n.fa-tree:before {\n  content: \"\\F1BB\";\n}\n.fa-spotify:before {\n  content: \"\\F1BC\";\n}\n.fa-deviantart:before {\n  content: \"\\F1BD\";\n}\n.fa-soundcloud:before {\n  content: \"\\F1BE\";\n}\n.fa-database:before {\n  content: \"\\F1C0\";\n}\n.fa-file-pdf-o:before {\n  content: \"\\F1C1\";\n}\n.fa-file-word-o:before {\n  content: \"\\F1C2\";\n}\n.fa-file-excel-o:before {\n  content: \"\\F1C3\";\n}\n.fa-file-powerpoint-o:before {\n  content: \"\\F1C4\";\n}\n.fa-file-photo-o:before,\n.fa-file-picture-o:before,\n.fa-file-image-o:before {\n  content: \"\\F1C5\";\n}\n.fa-file-zip-o:before,\n.fa-file-archive-o:before {\n  content: \"\\F1C6\";\n}\n.fa-file-sound-o:before,\n.fa-file-audio-o:before {\n  content: \"\\F1C7\";\n}\n.fa-file-movie-o:before,\n.fa-file-video-o:before {\n  content: \"\\F1C8\";\n}\n.fa-file-code-o:before {\n  content: \"\\F1C9\";\n}\n.fa-vine:before {\n  content: \"\\F1CA\";\n}\n.fa-codepen:before {\n  content: \"\\F1CB\";\n}\n.fa-jsfiddle:before {\n  content: \"\\F1CC\";\n}\n.fa-life-bouy:before,\n.fa-life-buoy:before,\n.fa-life-saver:before,\n.fa-support:before,\n.fa-life-ring:before {\n  content: \"\\F1CD\";\n}\n.fa-circle-o-notch:before {\n  content: \"\\F1CE\";\n}\n.fa-ra:before,\n.fa-resistance:before,\n.fa-rebel:before {\n  content: \"\\F1D0\";\n}\n.fa-ge:before,\n.fa-empire:before {\n  content: \"\\F1D1\";\n}\n.fa-git-square:before {\n  content: \"\\F1D2\";\n}\n.fa-git:before {\n  content: \"\\F1D3\";\n}\n.fa-y-combinator-square:before,\n.fa-yc-square:before,\n.fa-hacker-news:before {\n  content: \"\\F1D4\";\n}\n.fa-tencent-weibo:before {\n  content: \"\\F1D5\";\n}\n.fa-qq:before {\n  content: \"\\F1D6\";\n}\n.fa-wechat:before,\n.fa-weixin:before {\n  content: \"\\F1D7\";\n}\n.fa-send:before,\n.fa-paper-plane:before {\n  content: \"\\F1D8\";\n}\n.fa-send-o:before,\n.fa-paper-plane-o:before {\n  content: \"\\F1D9\";\n}\n.fa-history:before {\n  content: \"\\F1DA\";\n}\n.fa-circle-thin:before {\n  content: \"\\F1DB\";\n}\n.fa-header:before {\n  content: \"\\F1DC\";\n}\n.fa-paragraph:before {\n  content: \"\\F1DD\";\n}\n.fa-sliders:before {\n  content: \"\\F1DE\";\n}\n.fa-share-alt:before {\n  content: \"\\F1E0\";\n}\n.fa-share-alt-square:before {\n  content: \"\\F1E1\";\n}\n.fa-bomb:before {\n  content: \"\\F1E2\";\n}\n.fa-soccer-ball-o:before,\n.fa-futbol-o:before {\n  content: \"\\F1E3\";\n}\n.fa-tty:before {\n  content: \"\\F1E4\";\n}\n.fa-binoculars:before {\n  content: \"\\F1E5\";\n}\n.fa-plug:before {\n  content: \"\\F1E6\";\n}\n.fa-slideshare:before {\n  content: \"\\F1E7\";\n}\n.fa-twitch:before {\n  content: \"\\F1E8\";\n}\n.fa-yelp:before {\n  content: \"\\F1E9\";\n}\n.fa-newspaper-o:before {\n  content: \"\\F1EA\";\n}\n.fa-wifi:before {\n  content: \"\\F1EB\";\n}\n.fa-calculator:before {\n  content: \"\\F1EC\";\n}\n.fa-paypal:before {\n  content: \"\\F1ED\";\n}\n.fa-google-wallet:before {\n  content: \"\\F1EE\";\n}\n.fa-cc-visa:before {\n  content: \"\\F1F0\";\n}\n.fa-cc-mastercard:before {\n  content: \"\\F1F1\";\n}\n.fa-cc-discover:before {\n  content: \"\\F1F2\";\n}\n.fa-cc-amex:before {\n  content: \"\\F1F3\";\n}\n.fa-cc-paypal:before {\n  content: \"\\F1F4\";\n}\n.fa-cc-stripe:before {\n  content: \"\\F1F5\";\n}\n.fa-bell-slash:before {\n  content: \"\\F1F6\";\n}\n.fa-bell-slash-o:before {\n  content: \"\\F1F7\";\n}\n.fa-trash:before {\n  content: \"\\F1F8\";\n}\n.fa-copyright:before {\n  content: \"\\F1F9\";\n}\n.fa-at:before {\n  content: \"\\F1FA\";\n}\n.fa-eyedropper:before {\n  content: \"\\F1FB\";\n}\n.fa-paint-brush:before {\n  content: \"\\F1FC\";\n}\n.fa-birthday-cake:before {\n  content: \"\\F1FD\";\n}\n.fa-area-chart:before {\n  content: \"\\F1FE\";\n}\n.fa-pie-chart:before {\n  content: \"\\F200\";\n}\n.fa-line-chart:before {\n  content: \"\\F201\";\n}\n.fa-lastfm:before {\n  content: \"\\F202\";\n}\n.fa-lastfm-square:before {\n  content: \"\\F203\";\n}\n.fa-toggle-off:before {\n  content: \"\\F204\";\n}\n.fa-toggle-on:before {\n  content: \"\\F205\";\n}\n.fa-bicycle:before {\n  content: \"\\F206\";\n}\n.fa-bus:before {\n  content: \"\\F207\";\n}\n.fa-ioxhost:before {\n  content: \"\\F208\";\n}\n.fa-angellist:before {\n  content: \"\\F209\";\n}\n.fa-cc:before {\n  content: \"\\F20A\";\n}\n.fa-shekel:before,\n.fa-sheqel:before,\n.fa-ils:before {\n  content: \"\\F20B\";\n}\n.fa-meanpath:before {\n  content: \"\\F20C\";\n}\n.fa-buysellads:before {\n  content: \"\\F20D\";\n}\n.fa-connectdevelop:before {\n  content: \"\\F20E\";\n}\n.fa-dashcube:before {\n  content: \"\\F210\";\n}\n.fa-forumbee:before {\n  content: \"\\F211\";\n}\n.fa-leanpub:before {\n  content: \"\\F212\";\n}\n.fa-sellsy:before {\n  content: \"\\F213\";\n}\n.fa-shirtsinbulk:before {\n  content: \"\\F214\";\n}\n.fa-simplybuilt:before {\n  content: \"\\F215\";\n}\n.fa-skyatlas:before {\n  content: \"\\F216\";\n}\n.fa-cart-plus:before {\n  content: \"\\F217\";\n}\n.fa-cart-arrow-down:before {\n  content: \"\\F218\";\n}\n.fa-diamond:before {\n  content: \"\\F219\";\n}\n.fa-ship:before {\n  content: \"\\F21A\";\n}\n.fa-user-secret:before {\n  content: \"\\F21B\";\n}\n.fa-motorcycle:before {\n  content: \"\\F21C\";\n}\n.fa-street-view:before {\n  content: \"\\F21D\";\n}\n.fa-heartbeat:before {\n  content: \"\\F21E\";\n}\n.fa-venus:before {\n  content: \"\\F221\";\n}\n.fa-mars:before {\n  content: \"\\F222\";\n}\n.fa-mercury:before {\n  content: \"\\F223\";\n}\n.fa-intersex:before,\n.fa-transgender:before {\n  content: \"\\F224\";\n}\n.fa-transgender-alt:before {\n  content: \"\\F225\";\n}\n.fa-venus-double:before {\n  content: \"\\F226\";\n}\n.fa-mars-double:before {\n  content: \"\\F227\";\n}\n.fa-venus-mars:before {\n  content: \"\\F228\";\n}\n.fa-mars-stroke:before {\n  content: \"\\F229\";\n}\n.fa-mars-stroke-v:before {\n  content: \"\\F22A\";\n}\n.fa-mars-stroke-h:before {\n  content: \"\\F22B\";\n}\n.fa-neuter:before {\n  content: \"\\F22C\";\n}\n.fa-genderless:before {\n  content: \"\\F22D\";\n}\n.fa-facebook-official:before {\n  content: \"\\F230\";\n}\n.fa-pinterest-p:before {\n  content: \"\\F231\";\n}\n.fa-whatsapp:before {\n  content: \"\\F232\";\n}\n.fa-server:before {\n  content: \"\\F233\";\n}\n.fa-user-plus:before {\n  content: \"\\F234\";\n}\n.fa-user-times:before {\n  content: \"\\F235\";\n}\n.fa-hotel:before,\n.fa-bed:before {\n  content: \"\\F236\";\n}\n.fa-viacoin:before {\n  content: \"\\F237\";\n}\n.fa-train:before {\n  content: \"\\F238\";\n}\n.fa-subway:before {\n  content: \"\\F239\";\n}\n.fa-medium:before {\n  content: \"\\F23A\";\n}\n.fa-yc:before,\n.fa-y-combinator:before {\n  content: \"\\F23B\";\n}\n.fa-optin-monster:before {\n  content: \"\\F23C\";\n}\n.fa-opencart:before {\n  content: \"\\F23D\";\n}\n.fa-expeditedssl:before {\n  content: \"\\F23E\";\n}\n.fa-battery-4:before,\n.fa-battery:before,\n.fa-battery-full:before {\n  content: \"\\F240\";\n}\n.fa-battery-3:before,\n.fa-battery-three-quarters:before {\n  content: \"\\F241\";\n}\n.fa-battery-2:before,\n.fa-battery-half:before {\n  content: \"\\F242\";\n}\n.fa-battery-1:before,\n.fa-battery-quarter:before {\n  content: \"\\F243\";\n}\n.fa-battery-0:before,\n.fa-battery-empty:before {\n  content: \"\\F244\";\n}\n.fa-mouse-pointer:before {\n  content: \"\\F245\";\n}\n.fa-i-cursor:before {\n  content: \"\\F246\";\n}\n.fa-object-group:before {\n  content: \"\\F247\";\n}\n.fa-object-ungroup:before {\n  content: \"\\F248\";\n}\n.fa-sticky-note:before {\n  content: \"\\F249\";\n}\n.fa-sticky-note-o:before {\n  content: \"\\F24A\";\n}\n.fa-cc-jcb:before {\n  content: \"\\F24B\";\n}\n.fa-cc-diners-club:before {\n  content: \"\\F24C\";\n}\n.fa-clone:before {\n  content: \"\\F24D\";\n}\n.fa-balance-scale:before {\n  content: \"\\F24E\";\n}\n.fa-hourglass-o:before {\n  content: \"\\F250\";\n}\n.fa-hourglass-1:before,\n.fa-hourglass-start:before {\n  content: \"\\F251\";\n}\n.fa-hourglass-2:before,\n.fa-hourglass-half:before {\n  content: \"\\F252\";\n}\n.fa-hourglass-3:before,\n.fa-hourglass-end:before {\n  content: \"\\F253\";\n}\n.fa-hourglass:before {\n  content: \"\\F254\";\n}\n.fa-hand-grab-o:before,\n.fa-hand-rock-o:before {\n  content: \"\\F255\";\n}\n.fa-hand-stop-o:before,\n.fa-hand-paper-o:before {\n  content: \"\\F256\";\n}\n.fa-hand-scissors-o:before {\n  content: \"\\F257\";\n}\n.fa-hand-lizard-o:before {\n  content: \"\\F258\";\n}\n.fa-hand-spock-o:before {\n  content: \"\\F259\";\n}\n.fa-hand-pointer-o:before {\n  content: \"\\F25A\";\n}\n.fa-hand-peace-o:before {\n  content: \"\\F25B\";\n}\n.fa-trademark:before {\n  content: \"\\F25C\";\n}\n.fa-registered:before {\n  content: \"\\F25D\";\n}\n.fa-creative-commons:before {\n  content: \"\\F25E\";\n}\n.fa-gg:before {\n  content: \"\\F260\";\n}\n.fa-gg-circle:before {\n  content: \"\\F261\";\n}\n.fa-tripadvisor:before {\n  content: \"\\F262\";\n}\n.fa-odnoklassniki:before {\n  content: \"\\F263\";\n}\n.fa-odnoklassniki-square:before {\n  content: \"\\F264\";\n}\n.fa-get-pocket:before {\n  content: \"\\F265\";\n}\n.fa-wikipedia-w:before {\n  content: \"\\F266\";\n}\n.fa-safari:before {\n  content: \"\\F267\";\n}\n.fa-chrome:before {\n  content: \"\\F268\";\n}\n.fa-firefox:before {\n  content: \"\\F269\";\n}\n.fa-opera:before {\n  content: \"\\F26A\";\n}\n.fa-internet-explorer:before {\n  content: \"\\F26B\";\n}\n.fa-tv:before,\n.fa-television:before {\n  content: \"\\F26C\";\n}\n.fa-contao:before {\n  content: \"\\F26D\";\n}\n.fa-500px:before {\n  content: \"\\F26E\";\n}\n.fa-amazon:before {\n  content: \"\\F270\";\n}\n.fa-calendar-plus-o:before {\n  content: \"\\F271\";\n}\n.fa-calendar-minus-o:before {\n  content: \"\\F272\";\n}\n.fa-calendar-times-o:before {\n  content: \"\\F273\";\n}\n.fa-calendar-check-o:before {\n  content: \"\\F274\";\n}\n.fa-industry:before {\n  content: \"\\F275\";\n}\n.fa-map-pin:before {\n  content: \"\\F276\";\n}\n.fa-map-signs:before {\n  content: \"\\F277\";\n}\n.fa-map-o:before {\n  content: \"\\F278\";\n}\n.fa-map:before {\n  content: \"\\F279\";\n}\n.fa-commenting:before {\n  content: \"\\F27A\";\n}\n.fa-commenting-o:before {\n  content: \"\\F27B\";\n}\n.fa-houzz:before {\n  content: \"\\F27C\";\n}\n.fa-vimeo:before {\n  content: \"\\F27D\";\n}\n.fa-black-tie:before {\n  content: \"\\F27E\";\n}\n.fa-fonticons:before {\n  content: \"\\F280\";\n}\n.fa-reddit-alien:before {\n  content: \"\\F281\";\n}\n.fa-edge:before {\n  content: \"\\F282\";\n}\n.fa-credit-card-alt:before {\n  content: \"\\F283\";\n}\n.fa-codiepie:before {\n  content: \"\\F284\";\n}\n.fa-modx:before {\n  content: \"\\F285\";\n}\n.fa-fort-awesome:before {\n  content: \"\\F286\";\n}\n.fa-usb:before {\n  content: \"\\F287\";\n}\n.fa-product-hunt:before {\n  content: \"\\F288\";\n}\n.fa-mixcloud:before {\n  content: \"\\F289\";\n}\n.fa-scribd:before {\n  content: \"\\F28A\";\n}\n.fa-pause-circle:before {\n  content: \"\\F28B\";\n}\n.fa-pause-circle-o:before {\n  content: \"\\F28C\";\n}\n.fa-stop-circle:before {\n  content: \"\\F28D\";\n}\n.fa-stop-circle-o:before {\n  content: \"\\F28E\";\n}\n.fa-shopping-bag:before {\n  content: \"\\F290\";\n}\n.fa-shopping-basket:before {\n  content: \"\\F291\";\n}\n.fa-hashtag:before {\n  content: \"\\F292\";\n}\n.fa-bluetooth:before {\n  content: \"\\F293\";\n}\n.fa-bluetooth-b:before {\n  content: \"\\F294\";\n}\n.fa-percent:before {\n  content: \"\\F295\";\n}\n.fa-gitlab:before {\n  content: \"\\F296\";\n}\n.fa-wpbeginner:before {\n  content: \"\\F297\";\n}\n.fa-wpforms:before {\n  content: \"\\F298\";\n}\n.fa-envira:before {\n  content: \"\\F299\";\n}\n.fa-universal-access:before {\n  content: \"\\F29A\";\n}\n.fa-wheelchair-alt:before {\n  content: \"\\F29B\";\n}\n.fa-question-circle-o:before {\n  content: \"\\F29C\";\n}\n.fa-blind:before {\n  content: \"\\F29D\";\n}\n.fa-audio-description:before {\n  content: \"\\F29E\";\n}\n.fa-volume-control-phone:before {\n  content: \"\\F2A0\";\n}\n.fa-braille:before {\n  content: \"\\F2A1\";\n}\n.fa-assistive-listening-systems:before {\n  content: \"\\F2A2\";\n}\n.fa-asl-interpreting:before,\n.fa-american-sign-language-interpreting:before {\n  content: \"\\F2A3\";\n}\n.fa-deafness:before,\n.fa-hard-of-hearing:before,\n.fa-deaf:before {\n  content: \"\\F2A4\";\n}\n.fa-glide:before {\n  content: \"\\F2A5\";\n}\n.fa-glide-g:before {\n  content: \"\\F2A6\";\n}\n.fa-signing:before,\n.fa-sign-language:before {\n  content: \"\\F2A7\";\n}\n.fa-low-vision:before {\n  content: \"\\F2A8\";\n}\n.fa-viadeo:before {\n  content: \"\\F2A9\";\n}\n.fa-viadeo-square:before {\n  content: \"\\F2AA\";\n}\n.fa-snapchat:before {\n  content: \"\\F2AB\";\n}\n.fa-snapchat-ghost:before {\n  content: \"\\F2AC\";\n}\n.fa-snapchat-square:before {\n  content: \"\\F2AD\";\n}\n.fa-pied-piper:before {\n  content: \"\\F2AE\";\n}\n.fa-first-order:before {\n  content: \"\\F2B0\";\n}\n.fa-yoast:before {\n  content: \"\\F2B1\";\n}\n.fa-themeisle:before {\n  content: \"\\F2B2\";\n}\n.fa-google-plus-circle:before,\n.fa-google-plus-official:before {\n  content: \"\\F2B3\";\n}\n.fa-fa:before,\n.fa-font-awesome:before {\n  content: \"\\F2B4\";\n}\n.fa-handshake-o:before {\n  content: \"\\F2B5\";\n}\n.fa-envelope-open:before {\n  content: \"\\F2B6\";\n}\n.fa-envelope-open-o:before {\n  content: \"\\F2B7\";\n}\n.fa-linode:before {\n  content: \"\\F2B8\";\n}\n.fa-address-book:before {\n  content: \"\\F2B9\";\n}\n.fa-address-book-o:before {\n  content: \"\\F2BA\";\n}\n.fa-vcard:before,\n.fa-address-card:before {\n  content: \"\\F2BB\";\n}\n.fa-vcard-o:before,\n.fa-address-card-o:before {\n  content: \"\\F2BC\";\n}\n.fa-user-circle:before {\n  content: \"\\F2BD\";\n}\n.fa-user-circle-o:before {\n  content: \"\\F2BE\";\n}\n.fa-user-o:before {\n  content: \"\\F2C0\";\n}\n.fa-id-badge:before {\n  content: \"\\F2C1\";\n}\n.fa-drivers-license:before,\n.fa-id-card:before {\n  content: \"\\F2C2\";\n}\n.fa-drivers-license-o:before,\n.fa-id-card-o:before {\n  content: \"\\F2C3\";\n}\n.fa-quora:before {\n  content: \"\\F2C4\";\n}\n.fa-free-code-camp:before {\n  content: \"\\F2C5\";\n}\n.fa-telegram:before {\n  content: \"\\F2C6\";\n}\n.fa-thermometer-4:before,\n.fa-thermometer:before,\n.fa-thermometer-full:before {\n  content: \"\\F2C7\";\n}\n.fa-thermometer-3:before,\n.fa-thermometer-three-quarters:before {\n  content: \"\\F2C8\";\n}\n.fa-thermometer-2:before,\n.fa-thermometer-half:before {\n  content: \"\\F2C9\";\n}\n.fa-thermometer-1:before,\n.fa-thermometer-quarter:before {\n  content: \"\\F2CA\";\n}\n.fa-thermometer-0:before,\n.fa-thermometer-empty:before {\n  content: \"\\F2CB\";\n}\n.fa-shower:before {\n  content: \"\\F2CC\";\n}\n.fa-bathtub:before,\n.fa-s15:before,\n.fa-bath:before {\n  content: \"\\F2CD\";\n}\n.fa-podcast:before {\n  content: \"\\F2CE\";\n}\n.fa-window-maximize:before {\n  content: \"\\F2D0\";\n}\n.fa-window-minimize:before {\n  content: \"\\F2D1\";\n}\n.fa-window-restore:before {\n  content: \"\\F2D2\";\n}\n.fa-times-rectangle:before,\n.fa-window-close:before {\n  content: \"\\F2D3\";\n}\n.fa-times-rectangle-o:before,\n.fa-window-close-o:before {\n  content: \"\\F2D4\";\n}\n.fa-bandcamp:before {\n  content: \"\\F2D5\";\n}\n.fa-grav:before {\n  content: \"\\F2D6\";\n}\n.fa-etsy:before {\n  content: \"\\F2D7\";\n}\n.fa-imdb:before {\n  content: \"\\F2D8\";\n}\n.fa-ravelry:before {\n  content: \"\\F2D9\";\n}\n.fa-eercast:before {\n  content: \"\\F2DA\";\n}\n.fa-microchip:before {\n  content: \"\\F2DB\";\n}\n.fa-snowflake-o:before {\n  content: \"\\F2DC\";\n}\n.fa-superpowers:before {\n  content: \"\\F2DD\";\n}\n.fa-wpexplorer:before {\n  content: \"\\F2DE\";\n}\n.fa-meetup:before {\n  content: \"\\F2E0\";\n}\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  border: 0;\n}\n.sr-only-focusable:active,\n.sr-only-focusable:focus {\n  position: static;\n  width: auto;\n  height: auto;\n  margin: 0;\n  overflow: visible;\n  clip: auto;\n}\n", ""]);
	
	// exports


/***/ }),
/* 6 */
/***/ (function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function(useSourceMap) {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			return this.map(function (item) {
				var content = cssWithMappingToString(item, useSourceMap);
				if(item[2]) {
					return "@media " + item[2] + "{" + content + "}";
				} else {
					return content;
				}
			}).join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};
	
	function cssWithMappingToString(item, useSourceMap) {
		var content = item[1] || '';
		var cssMapping = item[3];
		if (!cssMapping) {
			return content;
		}
	
		if (useSourceMap && typeof btoa === 'function') {
			var sourceMapping = toComment(cssMapping);
			var sourceURLs = cssMapping.sources.map(function (source) {
				return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
			});
	
			return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
		}
	
		return [content].join('\n');
	}
	
	// Adapted from convert-source-map (MIT)
	function toComment(sourceMap) {
		// eslint-disable-next-line no-undef
		var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
		var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;
	
		return '/*# ' + data + ' */';
	}


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "674f50d287a8c48dc19ba404d20fe713.eot";

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "674f50d287a8c48dc19ba404d20fe713.eot";

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "af7ae505a9eed503f8b8e6982036873e.woff2";

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "fee66e712a8a08eef5805a46892932ad.woff";

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "b06871f281fee6b241d60582ae9369b9.ttf";

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "912ec66d7572ff821749319396470bde.svg";

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	
	var stylesInDom = {};
	
	var	memoize = function (fn) {
		var memo;
	
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	};
	
	var isOldIE = memoize(function () {
		// Test for IE <= 9 as proposed by Browserhacks
		// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
		// Tests for existence of standard globals is to allow style-loader
		// to operate correctly into non-standard environments
		// @see https://github.com/webpack-contrib/style-loader/issues/177
		return window && document && document.all && !window.atob;
	});
	
	var getElement = (function (fn) {
		var memo = {};
	
		return function(selector) {
			if (typeof memo[selector] === "undefined") {
				memo[selector] = fn.call(this, selector);
			}
	
			return memo[selector]
		};
	})(function (target) {
		return document.querySelector(target)
	});
	
	var singleton = null;
	var	singletonCounter = 0;
	var	stylesInsertedAtTop = [];
	
	var	fixUrls = __webpack_require__(14);
	
	module.exports = function(list, options) {
		if (false) {
			if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
	
		options.attrs = typeof options.attrs === "object" ? options.attrs : {};
	
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (!options.singleton) options.singleton = isOldIE();
	
		// By default, add <style> tags to the <head> element
		if (!options.insertInto) options.insertInto = "head";
	
		// By default, add <style> tags to the bottom of the target
		if (!options.insertAt) options.insertAt = "bottom";
	
		var styles = listToStyles(list, options);
	
		addStylesToDom(styles, options);
	
		return function update (newList) {
			var mayRemove = [];
	
			for (var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
	
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
	
			if(newList) {
				var newStyles = listToStyles(newList, options);
				addStylesToDom(newStyles, options);
			}
	
			for (var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
	
				if(domStyle.refs === 0) {
					for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();
	
					delete stylesInDom[domStyle.id];
				}
			}
		};
	};
	
	function addStylesToDom (styles, options) {
		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
	
			if(domStyle) {
				domStyle.refs++;
	
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
	
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
	
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
	
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles (list, options) {
		var styles = [];
		var newStyles = {};
	
		for (var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = options.base ? item[0] + options.base : item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
	
			if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
			else newStyles[id].parts.push(part);
		}
	
		return styles;
	}
	
	function insertStyleElement (options, style) {
		var target = getElement(options.insertInto)
	
		if (!target) {
			throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
		}
	
		var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];
	
		if (options.insertAt === "top") {
			if (!lastStyleElementInsertedAtTop) {
				target.insertBefore(style, target.firstChild);
			} else if (lastStyleElementInsertedAtTop.nextSibling) {
				target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				target.appendChild(style);
			}
			stylesInsertedAtTop.push(style);
		} else if (options.insertAt === "bottom") {
			target.appendChild(style);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement (style) {
		if (style.parentNode === null) return false;
		style.parentNode.removeChild(style);
	
		var idx = stylesInsertedAtTop.indexOf(style);
		if(idx >= 0) {
			stylesInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement (options) {
		var style = document.createElement("style");
	
		options.attrs.type = "text/css";
	
		addAttrs(style, options.attrs);
		insertStyleElement(options, style);
	
		return style;
	}
	
	function createLinkElement (options) {
		var link = document.createElement("link");
	
		options.attrs.type = "text/css";
		options.attrs.rel = "stylesheet";
	
		addAttrs(link, options.attrs);
		insertStyleElement(options, link);
	
		return link;
	}
	
	function addAttrs (el, attrs) {
		Object.keys(attrs).forEach(function (key) {
			el.setAttribute(key, attrs[key]);
		});
	}
	
	function addStyle (obj, options) {
		var style, update, remove, result;
	
		// If a transform function was defined, run it on the css
		if (options.transform && obj.css) {
		    result = options.transform(obj.css);
	
		    if (result) {
		    	// If transform returns a value, use that instead of the original css.
		    	// This allows running runtime transformations on the css.
		    	obj.css = result;
		    } else {
		    	// If the transform function returns a falsy value, don't add this css.
		    	// This allows conditional loading of css
		    	return function() {
		    		// noop
		    	};
		    }
		}
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
	
			style = singleton || (singleton = createStyleElement(options));
	
			update = applyToSingletonTag.bind(null, style, styleIndex, false);
			remove = applyToSingletonTag.bind(null, style, styleIndex, true);
	
		} else if (
			obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function"
		) {
			style = createLinkElement(options);
			update = updateLink.bind(null, style, options);
			remove = function () {
				removeStyleElement(style);
	
				if(style.href) URL.revokeObjectURL(style.href);
			};
		} else {
			style = createStyleElement(options);
			update = applyToTag.bind(null, style);
			remove = function () {
				removeStyleElement(style);
			};
		}
	
		update(obj);
	
		return function updateStyle (newObj) {
			if (newObj) {
				if (
					newObj.css === obj.css &&
					newObj.media === obj.media &&
					newObj.sourceMap === obj.sourceMap
				) {
					return;
				}
	
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
	
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag (style, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (style.styleSheet) {
			style.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = style.childNodes;
	
			if (childNodes[index]) style.removeChild(childNodes[index]);
	
			if (childNodes.length) {
				style.insertBefore(cssNode, childNodes[index]);
			} else {
				style.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag (style, obj) {
		var css = obj.css;
		var media = obj.media;
	
		if(media) {
			style.setAttribute("media", media)
		}
	
		if(style.styleSheet) {
			style.styleSheet.cssText = css;
		} else {
			while(style.firstChild) {
				style.removeChild(style.firstChild);
			}
	
			style.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink (link, options, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;
	
		/*
			If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
			and there is no publicPath defined then lets turn convertToAbsoluteUrls
			on by default.  Otherwise default to the convertToAbsoluteUrls option
			directly
		*/
		var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;
	
		if (options.convertToAbsoluteUrls || autoFixUrls) {
			css = fixUrls(css);
		}
	
		if (sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = link.href;
	
		link.href = URL.createObjectURL(blob);
	
		if(oldSrc) URL.revokeObjectURL(oldSrc);
	}


/***/ }),
/* 14 */
/***/ (function(module, exports) {

	
	/**
	 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
	 * embed the css on the page. This breaks all relative urls because now they are relative to a
	 * bundle instead of the current page.
	 *
	 * One solution is to only use full urls, but that may be impossible.
	 *
	 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
	 *
	 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
	 *
	 */
	
	module.exports = function (css) {
	  // get current location
	  var location = typeof window !== "undefined" && window.location;
	
	  if (!location) {
	    throw new Error("fixUrls requires window.location");
	  }
	
		// blank or null?
		if (!css || typeof css !== "string") {
		  return css;
	  }
	
	  var baseUrl = location.protocol + "//" + location.host;
	  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");
	
		// convert each url(...)
		/*
		This regular expression is just a way to recursively match brackets within
		a string.
	
		 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
		   (  = Start a capturing group
		     (?:  = Start a non-capturing group
		         [^)(]  = Match anything that isn't a parentheses
		         |  = OR
		         \(  = Match a start parentheses
		             (?:  = Start another non-capturing groups
		                 [^)(]+  = Match anything that isn't a parentheses
		                 |  = OR
		                 \(  = Match a start parentheses
		                     [^)(]*  = Match anything that isn't a parentheses
		                 \)  = Match a end parentheses
		             )  = End Group
	              *\) = Match anything and then a close parens
	          )  = Close non-capturing group
	          *  = Match anything
	       )  = Close capturing group
		 \)  = Match a close parens
	
		 /gi  = Get all matches, not the first.  Be case insensitive.
		 */
		var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
			// strip quotes (if they exist)
			var unquotedOrigUrl = origUrl
				.trim()
				.replace(/^"(.*)"$/, function(o, $1){ return $1; })
				.replace(/^'(.*)'$/, function(o, $1){ return $1; });
	
			// already a full url? no change
			if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
			  return fullMatch;
			}
	
			// convert the url to a full url
			var newUrl;
	
			if (unquotedOrigUrl.indexOf("//") === 0) {
			  	//TODO: should we add protocol?
				newUrl = unquotedOrigUrl;
			} else if (unquotedOrigUrl.indexOf("/") === 0) {
				// path should be relative to the base url
				newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
			} else {
				// path should be relative to current directory
				newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
			}
	
			// send back the fixed url(...)
			return "url(" + JSON.stringify(newUrl) + ")";
		});
	
		// send back the fixed css
		return fixedCss;
	};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(16);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// Prepare cssTransformation
	var transform;
	
	var options = {}
	options.transform = transform
	// add the styles to the DOM
	var update = __webpack_require__(13)(content, options);
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../css-loader/index.js!../../../postcss-loader/index.js!./index.css", function() {
				var newContent = require("!!../../../css-loader/index.js!../../../postcss-loader/index.js!./index.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)(undefined);
	// imports
	exports.push([module.id, "@import url(https://fonts.googleapis.com/css?family=Roboto+Mono);", ""]);
	
	// module
	exports.push([module.id, "\n/*-----------------------------------------------------------------------------\n| Copyright (c) Jupyter Development Team.\n| Distributed under the terms of the Modified BSD License.\n|----------------------------------------------------------------------------*/\n/**\n * The material design colors are adapted from google-material-color v1.2.6\n * https://github.com/danlevan/google-material-color\n * https://github.com/danlevan/google-material-color/blob/f67ca5f4028b2f1b34862f64b0ca67323f91b088/dist/palette.var.css\n *\n * The license for the material design color CSS variables is as follows (see\n * https://github.com/danlevan/google-material-color/blob/f67ca5f4028b2f1b34862f64b0ca67323f91b088/LICENSE)\n *\n * The MIT License (MIT)\n *\n * Copyright (c) 2014 Dan Le Van\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n * SOFTWARE.\n */\n/*\nThe following CSS variables define the main, public API for styling JupyterLab.\nThese variables should be used by all plugins wherever possible. In other\nwords, plugins should not define custom colors, sizes, etc unless absolutely\nnecessary. This enables users to change the visual theme of JupyterLab\nby changing these variables.\n\nMany variables appear in an ordered sequence (0,1,2,3). These sequences\nare designed to work well together, so for example, `--jp-border-color1` should\nbe used with `--jp-layout-color1`. The numbers have the following meanings:\n\n* 0: super-primary, reserved for special emphasis\n* 1: primary, most important under normal situations\n* 2: secondary, next most important under normal situations\n* 3: tertiary, next most important under normal situations\n\nThroughout JupyterLab, we are mostly following principles from Google's\nMaterial Design when selecting colors. We are not, however, following\nall of MD as it is not optimized for dense, information rich UIs.\n*/\n/*\n * Optional monospace font for input/output prompt.\n */\n/*\n * Added for compabitility with output area\n */\n:root {\n\n  /* Borders\n\n  The following variables, specify the visual styling of borders in JupyterLab.\n   */\n\n  /* UI Fonts\n\n  The UI font CSS variables are used for the typography all of the JupyterLab\n  user interface elements that are not directly user generated content.\n  */ /* Base font size */ /* Ensures px perfect FontAwesome icons */\n\n  /* Use these font colors against the corresponding main layout colors.\n     In a light theme, these go from dark to light.\n  */\n\n  /* Use these against the brand/accent/warn/error colors.\n     These will typically go from light to darker, in both a dark and light theme\n   */\n\n  /* Content Fonts\n\n  Content font variables are used for typography of user generated content.\n  */ /* Base font size */\n\n\n  /* Layout\n\n  The following are the main layout colors use in JupyterLab. In a light\n  theme these would go from light to dark.\n  */\n\n  /* Brand/accent */\n\n  /* State colors (warn, error, success, info) */\n\n  /* Cell specific styles */\n  /* A custom blend of MD grey and blue 600\n   * See https://meyerweb.com/eric/tools/color-blend/#546E7A:1E88E5:5:hex */\n  /* A custom blend of MD grey and orange 600\n   * https://meyerweb.com/eric/tools/color-blend/#546E7A:F4511E:5:hex */\n\n  /* Notebook specific styles */\n\n  /* Console specific styles */\n\n  /* Toolbar specific styles */\n}\n/*-----------------------------------------------------------------------------\r\n| Copyright (c) 2014-2017, PhosphorJS Contributors\r\n|\r\n| Distributed under the terms of the BSD 3-Clause License.\r\n|\r\n| The full license is in the file LICENSE, distributed with this software.\r\n|----------------------------------------------------------------------------*/\n/*-----------------------------------------------------------------------------\r\n| Copyright (c) 2014-2017, PhosphorJS Contributors\r\n|\r\n| Distributed under the terms of the BSD 3-Clause License.\r\n|\r\n| The full license is in the file LICENSE, distributed with this software.\r\n|----------------------------------------------------------------------------*/\n.p-Widget {\r\n  box-sizing: border-box;\r\n  position: relative;\r\n  overflow: hidden;\r\n  cursor: default;\r\n}\n.p-Widget.p-mod-hidden {\r\n  display: none !important;\r\n}\n/*-----------------------------------------------------------------------------\r\n| Copyright (c) 2014-2017, PhosphorJS Contributors\r\n|\r\n| Distributed under the terms of the BSD 3-Clause License.\r\n|\r\n| The full license is in the file LICENSE, distributed with this software.\r\n|----------------------------------------------------------------------------*/\n.p-CommandPalette {\r\n  display: -webkit-box;\r\n  display: -ms-flexbox;\r\n  display: flex;\r\n  -webkit-box-orient: vertical;\r\n  -webkit-box-direction: normal;\r\n      -ms-flex-direction: column;\r\n          flex-direction: column;\r\n  -webkit-user-select: none;\r\n  -moz-user-select: none;\r\n  -ms-user-select: none;\r\n  user-select: none;\r\n}\n.p-CommandPalette-search {\r\n  -webkit-box-flex: 0;\r\n      -ms-flex: 0 0 auto;\r\n          flex: 0 0 auto;\r\n}\n.p-CommandPalette-content {\r\n  -webkit-box-flex: 1;\r\n      -ms-flex: 1 1 auto;\r\n          flex: 1 1 auto;\r\n  margin: 0;\r\n  padding: 0;\r\n  min-height: 0;\r\n  overflow: auto;\r\n  list-style-type: none;\r\n}\n.p-CommandPalette-header {\r\n  overflow: hidden;\r\n  white-space: nowrap;\r\n  text-overflow: ellipsis;\r\n}\n.p-CommandPalette-itemShortcut {\r\n  float: right;\r\n}\n.p-CommandPalette-itemLabel {\r\n  overflow: hidden;\r\n  white-space: nowrap;\r\n  text-overflow: ellipsis;\r\n}\n/*-----------------------------------------------------------------------------\r\n| Copyright (c) 2014-2017, PhosphorJS Contributors\r\n|\r\n| Distributed under the terms of the BSD 3-Clause License.\r\n|\r\n| The full license is in the file LICENSE, distributed with this software.\r\n|----------------------------------------------------------------------------*/\n.p-DockPanel {\r\n  z-index: 0;\r\n}\n.p-DockPanel-widget {\r\n  z-index: 0;\r\n}\n.p-DockPanel-tabBar {\r\n  z-index: 1;\r\n}\n.p-DockPanel-handle {\r\n  z-index: 2;\r\n}\n.p-DockPanel-handle.p-mod-hidden {\r\n  display: none !important;\r\n}\n.p-DockPanel-handle:after {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n  content: '';\r\n}\n.p-DockPanel-handle[data-orientation='horizontal'] {\r\n  cursor: ew-resize;\r\n}\n.p-DockPanel-handle[data-orientation='vertical'] {\r\n  cursor: ns-resize;\r\n}\n.p-DockPanel-handle[data-orientation='horizontal']:after {\r\n  left: 50%;\r\n  min-width: 8px;\r\n  -webkit-transform: translateX(-50%);\r\n          transform: translateX(-50%);\r\n}\n.p-DockPanel-handle[data-orientation='vertical']:after {\r\n  top: 50%;\r\n  min-height: 8px;\r\n  -webkit-transform: translateY(-50%);\r\n          transform: translateY(-50%);\r\n}\n.p-DockPanel-overlay {\r\n  z-index: 3;\r\n  box-sizing: border-box;\r\n  pointer-events: none;\r\n}\n.p-DockPanel-overlay.p-mod-hidden {\r\n  display: none !important;\r\n}\n/*-----------------------------------------------------------------------------\r\n| Copyright (c) 2014-2017, PhosphorJS Contributors\r\n|\r\n| Distributed under the terms of the BSD 3-Clause License.\r\n|\r\n| The full license is in the file LICENSE, distributed with this software.\r\n|----------------------------------------------------------------------------*/\n.p-Menu {\r\n  z-index: 10000;\r\n  position: absolute;\r\n  white-space: nowrap;\r\n  overflow-x: hidden;\r\n  overflow-y: auto;\r\n  outline: none;\r\n  -webkit-user-select: none;\r\n  -moz-user-select: none;\r\n  -ms-user-select: none;\r\n  user-select: none;\r\n}\n.p-Menu-content {\r\n  margin: 0;\r\n  padding: 0;\r\n  display: table;\r\n  list-style-type: none;\r\n}\n.p-Menu-item {\r\n  display: table-row;\r\n}\n.p-Menu-item.p-mod-hidden,\r\n.p-Menu-item.p-mod-collapsed {\r\n  display: none !important;\r\n}\n.p-Menu-itemIcon,\r\n.p-Menu-itemSubmenuIcon {\r\n  display: table-cell;\r\n  text-align: center;\r\n}\n.p-Menu-itemLabel {\r\n  display: table-cell;\r\n  text-align: left;\r\n}\n.p-Menu-itemShortcut {\r\n  display: table-cell;\r\n  text-align: right;\r\n}\n/*-----------------------------------------------------------------------------\r\n| Copyright (c) 2014-2017, PhosphorJS Contributors\r\n|\r\n| Distributed under the terms of the BSD 3-Clause License.\r\n|\r\n| The full license is in the file LICENSE, distributed with this software.\r\n|----------------------------------------------------------------------------*/\n.p-MenuBar {\r\n  outline: none;\r\n  -webkit-user-select: none;\r\n  -moz-user-select: none;\r\n  -ms-user-select: none;\r\n  user-select: none;\r\n}\n.p-MenuBar-content {\r\n  margin: 0;\r\n  padding: 0;\r\n  display: -webkit-box;\r\n  display: -ms-flexbox;\r\n  display: flex;\r\n  -webkit-box-orient: horizontal;\r\n  -webkit-box-direction: normal;\r\n      -ms-flex-direction: row;\r\n          flex-direction: row;\r\n  list-style-type: none;\r\n}\n.p-MenuBar-item {\r\n  box-sizing: border-box;\r\n}\n.p-MenuBar-itemIcon,\r\n.p-MenuBar-itemLabel {\r\n  display: inline-block;\r\n}\n/*-----------------------------------------------------------------------------\r\n| Copyright (c) 2014-2017, PhosphorJS Contributors\r\n|\r\n| Distributed under the terms of the BSD 3-Clause License.\r\n|\r\n| The full license is in the file LICENSE, distributed with this software.\r\n|----------------------------------------------------------------------------*/\n.p-ScrollBar {\r\n  display: -webkit-box;\r\n  display: -ms-flexbox;\r\n  display: flex;\r\n  -webkit-user-select: none;\r\n  -moz-user-select: none;\r\n  -ms-user-select: none;\r\n  user-select: none;\r\n}\n.p-ScrollBar[data-orientation='horizontal'] {\r\n  -webkit-box-orient: horizontal;\r\n  -webkit-box-direction: normal;\r\n      -ms-flex-direction: row;\r\n          flex-direction: row;\r\n}\n.p-ScrollBar[data-orientation='vertical'] {\r\n  -webkit-box-orient: vertical;\r\n  -webkit-box-direction: normal;\r\n      -ms-flex-direction: column;\r\n          flex-direction: column;\r\n}\n.p-ScrollBar-button {\r\n  box-sizing: border-box;\r\n  -webkit-box-flex: 0;\r\n      -ms-flex: 0 0 auto;\r\n          flex: 0 0 auto;\r\n}\n.p-ScrollBar-track {\r\n  box-sizing: border-box;\r\n  position: relative;\r\n  overflow: hidden;\r\n  -webkit-box-flex: 1;\r\n      -ms-flex: 1 1 auto;\r\n          flex: 1 1 auto;\r\n}\n.p-ScrollBar-thumb {\r\n  box-sizing: border-box;\r\n  position: absolute;\r\n}\n/*-----------------------------------------------------------------------------\r\n| Copyright (c) 2014-2017, PhosphorJS Contributors\r\n|\r\n| Distributed under the terms of the BSD 3-Clause License.\r\n|\r\n| The full license is in the file LICENSE, distributed with this software.\r\n|----------------------------------------------------------------------------*/\n.p-SplitPanel-child {\r\n  z-index: 0;\r\n}\n.p-SplitPanel-handle {\r\n  z-index: 1;\r\n}\n.p-SplitPanel-handle.p-mod-hidden {\r\n  display: none !important;\r\n}\n.p-SplitPanel-handle:after {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n  content: '';\r\n}\n.p-SplitPanel[data-orientation='horizontal'] > .p-SplitPanel-handle {\r\n  cursor: ew-resize;\r\n}\n.p-SplitPanel[data-orientation='vertical'] > .p-SplitPanel-handle {\r\n  cursor: ns-resize;\r\n}\n.p-SplitPanel[data-orientation='horizontal'] > .p-SplitPanel-handle:after {\r\n  left: 50%;\r\n  min-width: 8px;\r\n  -webkit-transform: translateX(-50%);\r\n          transform: translateX(-50%);\r\n}\n.p-SplitPanel[data-orientation='vertical'] > .p-SplitPanel-handle:after {\r\n  top: 50%;\r\n  min-height: 8px;\r\n  -webkit-transform: translateY(-50%);\r\n          transform: translateY(-50%);\r\n}\n/*-----------------------------------------------------------------------------\r\n| Copyright (c) 2014-2017, PhosphorJS Contributors\r\n|\r\n| Distributed under the terms of the BSD 3-Clause License.\r\n|\r\n| The full license is in the file LICENSE, distributed with this software.\r\n|----------------------------------------------------------------------------*/\n.p-TabBar {\r\n  display: -webkit-box;\r\n  display: -ms-flexbox;\r\n  display: flex;\r\n  -webkit-user-select: none;\r\n  -moz-user-select: none;\r\n  -ms-user-select: none;\r\n  user-select: none;\r\n}\n.p-TabBar[data-orientation='horizontal'] {\r\n  -webkit-box-orient: horizontal;\r\n  -webkit-box-direction: normal;\r\n      -ms-flex-direction: row;\r\n          flex-direction: row;\r\n}\n.p-TabBar[data-orientation='vertical'] {\r\n  -webkit-box-orient: vertical;\r\n  -webkit-box-direction: normal;\r\n      -ms-flex-direction: column;\r\n          flex-direction: column;\r\n}\n.p-TabBar-content {\r\n  margin: 0;\r\n  padding: 0;\r\n  display: -webkit-box;\r\n  display: -ms-flexbox;\r\n  display: flex;\r\n  -webkit-box-flex: 1;\r\n      -ms-flex: 1 1 auto;\r\n          flex: 1 1 auto;\r\n  list-style-type: none;\r\n}\n.p-TabBar[data-orientation='horizontal'] > .p-TabBar-content {\r\n  -webkit-box-orient: horizontal;\r\n  -webkit-box-direction: normal;\r\n      -ms-flex-direction: row;\r\n          flex-direction: row;\r\n}\n.p-TabBar[data-orientation='vertical'] > .p-TabBar-content {\r\n  -webkit-box-orient: vertical;\r\n  -webkit-box-direction: normal;\r\n      -ms-flex-direction: column;\r\n          flex-direction: column;\r\n}\n.p-TabBar-tab {\r\n  display: -webkit-box;\r\n  display: -ms-flexbox;\r\n  display: flex;\r\n  -webkit-box-orient: horizontal;\r\n  -webkit-box-direction: normal;\r\n      -ms-flex-direction: row;\r\n          flex-direction: row;\r\n  box-sizing: border-box;\r\n  overflow: hidden;\r\n}\n.p-TabBar-tabIcon,\r\n.p-TabBar-tabCloseIcon {\r\n  -webkit-box-flex: 0;\r\n      -ms-flex: 0 0 auto;\r\n          flex: 0 0 auto;\r\n}\n.p-TabBar-tabLabel {\r\n  -webkit-box-flex: 1;\r\n      -ms-flex: 1 1 auto;\r\n          flex: 1 1 auto;\r\n  overflow: hidden;\r\n  white-space: nowrap;\r\n}\n.p-TabBar-tab.p-mod-hidden {\r\n  display: none !important;\r\n}\n.p-TabBar.p-mod-dragging .p-TabBar-tab {\r\n  position: relative;\r\n}\n.p-TabBar.p-mod-dragging[data-orientation='horizontal'] .p-TabBar-tab {\r\n  left: 0;\r\n  transition: left 150ms ease;\r\n}\n.p-TabBar.p-mod-dragging[data-orientation='vertical'] .p-TabBar-tab {\r\n  top: 0;\r\n  transition: top 150ms ease;\r\n}\n.p-TabBar.p-mod-dragging .p-TabBar-tab.p-mod-dragging {\r\n  transition: none;\r\n}\n/*-----------------------------------------------------------------------------\r\n| Copyright (c) 2014-2017, PhosphorJS Contributors\r\n|\r\n| Distributed under the terms of the BSD 3-Clause License.\r\n|\r\n| The full license is in the file LICENSE, distributed with this software.\r\n|----------------------------------------------------------------------------*/\n.p-TabPanel-tabBar {\r\n  z-index: 1;\r\n}\n.p-TabPanel-stackedPanel {\r\n  z-index: 0;\r\n}\r\n", ""]);
	
	// exports


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(18);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// Prepare cssTransformation
	var transform;
	
	var options = {}
	options.transform = transform
	// add the styles to the DOM
	var update = __webpack_require__(13)(content, options);
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/postcss-loader/index.js!./widgets.built.css", function() {
				var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/postcss-loader/index.js!./widgets.built.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)(undefined);
	// imports
	exports.push([module.id, "@import url(https://fonts.googleapis.com/css?family=Roboto+Mono);", ""]);
	
	// module
	exports.push([module.id, "\n/*-----------------------------------------------------------------------------\n| Copyright (c) Jupyter Development Team.\n| Distributed under the terms of the Modified BSD License.\n|----------------------------------------------------------------------------*/\n/**\n * The material design colors are adapted from google-material-color v1.2.6\n * https://github.com/danlevan/google-material-color\n * https://github.com/danlevan/google-material-color/blob/f67ca5f4028b2f1b34862f64b0ca67323f91b088/dist/palette.var.css\n *\n * The license for the material design color CSS variables is as follows (see\n * https://github.com/danlevan/google-material-color/blob/f67ca5f4028b2f1b34862f64b0ca67323f91b088/LICENSE)\n *\n * The MIT License (MIT)\n *\n * Copyright (c) 2014 Dan Le Van\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n * SOFTWARE.\n */\n/*\nThe following CSS variables define the main, public API for styling JupyterLab.\nThese variables should be used by all plugins wherever possible. In other\nwords, plugins should not define custom colors, sizes, etc unless absolutely\nnecessary. This enables users to change the visual theme of JupyterLab\nby changing these variables.\n\nMany variables appear in an ordered sequence (0,1,2,3). These sequences\nare designed to work well together, so for example, `--jp-border-color1` should\nbe used with `--jp-layout-color1`. The numbers have the following meanings:\n\n* 0: super-primary, reserved for special emphasis\n* 1: primary, most important under normal situations\n* 2: secondary, next most important under normal situations\n* 3: tertiary, next most important under normal situations\n\nThroughout JupyterLab, we are mostly following principles from Google's\nMaterial Design when selecting colors. We are not, however, following\nall of MD as it is not optimized for dense, information rich UIs.\n*/\n/*\n * Optional monospace font for input/output prompt.\n */\n/*\n * Added for compabitility with output area\n */\n:root {\n\n  /* Borders\n\n  The following variables, specify the visual styling of borders in JupyterLab.\n   */\n\n  /* UI Fonts\n\n  The UI font CSS variables are used for the typography all of the JupyterLab\n  user interface elements that are not directly user generated content.\n  */ /* Base font size */ /* Ensures px perfect FontAwesome icons */\n\n  /* Use these font colors against the corresponding main layout colors.\n     In a light theme, these go from dark to light.\n  */\n\n  /* Use these against the brand/accent/warn/error colors.\n     These will typically go from light to darker, in both a dark and light theme\n   */\n\n  /* Content Fonts\n\n  Content font variables are used for typography of user generated content.\n  */ /* Base font size */\n\n\n  /* Layout\n\n  The following are the main layout colors use in JupyterLab. In a light\n  theme these would go from light to dark.\n  */\n\n  /* Brand/accent */\n\n  /* State colors (warn, error, success, info) */\n\n  /* Cell specific styles */\n  /* A custom blend of MD grey and blue 600\n   * See https://meyerweb.com/eric/tools/color-blend/#546E7A:1E88E5:5:hex */\n  /* A custom blend of MD grey and orange 600\n   * https://meyerweb.com/eric/tools/color-blend/#546E7A:F4511E:5:hex */\n\n  /* Notebook specific styles */\n\n  /* Console specific styles */\n\n  /* Toolbar specific styles */\n}\n/* Copyright (c) Jupyter Development Team.\n * Distributed under the terms of the Modified BSD License.\n */\n/* We import all of these together in a single css file because the Webpack\nloader sees only one file at a time. This allows postcss to see the variable\ndefinitions when they are used. */\n/*-----------------------------------------------------------------------------\n| Copyright (c) Jupyter Development Team.\n| Distributed under the terms of the Modified BSD License.\n|----------------------------------------------------------------------------*/\n/**\n * The material design colors are adapted from google-material-color v1.2.6\n * https://github.com/danlevan/google-material-color\n * https://github.com/danlevan/google-material-color/blob/f67ca5f4028b2f1b34862f64b0ca67323f91b088/dist/palette.var.css\n *\n * The license for the material design color CSS variables is as follows (see\n * https://github.com/danlevan/google-material-color/blob/f67ca5f4028b2f1b34862f64b0ca67323f91b088/LICENSE)\n *\n * The MIT License (MIT)\n *\n * Copyright (c) 2014 Dan Le Van\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n * SOFTWARE.\n */\n/*\nThe following CSS variables define the main, public API for styling JupyterLab.\nThese variables should be used by all plugins wherever possible. In other\nwords, plugins should not define custom colors, sizes, etc unless absolutely\nnecessary. This enables users to change the visual theme of JupyterLab\nby changing these variables.\n\nMany variables appear in an ordered sequence (0,1,2,3). These sequences\nare designed to work well together, so for example, `--jp-border-color1` should\nbe used with `--jp-layout-color1`. The numbers have the following meanings:\n\n* 0: super-primary, reserved for special emphasis\n* 1: primary, most important under normal situations\n* 2: secondary, next most important under normal situations\n* 3: tertiary, next most important under normal situations\n\nThroughout JupyterLab, we are mostly following principles from Google's\nMaterial Design when selecting colors. We are not, however, following\nall of MD as it is not optimized for dense, information rich UIs.\n*/\n/*\n * Optional monospace font for input/output prompt.\n */\n/*\n * Added for compabitility with output area\n */\n:root {\n\n  /* Borders\n\n  The following variables, specify the visual styling of borders in JupyterLab.\n   */\n\n  /* UI Fonts\n\n  The UI font CSS variables are used for the typography all of the JupyterLab\n  user interface elements that are not directly user generated content.\n  */ /* Base font size */ /* Ensures px perfect FontAwesome icons */\n\n  /* Use these font colors against the corresponding main layout colors.\n     In a light theme, these go from dark to light.\n  */\n\n  /* Use these against the brand/accent/warn/error colors.\n     These will typically go from light to darker, in both a dark and light theme\n   */\n\n  /* Content Fonts\n\n  Content font variables are used for typography of user generated content.\n  */ /* Base font size */\n\n\n  /* Layout\n\n  The following are the main layout colors use in JupyterLab. In a light\n  theme these would go from light to dark.\n  */\n\n  /* Brand/accent */\n\n  /* State colors (warn, error, success, info) */\n\n  /* Cell specific styles */\n  /* A custom blend of MD grey and blue 600\n   * See https://meyerweb.com/eric/tools/color-blend/#546E7A:1E88E5:5:hex */\n  /* A custom blend of MD grey and orange 600\n   * https://meyerweb.com/eric/tools/color-blend/#546E7A:F4511E:5:hex */\n\n  /* Notebook specific styles */\n\n  /* Console specific styles */\n\n  /* Toolbar specific styles */\n}\n/* Copyright (c) Jupyter Development Team.\n * Distributed under the terms of the Modified BSD License.\n */\n/*\n * We assume that the CSS variables in\n * https://github.com/jupyterlab/jupyterlab/blob/master/src/default-theme/variables.css\n * have been defined.\n */\n:root { /* margin between inline elements */\n\n    /* From Material Design Lite */\n}\n.jupyter-widgets {\n    margin: 2px;\n    box-sizing: border-box;\n    color: black;\n    overflow: visible;\n}\n.jupyter-widgets.jupyter-widgets-disconnected::before {\n    line-height: 28px;\n    height: 28px;\n}\n.jp-Output-result > .jupyter-widgets {\n    margin-left: 0;\n    margin-right: 0;\n}\n/* vbox and hbox */\n.widget-inline-hbox {\n    /* Horizontal widgets */\n    box-sizing: border-box;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: row;\n            flex-direction: row;\n    -webkit-box-align: baseline;\n        -ms-flex-align: baseline;\n            align-items: baseline;\n}\n.widget-inline-vbox {\n    /* Vertical Widgets */\n    box-sizing: border-box;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n}\n.widget-box {\n    box-sizing: border-box;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    margin: 0;\n    overflow: auto;\n}\n.widget-hbox {\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: row;\n            flex-direction: row;\n}\n.widget-vbox {\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n}\n/* General Button Styling */\n.jupyter-button {\n    padding-left: 10px;\n    padding-right: 10px;\n    padding-top: 0px;\n    padding-bottom: 0px;\n    display: inline-block;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    text-align: center;\n    font-size: 13px;\n    cursor: pointer;\n\n    height: 28px;\n    border: 0px solid;\n    line-height: 28px;\n    box-shadow: none;\n\n    color: rgba(0, 0, 0, .8);\n    background-color: #EEEEEE;\n    border-color: #E0E0E0;\n    border: none;\n}\n.jupyter-button i.fa {\n    margin-right: 4px;\n    pointer-events: none;\n}\n.jupyter-button:empty:before {\n    content: \"\\200B\"; /* zero-width space */\n}\n.jupyter-widgets.jupyter-button:disabled {\n    opacity: 0.6;\n}\n.jupyter-button i.fa.center {\n    margin-right: 0;\n}\n.jupyter-button:hover:enabled, .jupyter-button:focus:enabled {\n    /* MD Lite 2dp shadow */\n    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14),\n                0 3px 1px -2px rgba(0, 0, 0, .2),\n                0 1px 5px 0 rgba(0, 0, 0, .12);\n}\n.jupyter-button:active, .jupyter-button.mod-active {\n    /* MD Lite 4dp shadow */\n    box-shadow: 0 4px 5px 0 rgba(0, 0, 0, .14),\n                0 1px 10px 0 rgba(0, 0, 0, .12),\n                0 2px 4px -1px rgba(0, 0, 0, .2);\n    color: rgba(0, 0, 0, .8);\n    background-color: #BDBDBD;\n}\n.jupyter-button:focus:enabled {\n    outline: 1px solid #64B5F6;\n}\n/* Button \"Primary\" Styling */\n.jupyter-button.mod-primary {\n    color: rgba(255, 255, 255, 1.0);\n    background-color: #2196F3;\n}\n.jupyter-button.mod-primary.mod-active {\n    color: rgba(255, 255, 255, 1);\n    background-color: #1976D2;\n}\n.jupyter-button.mod-primary:active {\n    color: rgba(255, 255, 255, 1);\n    background-color: #1976D2;\n}\n/* Button \"Success\" Styling */\n.jupyter-button.mod-success {\n    color: rgba(255, 255, 255, 1.0);\n    background-color: #4CAF50;\n}\n.jupyter-button.mod-success.mod-active {\n    color: rgba(255, 255, 255, 1);\n    background-color: #388E3C;\n }\n.jupyter-button.mod-success:active {\n    color: rgba(255, 255, 255, 1);\n    background-color: #388E3C;\n }\n/* Button \"Info\" Styling */\n.jupyter-button.mod-info {\n    color: rgba(255, 255, 255, 1.0);\n    background-color: #00BCD4;\n}\n.jupyter-button.mod-info.mod-active {\n    color: rgba(255, 255, 255, 1);\n    background-color: #0097A7;\n}\n.jupyter-button.mod-info:active {\n    color: rgba(255, 255, 255, 1);\n    background-color: #0097A7;\n}\n/* Button \"Warning\" Styling */\n.jupyter-button.mod-warning {\n    color: rgba(255, 255, 255, 1.0);\n    background-color: #FF9800;\n}\n.jupyter-button.mod-warning.mod-active {\n    color: rgba(255, 255, 255, 1);\n    background-color: #F57C00;\n}\n.jupyter-button.mod-warning:active {\n    color: rgba(255, 255, 255, 1);\n    background-color: #F57C00;\n}\n/* Button \"Danger\" Styling */\n.jupyter-button.mod-danger {\n    color: rgba(255, 255, 255, 1.0);\n    background-color: #F44336;\n}\n.jupyter-button.mod-danger.mod-active {\n    color: rgba(255, 255, 255, 1);\n    background-color: #D32F2F;\n}\n.jupyter-button.mod-danger:active {\n    color: rgba(255, 255, 255, 1);\n    background-color: #D32F2F;\n}\n/* Widget Button*/\n.widget-button, .widget-toggle-button {\n    width: 148px;\n}\n/* Widget Label Styling */\n/* Override Bootstrap label css */\n.jupyter-widgets label.widget-label {\n    margin-bottom: 0;\n    margin-bottom: initial;\n}\n.widget-label-basic {\n    /* Basic Label */\n    color: black;\n    font-size: 13px;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    line-height: 28px;\n}\n.widget-label {\n    /* Label */\n    color: black;\n    font-size: 13px;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    line-height: 28px;\n}\n.widget-inline-hbox .widget-label {\n    /* Horizontal Widget Label */\n    color: black;\n    text-align: right;\n    margin-right: 8px;\n    width: 80px;\n    -ms-flex-negative: 0;\n        flex-shrink: 0;\n}\n.widget-inline-vbox .widget-label {\n    /* Vertical Widget Label */\n    color: black;\n    text-align: center;\n    line-height: 28px;\n}\n/* Widget Readout Styling */\n.widget-readout {\n    color: black;\n    font-size: 13px;\n    height: 28px;\n    line-height: 28px;\n    margin-left: 4px;\n    overflow: hidden;\n    white-space: nowrap;\n    text-align: center;\n}\n.widget-readout.overflow {\n    /* Overflowing Readout */\n\n    /* From Material Design Lite\n        shadow-key-umbra-opacity: 0.2;\n        shadow-key-penumbra-opacity: 0.14;\n        shadow-ambient-shadow-opacity: 0.12;\n     */\n\n    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .2),\n                0 3px 1px -2px rgba(0, 0, 0, .14),\n                0 1px 5px 0 rgba(0, 0, 0, .12);\n}\n.widget-inline-hbox .widget-readout {\n    /* Horizontal Readout */\n    text-align: center;\n    max-width: 148px;\n    min-width: 72px;\n    margin-left: 4px;\n}\n.widget-inline-vbox .widget-readout {\n    /* Vertical Readout */\n    margin-top: 4px;\n}\n/* Widget Checkbox Styling */\n.widget-checkbox {\n    width: 300px;\n    height: 28px;\n    line-height: 28px;\n}\n.widget-checkbox input[type=\"checkbox\"] {\n    margin: 0px 8px 0px 0px;\n    line-height: 28px;\n    font-size: large;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    -ms-flex-negative: 0;\n        flex-shrink: 0;\n    -ms-flex-item-align: center;\n        -ms-grid-row-align: center;\n        align-self: center;\n}\n/* Widget Valid Styling */\n.widget-valid {\n    height: 28px;\n    line-height: 28px;\n    width: 148px;\n    font-size: 13px;\n}\n.widget-valid i:before {\n    height: 28px;\n    line-height: 28px;\n    margin-right: 4px;\n    margin-left: 4px;\n\n    /* from the fa class in FontAwesome: https://github.com/FortAwesome/Font-Awesome/blob/49100c7c3a7b58d50baa71efef11af41a66b03d3/css/font-awesome.css#L14 */\n    display: inline-block;\n    font: normal normal normal 14px/1 FontAwesome;\n    font-size: inherit;\n    text-rendering: auto;\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n}\n.widget-valid.mod-valid i:before {\n    content: \"\\F00C\";\n    color: green;\n}\n.widget-valid.mod-invalid i:before {\n    content: \"\\F00D\";\n    color: red;\n}\n.widget-valid.mod-valid .widget-valid-readout {\n    display: none;\n}\n/* Widget Text and TextArea Stying */\n.widget-textarea, .widget-text {\n    width: 300px;\n}\n.widget-text input[type=\"text\"], .widget-text input[type=\"number\"]{\n    height: 28px;\n    line-height: 28px;\n}\n.widget-text input[type=\"text\"]:disabled, .widget-text input[type=\"number\"]:disabled, .widget-textarea textarea:disabled {\n    opacity: 0.6;\n}\n.widget-text input[type=\"text\"], .widget-text input[type=\"number\"], .widget-textarea textarea {\n    box-sizing: border-box;\n    border: 1px solid #9E9E9E;\n    background-color: white;\n    color: rgba(0, 0, 0, .8);\n    font-size: 13px;\n    padding: 4px 8px;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    min-width: 0; /* This makes it possible for the flexbox to shrink this input */\n    -ms-flex-negative: 1;\n        flex-shrink: 1;\n    outline: none !important;\n}\n.widget-textarea textarea {\n    height: inherit;\n    width: inherit;\n}\n.widget-text input:focus, .widget-textarea textarea:focus {\n    border-color: #64B5F6;\n}\n/* Widget Slider */\n.widget-slider .ui-slider {\n    /* Slider Track */\n    border: 1px solid #BDBDBD;\n    background: #BDBDBD;\n    box-sizing: border-box;\n    position: relative;\n    border-radius: 0px;\n}\n.widget-slider .ui-slider .ui-slider-handle {\n    /* Slider Handle */\n    outline: none !important; /* focused slider handles are colored - see below */\n    position: absolute;\n    background-color: white;\n    border: 1px solid #9E9E9E;\n    box-sizing: border-box;\n    z-index: 1;\n    background-image: none; /* Override jquery-ui */\n}\n/* Override jquery-ui */\n.widget-slider .ui-slider .ui-slider-handle:hover, .widget-slider .ui-slider .ui-slider-handle:focus {\n    background-color: #2196F3;\n    border: 1px solid #2196F3;\n}\n.widget-slider .ui-slider .ui-slider-handle:active {\n    background-color: #2196F3;\n    border-color: #2196F3;\n    z-index: 2;\n    -webkit-transform: scale(1.2);\n            transform: scale(1.2);\n}\n.widget-slider  .ui-slider .ui-slider-range {\n    /* Interval between the two specified value of a double slider */\n    position: absolute;\n    background: #2196F3;\n    z-index: 0;\n}\n/* Shapes of Slider Handles */\n.widget-hslider .ui-slider .ui-slider-handle {\n    width: 16px;\n    height: 16px;\n    margin-top: -7px;\n    margin-left: -7px;\n    border-radius: 50%;\n    top: 0;\n}\n.widget-vslider .ui-slider .ui-slider-handle {\n    width: 16px;\n    height: 16px;\n    margin-bottom: -7px;\n    margin-left: -7px;\n    border-radius: 50%;\n    left: 0;\n}\n.widget-hslider .ui-slider .ui-slider-range {\n    height: 8px;\n    margin-top: -3px;\n}\n.widget-vslider .ui-slider .ui-slider-range {\n    width: 8px;\n    margin-left: -3px;\n}\n/* Horizontal Slider */\n.widget-hslider {\n    width: 300px;\n    height: 28px;\n    line-height: 28px;\n\n    /* Override the align-items baseline. This way, the description and readout\n    still seem to align their baseline properly, and we don't have to have\n    align-self: stretch in the .slider-container. */\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n}\n.widgets-slider .slider-container {\n    overflow: visible;\n}\n.widget-hslider .slider-container {\n    height: 28px;\n    margin-left: 6px;\n    margin-right: 6px;\n    -webkit-box-flex: 1;\n        -ms-flex: 1 1 148px;\n            flex: 1 1 148px;\n}\n.widget-hslider .ui-slider {\n    /* Inner, invisible slide div */\n    height: 4px;\n    margin-top: 12px;\n    width: 100%;\n}\n/* Vertical Slider */\n.widget-vbox .widget-label {\n    height: 28px;\n    line-height: 28px;\n}\n.widget-vslider {\n    /* Vertical Slider */\n    height: 200px;\n    width: 72px;\n}\n.widget-vslider .slider-container {\n    -webkit-box-flex: 1;\n        -ms-flex: 1 1 148px;\n            flex: 1 1 148px;\n    margin-left: auto;\n    margin-right: auto;\n    margin-bottom: 6px;\n    margin-top: 6px;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n}\n.widget-vslider .ui-slider-vertical {\n    /* Inner, invisible slide div */\n    width: 4px;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    margin-left: auto;\n    margin-right: auto;\n}\n/* Widget Progress Styling */\n.progress-bar {\n    transition: none;\n}\n.progress-bar {\n    height: 28px;\n}\n.progress-bar {\n    background-color: #2196F3;\n}\n.progress-bar-success {\n    background-color: #4CAF50;\n}\n.progress-bar-info {\n    background-color: #00BCD4;\n}\n.progress-bar-warning {\n    background-color: #FF9800;\n}\n.progress-bar-danger {\n    background-color: #F44336;\n}\n.progress {\n    background-color: #EEEEEE;\n    border: none;\n    box-shadow: none;\n}\n/* Horisontal Progress */\n.widget-hprogress {\n    /* Progress Bar */\n    height: 28px;\n    line-height: 28px;\n    width: 300px;\n}\n.widget-hprogress .progress {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    height: 20px;\n    margin-top: auto;\n    margin-bottom: auto;\n}\n/* Vertical Progress */\n.widget-vprogress {\n    height: 200px;\n    width: 72px;\n}\n.widget-vprogress .progress {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    width: 20px;\n    margin-left: auto;\n    margin-right: auto;\n    margin-bottom: 0;\n}\n/* Select Widget Styling */\n.widget-dropdown {\n    height: 28px;\n    width: 300px;\n    line-height: 28px;\n}\n.widget-dropdown > select {\n    border: 1px solid #9E9E9E;\n    border-radius: 0;\n    height: inherit;\n    -webkit-box-flex: 1;\n        -ms-flex: 1 1 148px;\n            flex: 1 1 148px;\n    min-width: 0; /* This makes it possible for the flexbox to shrink this input */\n    box-sizing: border-box;\n    outline: none !important;\n    box-shadow: none;\n    background-color: white;\n    color: rgba(0, 0, 0, .8);\n    font-size: 13px;\n    vertical-align: top;\n    padding-left: 8px;\n\tappearance: none;\n\t-webkit-appearance: none;\n\t-moz-appearance: none;\n    background-repeat: no-repeat;\n\tbackground-size: 20px;\n\tbackground-position: right center;\n    background-image: url(\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxOCAxOCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTggMTg7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDpub25lO30KPC9zdHlsZT4KPHBhdGggZD0iTTUuMiw1LjlMOSw5LjdsMy44LTMuOGwxLjIsMS4ybC00LjksNWwtNC45LTVMNS4yLDUuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTAtMC42aDE4djE4SDBWLTAuNnoiLz4KPC9zdmc+Cg\");\n}\n.widget-dropdown > select:focus {\n    border-color: #64B5F6;\n}\n.widget-dropdown > select:disabled {\n    opacity: 0.6;\n}\n/* To disable the dotted border in Firefox around select controls.\n   See http://stackoverflow.com/a/18853002 */\n.widget-dropdown > select:-moz-focusring {\n    color: transparent;\n    text-shadow: 0 0 0 #000;\n}\n.widget-dropdown > select > option:checked {\n    color: rgba(0, 0, 0, 1.0);\n    background: white repeat url(\"data:image/gif;base64,R0lGO...\");\n}\n/* Select and SelectMultiple */\n.widget-select {\n    width: 300px;\n    line-height: 28px;\n}\n.widget-select > select {\n    border: 1px solid #9E9E9E;\n    background-color: white;\n    color: rgba(0, 0, 0, .8);\n    font-size: 13px;\n    -webkit-box-flex: 1;\n        -ms-flex: 1 1 148px;\n            flex: 1 1 148px;\n    outline: none !important;\n    overflow: auto;\n    height: inherit;\n}\n.widget-select > select:focus {\n    border-color: #64B5F6;\n}\n.widget-select > select > option:checked {\n    color: rgba(0, 0, 0, 1.0);\n    background: white repeat url(\"data:image/gif;base64,R0lGO...\");\n}\n.wiget-select > select > option {\n    padding-left: 4px;\n    line-height: 28px;\n    /* line-height doesn't work on some browsers for select options */\n    padding-top: 21.5px;\n    padding-bottom: 21.5px;\n}\n/* Toggle Buttons Styling */\n.widget-toggle-buttons {\n    line-height: 28px;\n}\n.widget-toggle-buttons .widget-toggle-button {\n    margin-left: 2px;\n    margin-right: 2px;\n}\n.widget-toggle-buttons .jupyter-button:disabled {\n    opacity: 0.6;\n}\n/* Radio Buttons Styling */\n.widget-radio {\n    width: 300px;\n    line-height: 28px;\n}\n.widget-radio-box {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n    -webkit-box-align: stretch;\n        -ms-flex-align: stretch;\n            align-items: stretch;\n    box-sizing: border-box;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    margin-bottom: 8px;\n}\n.widget-radio-box label {\n    height: 20px;\n    line-height: 20px;\n    font-size: 13px;\n}\n.widget-radio-box input {\n    height: 20px;\n    line-height: 20px;\n    margin: 0 8px 0 1px;\n    float: left;\n}\n/* Color Picker Styling */\n.widget-colorpicker {\n    width: 300px;\n    height: 28px;\n    line-height: 28px;\n}\n.widget-colorpicker > .widget-colorpicker-input {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    -ms-flex-negative: 1;\n        flex-shrink: 1;\n    min-width: 72px;\n}\n.widget-colorpicker input[type=\"color\"] {\n    width: 28px;\n    height: 28px;\n    padding: 0 2px; /* make the color square actually square on Chrome on OS X */\n    background: white;\n    color: rgba(0, 0, 0, .8);\n    border: 1px solid #9E9E9E;\n    border-left: none;\n    -webkit-box-flex: 0;\n        -ms-flex-positive: 0;\n            flex-grow: 0;\n    -ms-flex-negative: 0;\n        flex-shrink: 0;\n    box-sizing: border-box;\n    -ms-flex-item-align: stretch;\n        -ms-grid-row-align: stretch;\n        align-self: stretch;\n    outline: none !important;\n}\n.widget-colorpicker.concise input[type=\"color\"] {\n    border-left: 1px solid #9E9E9E;\n}\n.widget-colorpicker input[type=\"color\"]:focus, .widget-colorpicker input[type=\"text\"]:focus {\n    border-color: #64B5F6;\n}\n.widget-colorpicker input[type=\"text\"] {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    outline: none !important;\n    height: 28px;\n    line-height: 28px;\n    background: white;\n    color: rgba(0, 0, 0, .8);\n    border: 1px solid #9E9E9E;\n    font-size: 13px;\n    padding: 4px 8px;\n    min-width: 0; /* This makes it possible for the flexbox to shrink this input */\n    -ms-flex-negative: 1;\n        flex-shrink: 1;\n    box-sizing: border-box;\n}\n.widget-colorpicker input[type=\"text\"]:disabled {\n    opacity: 0.6;\n}\n/* Date Picker Styling */\n.widget-datepicker {\n    width: 300px;\n    height: 28px;\n    line-height: 28px;\n}\n.widget-datepicker input[type=\"date\"] {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    -ms-flex-negative: 1;\n        flex-shrink: 1;\n    min-width: 0; /* This makes it possible for the flexbox to shrink this input */\n    outline: none !important;\n    height: 28px;\n    border: 1px solid #9E9E9E;\n    background-color: white;\n    color: rgba(0, 0, 0, .8);\n    font-size: 13px;\n    padding: 4px 8px;\n    box-sizing: border-box;\n}\n.widget-datepicker input[type=\"date\"]:focus {\n    border-color: #64B5F6;\n}\n.widget-datepicker input[type=\"date\"]:invalid {\n    border-color: #FF9800;\n}\n.widget-datepicker input[type=\"date\"]:disabled {\n    opacity: 0.6;\n}\n/* Play Widget */\n.widget-play {\n    width: 148px;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-align: stretch;\n        -ms-flex-align: stretch;\n            align-items: stretch;\n}\n.widget-play .jupyter-button {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    height: auto;\n}\n.widget-play .jupyter-button:disabled {\n    opacity: 0.6;\n}\n/* Tab Widget */\n.jupyter-widgets .p-TabBar {\n    /* Necessary so that a tab can be shifted down to overlay the border of the box below. */\n    overflow-x: visible;\n    overflow-y: visible;\n}\n.jupyter-widgets.widget-tab .p-TabBar.p-mod-horizontal > .p-TabBar-content {\n    -webkit-box-align: end;\n        -ms-flex-align: end;\n            align-items: flex-end;\n    margin-bottom: 0;\n}\n.jupyter-widgets.widget-tab {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n}\n.jupyter-widgets.widget-tab > .widget-tab-contents {\n    width: 100%;\n    box-sizing: border-box;\n    margin: 0;\n    background: white;\n    color: rgba(0, 0, 0, .8);\n    border: 1px solid #9E9E9E;\n    padding: 15px;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    overflow: auto;\n}\n.jupyter-widgets.widget-tab .widget-tab-contents .widget-tab-child.p-mod-hidden {\n    display: none !important;\n}\n.jupyter-widgets.widget-tab .widget-tab-bar.p-TabBar {\n    font: 13px Helvetica, Arial, sans-serif;\n}\n.jupyter-widgets.widget-tab .p-TabBar-tab {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 1 144px;\n            flex: 0 1 144px;\n    min-width: 35px;\n    min-height: 25px;\n    line-height: 24px;\n    margin-left: -1px;\n    padding: 0px 10px;\n    background: #EEEEEE;\n    color: rgba(0, 0, 0, .5);\n    border: 1px solid #9E9E9E;\n    border-bottom: none;\n    position: relative;\n}\n.jupyter-widgets.widget-tab .p-TabBar-tab.p-mod-current {\n    color: rgba(0, 0, 0, 1.0);\n    /* We want the background to match the tab content background */\n    background: white;\n    min-height: 26px;\n    -webkit-transform: translateY(1px);\n            transform: translateY(1px);\n}\n.jupyter-widgets.widget-tab .p-TabBar-tab.p-mod-current:before {\n    position: absolute;\n    top: -1px;\n    left: -1px;\n    content: '';\n    height: 2px;\n    width: calc(100% + 2 * 1px);\n    background: #2196F3;\n}\n.jupyter-widgets.widget-tab .p-TabBar-tab:first-child {\n    margin-left: 0;\n}\n.jupyter-widgets.widget-tab .p-TabBar-tab:hover:not(.p-mod-current) {\n    background: white;\n    color: rgba(0, 0, 0, .8);\n}\n.jupyter-widgets.widget-tab.p-mod-closable > .p-TabBar-tabCloseIcon {\n    margin-left: 4px;\n}\n.jupyter-widgets.widget-tab.p-mod-closable > .p-TabBar-tabCloseIcon:before {\n    font-family: FontAwesome;\n    content: '\\F00D'; /* close */\n}\n.jupyter-widgets.widget-tab .p-TabBar-tabIcon,\n.jupyter-widgets.widget-tab .p-TabBar-tabLabel,\n.jupyter-widgets.widget-tab .p-TabBar-tabCloseIcon {\n    line-height: 24px;\n}\n/* Accordion Widget */\n.p-Collapse {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n    -webkit-box-align: stretch;\n        -ms-flex-align: stretch;\n            align-items: stretch;\n}\n.p-Collapse-header {\n    padding: 4px;\n    cursor: pointer;\n    color: rgba(0, 0, 0, .5);\n    background-color: #EEEEEE;\n    border: 1px solid #9E9E9E;\n    padding: 10px 15px;\n    font-weight: bold;\n}\n.p-Collapse-header:hover {\n    background-color: white;\n    color: rgba(0, 0, 0, .8);\n}\n.p-Collapse-open > .p-Collapse-header {\n    background-color: white;\n    color: rgba(0, 0, 0, 1.0);\n    cursor: default;\n    border-bottom: none;\n}\n.p-Collapse .p-Collapse-header::before {\n    content: '\\F0DA\\A0';  /* caret-right, non-breaking space */\n    display: inline-block;\n    font: normal normal normal 14px/1 FontAwesome;\n    font-size: inherit;\n    text-rendering: auto;\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n}\n.p-Collapse-open > .p-Collapse-header::before {\n    content: '\\F0D7\\A0'; /* caret-down, non-breaking space */\n}\n.p-Collapse-contents {\n    padding: 15px;\n    background-color: white;\n    color: rgba(0, 0, 0, .8);\n    border-left: 1px solid #9E9E9E;\n    border-right: 1px solid #9E9E9E;\n    border-bottom: 1px solid #9E9E9E;\n    overflow: auto;\n}\n.p-Accordion {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n    -webkit-box-align: stretch;\n        -ms-flex-align: stretch;\n            align-items: stretch;\n}\n.p-Accordion .p-Collapse {\n    margin-bottom: 0;\n}\n.p-Accordion .p-Collapse + .p-Collapse {\n    margin-top: 4px;\n}\n/* HTML widget */\n.widget-html, .widget-htmlmath {\n    font-size: 13px;\n}\n", ""]);
	
	// exports


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	  * $script.js JS loader & dependency manager
	  * https://github.com/ded/script.js
	  * (c) Dustin Diaz 2014 | License MIT
	  */
	
	(function (name, definition) {
	  if (typeof module != 'undefined' && module.exports) module.exports = definition()
	  else if (true) !(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
	  else this[name] = definition()
	})('$script', function () {
	  var doc = document
	    , head = doc.getElementsByTagName('head')[0]
	    , s = 'string'
	    , f = false
	    , push = 'push'
	    , readyState = 'readyState'
	    , onreadystatechange = 'onreadystatechange'
	    , list = {}
	    , ids = {}
	    , delay = {}
	    , scripts = {}
	    , scriptpath
	    , urlArgs
	
	  function every(ar, fn) {
	    for (var i = 0, j = ar.length; i < j; ++i) if (!fn(ar[i])) return f
	    return 1
	  }
	  function each(ar, fn) {
	    every(ar, function (el) {
	      return !fn(el)
	    })
	  }
	
	  function $script(paths, idOrDone, optDone) {
	    paths = paths[push] ? paths : [paths]
	    var idOrDoneIsDone = idOrDone && idOrDone.call
	      , done = idOrDoneIsDone ? idOrDone : optDone
	      , id = idOrDoneIsDone ? paths.join('') : idOrDone
	      , queue = paths.length
	    function loopFn(item) {
	      return item.call ? item() : list[item]
	    }
	    function callback() {
	      if (!--queue) {
	        list[id] = 1
	        done && done()
	        for (var dset in delay) {
	          every(dset.split('|'), loopFn) && !each(delay[dset], loopFn) && (delay[dset] = [])
	        }
	      }
	    }
	    setTimeout(function () {
	      each(paths, function loading(path, force) {
	        if (path === null) return callback()
	        
	        if (!force && !/^https?:\/\//.test(path) && scriptpath) {
	          path = (path.indexOf('.js') === -1) ? scriptpath + path + '.js' : scriptpath + path;
	        }
	        
	        if (scripts[path]) {
	          if (id) ids[id] = 1
	          return (scripts[path] == 2) ? callback() : setTimeout(function () { loading(path, true) }, 0)
	        }
	
	        scripts[path] = 1
	        if (id) ids[id] = 1
	        create(path, callback)
	      })
	    }, 0)
	    return $script
	  }
	
	  function create(path, fn) {
	    var el = doc.createElement('script'), loaded
	    el.onload = el.onerror = el[onreadystatechange] = function () {
	      if ((el[readyState] && !(/^c|loade/.test(el[readyState]))) || loaded) return;
	      el.onload = el[onreadystatechange] = null
	      loaded = 1
	      scripts[path] = 2
	      fn()
	    }
	    el.async = 1
	    el.src = urlArgs ? path + (path.indexOf('?') === -1 ? '?' : '&') + urlArgs : path;
	    head.insertBefore(el, head.lastChild)
	  }
	
	  $script.get = create
	
	  $script.order = function (scripts, id, done) {
	    (function callback(s) {
	      s = scripts.shift()
	      !scripts.length ? $script(s, id, done) : $script(s, callback)
	    }())
	  }
	
	  $script.path = function (p) {
	    scriptpath = p
	  }
	  $script.urlArgs = function (str) {
	    urlArgs = str;
	  }
	  $script.ready = function (deps, ready, req) {
	    deps = deps[push] ? deps : [deps]
	    var missing = [];
	    !each(deps, function (dep) {
	      list[dep] || missing[push](dep);
	    }) && every(deps, function (dep) {return list[dep]}) ?
	      ready() : !function (key) {
	      delay[key] = delay[key] || []
	      delay[key][push](ready)
	      req && req(missing)
	    }(deps.join('|'))
	    return $script
	  }
	
	  $script.done = function (idOrDone) {
	    $script([null], idOrDone)
	  }
	
	  return $script
	});


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var compileSchema = __webpack_require__(21)
	  , resolve = __webpack_require__(22)
	  , Cache = __webpack_require__(42)
	  , SchemaObject = __webpack_require__(33)
	  , stableStringify = __webpack_require__(36)
	  , formats = __webpack_require__(43)
	  , rules = __webpack_require__(44)
	  , $dataMetaSchema = __webpack_require__(67)
	  , patternGroups = __webpack_require__(68)
	  , util = __webpack_require__(31)
	  , co = __webpack_require__(41);
	
	module.exports = Ajv;
	
	Ajv.prototype.validate = validate;
	Ajv.prototype.compile = compile;
	Ajv.prototype.addSchema = addSchema;
	Ajv.prototype.addMetaSchema = addMetaSchema;
	Ajv.prototype.validateSchema = validateSchema;
	Ajv.prototype.getSchema = getSchema;
	Ajv.prototype.removeSchema = removeSchema;
	Ajv.prototype.addFormat = addFormat;
	Ajv.prototype.errorsText = errorsText;
	
	Ajv.prototype._addSchema = _addSchema;
	Ajv.prototype._compile = _compile;
	
	Ajv.prototype.compileAsync = __webpack_require__(69);
	var customKeyword = __webpack_require__(70);
	Ajv.prototype.addKeyword = customKeyword.add;
	Ajv.prototype.getKeyword = customKeyword.get;
	Ajv.prototype.removeKeyword = customKeyword.remove;
	
	var errorClasses = __webpack_require__(35);
	Ajv.ValidationError = errorClasses.Validation;
	Ajv.MissingRefError = errorClasses.MissingRef;
	Ajv.$dataMetaSchema = $dataMetaSchema;
	
	var META_SCHEMA_ID = 'http://json-schema.org/draft-06/schema';
	
	var META_IGNORE_OPTIONS = [ 'removeAdditional', 'useDefaults', 'coerceTypes' ];
	var META_SUPPORT_DATA = ['/properties'];
	
	/**
	 * Creates validator instance.
	 * Usage: `Ajv(opts)`
	 * @param {Object} opts optional options
	 * @return {Object} ajv instance
	 */
	function Ajv(opts) {
	  if (!(this instanceof Ajv)) return new Ajv(opts);
	  opts = this._opts = util.copy(opts) || {};
	  this._schemas = {};
	  this._refs = {};
	  this._fragments = {};
	  this._formats = formats(opts.format);
	  var schemaUriFormat = this._schemaUriFormat = this._formats['uri-reference'];
	  this._schemaUriFormatFunc = function (str) { return schemaUriFormat.test(str); };
	
	  this._cache = opts.cache || new Cache;
	  this._loadingSchemas = {};
	  this._compilations = [];
	  this.RULES = rules();
	  this._getId = chooseGetId(opts);
	
	  opts.loopRequired = opts.loopRequired || Infinity;
	  if (opts.errorDataPath == 'property') opts._errorDataPathProperty = true;
	  if (opts.serialize === undefined) opts.serialize = stableStringify;
	  this._metaOpts = getMetaSchemaOptions(this);
	
	  if (opts.formats) addInitialFormats(this);
	  addDraft6MetaSchema(this);
	  if (typeof opts.meta == 'object') this.addMetaSchema(opts.meta);
	  addInitialSchemas(this);
	  if (opts.patternGroups) patternGroups(this);
	}
	
	
	
	/**
	 * Validate data using schema
	 * Schema will be compiled and cached (using serialized JSON as key. [json-stable-stringify](https://github.com/substack/json-stable-stringify) is used to serialize.
	 * @this   Ajv
	 * @param  {String|Object} schemaKeyRef key, ref or schema object
	 * @param  {Any} data to be validated
	 * @return {Boolean} validation result. Errors from the last validation will be available in `ajv.errors` (and also in compiled schema: `schema.errors`).
	 */
	function validate(schemaKeyRef, data) {
	  var v;
	  if (typeof schemaKeyRef == 'string') {
	    v = this.getSchema(schemaKeyRef);
	    if (!v) throw new Error('no schema with key or ref "' + schemaKeyRef + '"');
	  } else {
	    var schemaObj = this._addSchema(schemaKeyRef);
	    v = schemaObj.validate || this._compile(schemaObj);
	  }
	
	  var valid = v(data);
	  if (v.$async === true)
	    return this._opts.async == '*' ? co(valid) : valid;
	  this.errors = v.errors;
	  return valid;
	}
	
	
	/**
	 * Create validating function for passed schema.
	 * @this   Ajv
	 * @param  {Object} schema schema object
	 * @param  {Boolean} _meta true if schema is a meta-schema. Used internally to compile meta schemas of custom keywords.
	 * @return {Function} validating function
	 */
	function compile(schema, _meta) {
	  var schemaObj = this._addSchema(schema, undefined, _meta);
	  return schemaObj.validate || this._compile(schemaObj);
	}
	
	
	/**
	 * Adds schema to the instance.
	 * @this   Ajv
	 * @param {Object|Array} schema schema or array of schemas. If array is passed, `key` and other parameters will be ignored.
	 * @param {String} key Optional schema key. Can be passed to `validate` method instead of schema object or id/ref. One schema per instance can have empty `id` and `key`.
	 * @param {Boolean} _skipValidation true to skip schema validation. Used internally, option validateSchema should be used instead.
	 * @param {Boolean} _meta true if schema is a meta-schema. Used internally, addMetaSchema should be used instead.
	 */
	function addSchema(schema, key, _skipValidation, _meta) {
	  if (Array.isArray(schema)){
	    for (var i=0; i<schema.length; i++) this.addSchema(schema[i], undefined, _skipValidation, _meta);
	    return;
	  }
	  var id = this._getId(schema);
	  if (id !== undefined && typeof id != 'string')
	    throw new Error('schema id must be string');
	  key = resolve.normalizeId(key || id);
	  checkUnique(this, key);
	  this._schemas[key] = this._addSchema(schema, _skipValidation, _meta, true);
	}
	
	
	/**
	 * Add schema that will be used to validate other schemas
	 * options in META_IGNORE_OPTIONS are alway set to false
	 * @this   Ajv
	 * @param {Object} schema schema object
	 * @param {String} key optional schema key
	 * @param {Boolean} skipValidation true to skip schema validation, can be used to override validateSchema option for meta-schema
	 */
	function addMetaSchema(schema, key, skipValidation) {
	  this.addSchema(schema, key, skipValidation, true);
	}
	
	
	/**
	 * Validate schema
	 * @this   Ajv
	 * @param {Object} schema schema to validate
	 * @param {Boolean} throwOrLogError pass true to throw (or log) an error if invalid
	 * @return {Boolean} true if schema is valid
	 */
	function validateSchema(schema, throwOrLogError) {
	  var $schema = schema.$schema;
	  if ($schema !== undefined && typeof $schema != 'string')
	    throw new Error('$schema must be a string');
	  $schema = $schema || this._opts.defaultMeta || defaultMeta(this);
	  if (!$schema) {
	    console.warn('meta-schema not available');
	    this.errors = null;
	    return true;
	  }
	  var currentUriFormat = this._formats.uri;
	  this._formats.uri = typeof currentUriFormat == 'function'
	                      ? this._schemaUriFormatFunc
	                      : this._schemaUriFormat;
	  var valid;
	  try { valid = this.validate($schema, schema); }
	  finally { this._formats.uri = currentUriFormat; }
	  if (!valid && throwOrLogError) {
	    var message = 'schema is invalid: ' + this.errorsText();
	    if (this._opts.validateSchema == 'log') console.error(message);
	    else throw new Error(message);
	  }
	  return valid;
	}
	
	
	function defaultMeta(self) {
	  var meta = self._opts.meta;
	  self._opts.defaultMeta = typeof meta == 'object'
	                            ? self._getId(meta) || meta
	                            : self.getSchema(META_SCHEMA_ID)
	                              ? META_SCHEMA_ID
	                              : undefined;
	  return self._opts.defaultMeta;
	}
	
	
	/**
	 * Get compiled schema from the instance by `key` or `ref`.
	 * @this   Ajv
	 * @param  {String} keyRef `key` that was passed to `addSchema` or full schema reference (`schema.id` or resolved id).
	 * @return {Function} schema validating function (with property `schema`).
	 */
	function getSchema(keyRef) {
	  var schemaObj = _getSchemaObj(this, keyRef);
	  switch (typeof schemaObj) {
	    case 'object': return schemaObj.validate || this._compile(schemaObj);
	    case 'string': return this.getSchema(schemaObj);
	    case 'undefined': return _getSchemaFragment(this, keyRef);
	  }
	}
	
	
	function _getSchemaFragment(self, ref) {
	  var res = resolve.schema.call(self, { schema: {} }, ref);
	  if (res) {
	    var schema = res.schema
	      , root = res.root
	      , baseId = res.baseId;
	    var v = compileSchema.call(self, schema, root, undefined, baseId);
	    self._fragments[ref] = new SchemaObject({
	      ref: ref,
	      fragment: true,
	      schema: schema,
	      root: root,
	      baseId: baseId,
	      validate: v
	    });
	    return v;
	  }
	}
	
	
	function _getSchemaObj(self, keyRef) {
	  keyRef = resolve.normalizeId(keyRef);
	  return self._schemas[keyRef] || self._refs[keyRef] || self._fragments[keyRef];
	}
	
	
	/**
	 * Remove cached schema(s).
	 * If no parameter is passed all schemas but meta-schemas are removed.
	 * If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
	 * Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
	 * @this   Ajv
	 * @param  {String|Object|RegExp} schemaKeyRef key, ref, pattern to match key/ref or schema object
	 */
	function removeSchema(schemaKeyRef) {
	  if (schemaKeyRef instanceof RegExp) {
	    _removeAllSchemas(this, this._schemas, schemaKeyRef);
	    _removeAllSchemas(this, this._refs, schemaKeyRef);
	    return;
	  }
	  switch (typeof schemaKeyRef) {
	    case 'undefined':
	      _removeAllSchemas(this, this._schemas);
	      _removeAllSchemas(this, this._refs);
	      this._cache.clear();
	      return;
	    case 'string':
	      var schemaObj = _getSchemaObj(this, schemaKeyRef);
	      if (schemaObj) this._cache.del(schemaObj.cacheKey);
	      delete this._schemas[schemaKeyRef];
	      delete this._refs[schemaKeyRef];
	      return;
	    case 'object':
	      var serialize = this._opts.serialize;
	      var cacheKey = serialize ? serialize(schemaKeyRef) : schemaKeyRef;
	      this._cache.del(cacheKey);
	      var id = this._getId(schemaKeyRef);
	      if (id) {
	        id = resolve.normalizeId(id);
	        delete this._schemas[id];
	        delete this._refs[id];
	      }
	  }
	}
	
	
	function _removeAllSchemas(self, schemas, regex) {
	  for (var keyRef in schemas) {
	    var schemaObj = schemas[keyRef];
	    if (!schemaObj.meta && (!regex || regex.test(keyRef))) {
	      self._cache.del(schemaObj.cacheKey);
	      delete schemas[keyRef];
	    }
	  }
	}
	
	
	/* @this   Ajv */
	function _addSchema(schema, skipValidation, meta, shouldAddSchema) {
	  if (typeof schema != 'object' && typeof schema != 'boolean')
	    throw new Error('schema should be object or boolean');
	  var serialize = this._opts.serialize;
	  var cacheKey = serialize ? serialize(schema) : schema;
	  var cached = this._cache.get(cacheKey);
	  if (cached) return cached;
	
	  shouldAddSchema = shouldAddSchema || this._opts.addUsedSchema !== false;
	
	  var id = resolve.normalizeId(this._getId(schema));
	  if (id && shouldAddSchema) checkUnique(this, id);
	
	  var willValidate = this._opts.validateSchema !== false && !skipValidation;
	  var recursiveMeta;
	  if (willValidate && !(recursiveMeta = id && id == resolve.normalizeId(schema.$schema)))
	    this.validateSchema(schema, true);
	
	  var localRefs = resolve.ids.call(this, schema);
	
	  var schemaObj = new SchemaObject({
	    id: id,
	    schema: schema,
	    localRefs: localRefs,
	    cacheKey: cacheKey,
	    meta: meta
	  });
	
	  if (id[0] != '#' && shouldAddSchema) this._refs[id] = schemaObj;
	  this._cache.put(cacheKey, schemaObj);
	
	  if (willValidate && recursiveMeta) this.validateSchema(schema, true);
	
	  return schemaObj;
	}
	
	
	/* @this   Ajv */
	function _compile(schemaObj, root) {
	  if (schemaObj.compiling) {
	    schemaObj.validate = callValidate;
	    callValidate.schema = schemaObj.schema;
	    callValidate.errors = null;
	    callValidate.root = root ? root : callValidate;
	    if (schemaObj.schema.$async === true)
	      callValidate.$async = true;
	    return callValidate;
	  }
	  schemaObj.compiling = true;
	
	  var currentOpts;
	  if (schemaObj.meta) {
	    currentOpts = this._opts;
	    this._opts = this._metaOpts;
	  }
	
	  var v;
	  try { v = compileSchema.call(this, schemaObj.schema, root, schemaObj.localRefs); }
	  finally {
	    schemaObj.compiling = false;
	    if (schemaObj.meta) this._opts = currentOpts;
	  }
	
	  schemaObj.validate = v;
	  schemaObj.refs = v.refs;
	  schemaObj.refVal = v.refVal;
	  schemaObj.root = v.root;
	  return v;
	
	
	  function callValidate() {
	    var _validate = schemaObj.validate;
	    var result = _validate.apply(null, arguments);
	    callValidate.errors = _validate.errors;
	    return result;
	  }
	}
	
	
	function chooseGetId(opts) {
	  switch (opts.schemaId) {
	    case '$id': return _get$Id;
	    case 'id': return _getId;
	    default: return _get$IdOrId;
	  }
	}
	
	
	function _getId(schema) {
	  if (schema.$id) console.warn('schema $id ignored', schema.$id);
	  return schema.id;
	}
	
	
	function _get$Id(schema) {
	  if (schema.id) console.warn('schema id ignored', schema.id);
	  return schema.$id;
	}
	
	
	function _get$IdOrId(schema) {
	  if (schema.$id && schema.id && schema.$id != schema.id)
	    throw new Error('schema $id is different from id');
	  return schema.$id || schema.id;
	}
	
	
	/**
	 * Convert array of error message objects to string
	 * @this   Ajv
	 * @param  {Array<Object>} errors optional array of validation errors, if not passed errors from the instance are used.
	 * @param  {Object} options optional options with properties `separator` and `dataVar`.
	 * @return {String} human readable string with all errors descriptions
	 */
	function errorsText(errors, options) {
	  errors = errors || this.errors;
	  if (!errors) return 'No errors';
	  options = options || {};
	  var separator = options.separator === undefined ? ', ' : options.separator;
	  var dataVar = options.dataVar === undefined ? 'data' : options.dataVar;
	
	  var text = '';
	  for (var i=0; i<errors.length; i++) {
	    var e = errors[i];
	    if (e) text += dataVar + e.dataPath + ' ' + e.message + separator;
	  }
	  return text.slice(0, -separator.length);
	}
	
	
	/**
	 * Add custom format
	 * @this   Ajv
	 * @param {String} name format name
	 * @param {String|RegExp|Function} format string is converted to RegExp; function should return boolean (true when valid)
	 */
	function addFormat(name, format) {
	  if (typeof format == 'string') format = new RegExp(format);
	  this._formats[name] = format;
	}
	
	
	function addDraft6MetaSchema(self) {
	  var $dataSchema;
	  if (self._opts.$data) {
	    $dataSchema = __webpack_require__(72);
	    self.addMetaSchema($dataSchema, $dataSchema.$id, true);
	  }
	  if (self._opts.meta === false) return;
	  var metaSchema = __webpack_require__(73);
	  if (self._opts.$data) metaSchema = $dataMetaSchema(metaSchema, META_SUPPORT_DATA);
	  self.addMetaSchema(metaSchema, META_SCHEMA_ID, true);
	  self._refs['http://json-schema.org/schema'] = META_SCHEMA_ID;
	}
	
	
	function addInitialSchemas(self) {
	  var optsSchemas = self._opts.schemas;
	  if (!optsSchemas) return;
	  if (Array.isArray(optsSchemas)) self.addSchema(optsSchemas);
	  else for (var key in optsSchemas) self.addSchema(optsSchemas[key], key);
	}
	
	
	function addInitialFormats(self) {
	  for (var name in self._opts.formats) {
	    var format = self._opts.formats[name];
	    self.addFormat(name, format);
	  }
	}
	
	
	function checkUnique(self, id) {
	  if (self._schemas[id] || self._refs[id])
	    throw new Error('schema with key or id "' + id + '" already exists');
	}
	
	
	function getMetaSchemaOptions(self) {
	  var metaOpts = util.copy(self._opts);
	  for (var i=0; i<META_IGNORE_OPTIONS.length; i++)
	    delete metaOpts[META_IGNORE_OPTIONS[i]];
	  return metaOpts;
	}


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var resolve = __webpack_require__(22)
	  , util = __webpack_require__(31)
	  , errorClasses = __webpack_require__(35)
	  , stableStringify = __webpack_require__(36);
	
	var validateGenerator = __webpack_require__(40);
	
	/**
	 * Functions below are used inside compiled validations function
	 */
	
	var co = __webpack_require__(41);
	var ucs2length = util.ucs2length;
	var equal = __webpack_require__(30);
	
	// this error is thrown by async schemas to return validation errors via exception
	var ValidationError = errorClasses.Validation;
	
	module.exports = compile;
	
	
	/**
	 * Compiles schema to validation function
	 * @this   Ajv
	 * @param  {Object} schema schema object
	 * @param  {Object} root object with information about the root schema for this schema
	 * @param  {Object} localRefs the hash of local references inside the schema (created by resolve.id), used for inline resolution
	 * @param  {String} baseId base ID for IDs in the schema
	 * @return {Function} validation function
	 */
	function compile(schema, root, localRefs, baseId) {
	  /* jshint validthis: true, evil: true */
	  /* eslint no-shadow: 0 */
	  var self = this
	    , opts = this._opts
	    , refVal = [ undefined ]
	    , refs = {}
	    , patterns = []
	    , patternsHash = {}
	    , defaults = []
	    , defaultsHash = {}
	    , customRules = [];
	
	  root = root || { schema: schema, refVal: refVal, refs: refs };
	
	  var c = checkCompiling.call(this, schema, root, baseId);
	  var compilation = this._compilations[c.index];
	  if (c.compiling) return (compilation.callValidate = callValidate);
	
	  var formats = this._formats;
	  var RULES = this.RULES;
	
	  try {
	    var v = localCompile(schema, root, localRefs, baseId);
	    compilation.validate = v;
	    var cv = compilation.callValidate;
	    if (cv) {
	      cv.schema = v.schema;
	      cv.errors = null;
	      cv.refs = v.refs;
	      cv.refVal = v.refVal;
	      cv.root = v.root;
	      cv.$async = v.$async;
	      if (opts.sourceCode) cv.source = v.source;
	    }
	    return v;
	  } finally {
	    endCompiling.call(this, schema, root, baseId);
	  }
	
	  function callValidate() {
	    var validate = compilation.validate;
	    var result = validate.apply(null, arguments);
	    callValidate.errors = validate.errors;
	    return result;
	  }
	
	  function localCompile(_schema, _root, localRefs, baseId) {
	    var isRoot = !_root || (_root && _root.schema == _schema);
	    if (_root.schema != root.schema)
	      return compile.call(self, _schema, _root, localRefs, baseId);
	
	    var $async = _schema.$async === true;
	
	    var sourceCode = validateGenerator({
	      isTop: true,
	      schema: _schema,
	      isRoot: isRoot,
	      baseId: baseId,
	      root: _root,
	      schemaPath: '',
	      errSchemaPath: '#',
	      errorPath: '""',
	      MissingRefError: errorClasses.MissingRef,
	      RULES: RULES,
	      validate: validateGenerator,
	      util: util,
	      resolve: resolve,
	      resolveRef: resolveRef,
	      usePattern: usePattern,
	      useDefault: useDefault,
	      useCustomRule: useCustomRule,
	      opts: opts,
	      formats: formats,
	      self: self
	    });
	
	    sourceCode = vars(refVal, refValCode) + vars(patterns, patternCode)
	                   + vars(defaults, defaultCode) + vars(customRules, customRuleCode)
	                   + sourceCode;
	
	    if (opts.processCode) sourceCode = opts.processCode(sourceCode);
	    // console.log('\n\n\n *** \n', JSON.stringify(sourceCode));
	    var validate;
	    try {
	      var makeValidate = new Function(
	        'self',
	        'RULES',
	        'formats',
	        'root',
	        'refVal',
	        'defaults',
	        'customRules',
	        'co',
	        'equal',
	        'ucs2length',
	        'ValidationError',
	        sourceCode
	      );
	
	      validate = makeValidate(
	        self,
	        RULES,
	        formats,
	        root,
	        refVal,
	        defaults,
	        customRules,
	        co,
	        equal,
	        ucs2length,
	        ValidationError
	      );
	
	      refVal[0] = validate;
	    } catch(e) {
	      console.error('Error compiling schema, function code:', sourceCode);
	      throw e;
	    }
	
	    validate.schema = _schema;
	    validate.errors = null;
	    validate.refs = refs;
	    validate.refVal = refVal;
	    validate.root = isRoot ? validate : _root;
	    if ($async) validate.$async = true;
	    if (opts.sourceCode === true) {
	      validate.source = {
	        code: sourceCode,
	        patterns: patterns,
	        defaults: defaults
	      };
	    }
	
	    return validate;
	  }
	
	  function resolveRef(baseId, ref, isRoot) {
	    ref = resolve.url(baseId, ref);
	    var refIndex = refs[ref];
	    var _refVal, refCode;
	    if (refIndex !== undefined) {
	      _refVal = refVal[refIndex];
	      refCode = 'refVal[' + refIndex + ']';
	      return resolvedRef(_refVal, refCode);
	    }
	    if (!isRoot && root.refs) {
	      var rootRefId = root.refs[ref];
	      if (rootRefId !== undefined) {
	        _refVal = root.refVal[rootRefId];
	        refCode = addLocalRef(ref, _refVal);
	        return resolvedRef(_refVal, refCode);
	      }
	    }
	
	    refCode = addLocalRef(ref);
	    var v = resolve.call(self, localCompile, root, ref);
	    if (v === undefined) {
	      var localSchema = localRefs && localRefs[ref];
	      if (localSchema) {
	        v = resolve.inlineRef(localSchema, opts.inlineRefs)
	            ? localSchema
	            : compile.call(self, localSchema, root, localRefs, baseId);
	      }
	    }
	
	    if (v === undefined) {
	      removeLocalRef(ref);
	    } else {
	      replaceLocalRef(ref, v);
	      return resolvedRef(v, refCode);
	    }
	  }
	
	  function addLocalRef(ref, v) {
	    var refId = refVal.length;
	    refVal[refId] = v;
	    refs[ref] = refId;
	    return 'refVal' + refId;
	  }
	
	  function removeLocalRef(ref) {
	    delete refs[ref];
	  }
	
	  function replaceLocalRef(ref, v) {
	    var refId = refs[ref];
	    refVal[refId] = v;
	  }
	
	  function resolvedRef(refVal, code) {
	    return typeof refVal == 'object' || typeof refVal == 'boolean'
	            ? { code: code, schema: refVal, inline: true }
	            : { code: code, $async: refVal && refVal.$async };
	  }
	
	  function usePattern(regexStr) {
	    var index = patternsHash[regexStr];
	    if (index === undefined) {
	      index = patternsHash[regexStr] = patterns.length;
	      patterns[index] = regexStr;
	    }
	    return 'pattern' + index;
	  }
	
	  function useDefault(value) {
	    switch (typeof value) {
	      case 'boolean':
	      case 'number':
	        return '' + value;
	      case 'string':
	        return util.toQuotedString(value);
	      case 'object':
	        if (value === null) return 'null';
	        var valueStr = stableStringify(value);
	        var index = defaultsHash[valueStr];
	        if (index === undefined) {
	          index = defaultsHash[valueStr] = defaults.length;
	          defaults[index] = value;
	        }
	        return 'default' + index;
	    }
	  }
	
	  function useCustomRule(rule, schema, parentSchema, it) {
	    var validateSchema = rule.definition.validateSchema;
	    if (validateSchema && self._opts.validateSchema !== false) {
	      var valid = validateSchema(schema);
	      if (!valid) {
	        var message = 'keyword schema is invalid: ' + self.errorsText(validateSchema.errors);
	        if (self._opts.validateSchema == 'log') console.error(message);
	        else throw new Error(message);
	      }
	    }
	
	    var compile = rule.definition.compile
	      , inline = rule.definition.inline
	      , macro = rule.definition.macro;
	
	    var validate;
	    if (compile) {
	      validate = compile.call(self, schema, parentSchema, it);
	    } else if (macro) {
	      validate = macro.call(self, schema, parentSchema, it);
	      if (opts.validateSchema !== false) self.validateSchema(validate, true);
	    } else if (inline) {
	      validate = inline.call(self, it, rule.keyword, schema, parentSchema);
	    } else {
	      validate = rule.definition.validate;
	      if (!validate) return;
	    }
	
	    if (validate === undefined)
	      throw new Error('custom keyword "' + rule.keyword + '"failed to compile');
	
	    var index = customRules.length;
	    customRules[index] = validate;
	
	    return {
	      code: 'customRule' + index,
	      validate: validate
	    };
	  }
	}
	
	
	/**
	 * Checks if the schema is currently compiled
	 * @this   Ajv
	 * @param  {Object} schema schema to compile
	 * @param  {Object} root root object
	 * @param  {String} baseId base schema ID
	 * @return {Object} object with properties "index" (compilation index) and "compiling" (boolean)
	 */
	function checkCompiling(schema, root, baseId) {
	  /* jshint validthis: true */
	  var index = compIndex.call(this, schema, root, baseId);
	  if (index >= 0) return { index: index, compiling: true };
	  index = this._compilations.length;
	  this._compilations[index] = {
	    schema: schema,
	    root: root,
	    baseId: baseId
	  };
	  return { index: index, compiling: false };
	}
	
	
	/**
	 * Removes the schema from the currently compiled list
	 * @this   Ajv
	 * @param  {Object} schema schema to compile
	 * @param  {Object} root root object
	 * @param  {String} baseId base schema ID
	 */
	function endCompiling(schema, root, baseId) {
	  /* jshint validthis: true */
	  var i = compIndex.call(this, schema, root, baseId);
	  if (i >= 0) this._compilations.splice(i, 1);
	}
	
	
	/**
	 * Index of schema compilation in the currently compiled list
	 * @this   Ajv
	 * @param  {Object} schema schema to compile
	 * @param  {Object} root root object
	 * @param  {String} baseId base schema ID
	 * @return {Integer} compilation index
	 */
	function compIndex(schema, root, baseId) {
	  /* jshint validthis: true */
	  for (var i=0; i<this._compilations.length; i++) {
	    var c = this._compilations[i];
	    if (c.schema == schema && c.root == root && c.baseId == baseId) return i;
	  }
	  return -1;
	}
	
	
	function patternCode(i, patterns) {
	  return 'var pattern' + i + ' = new RegExp(' + util.toQuotedString(patterns[i]) + ');';
	}
	
	
	function defaultCode(i) {
	  return 'var default' + i + ' = defaults[' + i + '];';
	}
	
	
	function refValCode(i, refVal) {
	  return refVal[i] === undefined ? '' : 'var refVal' + i + ' = refVal[' + i + '];';
	}
	
	
	function customRuleCode(i) {
	  return 'var customRule' + i + ' = customRules[' + i + '];';
	}
	
	
	function vars(arr, statement) {
	  if (!arr.length) return '';
	  var code = '';
	  for (var i=0; i<arr.length; i++)
	    code += statement(i, arr);
	  return code;
	}


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var url = __webpack_require__(23)
	  , equal = __webpack_require__(30)
	  , util = __webpack_require__(31)
	  , SchemaObject = __webpack_require__(33)
	  , traverse = __webpack_require__(34);
	
	module.exports = resolve;
	
	resolve.normalizeId = normalizeId;
	resolve.fullPath = getFullPath;
	resolve.url = resolveUrl;
	resolve.ids = resolveIds;
	resolve.inlineRef = inlineRef;
	resolve.schema = resolveSchema;
	
	/**
	 * [resolve and compile the references ($ref)]
	 * @this   Ajv
	 * @param  {Function} compile reference to schema compilation funciton (localCompile)
	 * @param  {Object} root object with information about the root schema for the current schema
	 * @param  {String} ref reference to resolve
	 * @return {Object|Function} schema object (if the schema can be inlined) or validation function
	 */
	function resolve(compile, root, ref) {
	  /* jshint validthis: true */
	  var refVal = this._refs[ref];
	  if (typeof refVal == 'string') {
	    if (this._refs[refVal]) refVal = this._refs[refVal];
	    else return resolve.call(this, compile, root, refVal);
	  }
	
	  refVal = refVal || this._schemas[ref];
	  if (refVal instanceof SchemaObject) {
	    return inlineRef(refVal.schema, this._opts.inlineRefs)
	            ? refVal.schema
	            : refVal.validate || this._compile(refVal);
	  }
	
	  var res = resolveSchema.call(this, root, ref);
	  var schema, v, baseId;
	  if (res) {
	    schema = res.schema;
	    root = res.root;
	    baseId = res.baseId;
	  }
	
	  if (schema instanceof SchemaObject) {
	    v = schema.validate || compile.call(this, schema.schema, root, undefined, baseId);
	  } else if (schema !== undefined) {
	    v = inlineRef(schema, this._opts.inlineRefs)
	        ? schema
	        : compile.call(this, schema, root, undefined, baseId);
	  }
	
	  return v;
	}
	
	
	/**
	 * Resolve schema, its root and baseId
	 * @this Ajv
	 * @param  {Object} root root object with properties schema, refVal, refs
	 * @param  {String} ref  reference to resolve
	 * @return {Object} object with properties schema, root, baseId
	 */
	function resolveSchema(root, ref) {
	  /* jshint validthis: true */
	  var p = url.parse(ref, false, true)
	    , refPath = _getFullPath(p)
	    , baseId = getFullPath(this._getId(root.schema));
	  if (refPath !== baseId) {
	    var id = normalizeId(refPath);
	    var refVal = this._refs[id];
	    if (typeof refVal == 'string') {
	      return resolveRecursive.call(this, root, refVal, p);
	    } else if (refVal instanceof SchemaObject) {
	      if (!refVal.validate) this._compile(refVal);
	      root = refVal;
	    } else {
	      refVal = this._schemas[id];
	      if (refVal instanceof SchemaObject) {
	        if (!refVal.validate) this._compile(refVal);
	        if (id == normalizeId(ref))
	          return { schema: refVal, root: root, baseId: baseId };
	        root = refVal;
	      } else {
	        return;
	      }
	    }
	    if (!root.schema) return;
	    baseId = getFullPath(this._getId(root.schema));
	  }
	  return getJsonPointer.call(this, p, baseId, root.schema, root);
	}
	
	
	/* @this Ajv */
	function resolveRecursive(root, ref, parsedRef) {
	  /* jshint validthis: true */
	  var res = resolveSchema.call(this, root, ref);
	  if (res) {
	    var schema = res.schema;
	    var baseId = res.baseId;
	    root = res.root;
	    var id = this._getId(schema);
	    if (id) baseId = resolveUrl(baseId, id);
	    return getJsonPointer.call(this, parsedRef, baseId, schema, root);
	  }
	}
	
	
	var PREVENT_SCOPE_CHANGE = util.toHash(['properties', 'patternProperties', 'enum', 'dependencies', 'definitions']);
	/* @this Ajv */
	function getJsonPointer(parsedRef, baseId, schema, root) {
	  /* jshint validthis: true */
	  parsedRef.hash = parsedRef.hash || '';
	  if (parsedRef.hash.slice(0,2) != '#/') return;
	  var parts = parsedRef.hash.split('/');
	
	  for (var i = 1; i < parts.length; i++) {
	    var part = parts[i];
	    if (part) {
	      part = util.unescapeFragment(part);
	      schema = schema[part];
	      if (schema === undefined) break;
	      var id;
	      if (!PREVENT_SCOPE_CHANGE[part]) {
	        id = this._getId(schema);
	        if (id) baseId = resolveUrl(baseId, id);
	        if (schema.$ref) {
	          var $ref = resolveUrl(baseId, schema.$ref);
	          var res = resolveSchema.call(this, root, $ref);
	          if (res) {
	            schema = res.schema;
	            root = res.root;
	            baseId = res.baseId;
	          }
	        }
	      }
	    }
	  }
	  if (schema !== undefined && schema !== root.schema)
	    return { schema: schema, root: root, baseId: baseId };
	}
	
	
	var SIMPLE_INLINED = util.toHash([
	  'type', 'format', 'pattern',
	  'maxLength', 'minLength',
	  'maxProperties', 'minProperties',
	  'maxItems', 'minItems',
	  'maximum', 'minimum',
	  'uniqueItems', 'multipleOf',
	  'required', 'enum'
	]);
	function inlineRef(schema, limit) {
	  if (limit === false) return false;
	  if (limit === undefined || limit === true) return checkNoRef(schema);
	  else if (limit) return countKeys(schema) <= limit;
	}
	
	
	function checkNoRef(schema) {
	  var item;
	  if (Array.isArray(schema)) {
	    for (var i=0; i<schema.length; i++) {
	      item = schema[i];
	      if (typeof item == 'object' && !checkNoRef(item)) return false;
	    }
	  } else {
	    for (var key in schema) {
	      if (key == '$ref') return false;
	      item = schema[key];
	      if (typeof item == 'object' && !checkNoRef(item)) return false;
	    }
	  }
	  return true;
	}
	
	
	function countKeys(schema) {
	  var count = 0, item;
	  if (Array.isArray(schema)) {
	    for (var i=0; i<schema.length; i++) {
	      item = schema[i];
	      if (typeof item == 'object') count += countKeys(item);
	      if (count == Infinity) return Infinity;
	    }
	  } else {
	    for (var key in schema) {
	      if (key == '$ref') return Infinity;
	      if (SIMPLE_INLINED[key]) {
	        count++;
	      } else {
	        item = schema[key];
	        if (typeof item == 'object') count += countKeys(item) + 1;
	        if (count == Infinity) return Infinity;
	      }
	    }
	  }
	  return count;
	}
	
	
	function getFullPath(id, normalize) {
	  if (normalize !== false) id = normalizeId(id);
	  var p = url.parse(id, false, true);
	  return _getFullPath(p);
	}
	
	
	function _getFullPath(p) {
	  var protocolSeparator = p.protocol || p.href.slice(0,2) == '//' ? '//' : '';
	  return (p.protocol||'') + protocolSeparator + (p.host||'') + (p.path||'')  + '#';
	}
	
	
	var TRAILING_SLASH_HASH = /#\/?$/;
	function normalizeId(id) {
	  return id ? id.replace(TRAILING_SLASH_HASH, '') : '';
	}
	
	
	function resolveUrl(baseId, id) {
	  id = normalizeId(id);
	  return url.resolve(baseId, id);
	}
	
	
	/* @this Ajv */
	function resolveIds(schema) {
	  var schemaId = normalizeId(this._getId(schema));
	  var baseIds = {'': schemaId};
	  var fullPaths = {'': getFullPath(schemaId, false)};
	  var localRefs = {};
	  var self = this;
	
	  traverse(schema, {allKeys: true}, function(sch, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
	    if (jsonPtr === '') return;
	    var id = self._getId(sch);
	    var baseId = baseIds[parentJsonPtr];
	    var fullPath = fullPaths[parentJsonPtr] + '/' + parentKeyword;
	    if (keyIndex !== undefined)
	      fullPath += '/' + (typeof keyIndex == 'number' ? keyIndex : util.escapeFragment(keyIndex));
	
	    if (typeof id == 'string') {
	      id = baseId = normalizeId(baseId ? url.resolve(baseId, id) : id);
	
	      var refVal = self._refs[id];
	      if (typeof refVal == 'string') refVal = self._refs[refVal];
	      if (refVal && refVal.schema) {
	        if (!equal(sch, refVal.schema))
	          throw new Error('id "' + id + '" resolves to more than one schema');
	      } else if (id != normalizeId(fullPath)) {
	        if (id[0] == '#') {
	          if (localRefs[id] && !equal(sch, localRefs[id]))
	            throw new Error('id "' + id + '" resolves to more than one schema');
	          localRefs[id] = sch;
	        } else {
	          self._refs[id] = fullPath;
	        }
	      }
	    }
	    baseIds[jsonPtr] = baseId;
	    fullPaths[jsonPtr] = fullPath;
	  });
	
	  return localRefs;
	}


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	var punycode = __webpack_require__(24);
	var util = __webpack_require__(26);
	
	exports.parse = urlParse;
	exports.resolve = urlResolve;
	exports.resolveObject = urlResolveObject;
	exports.format = urlFormat;
	
	exports.Url = Url;
	
	function Url() {
	  this.protocol = null;
	  this.slashes = null;
	  this.auth = null;
	  this.host = null;
	  this.port = null;
	  this.hostname = null;
	  this.hash = null;
	  this.search = null;
	  this.query = null;
	  this.pathname = null;
	  this.path = null;
	  this.href = null;
	}
	
	// Reference: RFC 3986, RFC 1808, RFC 2396
	
	// define these here so at least they only have to be
	// compiled once on the first module load.
	var protocolPattern = /^([a-z0-9.+-]+:)/i,
	    portPattern = /:[0-9]*$/,
	
	    // Special case for a simple path URL
	    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
	
	    // RFC 2396: characters reserved for delimiting URLs.
	    // We actually just auto-escape these.
	    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
	
	    // RFC 2396: characters not allowed for various reasons.
	    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),
	
	    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
	    autoEscape = ['\''].concat(unwise),
	    // Characters that are never ever allowed in a hostname.
	    // Note that any invalid chars are also handled, but these
	    // are the ones that are *expected* to be seen, so we fast-path
	    // them.
	    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
	    hostEndingChars = ['/', '?', '#'],
	    hostnameMaxLen = 255,
	    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
	    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
	    // protocols that can allow "unsafe" and "unwise" chars.
	    unsafeProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that never have a hostname.
	    hostlessProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that always contain a // bit.
	    slashedProtocol = {
	      'http': true,
	      'https': true,
	      'ftp': true,
	      'gopher': true,
	      'file': true,
	      'http:': true,
	      'https:': true,
	      'ftp:': true,
	      'gopher:': true,
	      'file:': true
	    },
	    querystring = __webpack_require__(27);
	
	function urlParse(url, parseQueryString, slashesDenoteHost) {
	  if (url && util.isObject(url) && url instanceof Url) return url;
	
	  var u = new Url;
	  u.parse(url, parseQueryString, slashesDenoteHost);
	  return u;
	}
	
	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
	  if (!util.isString(url)) {
	    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
	  }
	
	  // Copy chrome, IE, opera backslash-handling behavior.
	  // Back slashes before the query string get converted to forward slashes
	  // See: https://code.google.com/p/chromium/issues/detail?id=25916
	  var queryIndex = url.indexOf('?'),
	      splitter =
	          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
	      uSplit = url.split(splitter),
	      slashRegex = /\\/g;
	  uSplit[0] = uSplit[0].replace(slashRegex, '/');
	  url = uSplit.join(splitter);
	
	  var rest = url;
	
	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();
	
	  if (!slashesDenoteHost && url.split('#').length === 1) {
	    // Try fast path regexp
	    var simplePath = simplePathPattern.exec(rest);
	    if (simplePath) {
	      this.path = rest;
	      this.href = rest;
	      this.pathname = simplePath[1];
	      if (simplePath[2]) {
	        this.search = simplePath[2];
	        if (parseQueryString) {
	          this.query = querystring.parse(this.search.substr(1));
	        } else {
	          this.query = this.search.substr(1);
	        }
	      } else if (parseQueryString) {
	        this.search = '';
	        this.query = {};
	      }
	      return this;
	    }
	  }
	
	  var proto = protocolPattern.exec(rest);
	  if (proto) {
	    proto = proto[0];
	    var lowerProto = proto.toLowerCase();
	    this.protocol = lowerProto;
	    rest = rest.substr(proto.length);
	  }
	
	  // figure out if it's got a host
	  // user@server is *always* interpreted as a hostname, and url
	  // resolution will treat //foo/bar as host=foo,path=bar because that's
	  // how the browser resolves relative URLs.
	  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	    var slashes = rest.substr(0, 2) === '//';
	    if (slashes && !(proto && hostlessProtocol[proto])) {
	      rest = rest.substr(2);
	      this.slashes = true;
	    }
	  }
	
	  if (!hostlessProtocol[proto] &&
	      (slashes || (proto && !slashedProtocol[proto]))) {
	
	    // there's a hostname.
	    // the first instance of /, ?, ;, or # ends the host.
	    //
	    // If there is an @ in the hostname, then non-host chars *are* allowed
	    // to the left of the last @ sign, unless some host-ending character
	    // comes *before* the @-sign.
	    // URLs are obnoxious.
	    //
	    // ex:
	    // http://a@b@c/ => user:a@b host:c
	    // http://a@b?@c => user:a host:c path:/?@c
	
	    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	    // Review our test case against browsers more comprehensively.
	
	    // find the first instance of any hostEndingChars
	    var hostEnd = -1;
	    for (var i = 0; i < hostEndingChars.length; i++) {
	      var hec = rest.indexOf(hostEndingChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	
	    // at this point, either we have an explicit point where the
	    // auth portion cannot go past, or the last @ char is the decider.
	    var auth, atSign;
	    if (hostEnd === -1) {
	      // atSign can be anywhere.
	      atSign = rest.lastIndexOf('@');
	    } else {
	      // atSign must be in auth portion.
	      // http://a@b/c@d => host:b auth:a path:/c@d
	      atSign = rest.lastIndexOf('@', hostEnd);
	    }
	
	    // Now we have a portion which is definitely the auth.
	    // Pull that off.
	    if (atSign !== -1) {
	      auth = rest.slice(0, atSign);
	      rest = rest.slice(atSign + 1);
	      this.auth = decodeURIComponent(auth);
	    }
	
	    // the host is the remaining to the left of the first non-host char
	    hostEnd = -1;
	    for (var i = 0; i < nonHostChars.length; i++) {
	      var hec = rest.indexOf(nonHostChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	    // if we still have not hit it, then the entire thing is a host.
	    if (hostEnd === -1)
	      hostEnd = rest.length;
	
	    this.host = rest.slice(0, hostEnd);
	    rest = rest.slice(hostEnd);
	
	    // pull out port.
	    this.parseHost();
	
	    // we've indicated that there is a hostname,
	    // so even if it's empty, it has to be present.
	    this.hostname = this.hostname || '';
	
	    // if hostname begins with [ and ends with ]
	    // assume that it's an IPv6 address.
	    var ipv6Hostname = this.hostname[0] === '[' &&
	        this.hostname[this.hostname.length - 1] === ']';
	
	    // validate a little.
	    if (!ipv6Hostname) {
	      var hostparts = this.hostname.split(/\./);
	      for (var i = 0, l = hostparts.length; i < l; i++) {
	        var part = hostparts[i];
	        if (!part) continue;
	        if (!part.match(hostnamePartPattern)) {
	          var newpart = '';
	          for (var j = 0, k = part.length; j < k; j++) {
	            if (part.charCodeAt(j) > 127) {
	              // we replace non-ASCII char with a temporary placeholder
	              // we need this to make sure size of hostname is not
	              // broken by replacing non-ASCII by nothing
	              newpart += 'x';
	            } else {
	              newpart += part[j];
	            }
	          }
	          // we test again with ASCII char only
	          if (!newpart.match(hostnamePartPattern)) {
	            var validParts = hostparts.slice(0, i);
	            var notHost = hostparts.slice(i + 1);
	            var bit = part.match(hostnamePartStart);
	            if (bit) {
	              validParts.push(bit[1]);
	              notHost.unshift(bit[2]);
	            }
	            if (notHost.length) {
	              rest = '/' + notHost.join('.') + rest;
	            }
	            this.hostname = validParts.join('.');
	            break;
	          }
	        }
	      }
	    }
	
	    if (this.hostname.length > hostnameMaxLen) {
	      this.hostname = '';
	    } else {
	      // hostnames are always lower case.
	      this.hostname = this.hostname.toLowerCase();
	    }
	
	    if (!ipv6Hostname) {
	      // IDNA Support: Returns a punycoded representation of "domain".
	      // It only converts parts of the domain name that
	      // have non-ASCII characters, i.e. it doesn't matter if
	      // you call it with a domain that already is ASCII-only.
	      this.hostname = punycode.toASCII(this.hostname);
	    }
	
	    var p = this.port ? ':' + this.port : '';
	    var h = this.hostname || '';
	    this.host = h + p;
	    this.href += this.host;
	
	    // strip [ and ] from the hostname
	    // the host field still retains them, though
	    if (ipv6Hostname) {
	      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
	      if (rest[0] !== '/') {
	        rest = '/' + rest;
	      }
	    }
	  }
	
	  // now rest is set to the post-host stuff.
	  // chop off any delim chars.
	  if (!unsafeProtocol[lowerProto]) {
	
	    // First, make 100% sure that any "autoEscape" chars get
	    // escaped, even if encodeURIComponent doesn't think they
	    // need to be.
	    for (var i = 0, l = autoEscape.length; i < l; i++) {
	      var ae = autoEscape[i];
	      if (rest.indexOf(ae) === -1)
	        continue;
	      var esc = encodeURIComponent(ae);
	      if (esc === ae) {
	        esc = escape(ae);
	      }
	      rest = rest.split(ae).join(esc);
	    }
	  }
	
	
	  // chop off from the tail first.
	  var hash = rest.indexOf('#');
	  if (hash !== -1) {
	    // got a fragment string.
	    this.hash = rest.substr(hash);
	    rest = rest.slice(0, hash);
	  }
	  var qm = rest.indexOf('?');
	  if (qm !== -1) {
	    this.search = rest.substr(qm);
	    this.query = rest.substr(qm + 1);
	    if (parseQueryString) {
	      this.query = querystring.parse(this.query);
	    }
	    rest = rest.slice(0, qm);
	  } else if (parseQueryString) {
	    // no query string, but parseQueryString still requested
	    this.search = '';
	    this.query = {};
	  }
	  if (rest) this.pathname = rest;
	  if (slashedProtocol[lowerProto] &&
	      this.hostname && !this.pathname) {
	    this.pathname = '/';
	  }
	
	  //to support http.request
	  if (this.pathname || this.search) {
	    var p = this.pathname || '';
	    var s = this.search || '';
	    this.path = p + s;
	  }
	
	  // finally, reconstruct the href based on what has been validated.
	  this.href = this.format();
	  return this;
	};
	
	// format a parsed object into a url string
	function urlFormat(obj) {
	  // ensure it's an object, and not a string url.
	  // If it's an obj, this is a no-op.
	  // this way, you can call url_format() on strings
	  // to clean up potentially wonky urls.
	  if (util.isString(obj)) obj = urlParse(obj);
	  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
	  return obj.format();
	}
	
	Url.prototype.format = function() {
	  var auth = this.auth || '';
	  if (auth) {
	    auth = encodeURIComponent(auth);
	    auth = auth.replace(/%3A/i, ':');
	    auth += '@';
	  }
	
	  var protocol = this.protocol || '',
	      pathname = this.pathname || '',
	      hash = this.hash || '',
	      host = false,
	      query = '';
	
	  if (this.host) {
	    host = auth + this.host;
	  } else if (this.hostname) {
	    host = auth + (this.hostname.indexOf(':') === -1 ?
	        this.hostname :
	        '[' + this.hostname + ']');
	    if (this.port) {
	      host += ':' + this.port;
	    }
	  }
	
	  if (this.query &&
	      util.isObject(this.query) &&
	      Object.keys(this.query).length) {
	    query = querystring.stringify(this.query);
	  }
	
	  var search = this.search || (query && ('?' + query)) || '';
	
	  if (protocol && protocol.substr(-1) !== ':') protocol += ':';
	
	  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
	  // unless they had them to begin with.
	  if (this.slashes ||
	      (!protocol || slashedProtocol[protocol]) && host !== false) {
	    host = '//' + (host || '');
	    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
	  } else if (!host) {
	    host = '';
	  }
	
	  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
	  if (search && search.charAt(0) !== '?') search = '?' + search;
	
	  pathname = pathname.replace(/[?#]/g, function(match) {
	    return encodeURIComponent(match);
	  });
	  search = search.replace('#', '%23');
	
	  return protocol + host + pathname + search + hash;
	};
	
	function urlResolve(source, relative) {
	  return urlParse(source, false, true).resolve(relative);
	}
	
	Url.prototype.resolve = function(relative) {
	  return this.resolveObject(urlParse(relative, false, true)).format();
	};
	
	function urlResolveObject(source, relative) {
	  if (!source) return relative;
	  return urlParse(source, false, true).resolveObject(relative);
	}
	
	Url.prototype.resolveObject = function(relative) {
	  if (util.isString(relative)) {
	    var rel = new Url();
	    rel.parse(relative, false, true);
	    relative = rel;
	  }
	
	  var result = new Url();
	  var tkeys = Object.keys(this);
	  for (var tk = 0; tk < tkeys.length; tk++) {
	    var tkey = tkeys[tk];
	    result[tkey] = this[tkey];
	  }
	
	  // hash is always overridden, no matter what.
	  // even href="" will remove it.
	  result.hash = relative.hash;
	
	  // if the relative url is empty, then there's nothing left to do here.
	  if (relative.href === '') {
	    result.href = result.format();
	    return result;
	  }
	
	  // hrefs like //foo/bar always cut to the protocol.
	  if (relative.slashes && !relative.protocol) {
	    // take everything except the protocol from relative
	    var rkeys = Object.keys(relative);
	    for (var rk = 0; rk < rkeys.length; rk++) {
	      var rkey = rkeys[rk];
	      if (rkey !== 'protocol')
	        result[rkey] = relative[rkey];
	    }
	
	    //urlParse appends trailing / to urls like http://www.example.com
	    if (slashedProtocol[result.protocol] &&
	        result.hostname && !result.pathname) {
	      result.path = result.pathname = '/';
	    }
	
	    result.href = result.format();
	    return result;
	  }
	
	  if (relative.protocol && relative.protocol !== result.protocol) {
	    // if it's a known url protocol, then changing
	    // the protocol does weird things
	    // first, if it's not file:, then we MUST have a host,
	    // and if there was a path
	    // to begin with, then we MUST have a path.
	    // if it is file:, then the host is dropped,
	    // because that's known to be hostless.
	    // anything else is assumed to be absolute.
	    if (!slashedProtocol[relative.protocol]) {
	      var keys = Object.keys(relative);
	      for (var v = 0; v < keys.length; v++) {
	        var k = keys[v];
	        result[k] = relative[k];
	      }
	      result.href = result.format();
	      return result;
	    }
	
	    result.protocol = relative.protocol;
	    if (!relative.host && !hostlessProtocol[relative.protocol]) {
	      var relPath = (relative.pathname || '').split('/');
	      while (relPath.length && !(relative.host = relPath.shift()));
	      if (!relative.host) relative.host = '';
	      if (!relative.hostname) relative.hostname = '';
	      if (relPath[0] !== '') relPath.unshift('');
	      if (relPath.length < 2) relPath.unshift('');
	      result.pathname = relPath.join('/');
	    } else {
	      result.pathname = relative.pathname;
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    result.host = relative.host || '';
	    result.auth = relative.auth;
	    result.hostname = relative.hostname || relative.host;
	    result.port = relative.port;
	    // to support http.request
	    if (result.pathname || result.search) {
	      var p = result.pathname || '';
	      var s = result.search || '';
	      result.path = p + s;
	    }
	    result.slashes = result.slashes || relative.slashes;
	    result.href = result.format();
	    return result;
	  }
	
	  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
	      isRelAbs = (
	          relative.host ||
	          relative.pathname && relative.pathname.charAt(0) === '/'
	      ),
	      mustEndAbs = (isRelAbs || isSourceAbs ||
	                    (result.host && relative.pathname)),
	      removeAllDots = mustEndAbs,
	      srcPath = result.pathname && result.pathname.split('/') || [],
	      relPath = relative.pathname && relative.pathname.split('/') || [],
	      psychotic = result.protocol && !slashedProtocol[result.protocol];
	
	  // if the url is a non-slashed url, then relative
	  // links like ../.. should be able
	  // to crawl up to the hostname, as well.  This is strange.
	  // result.protocol has already been set by now.
	  // Later on, put the first path part into the host field.
	  if (psychotic) {
	    result.hostname = '';
	    result.port = null;
	    if (result.host) {
	      if (srcPath[0] === '') srcPath[0] = result.host;
	      else srcPath.unshift(result.host);
	    }
	    result.host = '';
	    if (relative.protocol) {
	      relative.hostname = null;
	      relative.port = null;
	      if (relative.host) {
	        if (relPath[0] === '') relPath[0] = relative.host;
	        else relPath.unshift(relative.host);
	      }
	      relative.host = null;
	    }
	    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
	  }
	
	  if (isRelAbs) {
	    // it's absolute.
	    result.host = (relative.host || relative.host === '') ?
	                  relative.host : result.host;
	    result.hostname = (relative.hostname || relative.hostname === '') ?
	                      relative.hostname : result.hostname;
	    result.search = relative.search;
	    result.query = relative.query;
	    srcPath = relPath;
	    // fall through to the dot-handling below.
	  } else if (relPath.length) {
	    // it's relative
	    // throw away the existing file, and take the new path instead.
	    if (!srcPath) srcPath = [];
	    srcPath.pop();
	    srcPath = srcPath.concat(relPath);
	    result.search = relative.search;
	    result.query = relative.query;
	  } else if (!util.isNullOrUndefined(relative.search)) {
	    // just pull out the search.
	    // like href='?foo'.
	    // Put this after the other two cases because it simplifies the booleans
	    if (psychotic) {
	      result.hostname = result.host = srcPath.shift();
	      //occationaly the auth can get stuck only in host
	      //this especially happens in cases like
	      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	      var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                       result.host.split('@') : false;
	      if (authInHost) {
	        result.auth = authInHost.shift();
	        result.host = result.hostname = authInHost.shift();
	      }
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    //to support http.request
	    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
	      result.path = (result.pathname ? result.pathname : '') +
	                    (result.search ? result.search : '');
	    }
	    result.href = result.format();
	    return result;
	  }
	
	  if (!srcPath.length) {
	    // no path at all.  easy.
	    // we've already handled the other stuff above.
	    result.pathname = null;
	    //to support http.request
	    if (result.search) {
	      result.path = '/' + result.search;
	    } else {
	      result.path = null;
	    }
	    result.href = result.format();
	    return result;
	  }
	
	  // if a url ENDs in . or .., then it must get a trailing slash.
	  // however, if it ends in anything else non-slashy,
	  // then it must NOT get a trailing slash.
	  var last = srcPath.slice(-1)[0];
	  var hasTrailingSlash = (
	      (result.host || relative.host || srcPath.length > 1) &&
	      (last === '.' || last === '..') || last === '');
	
	  // strip single dots, resolve double dots to parent dir
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = srcPath.length; i >= 0; i--) {
	    last = srcPath[i];
	    if (last === '.') {
	      srcPath.splice(i, 1);
	    } else if (last === '..') {
	      srcPath.splice(i, 1);
	      up++;
	    } else if (up) {
	      srcPath.splice(i, 1);
	      up--;
	    }
	  }
	
	  // if the path is allowed to go above the root, restore leading ..s
	  if (!mustEndAbs && !removeAllDots) {
	    for (; up--; up) {
	      srcPath.unshift('..');
	    }
	  }
	
	  if (mustEndAbs && srcPath[0] !== '' &&
	      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
	    srcPath.unshift('');
	  }
	
	  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
	    srcPath.push('');
	  }
	
	  var isAbsolute = srcPath[0] === '' ||
	      (srcPath[0] && srcPath[0].charAt(0) === '/');
	
	  // put the host back
	  if (psychotic) {
	    result.hostname = result.host = isAbsolute ? '' :
	                                    srcPath.length ? srcPath.shift() : '';
	    //occationaly the auth can get stuck only in host
	    //this especially happens in cases like
	    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	    var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                     result.host.split('@') : false;
	    if (authInHost) {
	      result.auth = authInHost.shift();
	      result.host = result.hostname = authInHost.shift();
	    }
	  }
	
	  mustEndAbs = mustEndAbs || (result.host && srcPath.length);
	
	  if (mustEndAbs && !isAbsolute) {
	    srcPath.unshift('');
	  }
	
	  if (!srcPath.length) {
	    result.pathname = null;
	    result.path = null;
	  } else {
	    result.pathname = srcPath.join('/');
	  }
	
	  //to support request.http
	  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
	    result.path = (result.pathname ? result.pathname : '') +
	                  (result.search ? result.search : '');
	  }
	  result.auth = relative.auth || result.auth;
	  result.slashes = result.slashes || relative.slashes;
	  result.href = result.format();
	  return result;
	};
	
	Url.prototype.parseHost = function() {
	  var host = this.host;
	  var port = portPattern.exec(host);
	  if (port) {
	    port = port[0];
	    if (port !== ':') {
	      this.port = port.substr(1);
	    }
	    host = host.substr(0, host.length - port.length);
	  }
	  if (host) this.hostname = host;
	};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! https://mths.be/punycode v1.3.2 by @mathias */
	;(function(root) {
	
		/** Detect free variables */
		var freeExports = typeof exports == 'object' && exports &&
			!exports.nodeType && exports;
		var freeModule = typeof module == 'object' && module &&
			!module.nodeType && module;
		var freeGlobal = typeof global == 'object' && global;
		if (
			freeGlobal.global === freeGlobal ||
			freeGlobal.window === freeGlobal ||
			freeGlobal.self === freeGlobal
		) {
			root = freeGlobal;
		}
	
		/**
		 * The `punycode` object.
		 * @name punycode
		 * @type Object
		 */
		var punycode,
	
		/** Highest positive signed 32-bit float value */
		maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1
	
		/** Bootstring parameters */
		base = 36,
		tMin = 1,
		tMax = 26,
		skew = 38,
		damp = 700,
		initialBias = 72,
		initialN = 128, // 0x80
		delimiter = '-', // '\x2D'
	
		/** Regular expressions */
		regexPunycode = /^xn--/,
		regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
		regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators
	
		/** Error messages */
		errors = {
			'overflow': 'Overflow: input needs wider integers to process',
			'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
			'invalid-input': 'Invalid input'
		},
	
		/** Convenience shortcuts */
		baseMinusTMin = base - tMin,
		floor = Math.floor,
		stringFromCharCode = String.fromCharCode,
	
		/** Temporary variable */
		key;
	
		/*--------------------------------------------------------------------------*/
	
		/**
		 * A generic error utility function.
		 * @private
		 * @param {String} type The error type.
		 * @returns {Error} Throws a `RangeError` with the applicable error message.
		 */
		function error(type) {
			throw RangeError(errors[type]);
		}
	
		/**
		 * A generic `Array#map` utility function.
		 * @private
		 * @param {Array} array The array to iterate over.
		 * @param {Function} callback The function that gets called for every array
		 * item.
		 * @returns {Array} A new array of values returned by the callback function.
		 */
		function map(array, fn) {
			var length = array.length;
			var result = [];
			while (length--) {
				result[length] = fn(array[length]);
			}
			return result;
		}
	
		/**
		 * A simple `Array#map`-like wrapper to work with domain name strings or email
		 * addresses.
		 * @private
		 * @param {String} domain The domain name or email address.
		 * @param {Function} callback The function that gets called for every
		 * character.
		 * @returns {Array} A new string of characters returned by the callback
		 * function.
		 */
		function mapDomain(string, fn) {
			var parts = string.split('@');
			var result = '';
			if (parts.length > 1) {
				// In email addresses, only the domain name should be punycoded. Leave
				// the local part (i.e. everything up to `@`) intact.
				result = parts[0] + '@';
				string = parts[1];
			}
			// Avoid `split(regex)` for IE8 compatibility. See #17.
			string = string.replace(regexSeparators, '\x2E');
			var labels = string.split('.');
			var encoded = map(labels, fn).join('.');
			return result + encoded;
		}
	
		/**
		 * Creates an array containing the numeric code points of each Unicode
		 * character in the string. While JavaScript uses UCS-2 internally,
		 * this function will convert a pair of surrogate halves (each of which
		 * UCS-2 exposes as separate characters) into a single code point,
		 * matching UTF-16.
		 * @see `punycode.ucs2.encode`
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode.ucs2
		 * @name decode
		 * @param {String} string The Unicode input string (UCS-2).
		 * @returns {Array} The new array of code points.
		 */
		function ucs2decode(string) {
			var output = [],
			    counter = 0,
			    length = string.length,
			    value,
			    extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}
	
		/**
		 * Creates a string based on an array of numeric code points.
		 * @see `punycode.ucs2.decode`
		 * @memberOf punycode.ucs2
		 * @name encode
		 * @param {Array} codePoints The array of numeric code points.
		 * @returns {String} The new Unicode string (UCS-2).
		 */
		function ucs2encode(array) {
			return map(array, function(value) {
				var output = '';
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
				return output;
			}).join('');
		}
	
		/**
		 * Converts a basic code point into a digit/integer.
		 * @see `digitToBasic()`
		 * @private
		 * @param {Number} codePoint The basic numeric code point value.
		 * @returns {Number} The numeric value of a basic code point (for use in
		 * representing integers) in the range `0` to `base - 1`, or `base` if
		 * the code point does not represent a value.
		 */
		function basicToDigit(codePoint) {
			if (codePoint - 48 < 10) {
				return codePoint - 22;
			}
			if (codePoint - 65 < 26) {
				return codePoint - 65;
			}
			if (codePoint - 97 < 26) {
				return codePoint - 97;
			}
			return base;
		}
	
		/**
		 * Converts a digit/integer into a basic code point.
		 * @see `basicToDigit()`
		 * @private
		 * @param {Number} digit The numeric value of a basic code point.
		 * @returns {Number} The basic code point whose value (when used for
		 * representing integers) is `digit`, which needs to be in the range
		 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
		 * used; else, the lowercase form is used. The behavior is undefined
		 * if `flag` is non-zero and `digit` has no uppercase form.
		 */
		function digitToBasic(digit, flag) {
			//  0..25 map to ASCII a..z or A..Z
			// 26..35 map to ASCII 0..9
			return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
		}
	
		/**
		 * Bias adaptation function as per section 3.4 of RFC 3492.
		 * http://tools.ietf.org/html/rfc3492#section-3.4
		 * @private
		 */
		function adapt(delta, numPoints, firstTime) {
			var k = 0;
			delta = firstTime ? floor(delta / damp) : delta >> 1;
			delta += floor(delta / numPoints);
			for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
				delta = floor(delta / baseMinusTMin);
			}
			return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
		}
	
		/**
		 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
		 * symbols.
		 * @memberOf punycode
		 * @param {String} input The Punycode string of ASCII-only symbols.
		 * @returns {String} The resulting string of Unicode symbols.
		 */
		function decode(input) {
			// Don't use UCS-2
			var output = [],
			    inputLength = input.length,
			    out,
			    i = 0,
			    n = initialN,
			    bias = initialBias,
			    basic,
			    j,
			    index,
			    oldi,
			    w,
			    k,
			    digit,
			    t,
			    /** Cached calculation results */
			    baseMinusT;
	
			// Handle the basic code points: let `basic` be the number of input code
			// points before the last delimiter, or `0` if there is none, then copy
			// the first basic code points to the output.
	
			basic = input.lastIndexOf(delimiter);
			if (basic < 0) {
				basic = 0;
			}
	
			for (j = 0; j < basic; ++j) {
				// if it's not a basic code point
				if (input.charCodeAt(j) >= 0x80) {
					error('not-basic');
				}
				output.push(input.charCodeAt(j));
			}
	
			// Main decoding loop: start just after the last delimiter if any basic code
			// points were copied; start at the beginning otherwise.
	
			for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {
	
				// `index` is the index of the next character to be consumed.
				// Decode a generalized variable-length integer into `delta`,
				// which gets added to `i`. The overflow checking is easier
				// if we increase `i` as we go, then subtract off its starting
				// value at the end to obtain `delta`.
				for (oldi = i, w = 1, k = base; /* no condition */; k += base) {
	
					if (index >= inputLength) {
						error('invalid-input');
					}
	
					digit = basicToDigit(input.charCodeAt(index++));
	
					if (digit >= base || digit > floor((maxInt - i) / w)) {
						error('overflow');
					}
	
					i += digit * w;
					t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	
					if (digit < t) {
						break;
					}
	
					baseMinusT = base - t;
					if (w > floor(maxInt / baseMinusT)) {
						error('overflow');
					}
	
					w *= baseMinusT;
	
				}
	
				out = output.length + 1;
				bias = adapt(i - oldi, out, oldi == 0);
	
				// `i` was supposed to wrap around from `out` to `0`,
				// incrementing `n` each time, so we'll fix that now:
				if (floor(i / out) > maxInt - n) {
					error('overflow');
				}
	
				n += floor(i / out);
				i %= out;
	
				// Insert `n` at position `i` of the output
				output.splice(i++, 0, n);
	
			}
	
			return ucs2encode(output);
		}
	
		/**
		 * Converts a string of Unicode symbols (e.g. a domain name label) to a
		 * Punycode string of ASCII-only symbols.
		 * @memberOf punycode
		 * @param {String} input The string of Unicode symbols.
		 * @returns {String} The resulting Punycode string of ASCII-only symbols.
		 */
		function encode(input) {
			var n,
			    delta,
			    handledCPCount,
			    basicLength,
			    bias,
			    j,
			    m,
			    q,
			    k,
			    t,
			    currentValue,
			    output = [],
			    /** `inputLength` will hold the number of code points in `input`. */
			    inputLength,
			    /** Cached calculation results */
			    handledCPCountPlusOne,
			    baseMinusT,
			    qMinusT;
	
			// Convert the input in UCS-2 to Unicode
			input = ucs2decode(input);
	
			// Cache the length
			inputLength = input.length;
	
			// Initialize the state
			n = initialN;
			delta = 0;
			bias = initialBias;
	
			// Handle the basic code points
			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue < 0x80) {
					output.push(stringFromCharCode(currentValue));
				}
			}
	
			handledCPCount = basicLength = output.length;
	
			// `handledCPCount` is the number of code points that have been handled;
			// `basicLength` is the number of basic code points.
	
			// Finish the basic string - if it is not empty - with a delimiter
			if (basicLength) {
				output.push(delimiter);
			}
	
			// Main encoding loop:
			while (handledCPCount < inputLength) {
	
				// All non-basic code points < n have been handled already. Find the next
				// larger one:
				for (m = maxInt, j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue >= n && currentValue < m) {
						m = currentValue;
					}
				}
	
				// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
				// but guard against overflow
				handledCPCountPlusOne = handledCPCount + 1;
				if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
					error('overflow');
				}
	
				delta += (m - n) * handledCPCountPlusOne;
				n = m;
	
				for (j = 0; j < inputLength; ++j) {
					currentValue = input[j];
	
					if (currentValue < n && ++delta > maxInt) {
						error('overflow');
					}
	
					if (currentValue == n) {
						// Represent delta as a generalized variable-length integer
						for (q = delta, k = base; /* no condition */; k += base) {
							t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
							if (q < t) {
								break;
							}
							qMinusT = q - t;
							baseMinusT = base - t;
							output.push(
								stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
							);
							q = floor(qMinusT / baseMinusT);
						}
	
						output.push(stringFromCharCode(digitToBasic(q, 0)));
						bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
						delta = 0;
						++handledCPCount;
					}
				}
	
				++delta;
				++n;
	
			}
			return output.join('');
		}
	
		/**
		 * Converts a Punycode string representing a domain name or an email address
		 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
		 * it doesn't matter if you call it on a string that has already been
		 * converted to Unicode.
		 * @memberOf punycode
		 * @param {String} input The Punycoded domain name or email address to
		 * convert to Unicode.
		 * @returns {String} The Unicode representation of the given Punycode
		 * string.
		 */
		function toUnicode(input) {
			return mapDomain(input, function(string) {
				return regexPunycode.test(string)
					? decode(string.slice(4).toLowerCase())
					: string;
			});
		}
	
		/**
		 * Converts a Unicode string representing a domain name or an email address to
		 * Punycode. Only the non-ASCII parts of the domain name will be converted,
		 * i.e. it doesn't matter if you call it with a domain that's already in
		 * ASCII.
		 * @memberOf punycode
		 * @param {String} input The domain name or email address to convert, as a
		 * Unicode string.
		 * @returns {String} The Punycode representation of the given domain name or
		 * email address.
		 */
		function toASCII(input) {
			return mapDomain(input, function(string) {
				return regexNonASCII.test(string)
					? 'xn--' + encode(string)
					: string;
			});
		}
	
		/*--------------------------------------------------------------------------*/
	
		/** Define the public API */
		punycode = {
			/**
			 * A string representing the current Punycode.js version number.
			 * @memberOf punycode
			 * @type String
			 */
			'version': '1.3.2',
			/**
			 * An object of methods to convert from JavaScript's internal character
			 * representation (UCS-2) to Unicode code points, and back.
			 * @see <https://mathiasbynens.be/notes/javascript-encoding>
			 * @memberOf punycode
			 * @type Object
			 */
			'ucs2': {
				'decode': ucs2decode,
				'encode': ucs2encode
			},
			'decode': decode,
			'encode': encode,
			'toASCII': toASCII,
			'toUnicode': toUnicode
		};
	
		/** Expose `punycode` */
		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return punycode;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (freeExports && freeModule) {
			if (module.exports == freeExports) { // in Node.js or RingoJS v0.8.0+
				freeModule.exports = punycode;
			} else { // in Narwhal or RingoJS v0.7.0-
				for (key in punycode) {
					punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
				}
			}
		} else { // in Rhino or a web browser
			root.punycode = punycode;
		}
	
	}(this));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(25)(module), (function() { return this; }())))

/***/ }),
/* 25 */
/***/ (function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }),
/* 26 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = {
	  isString: function(arg) {
	    return typeof(arg) === 'string';
	  },
	  isObject: function(arg) {
	    return typeof(arg) === 'object' && arg !== null;
	  },
	  isNull: function(arg) {
	    return arg === null;
	  },
	  isNullOrUndefined: function(arg) {
	    return arg == null;
	  }
	};


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.decode = exports.parse = __webpack_require__(28);
	exports.encode = exports.stringify = __webpack_require__(29);


/***/ }),
/* 28 */
/***/ (function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	
	module.exports = function(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};
	
	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }
	
	  var regexp = /\+/g;
	  qs = qs.split(sep);
	
	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }
	
	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }
	
	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;
	
	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }
	
	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);
	
	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (Array.isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }
	
	  return obj;
	};


/***/ }),
/* 29 */
/***/ (function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;
	
	    case 'boolean':
	      return v ? 'true' : 'false';
	
	    case 'number':
	      return isFinite(v) ? v : '';
	
	    default:
	      return '';
	  }
	};
	
	module.exports = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }
	
	  if (typeof obj === 'object') {
	    return Object.keys(obj).map(function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (Array.isArray(obj[k])) {
	        return obj[k].map(function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);
	
	  }
	
	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};


/***/ }),
/* 30 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function equal(a, b) {
	  if (a === b) return true;
	
	  var arrA = Array.isArray(a)
	    , arrB = Array.isArray(b)
	    , i;
	
	  if (arrA && arrB) {
	    if (a.length != b.length) return false;
	    for (i = 0; i < a.length; i++)
	      if (!equal(a[i], b[i])) return false;
	    return true;
	  }
	
	  if (arrA != arrB) return false;
	
	  if (a && b && typeof a === 'object' && typeof b === 'object') {
	    var keys = Object.keys(a);
	    if (keys.length !== Object.keys(b).length) return false;
	
	    var dateA = a instanceof Date
	      , dateB = b instanceof Date;
	    if (dateA && dateB) return a.getTime() == b.getTime();
	    if (dateA != dateB) return false;
	
	    var regexpA = a instanceof RegExp
	      , regexpB = b instanceof RegExp;
	    if (regexpA && regexpB) return a.toString() == b.toString();
	    if (regexpA != regexpB) return false;
	
	    for (i = 0; i < keys.length; i++)
	      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
	
	    for (i = 0; i < keys.length; i++)
	      if(!equal(a[keys[i]], b[keys[i]])) return false;
	
	    return true;
	  }
	
	  return false;
	};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	
	module.exports = {
	  copy: copy,
	  checkDataType: checkDataType,
	  checkDataTypes: checkDataTypes,
	  coerceToTypes: coerceToTypes,
	  toHash: toHash,
	  getProperty: getProperty,
	  escapeQuotes: escapeQuotes,
	  equal: __webpack_require__(30),
	  ucs2length: __webpack_require__(32),
	  varOccurences: varOccurences,
	  varReplace: varReplace,
	  cleanUpCode: cleanUpCode,
	  finalCleanUpCode: finalCleanUpCode,
	  schemaHasRules: schemaHasRules,
	  schemaHasRulesExcept: schemaHasRulesExcept,
	  toQuotedString: toQuotedString,
	  getPathExpr: getPathExpr,
	  getPath: getPath,
	  getData: getData,
	  unescapeFragment: unescapeFragment,
	  unescapeJsonPointer: unescapeJsonPointer,
	  escapeFragment: escapeFragment,
	  escapeJsonPointer: escapeJsonPointer
	};
	
	
	function copy(o, to) {
	  to = to || {};
	  for (var key in o) to[key] = o[key];
	  return to;
	}
	
	
	function checkDataType(dataType, data, negate) {
	  var EQUAL = negate ? ' !== ' : ' === '
	    , AND = negate ? ' || ' : ' && '
	    , OK = negate ? '!' : ''
	    , NOT = negate ? '' : '!';
	  switch (dataType) {
	    case 'null': return data + EQUAL + 'null';
	    case 'array': return OK + 'Array.isArray(' + data + ')';
	    case 'object': return '(' + OK + data + AND +
	                          'typeof ' + data + EQUAL + '"object"' + AND +
	                          NOT + 'Array.isArray(' + data + '))';
	    case 'integer': return '(typeof ' + data + EQUAL + '"number"' + AND +
	                           NOT + '(' + data + ' % 1)' +
	                           AND + data + EQUAL + data + ')';
	    default: return 'typeof ' + data + EQUAL + '"' + dataType + '"';
	  }
	}
	
	
	function checkDataTypes(dataTypes, data) {
	  switch (dataTypes.length) {
	    case 1: return checkDataType(dataTypes[0], data, true);
	    default:
	      var code = '';
	      var types = toHash(dataTypes);
	      if (types.array && types.object) {
	        code = types.null ? '(': '(!' + data + ' || ';
	        code += 'typeof ' + data + ' !== "object")';
	        delete types.null;
	        delete types.array;
	        delete types.object;
	      }
	      if (types.number) delete types.integer;
	      for (var t in types)
	        code += (code ? ' && ' : '' ) + checkDataType(t, data, true);
	
	      return code;
	  }
	}
	
	
	var COERCE_TO_TYPES = toHash([ 'string', 'number', 'integer', 'boolean', 'null' ]);
	function coerceToTypes(optionCoerceTypes, dataTypes) {
	  if (Array.isArray(dataTypes)) {
	    var types = [];
	    for (var i=0; i<dataTypes.length; i++) {
	      var t = dataTypes[i];
	      if (COERCE_TO_TYPES[t]) types[types.length] = t;
	      else if (optionCoerceTypes === 'array' && t === 'array') types[types.length] = t;
	    }
	    if (types.length) return types;
	  } else if (COERCE_TO_TYPES[dataTypes]) {
	    return [dataTypes];
	  } else if (optionCoerceTypes === 'array' && dataTypes === 'array') {
	    return ['array'];
	  }
	}
	
	
	function toHash(arr) {
	  var hash = {};
	  for (var i=0; i<arr.length; i++) hash[arr[i]] = true;
	  return hash;
	}
	
	
	var IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
	var SINGLE_QUOTE = /'|\\/g;
	function getProperty(key) {
	  return typeof key == 'number'
	          ? '[' + key + ']'
	          : IDENTIFIER.test(key)
	            ? '.' + key
	            : "['" + escapeQuotes(key) + "']";
	}
	
	
	function escapeQuotes(str) {
	  return str.replace(SINGLE_QUOTE, '\\$&')
	            .replace(/\n/g, '\\n')
	            .replace(/\r/g, '\\r')
	            .replace(/\f/g, '\\f')
	            .replace(/\t/g, '\\t');
	}
	
	
	function varOccurences(str, dataVar) {
	  dataVar += '[^0-9]';
	  var matches = str.match(new RegExp(dataVar, 'g'));
	  return matches ? matches.length : 0;
	}
	
	
	function varReplace(str, dataVar, expr) {
	  dataVar += '([^0-9])';
	  expr = expr.replace(/\$/g, '$$$$');
	  return str.replace(new RegExp(dataVar, 'g'), expr + '$1');
	}
	
	
	var EMPTY_ELSE = /else\s*{\s*}/g
	  , EMPTY_IF_NO_ELSE = /if\s*\([^)]+\)\s*\{\s*\}(?!\s*else)/g
	  , EMPTY_IF_WITH_ELSE = /if\s*\(([^)]+)\)\s*\{\s*\}\s*else(?!\s*if)/g;
	function cleanUpCode(out) {
	  return out.replace(EMPTY_ELSE, '')
	            .replace(EMPTY_IF_NO_ELSE, '')
	            .replace(EMPTY_IF_WITH_ELSE, 'if (!($1))');
	}
	
	
	var ERRORS_REGEXP = /[^v.]errors/g
	  , REMOVE_ERRORS = /var errors = 0;|var vErrors = null;|validate.errors = vErrors;/g
	  , REMOVE_ERRORS_ASYNC = /var errors = 0;|var vErrors = null;/g
	  , RETURN_VALID = 'return errors === 0;'
	  , RETURN_TRUE = 'validate.errors = null; return true;'
	  , RETURN_ASYNC = /if \(errors === 0\) return data;\s*else throw new ValidationError\(vErrors\);/
	  , RETURN_DATA_ASYNC = 'return data;'
	  , ROOTDATA_REGEXP = /[^A-Za-z_$]rootData[^A-Za-z0-9_$]/g
	  , REMOVE_ROOTDATA = /if \(rootData === undefined\) rootData = data;/;
	
	function finalCleanUpCode(out, async) {
	  var matches = out.match(ERRORS_REGEXP);
	  if (matches && matches.length == 2) {
	    out = async
	          ? out.replace(REMOVE_ERRORS_ASYNC, '')
	               .replace(RETURN_ASYNC, RETURN_DATA_ASYNC)
	          : out.replace(REMOVE_ERRORS, '')
	               .replace(RETURN_VALID, RETURN_TRUE);
	  }
	
	  matches = out.match(ROOTDATA_REGEXP);
	  if (!matches || matches.length !== 3) return out;
	  return out.replace(REMOVE_ROOTDATA, '');
	}
	
	
	function schemaHasRules(schema, rules) {
	  if (typeof schema == 'boolean') return !schema;
	  for (var key in schema) if (rules[key]) return true;
	}
	
	
	function schemaHasRulesExcept(schema, rules, exceptKeyword) {
	  if (typeof schema == 'boolean') return !schema && exceptKeyword != 'not';
	  for (var key in schema) if (key != exceptKeyword && rules[key]) return true;
	}
	
	
	function toQuotedString(str) {
	  return '\'' + escapeQuotes(str) + '\'';
	}
	
	
	function getPathExpr(currentPath, expr, jsonPointers, isNumber) {
	  var path = jsonPointers // false by default
	              ? '\'/\' + ' + expr + (isNumber ? '' : '.replace(/~/g, \'~0\').replace(/\\//g, \'~1\')')
	              : (isNumber ? '\'[\' + ' + expr + ' + \']\'' : '\'[\\\'\' + ' + expr + ' + \'\\\']\'');
	  return joinPaths(currentPath, path);
	}
	
	
	function getPath(currentPath, prop, jsonPointers) {
	  var path = jsonPointers // false by default
	              ? toQuotedString('/' + escapeJsonPointer(prop))
	              : toQuotedString(getProperty(prop));
	  return joinPaths(currentPath, path);
	}
	
	
	var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
	var RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
	function getData($data, lvl, paths) {
	  var up, jsonPointer, data, matches;
	  if ($data === '') return 'rootData';
	  if ($data[0] == '/') {
	    if (!JSON_POINTER.test($data)) throw new Error('Invalid JSON-pointer: ' + $data);
	    jsonPointer = $data;
	    data = 'rootData';
	  } else {
	    matches = $data.match(RELATIVE_JSON_POINTER);
	    if (!matches) throw new Error('Invalid JSON-pointer: ' + $data);
	    up = +matches[1];
	    jsonPointer = matches[2];
	    if (jsonPointer == '#') {
	      if (up >= lvl) throw new Error('Cannot access property/index ' + up + ' levels up, current level is ' + lvl);
	      return paths[lvl - up];
	    }
	
	    if (up > lvl) throw new Error('Cannot access data ' + up + ' levels up, current level is ' + lvl);
	    data = 'data' + ((lvl - up) || '');
	    if (!jsonPointer) return data;
	  }
	
	  var expr = data;
	  var segments = jsonPointer.split('/');
	  for (var i=0; i<segments.length; i++) {
	    var segment = segments[i];
	    if (segment) {
	      data += getProperty(unescapeJsonPointer(segment));
	      expr += ' && ' + data;
	    }
	  }
	  return expr;
	}
	
	
	function joinPaths (a, b) {
	  if (a == '""') return b;
	  return (a + ' + ' + b).replace(/' \+ '/g, '');
	}
	
	
	function unescapeFragment(str) {
	  return unescapeJsonPointer(decodeURIComponent(str));
	}
	
	
	function escapeFragment(str) {
	  return encodeURIComponent(escapeJsonPointer(str));
	}
	
	
	function escapeJsonPointer(str) {
	  return str.replace(/~/g, '~0').replace(/\//g, '~1');
	}
	
	
	function unescapeJsonPointer(str) {
	  return str.replace(/~1/g, '/').replace(/~0/g, '~');
	}


/***/ }),
/* 32 */
/***/ (function(module, exports) {

	'use strict';
	
	// https://mathiasbynens.be/notes/javascript-encoding
	// https://github.com/bestiejs/punycode.js - punycode.ucs2.decode
	module.exports = function ucs2length(str) {
	  var length = 0
	    , len = str.length
	    , pos = 0
	    , value;
	  while (pos < len) {
	    length++;
	    value = str.charCodeAt(pos++);
	    if (value >= 0xD800 && value <= 0xDBFF && pos < len) {
	      // high surrogate, and there is a next character
	      value = str.charCodeAt(pos);
	      if ((value & 0xFC00) == 0xDC00) pos++; // low surrogate
	    }
	  }
	  return length;
	};


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var util = __webpack_require__(31);
	
	module.exports = SchemaObject;
	
	function SchemaObject(obj) {
	  util.copy(obj, this);
	}


/***/ }),
/* 34 */
/***/ (function(module, exports) {

	'use strict';
	
	var traverse = module.exports = function (schema, opts, cb) {
	  if (typeof opts == 'function') {
	    cb = opts;
	    opts = {};
	  }
	  _traverse(opts, cb, schema, '', schema);
	};
	
	
	traverse.keywords = {
	  additionalItems: true,
	  items: true,
	  contains: true,
	  additionalProperties: true,
	  propertyNames: true,
	  not: true
	};
	
	traverse.arrayKeywords = {
	  items: true,
	  allOf: true,
	  anyOf: true,
	  oneOf: true
	};
	
	traverse.propsKeywords = {
	  definitions: true,
	  properties: true,
	  patternProperties: true,
	  dependencies: true
	};
	
	traverse.skipKeywords = {
	  enum: true,
	  const: true,
	  required: true,
	  maximum: true,
	  minimum: true,
	  exclusiveMaximum: true,
	  exclusiveMinimum: true,
	  multipleOf: true,
	  maxLength: true,
	  minLength: true,
	  pattern: true,
	  format: true,
	  maxItems: true,
	  minItems: true,
	  uniqueItems: true,
	  maxProperties: true,
	  minProperties: true
	};
	
	
	function _traverse(opts, cb, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
	  if (schema && typeof schema == 'object' && !Array.isArray(schema)) {
	    cb(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
	    for (var key in schema) {
	      var sch = schema[key];
	      if (Array.isArray(sch)) {
	        if (key in traverse.arrayKeywords) {
	          for (var i=0; i<sch.length; i++)
	            _traverse(opts, cb, sch[i], jsonPtr + '/' + key + '/' + i, rootSchema, jsonPtr, key, schema, i);
	        }
	      } else if (key in traverse.propsKeywords) {
	        if (sch && typeof sch == 'object') {
	          for (var prop in sch)
	            _traverse(opts, cb, sch[prop], jsonPtr + '/' + key + '/' + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
	        }
	      } else if (key in traverse.keywords || (opts.allKeys && !(key in traverse.skipKeywords))) {
	        _traverse(opts, cb, sch, jsonPtr + '/' + key, rootSchema, jsonPtr, key, schema);
	      }
	    }
	  }
	}
	
	
	function escapeJsonPtr(str) {
	  return str.replace(/~/g, '~0').replace(/\//g, '~1');
	}


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var resolve = __webpack_require__(22);
	
	module.exports = {
	  Validation: errorSubclass(ValidationError),
	  MissingRef: errorSubclass(MissingRefError)
	};
	
	
	function ValidationError(errors) {
	  this.message = 'validation failed';
	  this.errors = errors;
	  this.ajv = this.validation = true;
	}
	
	
	MissingRefError.message = function (baseId, ref) {
	  return 'can\'t resolve reference ' + ref + ' from id ' + baseId;
	};
	
	
	function MissingRefError(baseId, ref, message) {
	  this.message = message || MissingRefError.message(baseId, ref);
	  this.missingRef = resolve.url(baseId, ref);
	  this.missingSchema = resolve.normalizeId(resolve.fullPath(this.missingRef));
	}
	
	
	function errorSubclass(Subclass) {
	  Subclass.prototype = Object.create(Error.prototype);
	  Subclass.prototype.constructor = Subclass;
	  return Subclass;
	}


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	var json = typeof JSON !== 'undefined' ? JSON : __webpack_require__(37);
	
	module.exports = function (obj, opts) {
	    if (!opts) opts = {};
	    if (typeof opts === 'function') opts = { cmp: opts };
	    var space = opts.space || '';
	    if (typeof space === 'number') space = Array(space+1).join(' ');
	    var cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;
	    var replacer = opts.replacer || function(key, value) { return value; };
	
	    var cmp = opts.cmp && (function (f) {
	        return function (node) {
	            return function (a, b) {
	                var aobj = { key: a, value: node[a] };
	                var bobj = { key: b, value: node[b] };
	                return f(aobj, bobj);
	            };
	        };
	    })(opts.cmp);
	
	    var seen = [];
	    return (function stringify (parent, key, node, level) {
	        var indent = space ? ('\n' + new Array(level + 1).join(space)) : '';
	        var colonSeparator = space ? ': ' : ':';
	
	        if (node && node.toJSON && typeof node.toJSON === 'function') {
	            node = node.toJSON();
	        }
	
	        node = replacer.call(parent, key, node);
	
	        if (node === undefined) {
	            return;
	        }
	        if (typeof node !== 'object' || node === null) {
	            return json.stringify(node);
	        }
	        if (isArray(node)) {
	            var out = [];
	            for (var i = 0; i < node.length; i++) {
	                var item = stringify(node, i, node[i], level+1) || json.stringify(null);
	                out.push(indent + space + item);
	            }
	            return '[' + out.join(',') + indent + ']';
	        }
	        else {
	            if (seen.indexOf(node) !== -1) {
	                if (cycles) return json.stringify('__cycle__');
	                throw new TypeError('Converting circular structure to JSON');
	            }
	            else seen.push(node);
	
	            var keys = objectKeys(node).sort(cmp && cmp(node));
	            var out = [];
	            for (var i = 0; i < keys.length; i++) {
	                var key = keys[i];
	                var value = stringify(node, key, node[key], level+1);
	
	                if(!value) continue;
	
	                var keyValue = json.stringify(key)
	                    + colonSeparator
	                    + value;
	                ;
	                out.push(indent + space + keyValue);
	            }
	            seen.splice(seen.indexOf(node), 1);
	            return '{' + out.join(',') + indent + '}';
	        }
	    })({ '': obj }, '', obj, 0);
	};
	
	var isArray = Array.isArray || function (x) {
	    return {}.toString.call(x) === '[object Array]';
	};
	
	var objectKeys = Object.keys || function (obj) {
	    var has = Object.prototype.hasOwnProperty || function () { return true };
	    var keys = [];
	    for (var key in obj) {
	        if (has.call(obj, key)) keys.push(key);
	    }
	    return keys;
	};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	exports.parse = __webpack_require__(38);
	exports.stringify = __webpack_require__(39);


/***/ }),
/* 38 */
/***/ (function(module, exports) {

	var at, // The index of the current character
	    ch, // The current character
	    escapee = {
	        '"':  '"',
	        '\\': '\\',
	        '/':  '/',
	        b:    '\b',
	        f:    '\f',
	        n:    '\n',
	        r:    '\r',
	        t:    '\t'
	    },
	    text,
	
	    error = function (m) {
	        // Call error when something is wrong.
	        throw {
	            name:    'SyntaxError',
	            message: m,
	            at:      at,
	            text:    text
	        };
	    },
	    
	    next = function (c) {
	        // If a c parameter is provided, verify that it matches the current character.
	        if (c && c !== ch) {
	            error("Expected '" + c + "' instead of '" + ch + "'");
	        }
	        
	        // Get the next character. When there are no more characters,
	        // return the empty string.
	        
	        ch = text.charAt(at);
	        at += 1;
	        return ch;
	    },
	    
	    number = function () {
	        // Parse a number value.
	        var number,
	            string = '';
	        
	        if (ch === '-') {
	            string = '-';
	            next('-');
	        }
	        while (ch >= '0' && ch <= '9') {
	            string += ch;
	            next();
	        }
	        if (ch === '.') {
	            string += '.';
	            while (next() && ch >= '0' && ch <= '9') {
	                string += ch;
	            }
	        }
	        if (ch === 'e' || ch === 'E') {
	            string += ch;
	            next();
	            if (ch === '-' || ch === '+') {
	                string += ch;
	                next();
	            }
	            while (ch >= '0' && ch <= '9') {
	                string += ch;
	                next();
	            }
	        }
	        number = +string;
	        if (!isFinite(number)) {
	            error("Bad number");
	        } else {
	            return number;
	        }
	    },
	    
	    string = function () {
	        // Parse a string value.
	        var hex,
	            i,
	            string = '',
	            uffff;
	        
	        // When parsing for string values, we must look for " and \ characters.
	        if (ch === '"') {
	            while (next()) {
	                if (ch === '"') {
	                    next();
	                    return string;
	                } else if (ch === '\\') {
	                    next();
	                    if (ch === 'u') {
	                        uffff = 0;
	                        for (i = 0; i < 4; i += 1) {
	                            hex = parseInt(next(), 16);
	                            if (!isFinite(hex)) {
	                                break;
	                            }
	                            uffff = uffff * 16 + hex;
	                        }
	                        string += String.fromCharCode(uffff);
	                    } else if (typeof escapee[ch] === 'string') {
	                        string += escapee[ch];
	                    } else {
	                        break;
	                    }
	                } else {
	                    string += ch;
	                }
	            }
	        }
	        error("Bad string");
	    },
	
	    white = function () {
	
	// Skip whitespace.
	
	        while (ch && ch <= ' ') {
	            next();
	        }
	    },
	
	    word = function () {
	
	// true, false, or null.
	
	        switch (ch) {
	        case 't':
	            next('t');
	            next('r');
	            next('u');
	            next('e');
	            return true;
	        case 'f':
	            next('f');
	            next('a');
	            next('l');
	            next('s');
	            next('e');
	            return false;
	        case 'n':
	            next('n');
	            next('u');
	            next('l');
	            next('l');
	            return null;
	        }
	        error("Unexpected '" + ch + "'");
	    },
	
	    value,  // Place holder for the value function.
	
	    array = function () {
	
	// Parse an array value.
	
	        var array = [];
	
	        if (ch === '[') {
	            next('[');
	            white();
	            if (ch === ']') {
	                next(']');
	                return array;   // empty array
	            }
	            while (ch) {
	                array.push(value());
	                white();
	                if (ch === ']') {
	                    next(']');
	                    return array;
	                }
	                next(',');
	                white();
	            }
	        }
	        error("Bad array");
	    },
	
	    object = function () {
	
	// Parse an object value.
	
	        var key,
	            object = {};
	
	        if (ch === '{') {
	            next('{');
	            white();
	            if (ch === '}') {
	                next('}');
	                return object;   // empty object
	            }
	            while (ch) {
	                key = string();
	                white();
	                next(':');
	                if (Object.hasOwnProperty.call(object, key)) {
	                    error('Duplicate key "' + key + '"');
	                }
	                object[key] = value();
	                white();
	                if (ch === '}') {
	                    next('}');
	                    return object;
	                }
	                next(',');
	                white();
	            }
	        }
	        error("Bad object");
	    };
	
	value = function () {
	
	// Parse a JSON value. It could be an object, an array, a string, a number,
	// or a word.
	
	    white();
	    switch (ch) {
	    case '{':
	        return object();
	    case '[':
	        return array();
	    case '"':
	        return string();
	    case '-':
	        return number();
	    default:
	        return ch >= '0' && ch <= '9' ? number() : word();
	    }
	};
	
	// Return the json_parse function. It will have access to all of the above
	// functions and variables.
	
	module.exports = function (source, reviver) {
	    var result;
	    
	    text = source;
	    at = 0;
	    ch = ' ';
	    result = value();
	    white();
	    if (ch) {
	        error("Syntax error");
	    }
	
	    // If there is a reviver function, we recursively walk the new structure,
	    // passing each name/value pair to the reviver function for possible
	    // transformation, starting with a temporary root object that holds the result
	    // in an empty key. If there is not a reviver function, we simply return the
	    // result.
	
	    return typeof reviver === 'function' ? (function walk(holder, key) {
	        var k, v, value = holder[key];
	        if (value && typeof value === 'object') {
	            for (k in value) {
	                if (Object.prototype.hasOwnProperty.call(value, k)) {
	                    v = walk(value, k);
	                    if (v !== undefined) {
	                        value[k] = v;
	                    } else {
	                        delete value[k];
	                    }
	                }
	            }
	        }
	        return reviver.call(holder, key, value);
	    }({'': result}, '')) : result;
	};


/***/ }),
/* 39 */
/***/ (function(module, exports) {

	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	    gap,
	    indent,
	    meta = {    // table of character substitutions
	        '\b': '\\b',
	        '\t': '\\t',
	        '\n': '\\n',
	        '\f': '\\f',
	        '\r': '\\r',
	        '"' : '\\"',
	        '\\': '\\\\'
	    },
	    rep;
	
	function quote(string) {
	    // If the string contains no control characters, no quote characters, and no
	    // backslash characters, then we can safely slap some quotes around it.
	    // Otherwise we must also replace the offending characters with safe escape
	    // sequences.
	    
	    escapable.lastIndex = 0;
	    return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
	        var c = meta[a];
	        return typeof c === 'string' ? c :
	            '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	    }) + '"' : '"' + string + '"';
	}
	
	function str(key, holder) {
	    // Produce a string from holder[key].
	    var i,          // The loop counter.
	        k,          // The member key.
	        v,          // The member value.
	        length,
	        mind = gap,
	        partial,
	        value = holder[key];
	    
	    // If the value has a toJSON method, call it to obtain a replacement value.
	    if (value && typeof value === 'object' &&
	            typeof value.toJSON === 'function') {
	        value = value.toJSON(key);
	    }
	    
	    // If we were called with a replacer function, then call the replacer to
	    // obtain a replacement value.
	    if (typeof rep === 'function') {
	        value = rep.call(holder, key, value);
	    }
	    
	    // What happens next depends on the value's type.
	    switch (typeof value) {
	        case 'string':
	            return quote(value);
	        
	        case 'number':
	            // JSON numbers must be finite. Encode non-finite numbers as null.
	            return isFinite(value) ? String(value) : 'null';
	        
	        case 'boolean':
	        case 'null':
	            // If the value is a boolean or null, convert it to a string. Note:
	            // typeof null does not produce 'null'. The case is included here in
	            // the remote chance that this gets fixed someday.
	            return String(value);
	            
	        case 'object':
	            if (!value) return 'null';
	            gap += indent;
	            partial = [];
	            
	            // Array.isArray
	            if (Object.prototype.toString.apply(value) === '[object Array]') {
	                length = value.length;
	                for (i = 0; i < length; i += 1) {
	                    partial[i] = str(i, value) || 'null';
	                }
	                
	                // Join all of the elements together, separated with commas, and
	                // wrap them in brackets.
	                v = partial.length === 0 ? '[]' : gap ?
	                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
	                    '[' + partial.join(',') + ']';
	                gap = mind;
	                return v;
	            }
	            
	            // If the replacer is an array, use it to select the members to be
	            // stringified.
	            if (rep && typeof rep === 'object') {
	                length = rep.length;
	                for (i = 0; i < length; i += 1) {
	                    k = rep[i];
	                    if (typeof k === 'string') {
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            }
	            else {
	                // Otherwise, iterate through all of the keys in the object.
	                for (k in value) {
	                    if (Object.prototype.hasOwnProperty.call(value, k)) {
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            }
	            
	        // Join all of the member texts together, separated with commas,
	        // and wrap them in braces.
	
	        v = partial.length === 0 ? '{}' : gap ?
	            '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
	            '{' + partial.join(',') + '}';
	        gap = mind;
	        return v;
	    }
	}
	
	module.exports = function (value, replacer, space) {
	    var i;
	    gap = '';
	    indent = '';
	    
	    // If the space parameter is a number, make an indent string containing that
	    // many spaces.
	    if (typeof space === 'number') {
	        for (i = 0; i < space; i += 1) {
	            indent += ' ';
	        }
	    }
	    // If the space parameter is a string, it will be used as the indent string.
	    else if (typeof space === 'string') {
	        indent = space;
	    }
	
	    // If there is a replacer, it must be a function or an array.
	    // Otherwise, throw an error.
	    rep = replacer;
	    if (replacer && typeof replacer !== 'function'
	    && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
	        throw new Error('JSON.stringify');
	    }
	    
	    // Make a fake root object containing our value under the key of ''.
	    // Return the result of stringifying the value.
	    return str('', {'': value});
	};


/***/ }),
/* 40 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_validate(it, $keyword, $ruleType) {
	  var out = '';
	  var $async = it.schema.$async === true,
	    $refKeywords = it.util.schemaHasRulesExcept(it.schema, it.RULES.all, '$ref'),
	    $id = it.self._getId(it.schema);
	  if (it.isTop) {
	    if ($async) {
	      it.async = true;
	      var $es7 = it.opts.async == 'es7';
	      it.yieldAwait = $es7 ? 'await' : 'yield';
	    }
	    out += ' var validate = ';
	    if ($async) {
	      if ($es7) {
	        out += ' (async function ';
	      } else {
	        if (it.opts.async != '*') {
	          out += 'co.wrap';
	        }
	        out += '(function* ';
	      }
	    } else {
	      out += ' (function ';
	    }
	    out += ' (data, dataPath, parentData, parentDataProperty, rootData) { \'use strict\'; ';
	    if ($id && (it.opts.sourceCode || it.opts.processCode)) {
	      out += ' ' + ('/\*# sourceURL=' + $id + ' */') + ' ';
	    }
	  }
	  if (typeof it.schema == 'boolean' || !($refKeywords || it.schema.$ref)) {
	    var $keyword = 'false schema';
	    var $lvl = it.level;
	    var $dataLvl = it.dataLevel;
	    var $schema = it.schema[$keyword];
	    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	    var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	    var $breakOnError = !it.opts.allErrors;
	    var $errorKeyword;
	    var $data = 'data' + ($dataLvl || '');
	    var $valid = 'valid' + $lvl;
	    if (it.schema === false) {
	      if (it.isTop) {
	        $breakOnError = true;
	      } else {
	        out += ' var ' + ($valid) + ' = false; ';
	      }
	      var $$outStack = $$outStack || [];
	      $$outStack.push(out);
	      out = ''; /* istanbul ignore else */
	      if (it.createErrors !== false) {
	        out += ' { keyword: \'' + ($errorKeyword || 'false schema') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
	        if (it.opts.messages !== false) {
	          out += ' , message: \'boolean schema is false\' ';
	        }
	        if (it.opts.verbose) {
	          out += ' , schema: false , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	        }
	        out += ' } ';
	      } else {
	        out += ' {} ';
	      }
	      var __err = out;
	      out = $$outStack.pop();
	      if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	        if (it.async) {
	          out += ' throw new ValidationError([' + (__err) + ']); ';
	        } else {
	          out += ' validate.errors = [' + (__err) + ']; return false; ';
	        }
	      } else {
	        out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	      }
	    } else {
	      if (it.isTop) {
	        if ($async) {
	          out += ' return data; ';
	        } else {
	          out += ' validate.errors = null; return true; ';
	        }
	      } else {
	        out += ' var ' + ($valid) + ' = true; ';
	      }
	    }
	    if (it.isTop) {
	      out += ' }); return validate; ';
	    }
	    return out;
	  }
	  if (it.isTop) {
	    var $top = it.isTop,
	      $lvl = it.level = 0,
	      $dataLvl = it.dataLevel = 0,
	      $data = 'data';
	    it.rootId = it.resolve.fullPath(it.self._getId(it.root.schema));
	    it.baseId = it.baseId || it.rootId;
	    delete it.isTop;
	    it.dataPathArr = [undefined];
	    out += ' var vErrors = null; ';
	    out += ' var errors = 0;     ';
	    out += ' if (rootData === undefined) rootData = data; ';
	  } else {
	    var $lvl = it.level,
	      $dataLvl = it.dataLevel,
	      $data = 'data' + ($dataLvl || '');
	    if ($id) it.baseId = it.resolve.url(it.baseId, $id);
	    if ($async && !it.async) throw new Error('async schema in sync schema');
	    out += ' var errs_' + ($lvl) + ' = errors;';
	  }
	  var $valid = 'valid' + $lvl,
	    $breakOnError = !it.opts.allErrors,
	    $closingBraces1 = '',
	    $closingBraces2 = '';
	  var $errorKeyword;
	  var $typeSchema = it.schema.type,
	    $typeIsArray = Array.isArray($typeSchema);
	  if ($typeIsArray && $typeSchema.length == 1) {
	    $typeSchema = $typeSchema[0];
	    $typeIsArray = false;
	  }
	  if (it.schema.$ref && $refKeywords) {
	    if (it.opts.extendRefs == 'fail') {
	      throw new Error('$ref: validation keywords used in schema at path "' + it.errSchemaPath + '" (see option extendRefs)');
	    } else if (it.opts.extendRefs !== true) {
	      $refKeywords = false;
	      console.warn('$ref: keywords ignored in schema at path "' + it.errSchemaPath + '"');
	    }
	  }
	  if ($typeSchema) {
	    if (it.opts.coerceTypes) {
	      var $coerceToTypes = it.util.coerceToTypes(it.opts.coerceTypes, $typeSchema);
	    }
	    var $rulesGroup = it.RULES.types[$typeSchema];
	    if ($coerceToTypes || $typeIsArray || $rulesGroup === true || ($rulesGroup && !$shouldUseGroup($rulesGroup))) {
	      var $schemaPath = it.schemaPath + '.type',
	        $errSchemaPath = it.errSchemaPath + '/type';
	      var $schemaPath = it.schemaPath + '.type',
	        $errSchemaPath = it.errSchemaPath + '/type',
	        $method = $typeIsArray ? 'checkDataTypes' : 'checkDataType';
	      out += ' if (' + (it.util[$method]($typeSchema, $data, true)) + ') { ';
	      if ($coerceToTypes) {
	        var $dataType = 'dataType' + $lvl,
	          $coerced = 'coerced' + $lvl;
	        out += ' var ' + ($dataType) + ' = typeof ' + ($data) + '; ';
	        if (it.opts.coerceTypes == 'array') {
	          out += ' if (' + ($dataType) + ' == \'object\' && Array.isArray(' + ($data) + ')) ' + ($dataType) + ' = \'array\'; ';
	        }
	        out += ' var ' + ($coerced) + ' = undefined; ';
	        var $bracesCoercion = '';
	        var arr1 = $coerceToTypes;
	        if (arr1) {
	          var $type, $i = -1,
	            l1 = arr1.length - 1;
	          while ($i < l1) {
	            $type = arr1[$i += 1];
	            if ($i) {
	              out += ' if (' + ($coerced) + ' === undefined) { ';
	              $bracesCoercion += '}';
	            }
	            if (it.opts.coerceTypes == 'array' && $type != 'array') {
	              out += ' if (' + ($dataType) + ' == \'array\' && ' + ($data) + '.length == 1) { ' + ($coerced) + ' = ' + ($data) + ' = ' + ($data) + '[0]; ' + ($dataType) + ' = typeof ' + ($data) + ';  } ';
	            }
	            if ($type == 'string') {
	              out += ' if (' + ($dataType) + ' == \'number\' || ' + ($dataType) + ' == \'boolean\') ' + ($coerced) + ' = \'\' + ' + ($data) + '; else if (' + ($data) + ' === null) ' + ($coerced) + ' = \'\'; ';
	            } else if ($type == 'number' || $type == 'integer') {
	              out += ' if (' + ($dataType) + ' == \'boolean\' || ' + ($data) + ' === null || (' + ($dataType) + ' == \'string\' && ' + ($data) + ' && ' + ($data) + ' == +' + ($data) + ' ';
	              if ($type == 'integer') {
	                out += ' && !(' + ($data) + ' % 1)';
	              }
	              out += ')) ' + ($coerced) + ' = +' + ($data) + '; ';
	            } else if ($type == 'boolean') {
	              out += ' if (' + ($data) + ' === \'false\' || ' + ($data) + ' === 0 || ' + ($data) + ' === null) ' + ($coerced) + ' = false; else if (' + ($data) + ' === \'true\' || ' + ($data) + ' === 1) ' + ($coerced) + ' = true; ';
	            } else if ($type == 'null') {
	              out += ' if (' + ($data) + ' === \'\' || ' + ($data) + ' === 0 || ' + ($data) + ' === false) ' + ($coerced) + ' = null; ';
	            } else if (it.opts.coerceTypes == 'array' && $type == 'array') {
	              out += ' if (' + ($dataType) + ' == \'string\' || ' + ($dataType) + ' == \'number\' || ' + ($dataType) + ' == \'boolean\' || ' + ($data) + ' == null) ' + ($coerced) + ' = [' + ($data) + ']; ';
	            }
	          }
	        }
	        out += ' ' + ($bracesCoercion) + ' if (' + ($coerced) + ' === undefined) {   ';
	        var $$outStack = $$outStack || [];
	        $$outStack.push(out);
	        out = ''; /* istanbul ignore else */
	        if (it.createErrors !== false) {
	          out += ' { keyword: \'' + ($errorKeyword || 'type') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { type: \'';
	          if ($typeIsArray) {
	            out += '' + ($typeSchema.join(","));
	          } else {
	            out += '' + ($typeSchema);
	          }
	          out += '\' } ';
	          if (it.opts.messages !== false) {
	            out += ' , message: \'should be ';
	            if ($typeIsArray) {
	              out += '' + ($typeSchema.join(","));
	            } else {
	              out += '' + ($typeSchema);
	            }
	            out += '\' ';
	          }
	          if (it.opts.verbose) {
	            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	          }
	          out += ' } ';
	        } else {
	          out += ' {} ';
	        }
	        var __err = out;
	        out = $$outStack.pop();
	        if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	          if (it.async) {
	            out += ' throw new ValidationError([' + (__err) + ']); ';
	          } else {
	            out += ' validate.errors = [' + (__err) + ']; return false; ';
	          }
	        } else {
	          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	        }
	        out += ' } else {  ';
	        var $parentData = $dataLvl ? 'data' + (($dataLvl - 1) || '') : 'parentData',
	          $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : 'parentDataProperty';
	        out += ' ' + ($data) + ' = ' + ($coerced) + '; ';
	        if (!$dataLvl) {
	          out += 'if (' + ($parentData) + ' !== undefined)';
	        }
	        out += ' ' + ($parentData) + '[' + ($parentDataProperty) + '] = ' + ($coerced) + '; } ';
	      } else {
	        var $$outStack = $$outStack || [];
	        $$outStack.push(out);
	        out = ''; /* istanbul ignore else */
	        if (it.createErrors !== false) {
	          out += ' { keyword: \'' + ($errorKeyword || 'type') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { type: \'';
	          if ($typeIsArray) {
	            out += '' + ($typeSchema.join(","));
	          } else {
	            out += '' + ($typeSchema);
	          }
	          out += '\' } ';
	          if (it.opts.messages !== false) {
	            out += ' , message: \'should be ';
	            if ($typeIsArray) {
	              out += '' + ($typeSchema.join(","));
	            } else {
	              out += '' + ($typeSchema);
	            }
	            out += '\' ';
	          }
	          if (it.opts.verbose) {
	            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	          }
	          out += ' } ';
	        } else {
	          out += ' {} ';
	        }
	        var __err = out;
	        out = $$outStack.pop();
	        if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	          if (it.async) {
	            out += ' throw new ValidationError([' + (__err) + ']); ';
	          } else {
	            out += ' validate.errors = [' + (__err) + ']; return false; ';
	          }
	        } else {
	          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	        }
	      }
	      out += ' } ';
	    }
	  }
	  if (it.schema.$ref && !$refKeywords) {
	    out += ' ' + (it.RULES.all.$ref.code(it, '$ref')) + ' ';
	    if ($breakOnError) {
	      out += ' } if (errors === ';
	      if ($top) {
	        out += '0';
	      } else {
	        out += 'errs_' + ($lvl);
	      }
	      out += ') { ';
	      $closingBraces2 += '}';
	    }
	  } else {
	    if (it.opts.v5 && it.schema.patternGroups) {
	      console.warn('keyword "patternGroups" is deprecated and disabled. Use option patternGroups: true to enable.');
	    }
	    var arr2 = it.RULES;
	    if (arr2) {
	      var $rulesGroup, i2 = -1,
	        l2 = arr2.length - 1;
	      while (i2 < l2) {
	        $rulesGroup = arr2[i2 += 1];
	        if ($shouldUseGroup($rulesGroup)) {
	          if ($rulesGroup.type) {
	            out += ' if (' + (it.util.checkDataType($rulesGroup.type, $data)) + ') { ';
	          }
	          if (it.opts.useDefaults && !it.compositeRule) {
	            if ($rulesGroup.type == 'object' && it.schema.properties) {
	              var $schema = it.schema.properties,
	                $schemaKeys = Object.keys($schema);
	              var arr3 = $schemaKeys;
	              if (arr3) {
	                var $propertyKey, i3 = -1,
	                  l3 = arr3.length - 1;
	                while (i3 < l3) {
	                  $propertyKey = arr3[i3 += 1];
	                  var $sch = $schema[$propertyKey];
	                  if ($sch.default !== undefined) {
	                    var $passData = $data + it.util.getProperty($propertyKey);
	                    out += '  if (' + ($passData) + ' === undefined) ' + ($passData) + ' = ';
	                    if (it.opts.useDefaults == 'shared') {
	                      out += ' ' + (it.useDefault($sch.default)) + ' ';
	                    } else {
	                      out += ' ' + (JSON.stringify($sch.default)) + ' ';
	                    }
	                    out += '; ';
	                  }
	                }
	              }
	            } else if ($rulesGroup.type == 'array' && Array.isArray(it.schema.items)) {
	              var arr4 = it.schema.items;
	              if (arr4) {
	                var $sch, $i = -1,
	                  l4 = arr4.length - 1;
	                while ($i < l4) {
	                  $sch = arr4[$i += 1];
	                  if ($sch.default !== undefined) {
	                    var $passData = $data + '[' + $i + ']';
	                    out += '  if (' + ($passData) + ' === undefined) ' + ($passData) + ' = ';
	                    if (it.opts.useDefaults == 'shared') {
	                      out += ' ' + (it.useDefault($sch.default)) + ' ';
	                    } else {
	                      out += ' ' + (JSON.stringify($sch.default)) + ' ';
	                    }
	                    out += '; ';
	                  }
	                }
	              }
	            }
	          }
	          var arr5 = $rulesGroup.rules;
	          if (arr5) {
	            var $rule, i5 = -1,
	              l5 = arr5.length - 1;
	            while (i5 < l5) {
	              $rule = arr5[i5 += 1];
	              if ($shouldUseRule($rule)) {
	                var $code = $rule.code(it, $rule.keyword, $rulesGroup.type);
	                if ($code) {
	                  out += ' ' + ($code) + ' ';
	                  if ($breakOnError) {
	                    $closingBraces1 += '}';
	                  }
	                }
	              }
	            }
	          }
	          if ($breakOnError) {
	            out += ' ' + ($closingBraces1) + ' ';
	            $closingBraces1 = '';
	          }
	          if ($rulesGroup.type) {
	            out += ' } ';
	            if ($typeSchema && $typeSchema === $rulesGroup.type && !$coerceToTypes) {
	              out += ' else { ';
	              var $schemaPath = it.schemaPath + '.type',
	                $errSchemaPath = it.errSchemaPath + '/type';
	              var $$outStack = $$outStack || [];
	              $$outStack.push(out);
	              out = ''; /* istanbul ignore else */
	              if (it.createErrors !== false) {
	                out += ' { keyword: \'' + ($errorKeyword || 'type') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { type: \'';
	                if ($typeIsArray) {
	                  out += '' + ($typeSchema.join(","));
	                } else {
	                  out += '' + ($typeSchema);
	                }
	                out += '\' } ';
	                if (it.opts.messages !== false) {
	                  out += ' , message: \'should be ';
	                  if ($typeIsArray) {
	                    out += '' + ($typeSchema.join(","));
	                  } else {
	                    out += '' + ($typeSchema);
	                  }
	                  out += '\' ';
	                }
	                if (it.opts.verbose) {
	                  out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	                }
	                out += ' } ';
	              } else {
	                out += ' {} ';
	              }
	              var __err = out;
	              out = $$outStack.pop();
	              if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	                if (it.async) {
	                  out += ' throw new ValidationError([' + (__err) + ']); ';
	                } else {
	                  out += ' validate.errors = [' + (__err) + ']; return false; ';
	                }
	              } else {
	                out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	              }
	              out += ' } ';
	            }
	          }
	          if ($breakOnError) {
	            out += ' if (errors === ';
	            if ($top) {
	              out += '0';
	            } else {
	              out += 'errs_' + ($lvl);
	            }
	            out += ') { ';
	            $closingBraces2 += '}';
	          }
	        }
	      }
	    }
	  }
	  if ($breakOnError) {
	    out += ' ' + ($closingBraces2) + ' ';
	  }
	  if ($top) {
	    if ($async) {
	      out += ' if (errors === 0) return data;           ';
	      out += ' else throw new ValidationError(vErrors); ';
	    } else {
	      out += ' validate.errors = vErrors; ';
	      out += ' return errors === 0;       ';
	    }
	    out += ' }); return validate;';
	  } else {
	    out += ' var ' + ($valid) + ' = errors === errs_' + ($lvl) + ';';
	  }
	  out = it.util.cleanUpCode(out);
	  if ($top) {
	    out = it.util.finalCleanUpCode(out, $async);
	  }
	
	  function $shouldUseGroup($rulesGroup) {
	    var rules = $rulesGroup.rules;
	    for (var i = 0; i < rules.length; i++)
	      if ($shouldUseRule(rules[i])) return true;
	  }
	
	  function $shouldUseRule($rule) {
	    return it.schema[$rule.keyword] !== undefined || ($rule.implements && $ruleImlementsSomeKeyword($rule));
	  }
	
	  function $ruleImlementsSomeKeyword($rule) {
	    var impl = $rule.implements;
	    for (var i = 0; i < impl.length; i++)
	      if (it.schema[impl[i]] !== undefined) return true;
	  }
	  return out;
	}


/***/ }),
/* 41 */
/***/ (function(module, exports) {

	
	/**
	 * slice() reference.
	 */
	
	var slice = Array.prototype.slice;
	
	/**
	 * Expose `co`.
	 */
	
	module.exports = co['default'] = co.co = co;
	
	/**
	 * Wrap the given generator `fn` into a
	 * function that returns a promise.
	 * This is a separate function so that
	 * every `co()` call doesn't create a new,
	 * unnecessary closure.
	 *
	 * @param {GeneratorFunction} fn
	 * @return {Function}
	 * @api public
	 */
	
	co.wrap = function (fn) {
	  createPromise.__generatorFunction__ = fn;
	  return createPromise;
	  function createPromise() {
	    return co.call(this, fn.apply(this, arguments));
	  }
	};
	
	/**
	 * Execute the generator function or a generator
	 * and return a promise.
	 *
	 * @param {Function} fn
	 * @return {Promise}
	 * @api public
	 */
	
	function co(gen) {
	  var ctx = this;
	  var args = slice.call(arguments, 1)
	
	  // we wrap everything in a promise to avoid promise chaining,
	  // which leads to memory leak errors.
	  // see https://github.com/tj/co/issues/180
	  return new Promise(function(resolve, reject) {
	    if (typeof gen === 'function') gen = gen.apply(ctx, args);
	    if (!gen || typeof gen.next !== 'function') return resolve(gen);
	
	    onFulfilled();
	
	    /**
	     * @param {Mixed} res
	     * @return {Promise}
	     * @api private
	     */
	
	    function onFulfilled(res) {
	      var ret;
	      try {
	        ret = gen.next(res);
	      } catch (e) {
	        return reject(e);
	      }
	      next(ret);
	    }
	
	    /**
	     * @param {Error} err
	     * @return {Promise}
	     * @api private
	     */
	
	    function onRejected(err) {
	      var ret;
	      try {
	        ret = gen.throw(err);
	      } catch (e) {
	        return reject(e);
	      }
	      next(ret);
	    }
	
	    /**
	     * Get the next value in the generator,
	     * return a promise.
	     *
	     * @param {Object} ret
	     * @return {Promise}
	     * @api private
	     */
	
	    function next(ret) {
	      if (ret.done) return resolve(ret.value);
	      var value = toPromise.call(ctx, ret.value);
	      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
	      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
	        + 'but the following object was passed: "' + String(ret.value) + '"'));
	    }
	  });
	}
	
	/**
	 * Convert a `yield`ed value into a promise.
	 *
	 * @param {Mixed} obj
	 * @return {Promise}
	 * @api private
	 */
	
	function toPromise(obj) {
	  if (!obj) return obj;
	  if (isPromise(obj)) return obj;
	  if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
	  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
	  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
	  if (isObject(obj)) return objectToPromise.call(this, obj);
	  return obj;
	}
	
	/**
	 * Convert a thunk to a promise.
	 *
	 * @param {Function}
	 * @return {Promise}
	 * @api private
	 */
	
	function thunkToPromise(fn) {
	  var ctx = this;
	  return new Promise(function (resolve, reject) {
	    fn.call(ctx, function (err, res) {
	      if (err) return reject(err);
	      if (arguments.length > 2) res = slice.call(arguments, 1);
	      resolve(res);
	    });
	  });
	}
	
	/**
	 * Convert an array of "yieldables" to a promise.
	 * Uses `Promise.all()` internally.
	 *
	 * @param {Array} obj
	 * @return {Promise}
	 * @api private
	 */
	
	function arrayToPromise(obj) {
	  return Promise.all(obj.map(toPromise, this));
	}
	
	/**
	 * Convert an object of "yieldables" to a promise.
	 * Uses `Promise.all()` internally.
	 *
	 * @param {Object} obj
	 * @return {Promise}
	 * @api private
	 */
	
	function objectToPromise(obj){
	  var results = new obj.constructor();
	  var keys = Object.keys(obj);
	  var promises = [];
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    var promise = toPromise.call(this, obj[key]);
	    if (promise && isPromise(promise)) defer(promise, key);
	    else results[key] = obj[key];
	  }
	  return Promise.all(promises).then(function () {
	    return results;
	  });
	
	  function defer(promise, key) {
	    // predefine the key in the result
	    results[key] = undefined;
	    promises.push(promise.then(function (res) {
	      results[key] = res;
	    }));
	  }
	}
	
	/**
	 * Check if `obj` is a promise.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */
	
	function isPromise(obj) {
	  return 'function' == typeof obj.then;
	}
	
	/**
	 * Check if `obj` is a generator.
	 *
	 * @param {Mixed} obj
	 * @return {Boolean}
	 * @api private
	 */
	
	function isGenerator(obj) {
	  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
	}
	
	/**
	 * Check if `obj` is a generator function.
	 *
	 * @param {Mixed} obj
	 * @return {Boolean}
	 * @api private
	 */
	function isGeneratorFunction(obj) {
	  var constructor = obj.constructor;
	  if (!constructor) return false;
	  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
	  return isGenerator(constructor.prototype);
	}
	
	/**
	 * Check for plain object.
	 *
	 * @param {Mixed} val
	 * @return {Boolean}
	 * @api private
	 */
	
	function isObject(val) {
	  return Object == val.constructor;
	}


/***/ }),
/* 42 */
/***/ (function(module, exports) {

	'use strict';
	
	
	var Cache = module.exports = function Cache() {
	  this._cache = {};
	};
	
	
	Cache.prototype.put = function Cache_put(key, value) {
	  this._cache[key] = value;
	};
	
	
	Cache.prototype.get = function Cache_get(key) {
	  return this._cache[key];
	};
	
	
	Cache.prototype.del = function Cache_del(key) {
	  delete this._cache[key];
	};
	
	
	Cache.prototype.clear = function Cache_clear() {
	  this._cache = {};
	};


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var util = __webpack_require__(31);
	
	var DATE = /^\d\d\d\d-(\d\d)-(\d\d)$/;
	var DAYS = [0,31,29,31,30,31,30,31,31,30,31,30,31];
	var TIME = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d:\d\d)?$/i;
	var HOSTNAME = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*$/i;
	var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
	var URIREF = /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
	// uri-template: https://tools.ietf.org/html/rfc6570
	var URITEMPLATE = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i;
	// For the source: https://gist.github.com/dperini/729294
	// For test cases: https://mathiasbynens.be/demo/url-regex
	// @todo Delete current URL in favour of the commented out URL rule when this issue is fixed https://github.com/eslint/eslint/issues/7983.
	// var URL = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)(?:\.(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu;
	var URL = /^(?:(?:http[s\u017F]?|ftp):\/\/)(?:(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+(?::(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?@)?(?:(?!10(?:\.[0-9]{1,3}){3})(?!127(?:\.[0-9]{1,3}){3})(?!169\.254(?:\.[0-9]{1,3}){2})(?!192\.168(?:\.[0-9]{1,3}){2})(?!172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})(?:[1-9][0-9]?|1[0-9][0-9]|2[01][0-9]|22[0-3])(?:\.(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])){2}(?:\.(?:[1-9][0-9]?|1[0-9][0-9]|2[0-4][0-9]|25[0-4]))|(?:(?:(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-?)*(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)(?:\.(?:(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-?)*(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)*(?:\.(?:(?:[KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]){2,})))(?::[0-9]{2,5})?(?:\/(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?$/i;
	var UUID = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
	var JSON_POINTER = /^(?:\/(?:[^~/]|~0|~1)*)*$|^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i;
	var RELATIVE_JSON_POINTER = /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/;
	
	
	module.exports = formats;
	
	function formats(mode) {
	  mode = mode == 'full' ? 'full' : 'fast';
	  return util.copy(formats[mode]);
	}
	
	
	formats.fast = {
	  // date: http://tools.ietf.org/html/rfc3339#section-5.6
	  date: /^\d\d\d\d-[0-1]\d-[0-3]\d$/,
	  // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
	  time: /^[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)?$/i,
	  'date-time': /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)$/i,
	  // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
	  uri: /^(?:[a-z][a-z0-9+-.]*)(?::|\/)\/?[^\s]*$/i,
	  'uri-reference': /^(?:(?:[a-z][a-z0-9+-.]*:)?\/\/)?[^\s]*$/i,
	  'uri-template': URITEMPLATE,
	  url: URL,
	  // email (sources from jsen validator):
	  // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
	  // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'willful violation')
	  email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
	  hostname: HOSTNAME,
	  // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
	  ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
	  // optimized http://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
	  ipv6: /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
	  regex: regex,
	  // uuid: http://tools.ietf.org/html/rfc4122
	  uuid: UUID,
	  // JSON-pointer: https://tools.ietf.org/html/rfc6901
	  // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
	  'json-pointer': JSON_POINTER,
	  // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
	  'relative-json-pointer': RELATIVE_JSON_POINTER
	};
	
	
	formats.full = {
	  date: date,
	  time: time,
	  'date-time': date_time,
	  uri: uri,
	  'uri-reference': URIREF,
	  'uri-template': URITEMPLATE,
	  url: URL,
	  email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&''*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
	  hostname: hostname,
	  ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
	  ipv6: /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
	  regex: regex,
	  uuid: UUID,
	  'json-pointer': JSON_POINTER,
	  'relative-json-pointer': RELATIVE_JSON_POINTER
	};
	
	
	function date(str) {
	  // full-date from http://tools.ietf.org/html/rfc3339#section-5.6
	  var matches = str.match(DATE);
	  if (!matches) return false;
	
	  var month = +matches[1];
	  var day = +matches[2];
	  return month >= 1 && month <= 12 && day >= 1 && day <= DAYS[month];
	}
	
	
	function time(str, full) {
	  var matches = str.match(TIME);
	  if (!matches) return false;
	
	  var hour = matches[1];
	  var minute = matches[2];
	  var second = matches[3];
	  var timeZone = matches[5];
	  return hour <= 23 && minute <= 59 && second <= 59 && (!full || timeZone);
	}
	
	
	var DATE_TIME_SEPARATOR = /t|\s/i;
	function date_time(str) {
	  // http://tools.ietf.org/html/rfc3339#section-5.6
	  var dateTime = str.split(DATE_TIME_SEPARATOR);
	  return dateTime.length == 2 && date(dateTime[0]) && time(dateTime[1], true);
	}
	
	
	function hostname(str) {
	  // https://tools.ietf.org/html/rfc1034#section-3.5
	  // https://tools.ietf.org/html/rfc1123#section-2
	  return str.length <= 255 && HOSTNAME.test(str);
	}
	
	
	var NOT_URI_FRAGMENT = /\/|:/;
	function uri(str) {
	  // http://jmrware.com/articles/2009/uri_regexp/URI_regex.html + optional protocol + required "."
	  return NOT_URI_FRAGMENT.test(str) && URI.test(str);
	}
	
	
	var Z_ANCHOR = /[^\\]\\Z/;
	function regex(str) {
	  if (Z_ANCHOR.test(str)) return false;
	  try {
	    new RegExp(str);
	    return true;
	  } catch(e) {
	    return false;
	  }
	}


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var ruleModules = __webpack_require__(45)
	  , toHash = __webpack_require__(31).toHash;
	
	module.exports = function rules() {
	  var RULES = [
	    { type: 'number',
	      rules: [ { 'maximum': ['exclusiveMaximum'] },
	               { 'minimum': ['exclusiveMinimum'] }, 'multipleOf', 'format'] },
	    { type: 'string',
	      rules: [ 'maxLength', 'minLength', 'pattern', 'format' ] },
	    { type: 'array',
	      rules: [ 'maxItems', 'minItems', 'uniqueItems', 'contains', 'items' ] },
	    { type: 'object',
	      rules: [ 'maxProperties', 'minProperties', 'required', 'dependencies', 'propertyNames',
	               { 'properties': ['additionalProperties', 'patternProperties'] } ] },
	    { rules: [ '$ref', 'const', 'enum', 'not', 'anyOf', 'oneOf', 'allOf' ] }
	  ];
	
	  var ALL = [ 'type' ];
	  var KEYWORDS = [
	    'additionalItems', '$schema', 'id', 'title',
	    'description', 'default', 'definitions'
	  ];
	  var TYPES = [ 'number', 'integer', 'string', 'array', 'object', 'boolean', 'null' ];
	  RULES.all = toHash(ALL);
	  RULES.types = toHash(TYPES);
	
	  RULES.forEach(function (group) {
	    group.rules = group.rules.map(function (keyword) {
	      var implKeywords;
	      if (typeof keyword == 'object') {
	        var key = Object.keys(keyword)[0];
	        implKeywords = keyword[key];
	        keyword = key;
	        implKeywords.forEach(function (k) {
	          ALL.push(k);
	          RULES.all[k] = true;
	        });
	      }
	      ALL.push(keyword);
	      var rule = RULES.all[keyword] = {
	        keyword: keyword,
	        code: ruleModules[keyword],
	        implements: implKeywords
	      };
	      return rule;
	    });
	
	    if (group.type) RULES.types[group.type] = group;
	  });
	
	  RULES.keywords = toHash(ALL.concat(KEYWORDS));
	  RULES.custom = {};
	
	  return RULES;
	};


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	//all requires must be explicit because browserify won't work with dynamic requires
	module.exports = {
	  '$ref': __webpack_require__(46),
	  allOf: __webpack_require__(47),
	  anyOf: __webpack_require__(48),
	  const: __webpack_require__(49),
	  contains: __webpack_require__(50),
	  dependencies: __webpack_require__(51),
	  'enum': __webpack_require__(52),
	  format: __webpack_require__(53),
	  items: __webpack_require__(54),
	  maximum: __webpack_require__(55),
	  minimum: __webpack_require__(55),
	  maxItems: __webpack_require__(56),
	  minItems: __webpack_require__(56),
	  maxLength: __webpack_require__(57),
	  minLength: __webpack_require__(57),
	  maxProperties: __webpack_require__(58),
	  minProperties: __webpack_require__(58),
	  multipleOf: __webpack_require__(59),
	  not: __webpack_require__(60),
	  oneOf: __webpack_require__(61),
	  pattern: __webpack_require__(62),
	  properties: __webpack_require__(63),
	  propertyNames: __webpack_require__(64),
	  required: __webpack_require__(65),
	  uniqueItems: __webpack_require__(66),
	  validate: __webpack_require__(40)
	};


/***/ }),
/* 46 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_ref(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  var $valid = 'valid' + $lvl;
	  var $async, $refCode;
	  if ($schema == '#' || $schema == '#/') {
	    if (it.isRoot) {
	      $async = it.async;
	      $refCode = 'validate';
	    } else {
	      $async = it.root.schema.$async === true;
	      $refCode = 'root.refVal[0]';
	    }
	  } else {
	    var $refVal = it.resolveRef(it.baseId, $schema, it.isRoot);
	    if ($refVal === undefined) {
	      var $message = it.MissingRefError.message(it.baseId, $schema);
	      if (it.opts.missingRefs == 'fail') {
	        console.error($message);
	        var $$outStack = $$outStack || [];
	        $$outStack.push(out);
	        out = ''; /* istanbul ignore else */
	        if (it.createErrors !== false) {
	          out += ' { keyword: \'' + ('$ref') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { ref: \'' + (it.util.escapeQuotes($schema)) + '\' } ';
	          if (it.opts.messages !== false) {
	            out += ' , message: \'can\\\'t resolve reference ' + (it.util.escapeQuotes($schema)) + '\' ';
	          }
	          if (it.opts.verbose) {
	            out += ' , schema: ' + (it.util.toQuotedString($schema)) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	          }
	          out += ' } ';
	        } else {
	          out += ' {} ';
	        }
	        var __err = out;
	        out = $$outStack.pop();
	        if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	          if (it.async) {
	            out += ' throw new ValidationError([' + (__err) + ']); ';
	          } else {
	            out += ' validate.errors = [' + (__err) + ']; return false; ';
	          }
	        } else {
	          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	        }
	        if ($breakOnError) {
	          out += ' if (false) { ';
	        }
	      } else if (it.opts.missingRefs == 'ignore') {
	        console.warn($message);
	        if ($breakOnError) {
	          out += ' if (true) { ';
	        }
	      } else {
	        throw new it.MissingRefError(it.baseId, $schema, $message);
	      }
	    } else if ($refVal.inline) {
	      var $it = it.util.copy(it);
	      $it.level++;
	      var $nextValid = 'valid' + $it.level;
	      $it.schema = $refVal.schema;
	      $it.schemaPath = '';
	      $it.errSchemaPath = $schema;
	      var $code = it.validate($it).replace(/validate\.schema/g, $refVal.code);
	      out += ' ' + ($code) + ' ';
	      if ($breakOnError) {
	        out += ' if (' + ($nextValid) + ') { ';
	      }
	    } else {
	      $async = $refVal.$async === true;
	      $refCode = $refVal.code;
	    }
	  }
	  if ($refCode) {
	    var $$outStack = $$outStack || [];
	    $$outStack.push(out);
	    out = '';
	    if (it.opts.passContext) {
	      out += ' ' + ($refCode) + '.call(this, ';
	    } else {
	      out += ' ' + ($refCode) + '( ';
	    }
	    out += ' ' + ($data) + ', (dataPath || \'\')';
	    if (it.errorPath != '""') {
	      out += ' + ' + (it.errorPath);
	    }
	    var $parentData = $dataLvl ? 'data' + (($dataLvl - 1) || '') : 'parentData',
	      $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : 'parentDataProperty';
	    out += ' , ' + ($parentData) + ' , ' + ($parentDataProperty) + ', rootData)  ';
	    var __callValidate = out;
	    out = $$outStack.pop();
	    if ($async) {
	      if (!it.async) throw new Error('async schema referenced by sync schema');
	      if ($breakOnError) {
	        out += ' var ' + ($valid) + '; ';
	      }
	      out += ' try { ' + (it.yieldAwait) + ' ' + (__callValidate) + '; ';
	      if ($breakOnError) {
	        out += ' ' + ($valid) + ' = true; ';
	      }
	      out += ' } catch (e) { if (!(e instanceof ValidationError)) throw e; if (vErrors === null) vErrors = e.errors; else vErrors = vErrors.concat(e.errors); errors = vErrors.length; ';
	      if ($breakOnError) {
	        out += ' ' + ($valid) + ' = false; ';
	      }
	      out += ' } ';
	      if ($breakOnError) {
	        out += ' if (' + ($valid) + ') { ';
	      }
	    } else {
	      out += ' if (!' + (__callValidate) + ') { if (vErrors === null) vErrors = ' + ($refCode) + '.errors; else vErrors = vErrors.concat(' + ($refCode) + '.errors); errors = vErrors.length; } ';
	      if ($breakOnError) {
	        out += ' else { ';
	      }
	    }
	  }
	  return out;
	}


/***/ }),
/* 47 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_allOf(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $it = it.util.copy(it);
	  var $closingBraces = '';
	  $it.level++;
	  var $nextValid = 'valid' + $it.level;
	  var $currentBaseId = $it.baseId,
	    $allSchemasEmpty = true;
	  var arr1 = $schema;
	  if (arr1) {
	    var $sch, $i = -1,
	      l1 = arr1.length - 1;
	    while ($i < l1) {
	      $sch = arr1[$i += 1];
	      if (it.util.schemaHasRules($sch, it.RULES.all)) {
	        $allSchemasEmpty = false;
	        $it.schema = $sch;
	        $it.schemaPath = $schemaPath + '[' + $i + ']';
	        $it.errSchemaPath = $errSchemaPath + '/' + $i;
	        out += '  ' + (it.validate($it)) + ' ';
	        $it.baseId = $currentBaseId;
	        if ($breakOnError) {
	          out += ' if (' + ($nextValid) + ') { ';
	          $closingBraces += '}';
	        }
	      }
	    }
	  }
	  if ($breakOnError) {
	    if ($allSchemasEmpty) {
	      out += ' if (true) { ';
	    } else {
	      out += ' ' + ($closingBraces.slice(0, -1)) + ' ';
	    }
	  }
	  out = it.util.cleanUpCode(out);
	  return out;
	}


/***/ }),
/* 48 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_anyOf(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  var $valid = 'valid' + $lvl;
	  var $errs = 'errs__' + $lvl;
	  var $it = it.util.copy(it);
	  var $closingBraces = '';
	  $it.level++;
	  var $nextValid = 'valid' + $it.level;
	  var $noEmptySchema = $schema.every(function($sch) {
	    return it.util.schemaHasRules($sch, it.RULES.all);
	  });
	  if ($noEmptySchema) {
	    var $currentBaseId = $it.baseId;
	    out += ' var ' + ($errs) + ' = errors; var ' + ($valid) + ' = false;  ';
	    var $wasComposite = it.compositeRule;
	    it.compositeRule = $it.compositeRule = true;
	    var arr1 = $schema;
	    if (arr1) {
	      var $sch, $i = -1,
	        l1 = arr1.length - 1;
	      while ($i < l1) {
	        $sch = arr1[$i += 1];
	        $it.schema = $sch;
	        $it.schemaPath = $schemaPath + '[' + $i + ']';
	        $it.errSchemaPath = $errSchemaPath + '/' + $i;
	        out += '  ' + (it.validate($it)) + ' ';
	        $it.baseId = $currentBaseId;
	        out += ' ' + ($valid) + ' = ' + ($valid) + ' || ' + ($nextValid) + '; if (!' + ($valid) + ') { ';
	        $closingBraces += '}';
	      }
	    }
	    it.compositeRule = $it.compositeRule = $wasComposite;
	    out += ' ' + ($closingBraces) + ' if (!' + ($valid) + ') {   var err =   '; /* istanbul ignore else */
	    if (it.createErrors !== false) {
	      out += ' { keyword: \'' + ('anyOf') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
	      if (it.opts.messages !== false) {
	        out += ' , message: \'should match some schema in anyOf\' ';
	      }
	      if (it.opts.verbose) {
	        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	      }
	      out += ' } ';
	    } else {
	      out += ' {} ';
	    }
	    out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	    if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	      if (it.async) {
	        out += ' throw new ValidationError(vErrors); ';
	      } else {
	        out += ' validate.errors = vErrors; return false; ';
	      }
	    }
	    out += ' } else {  errors = ' + ($errs) + '; if (vErrors !== null) { if (' + ($errs) + ') vErrors.length = ' + ($errs) + '; else vErrors = null; } ';
	    if (it.opts.allErrors) {
	      out += ' } ';
	    }
	    out = it.util.cleanUpCode(out);
	  } else {
	    if ($breakOnError) {
	      out += ' if (true) { ';
	    }
	  }
	  return out;
	}


/***/ }),
/* 49 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_const(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  var $valid = 'valid' + $lvl;
	  var $isData = it.opts.$data && $schema && $schema.$data,
	    $schemaValue;
	  if ($isData) {
	    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
	    $schemaValue = 'schema' + $lvl;
	  } else {
	    $schemaValue = $schema;
	  }
	  if (!$isData) {
	    out += ' var schema' + ($lvl) + ' = validate.schema' + ($schemaPath) + ';';
	  }
	  out += 'var ' + ($valid) + ' = equal(' + ($data) + ', schema' + ($lvl) + '); if (!' + ($valid) + ') {   ';
	  var $$outStack = $$outStack || [];
	  $$outStack.push(out);
	  out = ''; /* istanbul ignore else */
	  if (it.createErrors !== false) {
	    out += ' { keyword: \'' + ('const') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
	    if (it.opts.messages !== false) {
	      out += ' , message: \'should be equal to constant\' ';
	    }
	    if (it.opts.verbose) {
	      out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	    }
	    out += ' } ';
	  } else {
	    out += ' {} ';
	  }
	  var __err = out;
	  out = $$outStack.pop();
	  if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	    if (it.async) {
	      out += ' throw new ValidationError([' + (__err) + ']); ';
	    } else {
	      out += ' validate.errors = [' + (__err) + ']; return false; ';
	    }
	  } else {
	    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	  }
	  out += ' }';
	  if ($breakOnError) {
	    out += ' else { ';
	  }
	  return out;
	}


/***/ }),
/* 50 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_contains(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  var $valid = 'valid' + $lvl;
	  var $errs = 'errs__' + $lvl;
	  var $it = it.util.copy(it);
	  var $closingBraces = '';
	  $it.level++;
	  var $nextValid = 'valid' + $it.level;
	  var $idx = 'i' + $lvl,
	    $dataNxt = $it.dataLevel = it.dataLevel + 1,
	    $nextData = 'data' + $dataNxt,
	    $currentBaseId = it.baseId,
	    $nonEmptySchema = it.util.schemaHasRules($schema, it.RULES.all);
	  out += 'var ' + ($errs) + ' = errors;var ' + ($valid) + ';';
	  if ($nonEmptySchema) {
	    var $wasComposite = it.compositeRule;
	    it.compositeRule = $it.compositeRule = true;
	    $it.schema = $schema;
	    $it.schemaPath = $schemaPath;
	    $it.errSchemaPath = $errSchemaPath;
	    out += ' var ' + ($nextValid) + ' = false; for (var ' + ($idx) + ' = 0; ' + ($idx) + ' < ' + ($data) + '.length; ' + ($idx) + '++) { ';
	    $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, true);
	    var $passData = $data + '[' + $idx + ']';
	    $it.dataPathArr[$dataNxt] = $idx;
	    var $code = it.validate($it);
	    $it.baseId = $currentBaseId;
	    if (it.util.varOccurences($code, $nextData) < 2) {
	      out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
	    } else {
	      out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
	    }
	    out += ' if (' + ($nextValid) + ') break; }  ';
	    it.compositeRule = $it.compositeRule = $wasComposite;
	    out += ' ' + ($closingBraces) + ' if (!' + ($nextValid) + ') {';
	  } else {
	    out += ' if (' + ($data) + '.length == 0) {';
	  }
	  var $$outStack = $$outStack || [];
	  $$outStack.push(out);
	  out = ''; /* istanbul ignore else */
	  if (it.createErrors !== false) {
	    out += ' { keyword: \'' + ('contains') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
	    if (it.opts.messages !== false) {
	      out += ' , message: \'should contain a valid item\' ';
	    }
	    if (it.opts.verbose) {
	      out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	    }
	    out += ' } ';
	  } else {
	    out += ' {} ';
	  }
	  var __err = out;
	  out = $$outStack.pop();
	  if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	    if (it.async) {
	      out += ' throw new ValidationError([' + (__err) + ']); ';
	    } else {
	      out += ' validate.errors = [' + (__err) + ']; return false; ';
	    }
	  } else {
	    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	  }
	  out += ' } else { ';
	  if ($nonEmptySchema) {
	    out += '  errors = ' + ($errs) + '; if (vErrors !== null) { if (' + ($errs) + ') vErrors.length = ' + ($errs) + '; else vErrors = null; } ';
	  }
	  if (it.opts.allErrors) {
	    out += ' } ';
	  }
	  out = it.util.cleanUpCode(out);
	  return out;
	}


/***/ }),
/* 51 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_dependencies(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  var $errs = 'errs__' + $lvl;
	  var $it = it.util.copy(it);
	  var $closingBraces = '';
	  $it.level++;
	  var $nextValid = 'valid' + $it.level;
	  var $schemaDeps = {},
	    $propertyDeps = {},
	    $ownProperties = it.opts.ownProperties;
	  for ($property in $schema) {
	    var $sch = $schema[$property];
	    var $deps = Array.isArray($sch) ? $propertyDeps : $schemaDeps;
	    $deps[$property] = $sch;
	  }
	  out += 'var ' + ($errs) + ' = errors;';
	  var $currentErrorPath = it.errorPath;
	  out += 'var missing' + ($lvl) + ';';
	  for (var $property in $propertyDeps) {
	    $deps = $propertyDeps[$property];
	    if ($deps.length) {
	      out += ' if ( ' + ($data) + (it.util.getProperty($property)) + ' !== undefined ';
	      if ($ownProperties) {
	        out += ' && Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($property)) + '\') ';
	      }
	      if ($breakOnError) {
	        out += ' && ( ';
	        var arr1 = $deps;
	        if (arr1) {
	          var $propertyKey, $i = -1,
	            l1 = arr1.length - 1;
	          while ($i < l1) {
	            $propertyKey = arr1[$i += 1];
	            if ($i) {
	              out += ' || ';
	            }
	            var $prop = it.util.getProperty($propertyKey),
	              $useData = $data + $prop;
	            out += ' ( ( ' + ($useData) + ' === undefined ';
	            if ($ownProperties) {
	              out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
	            }
	            out += ') && (missing' + ($lvl) + ' = ' + (it.util.toQuotedString(it.opts.jsonPointers ? $propertyKey : $prop)) + ') ) ';
	          }
	        }
	        out += ')) {  ';
	        var $propertyPath = 'missing' + $lvl,
	          $missingProperty = '\' + ' + $propertyPath + ' + \'';
	        if (it.opts._errorDataPathProperty) {
	          it.errorPath = it.opts.jsonPointers ? it.util.getPathExpr($currentErrorPath, $propertyPath, true) : $currentErrorPath + ' + ' + $propertyPath;
	        }
	        var $$outStack = $$outStack || [];
	        $$outStack.push(out);
	        out = ''; /* istanbul ignore else */
	        if (it.createErrors !== false) {
	          out += ' { keyword: \'' + ('dependencies') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { property: \'' + (it.util.escapeQuotes($property)) + '\', missingProperty: \'' + ($missingProperty) + '\', depsCount: ' + ($deps.length) + ', deps: \'' + (it.util.escapeQuotes($deps.length == 1 ? $deps[0] : $deps.join(", "))) + '\' } ';
	          if (it.opts.messages !== false) {
	            out += ' , message: \'should have ';
	            if ($deps.length == 1) {
	              out += 'property ' + (it.util.escapeQuotes($deps[0]));
	            } else {
	              out += 'properties ' + (it.util.escapeQuotes($deps.join(", ")));
	            }
	            out += ' when property ' + (it.util.escapeQuotes($property)) + ' is present\' ';
	          }
	          if (it.opts.verbose) {
	            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	          }
	          out += ' } ';
	        } else {
	          out += ' {} ';
	        }
	        var __err = out;
	        out = $$outStack.pop();
	        if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	          if (it.async) {
	            out += ' throw new ValidationError([' + (__err) + ']); ';
	          } else {
	            out += ' validate.errors = [' + (__err) + ']; return false; ';
	          }
	        } else {
	          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	        }
	      } else {
	        out += ' ) { ';
	        var arr2 = $deps;
	        if (arr2) {
	          var $propertyKey, i2 = -1,
	            l2 = arr2.length - 1;
	          while (i2 < l2) {
	            $propertyKey = arr2[i2 += 1];
	            var $prop = it.util.getProperty($propertyKey),
	              $missingProperty = it.util.escapeQuotes($propertyKey),
	              $useData = $data + $prop;
	            if (it.opts._errorDataPathProperty) {
	              it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers);
	            }
	            out += ' if ( ' + ($useData) + ' === undefined ';
	            if ($ownProperties) {
	              out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
	            }
	            out += ') {  var err =   '; /* istanbul ignore else */
	            if (it.createErrors !== false) {
	              out += ' { keyword: \'' + ('dependencies') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { property: \'' + (it.util.escapeQuotes($property)) + '\', missingProperty: \'' + ($missingProperty) + '\', depsCount: ' + ($deps.length) + ', deps: \'' + (it.util.escapeQuotes($deps.length == 1 ? $deps[0] : $deps.join(", "))) + '\' } ';
	              if (it.opts.messages !== false) {
	                out += ' , message: \'should have ';
	                if ($deps.length == 1) {
	                  out += 'property ' + (it.util.escapeQuotes($deps[0]));
	                } else {
	                  out += 'properties ' + (it.util.escapeQuotes($deps.join(", ")));
	                }
	                out += ' when property ' + (it.util.escapeQuotes($property)) + ' is present\' ';
	              }
	              if (it.opts.verbose) {
	                out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	              }
	              out += ' } ';
	            } else {
	              out += ' {} ';
	            }
	            out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ';
	          }
	        }
	      }
	      out += ' }   ';
	      if ($breakOnError) {
	        $closingBraces += '}';
	        out += ' else { ';
	      }
	    }
	  }
	  it.errorPath = $currentErrorPath;
	  var $currentBaseId = $it.baseId;
	  for (var $property in $schemaDeps) {
	    var $sch = $schemaDeps[$property];
	    if (it.util.schemaHasRules($sch, it.RULES.all)) {
	      out += ' ' + ($nextValid) + ' = true; if ( ' + ($data) + (it.util.getProperty($property)) + ' !== undefined ';
	      if ($ownProperties) {
	        out += ' && Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($property)) + '\') ';
	      }
	      out += ') { ';
	      $it.schema = $sch;
	      $it.schemaPath = $schemaPath + it.util.getProperty($property);
	      $it.errSchemaPath = $errSchemaPath + '/' + it.util.escapeFragment($property);
	      out += '  ' + (it.validate($it)) + ' ';
	      $it.baseId = $currentBaseId;
	      out += ' }  ';
	      if ($breakOnError) {
	        out += ' if (' + ($nextValid) + ') { ';
	        $closingBraces += '}';
	      }
	    }
	  }
	  if ($breakOnError) {
	    out += '   ' + ($closingBraces) + ' if (' + ($errs) + ' == errors) {';
	  }
	  out = it.util.cleanUpCode(out);
	  return out;
	}


/***/ }),
/* 52 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_enum(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  var $valid = 'valid' + $lvl;
	  var $isData = it.opts.$data && $schema && $schema.$data,
	    $schemaValue;
	  if ($isData) {
	    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
	    $schemaValue = 'schema' + $lvl;
	  } else {
	    $schemaValue = $schema;
	  }
	  var $i = 'i' + $lvl,
	    $vSchema = 'schema' + $lvl;
	  if (!$isData) {
	    out += ' var ' + ($vSchema) + ' = validate.schema' + ($schemaPath) + ';';
	  }
	  out += 'var ' + ($valid) + ';';
	  if ($isData) {
	    out += ' if (schema' + ($lvl) + ' === undefined) ' + ($valid) + ' = true; else if (!Array.isArray(schema' + ($lvl) + ')) ' + ($valid) + ' = false; else {';
	  }
	  out += '' + ($valid) + ' = false;for (var ' + ($i) + '=0; ' + ($i) + '<' + ($vSchema) + '.length; ' + ($i) + '++) if (equal(' + ($data) + ', ' + ($vSchema) + '[' + ($i) + '])) { ' + ($valid) + ' = true; break; }';
	  if ($isData) {
	    out += '  }  ';
	  }
	  out += ' if (!' + ($valid) + ') {   ';
	  var $$outStack = $$outStack || [];
	  $$outStack.push(out);
	  out = ''; /* istanbul ignore else */
	  if (it.createErrors !== false) {
	    out += ' { keyword: \'' + ('enum') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { allowedValues: schema' + ($lvl) + ' } ';
	    if (it.opts.messages !== false) {
	      out += ' , message: \'should be equal to one of the allowed values\' ';
	    }
	    if (it.opts.verbose) {
	      out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	    }
	    out += ' } ';
	  } else {
	    out += ' {} ';
	  }
	  var __err = out;
	  out = $$outStack.pop();
	  if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	    if (it.async) {
	      out += ' throw new ValidationError([' + (__err) + ']); ';
	    } else {
	      out += ' validate.errors = [' + (__err) + ']; return false; ';
	    }
	  } else {
	    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	  }
	  out += ' }';
	  if ($breakOnError) {
	    out += ' else { ';
	  }
	  return out;
	}


/***/ }),
/* 53 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_format(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  if (it.opts.format === false) {
	    if ($breakOnError) {
	      out += ' if (true) { ';
	    }
	    return out;
	  }
	  var $isData = it.opts.$data && $schema && $schema.$data,
	    $schemaValue;
	  if ($isData) {
	    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
	    $schemaValue = 'schema' + $lvl;
	  } else {
	    $schemaValue = $schema;
	  }
	  var $unknownFormats = it.opts.unknownFormats,
	    $allowUnknown = Array.isArray($unknownFormats);
	  if ($isData) {
	    var $format = 'format' + $lvl,
	      $isObject = 'isObject' + $lvl,
	      $formatType = 'formatType' + $lvl;
	    out += ' var ' + ($format) + ' = formats[' + ($schemaValue) + ']; var ' + ($isObject) + ' = typeof ' + ($format) + ' == \'object\' && !(' + ($format) + ' instanceof RegExp) && ' + ($format) + '.validate; var ' + ($formatType) + ' = ' + ($isObject) + ' && ' + ($format) + '.type || \'string\'; if (' + ($isObject) + ') { ';
	    if (it.async) {
	      out += ' var async' + ($lvl) + ' = ' + ($format) + '.async; ';
	    }
	    out += ' ' + ($format) + ' = ' + ($format) + '.validate; } if (  ';
	    if ($isData) {
	      out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'string\') || ';
	    }
	    out += ' (';
	    if ($unknownFormats != 'ignore') {
	      out += ' (' + ($schemaValue) + ' && !' + ($format) + ' ';
	      if ($allowUnknown) {
	        out += ' && self._opts.unknownFormats.indexOf(' + ($schemaValue) + ') == -1 ';
	      }
	      out += ') || ';
	    }
	    out += ' (' + ($format) + ' && ' + ($formatType) + ' == \'' + ($ruleType) + '\' && !(typeof ' + ($format) + ' == \'function\' ? ';
	    if (it.async) {
	      out += ' (async' + ($lvl) + ' ? ' + (it.yieldAwait) + ' ' + ($format) + '(' + ($data) + ') : ' + ($format) + '(' + ($data) + ')) ';
	    } else {
	      out += ' ' + ($format) + '(' + ($data) + ') ';
	    }
	    out += ' : ' + ($format) + '.test(' + ($data) + '))))) {';
	  } else {
	    var $format = it.formats[$schema];
	    if (!$format) {
	      if ($unknownFormats == 'ignore') {
	        console.warn('unknown format "' + $schema + '" ignored in schema at path "' + it.errSchemaPath + '"');
	        if ($breakOnError) {
	          out += ' if (true) { ';
	        }
	        return out;
	      } else if ($allowUnknown && $unknownFormats.indexOf($schema) >= 0) {
	        if ($breakOnError) {
	          out += ' if (true) { ';
	        }
	        return out;
	      } else {
	        throw new Error('unknown format "' + $schema + '" is used in schema at path "' + it.errSchemaPath + '"');
	      }
	    }
	    var $isObject = typeof $format == 'object' && !($format instanceof RegExp) && $format.validate;
	    var $formatType = $isObject && $format.type || 'string';
	    if ($isObject) {
	      var $async = $format.async === true;
	      $format = $format.validate;
	    }
	    if ($formatType != $ruleType) {
	      if ($breakOnError) {
	        out += ' if (true) { ';
	      }
	      return out;
	    }
	    if ($async) {
	      if (!it.async) throw new Error('async format in sync schema');
	      var $formatRef = 'formats' + it.util.getProperty($schema) + '.validate';
	      out += ' if (!(' + (it.yieldAwait) + ' ' + ($formatRef) + '(' + ($data) + '))) { ';
	    } else {
	      out += ' if (! ';
	      var $formatRef = 'formats' + it.util.getProperty($schema);
	      if ($isObject) $formatRef += '.validate';
	      if (typeof $format == 'function') {
	        out += ' ' + ($formatRef) + '(' + ($data) + ') ';
	      } else {
	        out += ' ' + ($formatRef) + '.test(' + ($data) + ') ';
	      }
	      out += ') { ';
	    }
	  }
	  var $$outStack = $$outStack || [];
	  $$outStack.push(out);
	  out = ''; /* istanbul ignore else */
	  if (it.createErrors !== false) {
	    out += ' { keyword: \'' + ('format') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { format:  ';
	    if ($isData) {
	      out += '' + ($schemaValue);
	    } else {
	      out += '' + (it.util.toQuotedString($schema));
	    }
	    out += '  } ';
	    if (it.opts.messages !== false) {
	      out += ' , message: \'should match format "';
	      if ($isData) {
	        out += '\' + ' + ($schemaValue) + ' + \'';
	      } else {
	        out += '' + (it.util.escapeQuotes($schema));
	      }
	      out += '"\' ';
	    }
	    if (it.opts.verbose) {
	      out += ' , schema:  ';
	      if ($isData) {
	        out += 'validate.schema' + ($schemaPath);
	      } else {
	        out += '' + (it.util.toQuotedString($schema));
	      }
	      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	    }
	    out += ' } ';
	  } else {
	    out += ' {} ';
	  }
	  var __err = out;
	  out = $$outStack.pop();
	  if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	    if (it.async) {
	      out += ' throw new ValidationError([' + (__err) + ']); ';
	    } else {
	      out += ' validate.errors = [' + (__err) + ']; return false; ';
	    }
	  } else {
	    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	  }
	  out += ' } ';
	  if ($breakOnError) {
	    out += ' else { ';
	  }
	  return out;
	}


/***/ }),
/* 54 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_items(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  var $valid = 'valid' + $lvl;
	  var $errs = 'errs__' + $lvl;
	  var $it = it.util.copy(it);
	  var $closingBraces = '';
	  $it.level++;
	  var $nextValid = 'valid' + $it.level;
	  var $idx = 'i' + $lvl,
	    $dataNxt = $it.dataLevel = it.dataLevel + 1,
	    $nextData = 'data' + $dataNxt,
	    $currentBaseId = it.baseId;
	  out += 'var ' + ($errs) + ' = errors;var ' + ($valid) + ';';
	  if (Array.isArray($schema)) {
	    var $additionalItems = it.schema.additionalItems;
	    if ($additionalItems === false) {
	      out += ' ' + ($valid) + ' = ' + ($data) + '.length <= ' + ($schema.length) + '; ';
	      var $currErrSchemaPath = $errSchemaPath;
	      $errSchemaPath = it.errSchemaPath + '/additionalItems';
	      out += '  if (!' + ($valid) + ') {   ';
	      var $$outStack = $$outStack || [];
	      $$outStack.push(out);
	      out = ''; /* istanbul ignore else */
	      if (it.createErrors !== false) {
	        out += ' { keyword: \'' + ('additionalItems') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { limit: ' + ($schema.length) + ' } ';
	        if (it.opts.messages !== false) {
	          out += ' , message: \'should NOT have more than ' + ($schema.length) + ' items\' ';
	        }
	        if (it.opts.verbose) {
	          out += ' , schema: false , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	        }
	        out += ' } ';
	      } else {
	        out += ' {} ';
	      }
	      var __err = out;
	      out = $$outStack.pop();
	      if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	        if (it.async) {
	          out += ' throw new ValidationError([' + (__err) + ']); ';
	        } else {
	          out += ' validate.errors = [' + (__err) + ']; return false; ';
	        }
	      } else {
	        out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	      }
	      out += ' } ';
	      $errSchemaPath = $currErrSchemaPath;
	      if ($breakOnError) {
	        $closingBraces += '}';
	        out += ' else { ';
	      }
	    }
	    var arr1 = $schema;
	    if (arr1) {
	      var $sch, $i = -1,
	        l1 = arr1.length - 1;
	      while ($i < l1) {
	        $sch = arr1[$i += 1];
	        if (it.util.schemaHasRules($sch, it.RULES.all)) {
	          out += ' ' + ($nextValid) + ' = true; if (' + ($data) + '.length > ' + ($i) + ') { ';
	          var $passData = $data + '[' + $i + ']';
	          $it.schema = $sch;
	          $it.schemaPath = $schemaPath + '[' + $i + ']';
	          $it.errSchemaPath = $errSchemaPath + '/' + $i;
	          $it.errorPath = it.util.getPathExpr(it.errorPath, $i, it.opts.jsonPointers, true);
	          $it.dataPathArr[$dataNxt] = $i;
	          var $code = it.validate($it);
	          $it.baseId = $currentBaseId;
	          if (it.util.varOccurences($code, $nextData) < 2) {
	            out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
	          } else {
	            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
	          }
	          out += ' }  ';
	          if ($breakOnError) {
	            out += ' if (' + ($nextValid) + ') { ';
	            $closingBraces += '}';
	          }
	        }
	      }
	    }
	    if (typeof $additionalItems == 'object' && it.util.schemaHasRules($additionalItems, it.RULES.all)) {
	      $it.schema = $additionalItems;
	      $it.schemaPath = it.schemaPath + '.additionalItems';
	      $it.errSchemaPath = it.errSchemaPath + '/additionalItems';
	      out += ' ' + ($nextValid) + ' = true; if (' + ($data) + '.length > ' + ($schema.length) + ') {  for (var ' + ($idx) + ' = ' + ($schema.length) + '; ' + ($idx) + ' < ' + ($data) + '.length; ' + ($idx) + '++) { ';
	      $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, true);
	      var $passData = $data + '[' + $idx + ']';
	      $it.dataPathArr[$dataNxt] = $idx;
	      var $code = it.validate($it);
	      $it.baseId = $currentBaseId;
	      if (it.util.varOccurences($code, $nextData) < 2) {
	        out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
	      } else {
	        out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
	      }
	      if ($breakOnError) {
	        out += ' if (!' + ($nextValid) + ') break; ';
	      }
	      out += ' } }  ';
	      if ($breakOnError) {
	        out += ' if (' + ($nextValid) + ') { ';
	        $closingBraces += '}';
	      }
	    }
	  } else if (it.util.schemaHasRules($schema, it.RULES.all)) {
	    $it.schema = $schema;
	    $it.schemaPath = $schemaPath;
	    $it.errSchemaPath = $errSchemaPath;
	    out += '  for (var ' + ($idx) + ' = ' + (0) + '; ' + ($idx) + ' < ' + ($data) + '.length; ' + ($idx) + '++) { ';
	    $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, true);
	    var $passData = $data + '[' + $idx + ']';
	    $it.dataPathArr[$dataNxt] = $idx;
	    var $code = it.validate($it);
	    $it.baseId = $currentBaseId;
	    if (it.util.varOccurences($code, $nextData) < 2) {
	      out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
	    } else {
	      out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
	    }
	    if ($breakOnError) {
	      out += ' if (!' + ($nextValid) + ') break; ';
	    }
	    out += ' }';
	  }
	  if ($breakOnError) {
	    out += ' ' + ($closingBraces) + ' if (' + ($errs) + ' == errors) {';
	  }
	  out = it.util.cleanUpCode(out);
	  return out;
	}


/***/ }),
/* 55 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate__limit(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $errorKeyword;
	  var $data = 'data' + ($dataLvl || '');
	  var $isData = it.opts.$data && $schema && $schema.$data,
	    $schemaValue;
	  if ($isData) {
	    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
	    $schemaValue = 'schema' + $lvl;
	  } else {
	    $schemaValue = $schema;
	  }
	  var $isMax = $keyword == 'maximum',
	    $exclusiveKeyword = $isMax ? 'exclusiveMaximum' : 'exclusiveMinimum',
	    $schemaExcl = it.schema[$exclusiveKeyword],
	    $isDataExcl = it.opts.$data && $schemaExcl && $schemaExcl.$data,
	    $op = $isMax ? '<' : '>',
	    $notOp = $isMax ? '>' : '<',
	    $errorKeyword = undefined;
	  if ($isDataExcl) {
	    var $schemaValueExcl = it.util.getData($schemaExcl.$data, $dataLvl, it.dataPathArr),
	      $exclusive = 'exclusive' + $lvl,
	      $exclType = 'exclType' + $lvl,
	      $exclIsNumber = 'exclIsNumber' + $lvl,
	      $opExpr = 'op' + $lvl,
	      $opStr = '\' + ' + $opExpr + ' + \'';
	    out += ' var schemaExcl' + ($lvl) + ' = ' + ($schemaValueExcl) + '; ';
	    $schemaValueExcl = 'schemaExcl' + $lvl;
	    out += ' var ' + ($exclusive) + '; var ' + ($exclType) + ' = typeof ' + ($schemaValueExcl) + '; if (' + ($exclType) + ' != \'boolean\' && ' + ($exclType) + ' != \'undefined\' && ' + ($exclType) + ' != \'number\') { ';
	    var $errorKeyword = $exclusiveKeyword;
	    var $$outStack = $$outStack || [];
	    $$outStack.push(out);
	    out = ''; /* istanbul ignore else */
	    if (it.createErrors !== false) {
	      out += ' { keyword: \'' + ($errorKeyword || '_exclusiveLimit') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
	      if (it.opts.messages !== false) {
	        out += ' , message: \'' + ($exclusiveKeyword) + ' should be boolean\' ';
	      }
	      if (it.opts.verbose) {
	        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	      }
	      out += ' } ';
	    } else {
	      out += ' {} ';
	    }
	    var __err = out;
	    out = $$outStack.pop();
	    if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	      if (it.async) {
	        out += ' throw new ValidationError([' + (__err) + ']); ';
	      } else {
	        out += ' validate.errors = [' + (__err) + ']; return false; ';
	      }
	    } else {
	      out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	    }
	    out += ' } else if ( ';
	    if ($isData) {
	      out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
	    }
	    out += ' ' + ($exclType) + ' == \'number\' ? ( (' + ($exclusive) + ' = ' + ($schemaValue) + ' === undefined || ' + ($schemaValueExcl) + ' ' + ($op) + '= ' + ($schemaValue) + ') ? ' + ($data) + ' ' + ($notOp) + '= ' + ($schemaValueExcl) + ' : ' + ($data) + ' ' + ($notOp) + ' ' + ($schemaValue) + ' ) : ( (' + ($exclusive) + ' = ' + ($schemaValueExcl) + ' === true) ? ' + ($data) + ' ' + ($notOp) + '= ' + ($schemaValue) + ' : ' + ($data) + ' ' + ($notOp) + ' ' + ($schemaValue) + ' ) || ' + ($data) + ' !== ' + ($data) + ') { var op' + ($lvl) + ' = ' + ($exclusive) + ' ? \'' + ($op) + '\' : \'' + ($op) + '=\';';
	  } else {
	    var $exclIsNumber = typeof $schemaExcl == 'number',
	      $opStr = $op;
	    if ($exclIsNumber && $isData) {
	      var $opExpr = '\'' + $opStr + '\'';
	      out += ' if ( ';
	      if ($isData) {
	        out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
	      }
	      out += ' ( ' + ($schemaValue) + ' === undefined || ' + ($schemaExcl) + ' ' + ($op) + '= ' + ($schemaValue) + ' ? ' + ($data) + ' ' + ($notOp) + '= ' + ($schemaExcl) + ' : ' + ($data) + ' ' + ($notOp) + ' ' + ($schemaValue) + ' ) || ' + ($data) + ' !== ' + ($data) + ') { ';
	    } else {
	      if ($exclIsNumber && $schema === undefined) {
	        $exclusive = true;
	        $errorKeyword = $exclusiveKeyword;
	        $errSchemaPath = it.errSchemaPath + '/' + $exclusiveKeyword;
	        $schemaValue = $schemaExcl;
	        $notOp += '=';
	      } else {
	        if ($exclIsNumber) $schemaValue = Math[$isMax ? 'min' : 'max']($schemaExcl, $schema);
	        if ($schemaExcl === ($exclIsNumber ? $schemaValue : true)) {
	          $exclusive = true;
	          $errorKeyword = $exclusiveKeyword;
	          $errSchemaPath = it.errSchemaPath + '/' + $exclusiveKeyword;
	          $notOp += '=';
	        } else {
	          $exclusive = false;
	          $opStr += '=';
	        }
	      }
	      var $opExpr = '\'' + $opStr + '\'';
	      out += ' if ( ';
	      if ($isData) {
	        out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
	      }
	      out += ' ' + ($data) + ' ' + ($notOp) + ' ' + ($schemaValue) + ' || ' + ($data) + ' !== ' + ($data) + ') { ';
	    }
	  }
	  $errorKeyword = $errorKeyword || $keyword;
	  var $$outStack = $$outStack || [];
	  $$outStack.push(out);
	  out = ''; /* istanbul ignore else */
	  if (it.createErrors !== false) {
	    out += ' { keyword: \'' + ($errorKeyword || '_limit') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { comparison: ' + ($opExpr) + ', limit: ' + ($schemaValue) + ', exclusive: ' + ($exclusive) + ' } ';
	    if (it.opts.messages !== false) {
	      out += ' , message: \'should be ' + ($opStr) + ' ';
	      if ($isData) {
	        out += '\' + ' + ($schemaValue);
	      } else {
	        out += '' + ($schemaValue) + '\'';
	      }
	    }
	    if (it.opts.verbose) {
	      out += ' , schema:  ';
	      if ($isData) {
	        out += 'validate.schema' + ($schemaPath);
	      } else {
	        out += '' + ($schema);
	      }
	      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	    }
	    out += ' } ';
	  } else {
	    out += ' {} ';
	  }
	  var __err = out;
	  out = $$outStack.pop();
	  if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	    if (it.async) {
	      out += ' throw new ValidationError([' + (__err) + ']); ';
	    } else {
	      out += ' validate.errors = [' + (__err) + ']; return false; ';
	    }
	  } else {
	    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	  }
	  out += ' } ';
	  if ($breakOnError) {
	    out += ' else { ';
	  }
	  return out;
	}


/***/ }),
/* 56 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate__limitItems(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $errorKeyword;
	  var $data = 'data' + ($dataLvl || '');
	  var $isData = it.opts.$data && $schema && $schema.$data,
	    $schemaValue;
	  if ($isData) {
	    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
	    $schemaValue = 'schema' + $lvl;
	  } else {
	    $schemaValue = $schema;
	  }
	  var $op = $keyword == 'maxItems' ? '>' : '<';
	  out += 'if ( ';
	  if ($isData) {
	    out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
	  }
	  out += ' ' + ($data) + '.length ' + ($op) + ' ' + ($schemaValue) + ') { ';
	  var $errorKeyword = $keyword;
	  var $$outStack = $$outStack || [];
	  $$outStack.push(out);
	  out = ''; /* istanbul ignore else */
	  if (it.createErrors !== false) {
	    out += ' { keyword: \'' + ($errorKeyword || '_limitItems') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { limit: ' + ($schemaValue) + ' } ';
	    if (it.opts.messages !== false) {
	      out += ' , message: \'should NOT have ';
	      if ($keyword == 'maxItems') {
	        out += 'more';
	      } else {
	        out += 'less';
	      }
	      out += ' than ';
	      if ($isData) {
	        out += '\' + ' + ($schemaValue) + ' + \'';
	      } else {
	        out += '' + ($schema);
	      }
	      out += ' items\' ';
	    }
	    if (it.opts.verbose) {
	      out += ' , schema:  ';
	      if ($isData) {
	        out += 'validate.schema' + ($schemaPath);
	      } else {
	        out += '' + ($schema);
	      }
	      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	    }
	    out += ' } ';
	  } else {
	    out += ' {} ';
	  }
	  var __err = out;
	  out = $$outStack.pop();
	  if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	    if (it.async) {
	      out += ' throw new ValidationError([' + (__err) + ']); ';
	    } else {
	      out += ' validate.errors = [' + (__err) + ']; return false; ';
	    }
	  } else {
	    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	  }
	  out += '} ';
	  if ($breakOnError) {
	    out += ' else { ';
	  }
	  return out;
	}


/***/ }),
/* 57 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate__limitLength(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $errorKeyword;
	  var $data = 'data' + ($dataLvl || '');
	  var $isData = it.opts.$data && $schema && $schema.$data,
	    $schemaValue;
	  if ($isData) {
	    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
	    $schemaValue = 'schema' + $lvl;
	  } else {
	    $schemaValue = $schema;
	  }
	  var $op = $keyword == 'maxLength' ? '>' : '<';
	  out += 'if ( ';
	  if ($isData) {
	    out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
	  }
	  if (it.opts.unicode === false) {
	    out += ' ' + ($data) + '.length ';
	  } else {
	    out += ' ucs2length(' + ($data) + ') ';
	  }
	  out += ' ' + ($op) + ' ' + ($schemaValue) + ') { ';
	  var $errorKeyword = $keyword;
	  var $$outStack = $$outStack || [];
	  $$outStack.push(out);
	  out = ''; /* istanbul ignore else */
	  if (it.createErrors !== false) {
	    out += ' { keyword: \'' + ($errorKeyword || '_limitLength') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { limit: ' + ($schemaValue) + ' } ';
	    if (it.opts.messages !== false) {
	      out += ' , message: \'should NOT be ';
	      if ($keyword == 'maxLength') {
	        out += 'longer';
	      } else {
	        out += 'shorter';
	      }
	      out += ' than ';
	      if ($isData) {
	        out += '\' + ' + ($schemaValue) + ' + \'';
	      } else {
	        out += '' + ($schema);
	      }
	      out += ' characters\' ';
	    }
	    if (it.opts.verbose) {
	      out += ' , schema:  ';
	      if ($isData) {
	        out += 'validate.schema' + ($schemaPath);
	      } else {
	        out += '' + ($schema);
	      }
	      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	    }
	    out += ' } ';
	  } else {
	    out += ' {} ';
	  }
	  var __err = out;
	  out = $$outStack.pop();
	  if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	    if (it.async) {
	      out += ' throw new ValidationError([' + (__err) + ']); ';
	    } else {
	      out += ' validate.errors = [' + (__err) + ']; return false; ';
	    }
	  } else {
	    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	  }
	  out += '} ';
	  if ($breakOnError) {
	    out += ' else { ';
	  }
	  return out;
	}


/***/ }),
/* 58 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate__limitProperties(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $errorKeyword;
	  var $data = 'data' + ($dataLvl || '');
	  var $isData = it.opts.$data && $schema && $schema.$data,
	    $schemaValue;
	  if ($isData) {
	    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
	    $schemaValue = 'schema' + $lvl;
	  } else {
	    $schemaValue = $schema;
	  }
	  var $op = $keyword == 'maxProperties' ? '>' : '<';
	  out += 'if ( ';
	  if ($isData) {
	    out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
	  }
	  out += ' Object.keys(' + ($data) + ').length ' + ($op) + ' ' + ($schemaValue) + ') { ';
	  var $errorKeyword = $keyword;
	  var $$outStack = $$outStack || [];
	  $$outStack.push(out);
	  out = ''; /* istanbul ignore else */
	  if (it.createErrors !== false) {
	    out += ' { keyword: \'' + ($errorKeyword || '_limitProperties') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { limit: ' + ($schemaValue) + ' } ';
	    if (it.opts.messages !== false) {
	      out += ' , message: \'should NOT have ';
	      if ($keyword == 'maxProperties') {
	        out += 'more';
	      } else {
	        out += 'less';
	      }
	      out += ' than ';
	      if ($isData) {
	        out += '\' + ' + ($schemaValue) + ' + \'';
	      } else {
	        out += '' + ($schema);
	      }
	      out += ' properties\' ';
	    }
	    if (it.opts.verbose) {
	      out += ' , schema:  ';
	      if ($isData) {
	        out += 'validate.schema' + ($schemaPath);
	      } else {
	        out += '' + ($schema);
	      }
	      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	    }
	    out += ' } ';
	  } else {
	    out += ' {} ';
	  }
	  var __err = out;
	  out = $$outStack.pop();
	  if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	    if (it.async) {
	      out += ' throw new ValidationError([' + (__err) + ']); ';
	    } else {
	      out += ' validate.errors = [' + (__err) + ']; return false; ';
	    }
	  } else {
	    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	  }
	  out += '} ';
	  if ($breakOnError) {
	    out += ' else { ';
	  }
	  return out;
	}


/***/ }),
/* 59 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_multipleOf(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  var $isData = it.opts.$data && $schema && $schema.$data,
	    $schemaValue;
	  if ($isData) {
	    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
	    $schemaValue = 'schema' + $lvl;
	  } else {
	    $schemaValue = $schema;
	  }
	  out += 'var division' + ($lvl) + ';if (';
	  if ($isData) {
	    out += ' ' + ($schemaValue) + ' !== undefined && ( typeof ' + ($schemaValue) + ' != \'number\' || ';
	  }
	  out += ' (division' + ($lvl) + ' = ' + ($data) + ' / ' + ($schemaValue) + ', ';
	  if (it.opts.multipleOfPrecision) {
	    out += ' Math.abs(Math.round(division' + ($lvl) + ') - division' + ($lvl) + ') > 1e-' + (it.opts.multipleOfPrecision) + ' ';
	  } else {
	    out += ' division' + ($lvl) + ' !== parseInt(division' + ($lvl) + ') ';
	  }
	  out += ' ) ';
	  if ($isData) {
	    out += '  )  ';
	  }
	  out += ' ) {   ';
	  var $$outStack = $$outStack || [];
	  $$outStack.push(out);
	  out = ''; /* istanbul ignore else */
	  if (it.createErrors !== false) {
	    out += ' { keyword: \'' + ('multipleOf') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { multipleOf: ' + ($schemaValue) + ' } ';
	    if (it.opts.messages !== false) {
	      out += ' , message: \'should be multiple of ';
	      if ($isData) {
	        out += '\' + ' + ($schemaValue);
	      } else {
	        out += '' + ($schemaValue) + '\'';
	      }
	    }
	    if (it.opts.verbose) {
	      out += ' , schema:  ';
	      if ($isData) {
	        out += 'validate.schema' + ($schemaPath);
	      } else {
	        out += '' + ($schema);
	      }
	      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	    }
	    out += ' } ';
	  } else {
	    out += ' {} ';
	  }
	  var __err = out;
	  out = $$outStack.pop();
	  if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	    if (it.async) {
	      out += ' throw new ValidationError([' + (__err) + ']); ';
	    } else {
	      out += ' validate.errors = [' + (__err) + ']; return false; ';
	    }
	  } else {
	    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	  }
	  out += '} ';
	  if ($breakOnError) {
	    out += ' else { ';
	  }
	  return out;
	}


/***/ }),
/* 60 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_not(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  var $errs = 'errs__' + $lvl;
	  var $it = it.util.copy(it);
	  $it.level++;
	  var $nextValid = 'valid' + $it.level;
	  if (it.util.schemaHasRules($schema, it.RULES.all)) {
	    $it.schema = $schema;
	    $it.schemaPath = $schemaPath;
	    $it.errSchemaPath = $errSchemaPath;
	    out += ' var ' + ($errs) + ' = errors;  ';
	    var $wasComposite = it.compositeRule;
	    it.compositeRule = $it.compositeRule = true;
	    $it.createErrors = false;
	    var $allErrorsOption;
	    if ($it.opts.allErrors) {
	      $allErrorsOption = $it.opts.allErrors;
	      $it.opts.allErrors = false;
	    }
	    out += ' ' + (it.validate($it)) + ' ';
	    $it.createErrors = true;
	    if ($allErrorsOption) $it.opts.allErrors = $allErrorsOption;
	    it.compositeRule = $it.compositeRule = $wasComposite;
	    out += ' if (' + ($nextValid) + ') {   ';
	    var $$outStack = $$outStack || [];
	    $$outStack.push(out);
	    out = ''; /* istanbul ignore else */
	    if (it.createErrors !== false) {
	      out += ' { keyword: \'' + ('not') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
	      if (it.opts.messages !== false) {
	        out += ' , message: \'should NOT be valid\' ';
	      }
	      if (it.opts.verbose) {
	        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	      }
	      out += ' } ';
	    } else {
	      out += ' {} ';
	    }
	    var __err = out;
	    out = $$outStack.pop();
	    if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	      if (it.async) {
	        out += ' throw new ValidationError([' + (__err) + ']); ';
	      } else {
	        out += ' validate.errors = [' + (__err) + ']; return false; ';
	      }
	    } else {
	      out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	    }
	    out += ' } else {  errors = ' + ($errs) + '; if (vErrors !== null) { if (' + ($errs) + ') vErrors.length = ' + ($errs) + '; else vErrors = null; } ';
	    if (it.opts.allErrors) {
	      out += ' } ';
	    }
	  } else {
	    out += '  var err =   '; /* istanbul ignore else */
	    if (it.createErrors !== false) {
	      out += ' { keyword: \'' + ('not') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
	      if (it.opts.messages !== false) {
	        out += ' , message: \'should NOT be valid\' ';
	      }
	      if (it.opts.verbose) {
	        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	      }
	      out += ' } ';
	    } else {
	      out += ' {} ';
	    }
	    out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	    if ($breakOnError) {
	      out += ' if (false) { ';
	    }
	  }
	  return out;
	}


/***/ }),
/* 61 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_oneOf(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  var $valid = 'valid' + $lvl;
	  var $errs = 'errs__' + $lvl;
	  var $it = it.util.copy(it);
	  var $closingBraces = '';
	  $it.level++;
	  var $nextValid = 'valid' + $it.level;
	  out += 'var ' + ($errs) + ' = errors;var prevValid' + ($lvl) + ' = false;var ' + ($valid) + ' = false;';
	  var $currentBaseId = $it.baseId;
	  var $wasComposite = it.compositeRule;
	  it.compositeRule = $it.compositeRule = true;
	  var arr1 = $schema;
	  if (arr1) {
	    var $sch, $i = -1,
	      l1 = arr1.length - 1;
	    while ($i < l1) {
	      $sch = arr1[$i += 1];
	      if (it.util.schemaHasRules($sch, it.RULES.all)) {
	        $it.schema = $sch;
	        $it.schemaPath = $schemaPath + '[' + $i + ']';
	        $it.errSchemaPath = $errSchemaPath + '/' + $i;
	        out += '  ' + (it.validate($it)) + ' ';
	        $it.baseId = $currentBaseId;
	      } else {
	        out += ' var ' + ($nextValid) + ' = true; ';
	      }
	      if ($i) {
	        out += ' if (' + ($nextValid) + ' && prevValid' + ($lvl) + ') ' + ($valid) + ' = false; else { ';
	        $closingBraces += '}';
	      }
	      out += ' if (' + ($nextValid) + ') ' + ($valid) + ' = prevValid' + ($lvl) + ' = true;';
	    }
	  }
	  it.compositeRule = $it.compositeRule = $wasComposite;
	  out += '' + ($closingBraces) + 'if (!' + ($valid) + ') {   var err =   '; /* istanbul ignore else */
	  if (it.createErrors !== false) {
	    out += ' { keyword: \'' + ('oneOf') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
	    if (it.opts.messages !== false) {
	      out += ' , message: \'should match exactly one schema in oneOf\' ';
	    }
	    if (it.opts.verbose) {
	      out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	    }
	    out += ' } ';
	  } else {
	    out += ' {} ';
	  }
	  out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	  if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	    if (it.async) {
	      out += ' throw new ValidationError(vErrors); ';
	    } else {
	      out += ' validate.errors = vErrors; return false; ';
	    }
	  }
	  out += '} else {  errors = ' + ($errs) + '; if (vErrors !== null) { if (' + ($errs) + ') vErrors.length = ' + ($errs) + '; else vErrors = null; }';
	  if (it.opts.allErrors) {
	    out += ' } ';
	  }
	  return out;
	}


/***/ }),
/* 62 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_pattern(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  var $isData = it.opts.$data && $schema && $schema.$data,
	    $schemaValue;
	  if ($isData) {
	    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
	    $schemaValue = 'schema' + $lvl;
	  } else {
	    $schemaValue = $schema;
	  }
	  var $regexp = $isData ? '(new RegExp(' + $schemaValue + '))' : it.usePattern($schema);
	  out += 'if ( ';
	  if ($isData) {
	    out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'string\') || ';
	  }
	  out += ' !' + ($regexp) + '.test(' + ($data) + ') ) {   ';
	  var $$outStack = $$outStack || [];
	  $$outStack.push(out);
	  out = ''; /* istanbul ignore else */
	  if (it.createErrors !== false) {
	    out += ' { keyword: \'' + ('pattern') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { pattern:  ';
	    if ($isData) {
	      out += '' + ($schemaValue);
	    } else {
	      out += '' + (it.util.toQuotedString($schema));
	    }
	    out += '  } ';
	    if (it.opts.messages !== false) {
	      out += ' , message: \'should match pattern "';
	      if ($isData) {
	        out += '\' + ' + ($schemaValue) + ' + \'';
	      } else {
	        out += '' + (it.util.escapeQuotes($schema));
	      }
	      out += '"\' ';
	    }
	    if (it.opts.verbose) {
	      out += ' , schema:  ';
	      if ($isData) {
	        out += 'validate.schema' + ($schemaPath);
	      } else {
	        out += '' + (it.util.toQuotedString($schema));
	      }
	      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	    }
	    out += ' } ';
	  } else {
	    out += ' {} ';
	  }
	  var __err = out;
	  out = $$outStack.pop();
	  if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	    if (it.async) {
	      out += ' throw new ValidationError([' + (__err) + ']); ';
	    } else {
	      out += ' validate.errors = [' + (__err) + ']; return false; ';
	    }
	  } else {
	    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	  }
	  out += '} ';
	  if ($breakOnError) {
	    out += ' else { ';
	  }
	  return out;
	}


/***/ }),
/* 63 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_properties(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  var $valid = 'valid' + $lvl;
	  var $errs = 'errs__' + $lvl;
	  var $it = it.util.copy(it);
	  var $closingBraces = '';
	  $it.level++;
	  var $nextValid = 'valid' + $it.level;
	  var $key = 'key' + $lvl,
	    $idx = 'idx' + $lvl,
	    $dataNxt = $it.dataLevel = it.dataLevel + 1,
	    $nextData = 'data' + $dataNxt,
	    $dataProperties = 'dataProperties' + $lvl;
	  var $schemaKeys = Object.keys($schema || {}),
	    $pProperties = it.schema.patternProperties || {},
	    $pPropertyKeys = Object.keys($pProperties),
	    $aProperties = it.schema.additionalProperties,
	    $someProperties = $schemaKeys.length || $pPropertyKeys.length,
	    $noAdditional = $aProperties === false,
	    $additionalIsSchema = typeof $aProperties == 'object' && Object.keys($aProperties).length,
	    $removeAdditional = it.opts.removeAdditional,
	    $checkAdditional = $noAdditional || $additionalIsSchema || $removeAdditional,
	    $ownProperties = it.opts.ownProperties,
	    $currentBaseId = it.baseId;
	  var $required = it.schema.required;
	  if ($required && !(it.opts.v5 && $required.$data) && $required.length < it.opts.loopRequired) var $requiredHash = it.util.toHash($required);
	  if (it.opts.patternGroups) {
	    var $pgProperties = it.schema.patternGroups || {},
	      $pgPropertyKeys = Object.keys($pgProperties);
	  }
	  out += 'var ' + ($errs) + ' = errors;var ' + ($nextValid) + ' = true;';
	  if ($ownProperties) {
	    out += ' var ' + ($dataProperties) + ' = undefined;';
	  }
	  if ($checkAdditional) {
	    if ($ownProperties) {
	      out += ' ' + ($dataProperties) + ' = ' + ($dataProperties) + ' || Object.keys(' + ($data) + '); for (var ' + ($idx) + '=0; ' + ($idx) + '<' + ($dataProperties) + '.length; ' + ($idx) + '++) { var ' + ($key) + ' = ' + ($dataProperties) + '[' + ($idx) + ']; ';
	    } else {
	      out += ' for (var ' + ($key) + ' in ' + ($data) + ') { ';
	    }
	    if ($someProperties) {
	      out += ' var isAdditional' + ($lvl) + ' = !(false ';
	      if ($schemaKeys.length) {
	        if ($schemaKeys.length > 5) {
	          out += ' || validate.schema' + ($schemaPath) + '[' + ($key) + '] ';
	        } else {
	          var arr1 = $schemaKeys;
	          if (arr1) {
	            var $propertyKey, i1 = -1,
	              l1 = arr1.length - 1;
	            while (i1 < l1) {
	              $propertyKey = arr1[i1 += 1];
	              out += ' || ' + ($key) + ' == ' + (it.util.toQuotedString($propertyKey)) + ' ';
	            }
	          }
	        }
	      }
	      if ($pPropertyKeys.length) {
	        var arr2 = $pPropertyKeys;
	        if (arr2) {
	          var $pProperty, $i = -1,
	            l2 = arr2.length - 1;
	          while ($i < l2) {
	            $pProperty = arr2[$i += 1];
	            out += ' || ' + (it.usePattern($pProperty)) + '.test(' + ($key) + ') ';
	          }
	        }
	      }
	      if (it.opts.patternGroups && $pgPropertyKeys.length) {
	        var arr3 = $pgPropertyKeys;
	        if (arr3) {
	          var $pgProperty, $i = -1,
	            l3 = arr3.length - 1;
	          while ($i < l3) {
	            $pgProperty = arr3[$i += 1];
	            out += ' || ' + (it.usePattern($pgProperty)) + '.test(' + ($key) + ') ';
	          }
	        }
	      }
	      out += ' ); if (isAdditional' + ($lvl) + ') { ';
	    }
	    if ($removeAdditional == 'all') {
	      out += ' delete ' + ($data) + '[' + ($key) + ']; ';
	    } else {
	      var $currentErrorPath = it.errorPath;
	      var $additionalProperty = '\' + ' + $key + ' + \'';
	      if (it.opts._errorDataPathProperty) {
	        it.errorPath = it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
	      }
	      if ($noAdditional) {
	        if ($removeAdditional) {
	          out += ' delete ' + ($data) + '[' + ($key) + ']; ';
	        } else {
	          out += ' ' + ($nextValid) + ' = false; ';
	          var $currErrSchemaPath = $errSchemaPath;
	          $errSchemaPath = it.errSchemaPath + '/additionalProperties';
	          var $$outStack = $$outStack || [];
	          $$outStack.push(out);
	          out = ''; /* istanbul ignore else */
	          if (it.createErrors !== false) {
	            out += ' { keyword: \'' + ('additionalProperties') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { additionalProperty: \'' + ($additionalProperty) + '\' } ';
	            if (it.opts.messages !== false) {
	              out += ' , message: \'should NOT have additional properties\' ';
	            }
	            if (it.opts.verbose) {
	              out += ' , schema: false , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	            }
	            out += ' } ';
	          } else {
	            out += ' {} ';
	          }
	          var __err = out;
	          out = $$outStack.pop();
	          if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	            if (it.async) {
	              out += ' throw new ValidationError([' + (__err) + ']); ';
	            } else {
	              out += ' validate.errors = [' + (__err) + ']; return false; ';
	            }
	          } else {
	            out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	          }
	          $errSchemaPath = $currErrSchemaPath;
	          if ($breakOnError) {
	            out += ' break; ';
	          }
	        }
	      } else if ($additionalIsSchema) {
	        if ($removeAdditional == 'failing') {
	          out += ' var ' + ($errs) + ' = errors;  ';
	          var $wasComposite = it.compositeRule;
	          it.compositeRule = $it.compositeRule = true;
	          $it.schema = $aProperties;
	          $it.schemaPath = it.schemaPath + '.additionalProperties';
	          $it.errSchemaPath = it.errSchemaPath + '/additionalProperties';
	          $it.errorPath = it.opts._errorDataPathProperty ? it.errorPath : it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
	          var $passData = $data + '[' + $key + ']';
	          $it.dataPathArr[$dataNxt] = $key;
	          var $code = it.validate($it);
	          $it.baseId = $currentBaseId;
	          if (it.util.varOccurences($code, $nextData) < 2) {
	            out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
	          } else {
	            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
	          }
	          out += ' if (!' + ($nextValid) + ') { errors = ' + ($errs) + '; if (validate.errors !== null) { if (errors) validate.errors.length = errors; else validate.errors = null; } delete ' + ($data) + '[' + ($key) + ']; }  ';
	          it.compositeRule = $it.compositeRule = $wasComposite;
	        } else {
	          $it.schema = $aProperties;
	          $it.schemaPath = it.schemaPath + '.additionalProperties';
	          $it.errSchemaPath = it.errSchemaPath + '/additionalProperties';
	          $it.errorPath = it.opts._errorDataPathProperty ? it.errorPath : it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
	          var $passData = $data + '[' + $key + ']';
	          $it.dataPathArr[$dataNxt] = $key;
	          var $code = it.validate($it);
	          $it.baseId = $currentBaseId;
	          if (it.util.varOccurences($code, $nextData) < 2) {
	            out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
	          } else {
	            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
	          }
	          if ($breakOnError) {
	            out += ' if (!' + ($nextValid) + ') break; ';
	          }
	        }
	      }
	      it.errorPath = $currentErrorPath;
	    }
	    if ($someProperties) {
	      out += ' } ';
	    }
	    out += ' }  ';
	    if ($breakOnError) {
	      out += ' if (' + ($nextValid) + ') { ';
	      $closingBraces += '}';
	    }
	  }
	  var $useDefaults = it.opts.useDefaults && !it.compositeRule;
	  if ($schemaKeys.length) {
	    var arr4 = $schemaKeys;
	    if (arr4) {
	      var $propertyKey, i4 = -1,
	        l4 = arr4.length - 1;
	      while (i4 < l4) {
	        $propertyKey = arr4[i4 += 1];
	        var $sch = $schema[$propertyKey];
	        if (it.util.schemaHasRules($sch, it.RULES.all)) {
	          var $prop = it.util.getProperty($propertyKey),
	            $passData = $data + $prop,
	            $hasDefault = $useDefaults && $sch.default !== undefined;
	          $it.schema = $sch;
	          $it.schemaPath = $schemaPath + $prop;
	          $it.errSchemaPath = $errSchemaPath + '/' + it.util.escapeFragment($propertyKey);
	          $it.errorPath = it.util.getPath(it.errorPath, $propertyKey, it.opts.jsonPointers);
	          $it.dataPathArr[$dataNxt] = it.util.toQuotedString($propertyKey);
	          var $code = it.validate($it);
	          $it.baseId = $currentBaseId;
	          if (it.util.varOccurences($code, $nextData) < 2) {
	            $code = it.util.varReplace($code, $nextData, $passData);
	            var $useData = $passData;
	          } else {
	            var $useData = $nextData;
	            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ';
	          }
	          if ($hasDefault) {
	            out += ' ' + ($code) + ' ';
	          } else {
	            if ($requiredHash && $requiredHash[$propertyKey]) {
	              out += ' if ( ' + ($useData) + ' === undefined ';
	              if ($ownProperties) {
	                out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
	              }
	              out += ') { ' + ($nextValid) + ' = false; ';
	              var $currentErrorPath = it.errorPath,
	                $currErrSchemaPath = $errSchemaPath,
	                $missingProperty = it.util.escapeQuotes($propertyKey);
	              if (it.opts._errorDataPathProperty) {
	                it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers);
	              }
	              $errSchemaPath = it.errSchemaPath + '/required';
	              var $$outStack = $$outStack || [];
	              $$outStack.push(out);
	              out = ''; /* istanbul ignore else */
	              if (it.createErrors !== false) {
	                out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
	                if (it.opts.messages !== false) {
	                  out += ' , message: \'';
	                  if (it.opts._errorDataPathProperty) {
	                    out += 'is a required property';
	                  } else {
	                    out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
	                  }
	                  out += '\' ';
	                }
	                if (it.opts.verbose) {
	                  out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	                }
	                out += ' } ';
	              } else {
	                out += ' {} ';
	              }
	              var __err = out;
	              out = $$outStack.pop();
	              if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	                if (it.async) {
	                  out += ' throw new ValidationError([' + (__err) + ']); ';
	                } else {
	                  out += ' validate.errors = [' + (__err) + ']; return false; ';
	                }
	              } else {
	                out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	              }
	              $errSchemaPath = $currErrSchemaPath;
	              it.errorPath = $currentErrorPath;
	              out += ' } else { ';
	            } else {
	              if ($breakOnError) {
	                out += ' if ( ' + ($useData) + ' === undefined ';
	                if ($ownProperties) {
	                  out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
	                }
	                out += ') { ' + ($nextValid) + ' = true; } else { ';
	              } else {
	                out += ' if (' + ($useData) + ' !== undefined ';
	                if ($ownProperties) {
	                  out += ' &&   Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
	                }
	                out += ' ) { ';
	              }
	            }
	            out += ' ' + ($code) + ' } ';
	          }
	        }
	        if ($breakOnError) {
	          out += ' if (' + ($nextValid) + ') { ';
	          $closingBraces += '}';
	        }
	      }
	    }
	  }
	  if ($pPropertyKeys.length) {
	    var arr5 = $pPropertyKeys;
	    if (arr5) {
	      var $pProperty, i5 = -1,
	        l5 = arr5.length - 1;
	      while (i5 < l5) {
	        $pProperty = arr5[i5 += 1];
	        var $sch = $pProperties[$pProperty];
	        if (it.util.schemaHasRules($sch, it.RULES.all)) {
	          $it.schema = $sch;
	          $it.schemaPath = it.schemaPath + '.patternProperties' + it.util.getProperty($pProperty);
	          $it.errSchemaPath = it.errSchemaPath + '/patternProperties/' + it.util.escapeFragment($pProperty);
	          if ($ownProperties) {
	            out += ' ' + ($dataProperties) + ' = ' + ($dataProperties) + ' || Object.keys(' + ($data) + '); for (var ' + ($idx) + '=0; ' + ($idx) + '<' + ($dataProperties) + '.length; ' + ($idx) + '++) { var ' + ($key) + ' = ' + ($dataProperties) + '[' + ($idx) + ']; ';
	          } else {
	            out += ' for (var ' + ($key) + ' in ' + ($data) + ') { ';
	          }
	          out += ' if (' + (it.usePattern($pProperty)) + '.test(' + ($key) + ')) { ';
	          $it.errorPath = it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
	          var $passData = $data + '[' + $key + ']';
	          $it.dataPathArr[$dataNxt] = $key;
	          var $code = it.validate($it);
	          $it.baseId = $currentBaseId;
	          if (it.util.varOccurences($code, $nextData) < 2) {
	            out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
	          } else {
	            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
	          }
	          if ($breakOnError) {
	            out += ' if (!' + ($nextValid) + ') break; ';
	          }
	          out += ' } ';
	          if ($breakOnError) {
	            out += ' else ' + ($nextValid) + ' = true; ';
	          }
	          out += ' }  ';
	          if ($breakOnError) {
	            out += ' if (' + ($nextValid) + ') { ';
	            $closingBraces += '}';
	          }
	        }
	      }
	    }
	  }
	  if (it.opts.patternGroups && $pgPropertyKeys.length) {
	    var arr6 = $pgPropertyKeys;
	    if (arr6) {
	      var $pgProperty, i6 = -1,
	        l6 = arr6.length - 1;
	      while (i6 < l6) {
	        $pgProperty = arr6[i6 += 1];
	        var $pgSchema = $pgProperties[$pgProperty],
	          $sch = $pgSchema.schema;
	        if (it.util.schemaHasRules($sch, it.RULES.all)) {
	          $it.schema = $sch;
	          $it.schemaPath = it.schemaPath + '.patternGroups' + it.util.getProperty($pgProperty) + '.schema';
	          $it.errSchemaPath = it.errSchemaPath + '/patternGroups/' + it.util.escapeFragment($pgProperty) + '/schema';
	          out += ' var pgPropCount' + ($lvl) + ' = 0;  ';
	          if ($ownProperties) {
	            out += ' ' + ($dataProperties) + ' = ' + ($dataProperties) + ' || Object.keys(' + ($data) + '); for (var ' + ($idx) + '=0; ' + ($idx) + '<' + ($dataProperties) + '.length; ' + ($idx) + '++) { var ' + ($key) + ' = ' + ($dataProperties) + '[' + ($idx) + ']; ';
	          } else {
	            out += ' for (var ' + ($key) + ' in ' + ($data) + ') { ';
	          }
	          out += ' if (' + (it.usePattern($pgProperty)) + '.test(' + ($key) + ')) { pgPropCount' + ($lvl) + '++; ';
	          $it.errorPath = it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
	          var $passData = $data + '[' + $key + ']';
	          $it.dataPathArr[$dataNxt] = $key;
	          var $code = it.validate($it);
	          $it.baseId = $currentBaseId;
	          if (it.util.varOccurences($code, $nextData) < 2) {
	            out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
	          } else {
	            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
	          }
	          if ($breakOnError) {
	            out += ' if (!' + ($nextValid) + ') break; ';
	          }
	          out += ' } ';
	          if ($breakOnError) {
	            out += ' else ' + ($nextValid) + ' = true; ';
	          }
	          out += ' }  ';
	          if ($breakOnError) {
	            out += ' if (' + ($nextValid) + ') { ';
	            $closingBraces += '}';
	          }
	          var $pgMin = $pgSchema.minimum,
	            $pgMax = $pgSchema.maximum;
	          if ($pgMin !== undefined || $pgMax !== undefined) {
	            out += ' var ' + ($valid) + ' = true; ';
	            var $currErrSchemaPath = $errSchemaPath;
	            if ($pgMin !== undefined) {
	              var $limit = $pgMin,
	                $reason = 'minimum',
	                $moreOrLess = 'less';
	              out += ' ' + ($valid) + ' = pgPropCount' + ($lvl) + ' >= ' + ($pgMin) + '; ';
	              $errSchemaPath = it.errSchemaPath + '/patternGroups/minimum';
	              out += '  if (!' + ($valid) + ') {   ';
	              var $$outStack = $$outStack || [];
	              $$outStack.push(out);
	              out = ''; /* istanbul ignore else */
	              if (it.createErrors !== false) {
	                out += ' { keyword: \'' + ('patternGroups') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { reason: \'' + ($reason) + '\', limit: ' + ($limit) + ', pattern: \'' + (it.util.escapeQuotes($pgProperty)) + '\' } ';
	                if (it.opts.messages !== false) {
	                  out += ' , message: \'should NOT have ' + ($moreOrLess) + ' than ' + ($limit) + ' properties matching pattern "' + (it.util.escapeQuotes($pgProperty)) + '"\' ';
	                }
	                if (it.opts.verbose) {
	                  out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	                }
	                out += ' } ';
	              } else {
	                out += ' {} ';
	              }
	              var __err = out;
	              out = $$outStack.pop();
	              if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	                if (it.async) {
	                  out += ' throw new ValidationError([' + (__err) + ']); ';
	                } else {
	                  out += ' validate.errors = [' + (__err) + ']; return false; ';
	                }
	              } else {
	                out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	              }
	              out += ' } ';
	              if ($pgMax !== undefined) {
	                out += ' else ';
	              }
	            }
	            if ($pgMax !== undefined) {
	              var $limit = $pgMax,
	                $reason = 'maximum',
	                $moreOrLess = 'more';
	              out += ' ' + ($valid) + ' = pgPropCount' + ($lvl) + ' <= ' + ($pgMax) + '; ';
	              $errSchemaPath = it.errSchemaPath + '/patternGroups/maximum';
	              out += '  if (!' + ($valid) + ') {   ';
	              var $$outStack = $$outStack || [];
	              $$outStack.push(out);
	              out = ''; /* istanbul ignore else */
	              if (it.createErrors !== false) {
	                out += ' { keyword: \'' + ('patternGroups') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { reason: \'' + ($reason) + '\', limit: ' + ($limit) + ', pattern: \'' + (it.util.escapeQuotes($pgProperty)) + '\' } ';
	                if (it.opts.messages !== false) {
	                  out += ' , message: \'should NOT have ' + ($moreOrLess) + ' than ' + ($limit) + ' properties matching pattern "' + (it.util.escapeQuotes($pgProperty)) + '"\' ';
	                }
	                if (it.opts.verbose) {
	                  out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	                }
	                out += ' } ';
	              } else {
	                out += ' {} ';
	              }
	              var __err = out;
	              out = $$outStack.pop();
	              if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	                if (it.async) {
	                  out += ' throw new ValidationError([' + (__err) + ']); ';
	                } else {
	                  out += ' validate.errors = [' + (__err) + ']; return false; ';
	                }
	              } else {
	                out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	              }
	              out += ' } ';
	            }
	            $errSchemaPath = $currErrSchemaPath;
	            if ($breakOnError) {
	              out += ' if (' + ($valid) + ') { ';
	              $closingBraces += '}';
	            }
	          }
	        }
	      }
	    }
	  }
	  if ($breakOnError) {
	    out += ' ' + ($closingBraces) + ' if (' + ($errs) + ' == errors) {';
	  }
	  out = it.util.cleanUpCode(out);
	  return out;
	}


/***/ }),
/* 64 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_propertyNames(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  var $errs = 'errs__' + $lvl;
	  var $it = it.util.copy(it);
	  var $closingBraces = '';
	  $it.level++;
	  var $nextValid = 'valid' + $it.level;
	  if (it.util.schemaHasRules($schema, it.RULES.all)) {
	    $it.schema = $schema;
	    $it.schemaPath = $schemaPath;
	    $it.errSchemaPath = $errSchemaPath;
	    var $key = 'key' + $lvl,
	      $idx = 'idx' + $lvl,
	      $i = 'i' + $lvl,
	      $invalidName = '\' + ' + $key + ' + \'',
	      $dataNxt = $it.dataLevel = it.dataLevel + 1,
	      $nextData = 'data' + $dataNxt,
	      $dataProperties = 'dataProperties' + $lvl,
	      $ownProperties = it.opts.ownProperties,
	      $currentBaseId = it.baseId;
	    out += ' var ' + ($errs) + ' = errors; ';
	    if ($ownProperties) {
	      out += ' var ' + ($dataProperties) + ' = undefined; ';
	    }
	    if ($ownProperties) {
	      out += ' ' + ($dataProperties) + ' = ' + ($dataProperties) + ' || Object.keys(' + ($data) + '); for (var ' + ($idx) + '=0; ' + ($idx) + '<' + ($dataProperties) + '.length; ' + ($idx) + '++) { var ' + ($key) + ' = ' + ($dataProperties) + '[' + ($idx) + ']; ';
	    } else {
	      out += ' for (var ' + ($key) + ' in ' + ($data) + ') { ';
	    }
	    out += ' var startErrs' + ($lvl) + ' = errors; ';
	    var $passData = $key;
	    var $wasComposite = it.compositeRule;
	    it.compositeRule = $it.compositeRule = true;
	    var $code = it.validate($it);
	    $it.baseId = $currentBaseId;
	    if (it.util.varOccurences($code, $nextData) < 2) {
	      out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
	    } else {
	      out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
	    }
	    it.compositeRule = $it.compositeRule = $wasComposite;
	    out += ' if (!' + ($nextValid) + ') { for (var ' + ($i) + '=startErrs' + ($lvl) + '; ' + ($i) + '<errors; ' + ($i) + '++) { vErrors[' + ($i) + '].propertyName = ' + ($key) + '; }   var err =   '; /* istanbul ignore else */
	    if (it.createErrors !== false) {
	      out += ' { keyword: \'' + ('propertyNames') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { propertyName: \'' + ($invalidName) + '\' } ';
	      if (it.opts.messages !== false) {
	        out += ' , message: \'property name \\\'' + ($invalidName) + '\\\' is invalid\' ';
	      }
	      if (it.opts.verbose) {
	        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	      }
	      out += ' } ';
	    } else {
	      out += ' {} ';
	    }
	    out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	    if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	      if (it.async) {
	        out += ' throw new ValidationError(vErrors); ';
	      } else {
	        out += ' validate.errors = vErrors; return false; ';
	      }
	    }
	    if ($breakOnError) {
	      out += ' break; ';
	    }
	    out += ' } }';
	  }
	  if ($breakOnError) {
	    out += ' ' + ($closingBraces) + ' if (' + ($errs) + ' == errors) {';
	  }
	  out = it.util.cleanUpCode(out);
	  return out;
	}


/***/ }),
/* 65 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_required(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  var $valid = 'valid' + $lvl;
	  var $isData = it.opts.$data && $schema && $schema.$data,
	    $schemaValue;
	  if ($isData) {
	    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
	    $schemaValue = 'schema' + $lvl;
	  } else {
	    $schemaValue = $schema;
	  }
	  var $vSchema = 'schema' + $lvl;
	  if (!$isData) {
	    if ($schema.length < it.opts.loopRequired && it.schema.properties && Object.keys(it.schema.properties).length) {
	      var $required = [];
	      var arr1 = $schema;
	      if (arr1) {
	        var $property, i1 = -1,
	          l1 = arr1.length - 1;
	        while (i1 < l1) {
	          $property = arr1[i1 += 1];
	          var $propertySch = it.schema.properties[$property];
	          if (!($propertySch && it.util.schemaHasRules($propertySch, it.RULES.all))) {
	            $required[$required.length] = $property;
	          }
	        }
	      }
	    } else {
	      var $required = $schema;
	    }
	  }
	  if ($isData || $required.length) {
	    var $currentErrorPath = it.errorPath,
	      $loopRequired = $isData || $required.length >= it.opts.loopRequired,
	      $ownProperties = it.opts.ownProperties;
	    if ($breakOnError) {
	      out += ' var missing' + ($lvl) + '; ';
	      if ($loopRequired) {
	        if (!$isData) {
	          out += ' var ' + ($vSchema) + ' = validate.schema' + ($schemaPath) + '; ';
	        }
	        var $i = 'i' + $lvl,
	          $propertyPath = 'schema' + $lvl + '[' + $i + ']',
	          $missingProperty = '\' + ' + $propertyPath + ' + \'';
	        if (it.opts._errorDataPathProperty) {
	          it.errorPath = it.util.getPathExpr($currentErrorPath, $propertyPath, it.opts.jsonPointers);
	        }
	        out += ' var ' + ($valid) + ' = true; ';
	        if ($isData) {
	          out += ' if (schema' + ($lvl) + ' === undefined) ' + ($valid) + ' = true; else if (!Array.isArray(schema' + ($lvl) + ')) ' + ($valid) + ' = false; else {';
	        }
	        out += ' for (var ' + ($i) + ' = 0; ' + ($i) + ' < ' + ($vSchema) + '.length; ' + ($i) + '++) { ' + ($valid) + ' = ' + ($data) + '[' + ($vSchema) + '[' + ($i) + ']] !== undefined ';
	        if ($ownProperties) {
	          out += ' &&   Object.prototype.hasOwnProperty.call(' + ($data) + ', ' + ($vSchema) + '[' + ($i) + ']) ';
	        }
	        out += '; if (!' + ($valid) + ') break; } ';
	        if ($isData) {
	          out += '  }  ';
	        }
	        out += '  if (!' + ($valid) + ') {   ';
	        var $$outStack = $$outStack || [];
	        $$outStack.push(out);
	        out = ''; /* istanbul ignore else */
	        if (it.createErrors !== false) {
	          out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
	          if (it.opts.messages !== false) {
	            out += ' , message: \'';
	            if (it.opts._errorDataPathProperty) {
	              out += 'is a required property';
	            } else {
	              out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
	            }
	            out += '\' ';
	          }
	          if (it.opts.verbose) {
	            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	          }
	          out += ' } ';
	        } else {
	          out += ' {} ';
	        }
	        var __err = out;
	        out = $$outStack.pop();
	        if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	          if (it.async) {
	            out += ' throw new ValidationError([' + (__err) + ']); ';
	          } else {
	            out += ' validate.errors = [' + (__err) + ']; return false; ';
	          }
	        } else {
	          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	        }
	        out += ' } else { ';
	      } else {
	        out += ' if ( ';
	        var arr2 = $required;
	        if (arr2) {
	          var $propertyKey, $i = -1,
	            l2 = arr2.length - 1;
	          while ($i < l2) {
	            $propertyKey = arr2[$i += 1];
	            if ($i) {
	              out += ' || ';
	            }
	            var $prop = it.util.getProperty($propertyKey),
	              $useData = $data + $prop;
	            out += ' ( ( ' + ($useData) + ' === undefined ';
	            if ($ownProperties) {
	              out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
	            }
	            out += ') && (missing' + ($lvl) + ' = ' + (it.util.toQuotedString(it.opts.jsonPointers ? $propertyKey : $prop)) + ') ) ';
	          }
	        }
	        out += ') {  ';
	        var $propertyPath = 'missing' + $lvl,
	          $missingProperty = '\' + ' + $propertyPath + ' + \'';
	        if (it.opts._errorDataPathProperty) {
	          it.errorPath = it.opts.jsonPointers ? it.util.getPathExpr($currentErrorPath, $propertyPath, true) : $currentErrorPath + ' + ' + $propertyPath;
	        }
	        var $$outStack = $$outStack || [];
	        $$outStack.push(out);
	        out = ''; /* istanbul ignore else */
	        if (it.createErrors !== false) {
	          out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
	          if (it.opts.messages !== false) {
	            out += ' , message: \'';
	            if (it.opts._errorDataPathProperty) {
	              out += 'is a required property';
	            } else {
	              out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
	            }
	            out += '\' ';
	          }
	          if (it.opts.verbose) {
	            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	          }
	          out += ' } ';
	        } else {
	          out += ' {} ';
	        }
	        var __err = out;
	        out = $$outStack.pop();
	        if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	          if (it.async) {
	            out += ' throw new ValidationError([' + (__err) + ']); ';
	          } else {
	            out += ' validate.errors = [' + (__err) + ']; return false; ';
	          }
	        } else {
	          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	        }
	        out += ' } else { ';
	      }
	    } else {
	      if ($loopRequired) {
	        if (!$isData) {
	          out += ' var ' + ($vSchema) + ' = validate.schema' + ($schemaPath) + '; ';
	        }
	        var $i = 'i' + $lvl,
	          $propertyPath = 'schema' + $lvl + '[' + $i + ']',
	          $missingProperty = '\' + ' + $propertyPath + ' + \'';
	        if (it.opts._errorDataPathProperty) {
	          it.errorPath = it.util.getPathExpr($currentErrorPath, $propertyPath, it.opts.jsonPointers);
	        }
	        if ($isData) {
	          out += ' if (' + ($vSchema) + ' && !Array.isArray(' + ($vSchema) + ')) {  var err =   '; /* istanbul ignore else */
	          if (it.createErrors !== false) {
	            out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
	            if (it.opts.messages !== false) {
	              out += ' , message: \'';
	              if (it.opts._errorDataPathProperty) {
	                out += 'is a required property';
	              } else {
	                out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
	              }
	              out += '\' ';
	            }
	            if (it.opts.verbose) {
	              out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	            }
	            out += ' } ';
	          } else {
	            out += ' {} ';
	          }
	          out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } else if (' + ($vSchema) + ' !== undefined) { ';
	        }
	        out += ' for (var ' + ($i) + ' = 0; ' + ($i) + ' < ' + ($vSchema) + '.length; ' + ($i) + '++) { if (' + ($data) + '[' + ($vSchema) + '[' + ($i) + ']] === undefined ';
	        if ($ownProperties) {
	          out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', ' + ($vSchema) + '[' + ($i) + ']) ';
	        }
	        out += ') {  var err =   '; /* istanbul ignore else */
	        if (it.createErrors !== false) {
	          out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
	          if (it.opts.messages !== false) {
	            out += ' , message: \'';
	            if (it.opts._errorDataPathProperty) {
	              out += 'is a required property';
	            } else {
	              out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
	            }
	            out += '\' ';
	          }
	          if (it.opts.verbose) {
	            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	          }
	          out += ' } ';
	        } else {
	          out += ' {} ';
	        }
	        out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } } ';
	        if ($isData) {
	          out += '  }  ';
	        }
	      } else {
	        var arr3 = $required;
	        if (arr3) {
	          var $propertyKey, i3 = -1,
	            l3 = arr3.length - 1;
	          while (i3 < l3) {
	            $propertyKey = arr3[i3 += 1];
	            var $prop = it.util.getProperty($propertyKey),
	              $missingProperty = it.util.escapeQuotes($propertyKey),
	              $useData = $data + $prop;
	            if (it.opts._errorDataPathProperty) {
	              it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers);
	            }
	            out += ' if ( ' + ($useData) + ' === undefined ';
	            if ($ownProperties) {
	              out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
	            }
	            out += ') {  var err =   '; /* istanbul ignore else */
	            if (it.createErrors !== false) {
	              out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
	              if (it.opts.messages !== false) {
	                out += ' , message: \'';
	                if (it.opts._errorDataPathProperty) {
	                  out += 'is a required property';
	                } else {
	                  out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
	                }
	                out += '\' ';
	              }
	              if (it.opts.verbose) {
	                out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	              }
	              out += ' } ';
	            } else {
	              out += ' {} ';
	            }
	            out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ';
	          }
	        }
	      }
	    }
	    it.errorPath = $currentErrorPath;
	  } else if ($breakOnError) {
	    out += ' if (true) {';
	  }
	  return out;
	}


/***/ }),
/* 66 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_uniqueItems(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $data = 'data' + ($dataLvl || '');
	  var $valid = 'valid' + $lvl;
	  var $isData = it.opts.$data && $schema && $schema.$data,
	    $schemaValue;
	  if ($isData) {
	    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
	    $schemaValue = 'schema' + $lvl;
	  } else {
	    $schemaValue = $schema;
	  }
	  if (($schema || $isData) && it.opts.uniqueItems !== false) {
	    if ($isData) {
	      out += ' var ' + ($valid) + '; if (' + ($schemaValue) + ' === false || ' + ($schemaValue) + ' === undefined) ' + ($valid) + ' = true; else if (typeof ' + ($schemaValue) + ' != \'boolean\') ' + ($valid) + ' = false; else { ';
	    }
	    out += ' var ' + ($valid) + ' = true; if (' + ($data) + '.length > 1) { var i = ' + ($data) + '.length, j; outer: for (;i--;) { for (j = i; j--;) { if (equal(' + ($data) + '[i], ' + ($data) + '[j])) { ' + ($valid) + ' = false; break outer; } } } } ';
	    if ($isData) {
	      out += '  }  ';
	    }
	    out += ' if (!' + ($valid) + ') {   ';
	    var $$outStack = $$outStack || [];
	    $$outStack.push(out);
	    out = ''; /* istanbul ignore else */
	    if (it.createErrors !== false) {
	      out += ' { keyword: \'' + ('uniqueItems') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { i: i, j: j } ';
	      if (it.opts.messages !== false) {
	        out += ' , message: \'should NOT have duplicate items (items ## \' + j + \' and \' + i + \' are identical)\' ';
	      }
	      if (it.opts.verbose) {
	        out += ' , schema:  ';
	        if ($isData) {
	          out += 'validate.schema' + ($schemaPath);
	        } else {
	          out += '' + ($schema);
	        }
	        out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	      }
	      out += ' } ';
	    } else {
	      out += ' {} ';
	    }
	    var __err = out;
	    out = $$outStack.pop();
	    if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	      if (it.async) {
	        out += ' throw new ValidationError([' + (__err) + ']); ';
	      } else {
	        out += ' validate.errors = [' + (__err) + ']; return false; ';
	      }
	    } else {
	      out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	    }
	    out += ' } ';
	    if ($breakOnError) {
	      out += ' else { ';
	    }
	  } else {
	    if ($breakOnError) {
	      out += ' if (true) { ';
	    }
	  }
	  return out;
	}


/***/ }),
/* 67 */
/***/ (function(module, exports) {

	'use strict';
	
	var KEYWORDS = [
	  'multipleOf',
	  'maximum',
	  'exclusiveMaximum',
	  'minimum',
	  'exclusiveMinimum',
	  'maxLength',
	  'minLength',
	  'pattern',
	  'additionalItems',
	  'maxItems',
	  'minItems',
	  'uniqueItems',
	  'maxProperties',
	  'minProperties',
	  'required',
	  'additionalProperties',
	  'enum',
	  'format',
	  'const'
	];
	
	module.exports = function (metaSchema, keywordsJsonPointers) {
	  for (var i=0; i<keywordsJsonPointers.length; i++) {
	    metaSchema = JSON.parse(JSON.stringify(metaSchema));
	    var segments = keywordsJsonPointers[i].split('/');
	    var keywords = metaSchema;
	    var j;
	    for (j=1; j<segments.length; j++)
	      keywords = keywords[segments[j]];
	
	    for (j=0; j<KEYWORDS.length; j++) {
	      var key = KEYWORDS[j];
	      var schema = keywords[key];
	      if (schema) {
	        keywords[key] = {
	          anyOf: [
	            schema,
	            { $ref: 'https://raw.githubusercontent.com/epoberezkin/ajv/master/lib/refs/$data.json#' }
	          ]
	        };
	      }
	    }
	  }
	
	  return metaSchema;
	};


/***/ }),
/* 68 */
/***/ (function(module, exports) {

	'use strict';
	
	var META_SCHEMA_ID = 'http://json-schema.org/draft-06/schema';
	
	module.exports = function (ajv) {
	  var defaultMeta = ajv._opts.defaultMeta;
	  var metaSchemaRef = typeof defaultMeta == 'string'
	                      ? { $ref: defaultMeta }
	                      : ajv.getSchema(META_SCHEMA_ID)
	                        ? { $ref: META_SCHEMA_ID }
	                        : {};
	
	  ajv.addKeyword('patternGroups', {
	    // implemented in properties.jst
	    metaSchema: {
	      type: 'object',
	      additionalProperties: {
	        type: 'object',
	        required: [ 'schema' ],
	        properties: {
	          maximum: {
	            type: 'integer',
	            minimum: 0
	          },
	          minimum: {
	            type: 'integer',
	            minimum: 0
	          },
	          schema: metaSchemaRef
	        },
	        additionalProperties: false
	      }
	    }
	  });
	  ajv.RULES.all.properties.implements.push('patternGroups');
	};


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var MissingRefError = __webpack_require__(35).MissingRef;
	
	module.exports = compileAsync;
	
	
	/**
	 * Creates validating function for passed schema with asynchronous loading of missing schemas.
	 * `loadSchema` option should be a function that accepts schema uri and returns promise that resolves with the schema.
	 * @this  Ajv
	 * @param {Object}   schema schema object
	 * @param {Boolean}  meta optional true to compile meta-schema; this parameter can be skipped
	 * @param {Function} callback an optional node-style callback, it is called with 2 parameters: error (or null) and validating function.
	 * @return {Promise} promise that resolves with a validating function.
	 */
	function compileAsync(schema, meta, callback) {
	  /* eslint no-shadow: 0 */
	  /* global Promise */
	  /* jshint validthis: true */
	  var self = this;
	  if (typeof this._opts.loadSchema != 'function')
	    throw new Error('options.loadSchema should be a function');
	
	  if (typeof meta == 'function') {
	    callback = meta;
	    meta = undefined;
	  }
	
	  var p = loadMetaSchemaOf(schema).then(function () {
	    var schemaObj = self._addSchema(schema, undefined, meta);
	    return schemaObj.validate || _compileAsync(schemaObj);
	  });
	
	  if (callback) {
	    p.then(
	      function(v) { callback(null, v); },
	      callback
	    );
	  }
	
	  return p;
	
	
	  function loadMetaSchemaOf(sch) {
	    var $schema = sch.$schema;
	    return $schema && !self.getSchema($schema)
	            ? compileAsync.call(self, { $ref: $schema }, true)
	            : Promise.resolve();
	  }
	
	
	  function _compileAsync(schemaObj) {
	    try { return self._compile(schemaObj); }
	    catch(e) {
	      if (e instanceof MissingRefError) return loadMissingSchema(e);
	      throw e;
	    }
	
	
	    function loadMissingSchema(e) {
	      var ref = e.missingSchema;
	      if (added(ref)) throw new Error('Schema ' + ref + ' is loaded but ' + e.missingRef + ' cannot be resolved');
	
	      var schemaPromise = self._loadingSchemas[ref];
	      if (!schemaPromise) {
	        schemaPromise = self._loadingSchemas[ref] = self._opts.loadSchema(ref);
	        schemaPromise.then(removePromise, removePromise);
	      }
	
	      return schemaPromise.then(function (sch) {
	        if (!added(ref)) {
	          return loadMetaSchemaOf(sch).then(function () {
	            if (!added(ref)) self.addSchema(sch, ref, undefined, meta);
	          });
	        }
	      }).then(function() {
	        return _compileAsync(schemaObj);
	      });
	
	      function removePromise() {
	        delete self._loadingSchemas[ref];
	      }
	
	      function added(ref) {
	        return self._refs[ref] || self._schemas[ref];
	      }
	    }
	  }
	}


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var IDENTIFIER = /^[a-z_$][a-z0-9_$-]*$/i;
	var customRuleCode = __webpack_require__(71);
	
	module.exports = {
	  add: addKeyword,
	  get: getKeyword,
	  remove: removeKeyword
	};
	
	/**
	 * Define custom keyword
	 * @this  Ajv
	 * @param {String} keyword custom keyword, should be unique (including different from all standard, custom and macro keywords).
	 * @param {Object} definition keyword definition object with properties `type` (type(s) which the keyword applies to), `validate` or `compile`.
	 */
	function addKeyword(keyword, definition) {
	  /* jshint validthis: true */
	  /* eslint no-shadow: 0 */
	  var RULES = this.RULES;
	
	  if (RULES.keywords[keyword])
	    throw new Error('Keyword ' + keyword + ' is already defined');
	
	  if (!IDENTIFIER.test(keyword))
	    throw new Error('Keyword ' + keyword + ' is not a valid identifier');
	
	  if (definition) {
	    if (definition.macro && definition.valid !== undefined)
	      throw new Error('"valid" option cannot be used with macro keywords');
	
	    var dataType = definition.type;
	    if (Array.isArray(dataType)) {
	      var i, len = dataType.length;
	      for (i=0; i<len; i++) checkDataType(dataType[i]);
	      for (i=0; i<len; i++) _addRule(keyword, dataType[i], definition);
	    } else {
	      if (dataType) checkDataType(dataType);
	      _addRule(keyword, dataType, definition);
	    }
	
	    var $data = definition.$data === true && this._opts.$data;
	    if ($data && !definition.validate)
	      throw new Error('$data support: "validate" function is not defined');
	
	    var metaSchema = definition.metaSchema;
	    if (metaSchema) {
	      if ($data) {
	        metaSchema = {
	          anyOf: [
	            metaSchema,
	            { '$ref': 'https://raw.githubusercontent.com/epoberezkin/ajv/master/lib/refs/$data.json#' }
	          ]
	        };
	      }
	      definition.validateSchema = this.compile(metaSchema, true);
	    }
	  }
	
	  RULES.keywords[keyword] = RULES.all[keyword] = true;
	
	
	  function _addRule(keyword, dataType, definition) {
	    var ruleGroup;
	    for (var i=0; i<RULES.length; i++) {
	      var rg = RULES[i];
	      if (rg.type == dataType) {
	        ruleGroup = rg;
	        break;
	      }
	    }
	
	    if (!ruleGroup) {
	      ruleGroup = { type: dataType, rules: [] };
	      RULES.push(ruleGroup);
	    }
	
	    var rule = {
	      keyword: keyword,
	      definition: definition,
	      custom: true,
	      code: customRuleCode,
	      implements: definition.implements
	    };
	    ruleGroup.rules.push(rule);
	    RULES.custom[keyword] = rule;
	  }
	
	
	  function checkDataType(dataType) {
	    if (!RULES.types[dataType]) throw new Error('Unknown type ' + dataType);
	  }
	}
	
	
	/**
	 * Get keyword
	 * @this  Ajv
	 * @param {String} keyword pre-defined or custom keyword.
	 * @return {Object|Boolean} custom keyword definition, `true` if it is a predefined keyword, `false` otherwise.
	 */
	function getKeyword(keyword) {
	  /* jshint validthis: true */
	  var rule = this.RULES.custom[keyword];
	  return rule ? rule.definition : this.RULES.keywords[keyword] || false;
	}
	
	
	/**
	 * Remove keyword
	 * @this  Ajv
	 * @param {String} keyword pre-defined or custom keyword.
	 */
	function removeKeyword(keyword) {
	  /* jshint validthis: true */
	  var RULES = this.RULES;
	  delete RULES.keywords[keyword];
	  delete RULES.all[keyword];
	  delete RULES.custom[keyword];
	  for (var i=0; i<RULES.length; i++) {
	    var rules = RULES[i].rules;
	    for (var j=0; j<rules.length; j++) {
	      if (rules[j].keyword == keyword) {
	        rules.splice(j, 1);
	        break;
	      }
	    }
	  }
	}


/***/ }),
/* 71 */
/***/ (function(module, exports) {

	'use strict';
	module.exports = function generate_custom(it, $keyword, $ruleType) {
	  var out = ' ';
	  var $lvl = it.level;
	  var $dataLvl = it.dataLevel;
	  var $schema = it.schema[$keyword];
	  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
	  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
	  var $breakOnError = !it.opts.allErrors;
	  var $errorKeyword;
	  var $data = 'data' + ($dataLvl || '');
	  var $valid = 'valid' + $lvl;
	  var $errs = 'errs__' + $lvl;
	  var $isData = it.opts.$data && $schema && $schema.$data,
	    $schemaValue;
	  if ($isData) {
	    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
	    $schemaValue = 'schema' + $lvl;
	  } else {
	    $schemaValue = $schema;
	  }
	  var $rule = this,
	    $definition = 'definition' + $lvl,
	    $rDef = $rule.definition,
	    $closingBraces = '';
	  var $compile, $inline, $macro, $ruleValidate, $validateCode;
	  if ($isData && $rDef.$data) {
	    $validateCode = 'keywordValidate' + $lvl;
	    var $validateSchema = $rDef.validateSchema;
	    out += ' var ' + ($definition) + ' = RULES.custom[\'' + ($keyword) + '\'].definition; var ' + ($validateCode) + ' = ' + ($definition) + '.validate;';
	  } else {
	    $ruleValidate = it.useCustomRule($rule, $schema, it.schema, it);
	    if (!$ruleValidate) return;
	    $schemaValue = 'validate.schema' + $schemaPath;
	    $validateCode = $ruleValidate.code;
	    $compile = $rDef.compile;
	    $inline = $rDef.inline;
	    $macro = $rDef.macro;
	  }
	  var $ruleErrs = $validateCode + '.errors',
	    $i = 'i' + $lvl,
	    $ruleErr = 'ruleErr' + $lvl,
	    $asyncKeyword = $rDef.async;
	  if ($asyncKeyword && !it.async) throw new Error('async keyword in sync schema');
	  if (!($inline || $macro)) {
	    out += '' + ($ruleErrs) + ' = null;';
	  }
	  out += 'var ' + ($errs) + ' = errors;var ' + ($valid) + ';';
	  if ($isData && $rDef.$data) {
	    $closingBraces += '}';
	    out += ' if (' + ($schemaValue) + ' === undefined) { ' + ($valid) + ' = true; } else { ';
	    if ($validateSchema) {
	      $closingBraces += '}';
	      out += ' ' + ($valid) + ' = ' + ($definition) + '.validateSchema(' + ($schemaValue) + '); if (' + ($valid) + ') { ';
	    }
	  }
	  if ($inline) {
	    if ($rDef.statements) {
	      out += ' ' + ($ruleValidate.validate) + ' ';
	    } else {
	      out += ' ' + ($valid) + ' = ' + ($ruleValidate.validate) + '; ';
	    }
	  } else if ($macro) {
	    var $it = it.util.copy(it);
	    var $closingBraces = '';
	    $it.level++;
	    var $nextValid = 'valid' + $it.level;
	    $it.schema = $ruleValidate.validate;
	    $it.schemaPath = '';
	    var $wasComposite = it.compositeRule;
	    it.compositeRule = $it.compositeRule = true;
	    var $code = it.validate($it).replace(/validate\.schema/g, $validateCode);
	    it.compositeRule = $it.compositeRule = $wasComposite;
	    out += ' ' + ($code);
	  } else {
	    var $$outStack = $$outStack || [];
	    $$outStack.push(out);
	    out = '';
	    out += '  ' + ($validateCode) + '.call( ';
	    if (it.opts.passContext) {
	      out += 'this';
	    } else {
	      out += 'self';
	    }
	    if ($compile || $rDef.schema === false) {
	      out += ' , ' + ($data) + ' ';
	    } else {
	      out += ' , ' + ($schemaValue) + ' , ' + ($data) + ' , validate.schema' + (it.schemaPath) + ' ';
	    }
	    out += ' , (dataPath || \'\')';
	    if (it.errorPath != '""') {
	      out += ' + ' + (it.errorPath);
	    }
	    var $parentData = $dataLvl ? 'data' + (($dataLvl - 1) || '') : 'parentData',
	      $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : 'parentDataProperty';
	    out += ' , ' + ($parentData) + ' , ' + ($parentDataProperty) + ' , rootData )  ';
	    var def_callRuleValidate = out;
	    out = $$outStack.pop();
	    if ($rDef.errors === false) {
	      out += ' ' + ($valid) + ' = ';
	      if ($asyncKeyword) {
	        out += '' + (it.yieldAwait);
	      }
	      out += '' + (def_callRuleValidate) + '; ';
	    } else {
	      if ($asyncKeyword) {
	        $ruleErrs = 'customErrors' + $lvl;
	        out += ' var ' + ($ruleErrs) + ' = null; try { ' + ($valid) + ' = ' + (it.yieldAwait) + (def_callRuleValidate) + '; } catch (e) { ' + ($valid) + ' = false; if (e instanceof ValidationError) ' + ($ruleErrs) + ' = e.errors; else throw e; } ';
	      } else {
	        out += ' ' + ($ruleErrs) + ' = null; ' + ($valid) + ' = ' + (def_callRuleValidate) + '; ';
	      }
	    }
	  }
	  if ($rDef.modifying) {
	    out += ' if (' + ($parentData) + ') ' + ($data) + ' = ' + ($parentData) + '[' + ($parentDataProperty) + '];';
	  }
	  out += '' + ($closingBraces);
	  if ($rDef.valid) {
	    if ($breakOnError) {
	      out += ' if (true) { ';
	    }
	  } else {
	    out += ' if ( ';
	    if ($rDef.valid === undefined) {
	      out += ' !';
	      if ($macro) {
	        out += '' + ($nextValid);
	      } else {
	        out += '' + ($valid);
	      }
	    } else {
	      out += ' ' + (!$rDef.valid) + ' ';
	    }
	    out += ') { ';
	    $errorKeyword = $rule.keyword;
	    var $$outStack = $$outStack || [];
	    $$outStack.push(out);
	    out = '';
	    var $$outStack = $$outStack || [];
	    $$outStack.push(out);
	    out = ''; /* istanbul ignore else */
	    if (it.createErrors !== false) {
	      out += ' { keyword: \'' + ($errorKeyword || 'custom') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { keyword: \'' + ($rule.keyword) + '\' } ';
	      if (it.opts.messages !== false) {
	        out += ' , message: \'should pass "' + ($rule.keyword) + '" keyword validation\' ';
	      }
	      if (it.opts.verbose) {
	        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	      }
	      out += ' } ';
	    } else {
	      out += ' {} ';
	    }
	    var __err = out;
	    out = $$outStack.pop();
	    if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	      if (it.async) {
	        out += ' throw new ValidationError([' + (__err) + ']); ';
	      } else {
	        out += ' validate.errors = [' + (__err) + ']; return false; ';
	      }
	    } else {
	      out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	    }
	    var def_customError = out;
	    out = $$outStack.pop();
	    if ($inline) {
	      if ($rDef.errors) {
	        if ($rDef.errors != 'full') {
	          out += '  for (var ' + ($i) + '=' + ($errs) + '; ' + ($i) + '<errors; ' + ($i) + '++) { var ' + ($ruleErr) + ' = vErrors[' + ($i) + ']; if (' + ($ruleErr) + '.dataPath === undefined) ' + ($ruleErr) + '.dataPath = (dataPath || \'\') + ' + (it.errorPath) + '; if (' + ($ruleErr) + '.schemaPath === undefined) { ' + ($ruleErr) + '.schemaPath = "' + ($errSchemaPath) + '"; } ';
	          if (it.opts.verbose) {
	            out += ' ' + ($ruleErr) + '.schema = ' + ($schemaValue) + '; ' + ($ruleErr) + '.data = ' + ($data) + '; ';
	          }
	          out += ' } ';
	        }
	      } else {
	        if ($rDef.errors === false) {
	          out += ' ' + (def_customError) + ' ';
	        } else {
	          out += ' if (' + ($errs) + ' == errors) { ' + (def_customError) + ' } else {  for (var ' + ($i) + '=' + ($errs) + '; ' + ($i) + '<errors; ' + ($i) + '++) { var ' + ($ruleErr) + ' = vErrors[' + ($i) + ']; if (' + ($ruleErr) + '.dataPath === undefined) ' + ($ruleErr) + '.dataPath = (dataPath || \'\') + ' + (it.errorPath) + '; if (' + ($ruleErr) + '.schemaPath === undefined) { ' + ($ruleErr) + '.schemaPath = "' + ($errSchemaPath) + '"; } ';
	          if (it.opts.verbose) {
	            out += ' ' + ($ruleErr) + '.schema = ' + ($schemaValue) + '; ' + ($ruleErr) + '.data = ' + ($data) + '; ';
	          }
	          out += ' } } ';
	        }
	      }
	    } else if ($macro) {
	      out += '   var err =   '; /* istanbul ignore else */
	      if (it.createErrors !== false) {
	        out += ' { keyword: \'' + ($errorKeyword || 'custom') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { keyword: \'' + ($rule.keyword) + '\' } ';
	        if (it.opts.messages !== false) {
	          out += ' , message: \'should pass "' + ($rule.keyword) + '" keyword validation\' ';
	        }
	        if (it.opts.verbose) {
	          out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
	        }
	        out += ' } ';
	      } else {
	        out += ' {} ';
	      }
	      out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
	      if (!it.compositeRule && $breakOnError) { /* istanbul ignore if */
	        if (it.async) {
	          out += ' throw new ValidationError(vErrors); ';
	        } else {
	          out += ' validate.errors = vErrors; return false; ';
	        }
	      }
	    } else {
	      if ($rDef.errors === false) {
	        out += ' ' + (def_customError) + ' ';
	      } else {
	        out += ' if (Array.isArray(' + ($ruleErrs) + ')) { if (vErrors === null) vErrors = ' + ($ruleErrs) + '; else vErrors = vErrors.concat(' + ($ruleErrs) + '); errors = vErrors.length;  for (var ' + ($i) + '=' + ($errs) + '; ' + ($i) + '<errors; ' + ($i) + '++) { var ' + ($ruleErr) + ' = vErrors[' + ($i) + ']; if (' + ($ruleErr) + '.dataPath === undefined) ' + ($ruleErr) + '.dataPath = (dataPath || \'\') + ' + (it.errorPath) + ';  ' + ($ruleErr) + '.schemaPath = "' + ($errSchemaPath) + '";  ';
	        if (it.opts.verbose) {
	          out += ' ' + ($ruleErr) + '.schema = ' + ($schemaValue) + '; ' + ($ruleErr) + '.data = ' + ($data) + '; ';
	        }
	        out += ' } } else { ' + (def_customError) + ' } ';
	      }
	    }
	    out += ' } ';
	    if ($breakOnError) {
	      out += ' else { ';
	    }
	  }
	  return out;
	}


/***/ }),
/* 72 */
/***/ (function(module, exports) {

	module.exports = {"$schema":"http://json-schema.org/draft-06/schema#","$id":"https://raw.githubusercontent.com/epoberezkin/ajv/master/lib/refs/$data.json#","description":"Meta-schema for $data reference (JSON-schema extension proposal)","type":"object","required":["$data"],"properties":{"$data":{"type":"string","anyOf":[{"format":"relative-json-pointer"},{"format":"json-pointer"}]}},"additionalProperties":false}

/***/ }),
/* 73 */
/***/ (function(module, exports) {

	module.exports = {"$schema":"http://json-schema.org/draft-06/schema#","$id":"http://json-schema.org/draft-06/schema#","title":"Core schema meta-schema","definitions":{"schemaArray":{"type":"array","minItems":1,"items":{"$ref":"#"}},"nonNegativeInteger":{"type":"integer","minimum":0},"nonNegativeIntegerDefault0":{"allOf":[{"$ref":"#/definitions/nonNegativeInteger"},{"default":0}]},"simpleTypes":{"enum":["array","boolean","integer","null","number","object","string"]},"stringArray":{"type":"array","items":{"type":"string"},"uniqueItems":true,"default":[]}},"type":["object","boolean"],"properties":{"$id":{"type":"string","format":"uri-reference"},"$schema":{"type":"string","format":"uri"},"$ref":{"type":"string","format":"uri-reference"},"title":{"type":"string"},"description":{"type":"string"},"default":{},"multipleOf":{"type":"number","exclusiveMinimum":0},"maximum":{"type":"number"},"exclusiveMaximum":{"type":"number"},"minimum":{"type":"number"},"exclusiveMinimum":{"type":"number"},"maxLength":{"$ref":"#/definitions/nonNegativeInteger"},"minLength":{"$ref":"#/definitions/nonNegativeIntegerDefault0"},"pattern":{"type":"string","format":"regex"},"additionalItems":{"$ref":"#"},"items":{"anyOf":[{"$ref":"#"},{"$ref":"#/definitions/schemaArray"}],"default":{}},"maxItems":{"$ref":"#/definitions/nonNegativeInteger"},"minItems":{"$ref":"#/definitions/nonNegativeIntegerDefault0"},"uniqueItems":{"type":"boolean","default":false},"contains":{"$ref":"#"},"maxProperties":{"$ref":"#/definitions/nonNegativeInteger"},"minProperties":{"$ref":"#/definitions/nonNegativeIntegerDefault0"},"required":{"$ref":"#/definitions/stringArray"},"additionalProperties":{"$ref":"#"},"definitions":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"properties":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"patternProperties":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"dependencies":{"type":"object","additionalProperties":{"anyOf":[{"$ref":"#"},{"$ref":"#/definitions/stringArray"}]}},"propertyNames":{"$ref":"#"},"const":{},"enum":{"type":"array","minItems":1,"uniqueItems":true},"type":{"anyOf":[{"$ref":"#/definitions/simpleTypes"},{"type":"array","items":{"$ref":"#/definitions/simpleTypes"},"minItems":1,"uniqueItems":true}]},"format":{"type":"string"},"allOf":{"$ref":"#/definitions/schemaArray"},"anyOf":{"$ref":"#/definitions/schemaArray"},"oneOf":{"$ref":"#/definitions/schemaArray"},"not":{"$ref":"#"}},"default":{}}

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = {
	    v1: {
	        state: __webpack_require__(75),
	        view: __webpack_require__(76)
	    },
	    v2: {
	        state: __webpack_require__(77),
	        view: __webpack_require__(78)
	    },
	};


/***/ }),
/* 75 */
/***/ (function(module, exports) {

	module.exports = {"$schema":"http://json-schema.org/draft-04/schema#","description":"Jupyter Interactive Widget State JSON schema.","type":"object","properties":{"version_major":{"description":"Format version (major)","type":"number","minimum":1,"maximum":1},"version_minor":{"description":"Format version (minor)","type":"number"},"state":{"description":"Model State for All Widget Models","type":"object","additionalProperties":{"type":"object","properties":{"model_name":{"description":"Name of the JavaScript class holding the model implementation","type":"string"},"model_module":{"description":"Name of the JavaScript module holding the model implementation","type":"string"},"model_module_version":{"description":"Semver range for the JavaScript module holding the model implementation","type":"string"},"state":{"description":"Serialized state of the model","type":"object","additional_properties":true}},"required":["model_name","model_module","state"],"additionalProperties":false}}},"required":["version_major","version_minor","state"],"additionalProperties":false}

/***/ }),
/* 76 */
/***/ (function(module, exports) {

	module.exports = {"$schema":"http://json-schema.org/draft-04/schema#","description":"Jupyter Interactive Widget View JSON schema.","type":"object","properties":{"version_major":{"description":"Format version (major)","type":"number","minimum":1,"maximum":1},"version_minor":{"description":"Format version (minor)","type":"number"},"model_id":{"description":"Unique identifier of the widget model to be displayed","type":"string"}},"required":["model_id"],"additionalProperties":false}

/***/ }),
/* 77 */
/***/ (function(module, exports) {

	module.exports = {"$schema":"http://json-schema.org/draft-04/schema#","description":"Jupyter Interactive Widget State JSON schema.","type":"object","properties":{"version_major":{"description":"Format version (major)","type":"number","minimum":2,"maximum":2},"version_minor":{"description":"Format version (minor)","type":"number","minimum":0,"maximum":0},"state":{"description":"Model State for All Widget Models - keys are model ids, values are model state","type":"object","additionalProperties":{"type":"object","properties":{"model_name":{"description":"Name of the JavaScript class holding the model implementation","type":"string"},"model_module":{"description":"Name of the JavaScript module holding the model implementation","type":"string"},"model_module_version":{"description":"Semver range for the JavaScript module holding the model implementation","type":"string"},"state":{"description":"Serialized state of the model","type":"object"},"buffers":{"description":"Binary buffers in the state","type":"array","items":{"type":"object","properties":{"path":{"description":"A path for a binary buffer value.","type":"array","items":{"description":"An object key or array index","type":["string","number"]}},"data":{"description":"A binary buffer encoded as specified in the 'encoding' property","type":"string"},"encoding":{"description":"The encoding of the buffer data","type":"string","oneOf":[{"enum":["hex"],"description":"Base 16 encoding, as specified in RFC 4648, section 8 (https://tools.ietf.org/html/rfc4648#section-8)"},{"enum":["base64"],"description":"Base 64 encoding, as specified in RFC 4648, section 4 (https://tools.ietf.org/html/rfc4648#section-4)"}]}},"required":["path","data","encoding"]}}},"required":["model_name","model_module","state"]}}},"required":["version_major","version_minor","state"]}

/***/ }),
/* 78 */
/***/ (function(module, exports) {

	module.exports = {"$schema":"http://json-schema.org/draft-04/schema#","description":"Jupyter Interactive Widget View JSON schema.","type":"object","properties":{"version_major":{"description":"Format version (major)","type":"number","minimum":2,"maximum":2},"version_minor":{"description":"Format version (minor)","type":"number"},"model_id":{"description":"Unique identifier of the widget model to be displayed","type":"string"}},"required":["model_id"]}

/***/ }),
/* 79 */
/***/ (function(module, exports) {

	module.exports = {"id":"http://json-schema.org/draft-04/schema#","$schema":"http://json-schema.org/draft-04/schema#","description":"Core schema meta-schema","definitions":{"schemaArray":{"type":"array","minItems":1,"items":{"$ref":"#"}},"positiveInteger":{"type":"integer","minimum":0},"positiveIntegerDefault0":{"allOf":[{"$ref":"#/definitions/positiveInteger"},{"default":0}]},"simpleTypes":{"enum":["array","boolean","integer","null","number","object","string"]},"stringArray":{"type":"array","items":{"type":"string"},"minItems":1,"uniqueItems":true}},"type":"object","properties":{"id":{"type":"string","format":"uri"},"$schema":{"type":"string","format":"uri"},"title":{"type":"string"},"description":{"type":"string"},"default":{},"multipleOf":{"type":"number","minimum":0,"exclusiveMinimum":true},"maximum":{"type":"number"},"exclusiveMaximum":{"type":"boolean","default":false},"minimum":{"type":"number"},"exclusiveMinimum":{"type":"boolean","default":false},"maxLength":{"$ref":"#/definitions/positiveInteger"},"minLength":{"$ref":"#/definitions/positiveIntegerDefault0"},"pattern":{"type":"string","format":"regex"},"additionalItems":{"anyOf":[{"type":"boolean"},{"$ref":"#"}],"default":{}},"items":{"anyOf":[{"$ref":"#"},{"$ref":"#/definitions/schemaArray"}],"default":{}},"maxItems":{"$ref":"#/definitions/positiveInteger"},"minItems":{"$ref":"#/definitions/positiveIntegerDefault0"},"uniqueItems":{"type":"boolean","default":false},"maxProperties":{"$ref":"#/definitions/positiveInteger"},"minProperties":{"$ref":"#/definitions/positiveIntegerDefault0"},"required":{"$ref":"#/definitions/stringArray"},"additionalProperties":{"anyOf":[{"type":"boolean"},{"$ref":"#"}],"default":{}},"definitions":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"properties":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"patternProperties":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"dependencies":{"type":"object","additionalProperties":{"anyOf":[{"$ref":"#"},{"$ref":"#/definitions/stringArray"}]}},"enum":{"type":"array","minItems":1,"uniqueItems":true},"type":{"anyOf":[{"$ref":"#/definitions/simpleTypes"},{"type":"array","items":{"$ref":"#/definitions/simpleTypes"},"minItems":1,"uniqueItems":true}]},"allOf":{"$ref":"#/definitions/schemaArray"},"anyOf":{"$ref":"#/definitions/schemaArray"},"oneOf":{"$ref":"#/definitions/schemaArray"},"not":{"$ref":"#"}},"dependencies":{"exclusiveMaximum":["maximum"],"exclusiveMinimum":["minimum"]},"default":{}}

/***/ })
/******/ ]);
//# sourceMappingURL=embed.js.map