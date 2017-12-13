// This construct deferred with all needed goodies that are being exported
// when we import 'deferred' by main name.
// All available promise extensions are also initialized.

"use strict";

var call   = Function.prototype.call
  , assign = require("es5-ext/object/assign");

module.exports = assign(
	require("./deferred"),
	{
		invokeAsync: require("./invoke-async"),
		isPromise: require("./is-promise"),
		dynamicQueue: require("./dynamic-queue"),
		validPromise: require("./valid-promise"),
		callAsync: call.bind(require("./ext/function/call-async")),
		delay: call.bind(require("./ext/function/delay")),
		gate: call.bind(require("./ext/function/gate")),
		monitor: require("./monitor"),
		promisify: call.bind(require("./ext/function/promisify")),
		promisifySync: call.bind(require("./ext/function/promisify-sync")),
		every: call.bind(require("./ext/array/every")),
		find: call.bind(require("./ext/array/find")),
		map: call.bind(require("./ext/array/map")),
		reduce: call.bind(require("./ext/array/reduce")),
		some: call.bind(require("./ext/array/some"))
	},
	require("./profiler")
);

require("./ext/promise/aside");
require("./ext/promise/catch");
require("./ext/promise/cb");
require("./ext/promise/finally");
require("./ext/promise/get");
require("./ext/promise/invoke");
require("./ext/promise/invoke-async");
require("./ext/promise/map");
require("./ext/promise/reduce");
require("./ext/promise/spread");
require("./ext/promise/some");
require("./ext/promise/timeout");
