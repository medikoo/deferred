# Asynchronous JavaScript with deferred and promises

 Promises simple, straightforward and powerful way. It was build with  _less is more_ mantra in mind, API consist of just 7 functions which should give all you need to configure complicated asynchronous control flow.

This work is highly inspired by other deferred/promise implementations, in particular [Q](https://github.com/kriskowal/q) by [Kris Kowal](https://github.com/kriskowal).

* [Installation](#installation)
* [Deferred/Promise concept](#deferred-promise-concept)
	* [Basics](#deferred-promise-basics)
	* [Error handling](#deferred-promise-error-handling)
* [Asynchronous functions as promises](#asynchronous-functions-as-promises)
* [Control-flow, joining promises](#control-flow)
	* [`join`](#control-flow-join)
	* [`all`](#control-flow-all)
	* [`first`](#control-flow-first)
	* [Non promise arguments](#control-flow-non-promise-arguments)
	* [Examples](#control-flow-examples)
		* [Regular control-flow](#control-flow-examples)
		* [Asynchronous loop](#control-flow-examples-asynchronous-loop)
* [Comparision to other solutions that take non promise approach](#comparision)
	* [Step](#comparision-to-step)
	* [Async](#comparision-to-async)
		* [async.series](#comparision-to-async-series)
		* [async.parallels](#comparision-to-async-parallels)
		* [async.waterfall](#comparision-to-async-waterfall)
		* [async.auto](#comparision-to-async-auto)
		* [async.whilst, async.until](#comparision-to-async-loop)
		* [async.forEach, async.map, async.filter etc.](#comparision-to-async-array-iterators)

<a name="installation" />
## Installation

It's plain EcmaScript, but out of the box currently works only with node & npm (due to it's CommonJS package):

	$ npm install deferred

For browser or other environments it needs to be bundled with few dependencies from [es5-ext](https://github.com/medikoo/es5-ext) project (code states specifically which). Browser ready files will be available in near future.

<a name="deferred-promise-concept" />
## Deferred/Promise concept

<a name="deferred-promise-basics" />
### Basics

When there's work to do that doesn't return immediately (asynchronous), `deferred` object is created and promise (`deferred.promise`) is returned to the world. When finally value is obtained, deferred is resolved with it `deferred.resolve(value)`. At that point all promise observers (added in meantime via `deferred.promise.then`) are notified with value of fulfilled promise.

Example:

	var deferred = require('deferred');

	var later = function () {
	  var d = deferred();
		setTimeout(function () {
			d.resolve(1);
		}, 1000);
		return d.promise;
	};

	later().then(function (n) {
		console.log(n); // 1
	});

`promise` is really a `then` function, so you may use it directly:

	later()
	(function (n) {
		console.log(n); // 1
	});

`promise` takes callback and returns another promise. Returned promise will resolve with value that is a result of callback function, this way, promises can be chained:

	later()
	(function (n) {
		var d = deferred();
		setTimeout(function () {
			d.resolve(n + 1);
		}, 1000);
		return d.promise;
	})
	(function (n) {
		console.log(n); // 2
	});

Callback passed to `promise` may return anything, it may also be regular synchronous function:

	later()
	(function (n) {
		return n + 1;
	})
	(function (n) {
		console.log(n); // 2
	});

Promises can be nested. If promise resolves with another promise, it's not really resolved. It's resolved only when final promise returns real value:

	var count = 0;
	var laterNested = function fn (value) {
	  var d = deferred();
		setTimeout(function () {
			value *= 2;
			d.resolve((++count === 3) ? value : fn(value));
		}, 1000);
		return d.promise;
	};

	laterNested(1)(function (n) {
		console.log(n); // 8
	});

Promise can be resolved only once, and callbacks passed to `promise` are also called only once, no exceptions. For deeper insight into this concept, and to better understand design decisions please see Kris Kowal [design notes](https://github.com/kriskowal/q/blob/master/design/README.js), it's well worth read.

<a name="deferred-promise-error-handling" />
### Error handling

Promise is rejected when it's resolved with an error, same way if callback passed to `promise` throws exception it becomes resolution of promise returned by `promise` call. To handle error, pass second callback to `promise`:

	later()
	(function (n) {
		throw new Error('error!')
	})
	(function () {
		// never called
	}, function (e) {
		// handle error;
	});

When there is no error callback passed, error is silent. To expose error, end chain with `.end()`, then error that broke the chain will be thrown:

	later()
	(function (n) {
		throw new Error('error!')
	})
	(function (n) {
		// never executed
	})
	.end(); // throws error!

`end` takes optional handler so instead of throwing, error can be handled other way. Behavior is exactly same as when passing second callback to `promise`:

	later()
	(function (n) {
		throw new Error('error!')
	})
	.end(function (e) {
		// handle error!
	});

<a name="asynchronous-functions-as-promises" />
## Asynchronous functions as promises

There is a known convention in JavaScript for working with asynchronous calls. Following approach is widely used within node.js:

	var afunc = function (x, y, callback) {
		setTimeout(function () {
			try {
				callback(null, x + y);
			} catch (e) {
				callback(e);
			}
		}, 1000);
	};

Asynchronous function receives callback argument, callback handles both error and success. There's easy way to turn such functions into promises and take advantage of promise design. There's `deferred.asyncToPromise` for that, let's use shorter name:

	var a2p = deferred.asyncToPromise;

	// we can also import it individually:
	a2p = require('deferred/lib/async-to-promise');

This method can be used in various ways.  
First way is to  assign it directly to asynchronous method:

	afunc.a2p = a2p;

	afunc.a2p(3, 4)
	(function (n) {
		console.log(n); // 7
	});

Second way is more traditional (I personally favor this one as it doesn't touch asynchronous function):

	a2p = a2p.call;

	a2p(afunc, 3, 4)
	(function (n) {
		console.log(n); // 7
	});

Third way is to bind method for later execution. We'll use `ba2p` name for that:

	var ba2p = require('deferred/lib/async-to-promise').bind;

	var abinded = ba2p(afunc, 3, 4);

	// somewhere in other context:
	abinded()
	(function (n) {
		console.log(n); // 7
	});

Note that this way of using it is not perfectly safe. We need to be sure that `abinded` will be called without any not expected arguments, if it's the case, then it won't execute as expected:

	abinded(7, 4); // TypeError: number is not a function.

Node.js example, reading file, changing it's content  and writing under different name:

	var fs   = require('fs');

	a2p(fs.readFile, __filename, 'utf-8')
	(function (content) {
		// change content
		return content;
	})
	(ba2p(fs.writeFile, __filename + '.changed'))
	.end();

<a name="control-flow" />
## Control-flow, joining promises

There are three dedicated methods for joining promises. They're avaiable on `deferred` as `deferred.join`, `deferred.all` and `deferred.first`. Let's access them directly:

	// let's access them directly:
	var join = deferred.join;
	var all = deferred.all;
	var first = deferred.first;

As with other API methods, they can also be imported individually:

	var join  = require('deferred/lib/join/default')
	  , all   = require('deferred/lib/join/all')
	  , first = require('deferred/lib/join/first');

Join methods take arguments of any type and internally distinguish between promises, functions and others. Call them with list of arguments or an array:

	join(p1, p2, p3);
	join([p1, p2, p3]); // same behavior

`join` and `all` return another promise, which resolves with combined result of resolved arguments:

	join(p1, p2, p3)
	(function (result) {
		// result is array of resolved values of p1, p2 and p3.
	});

`first` results with value of first resolved argument:

	first(p1, p2, p3)
	(function (result) {
		// result is resolved p1, p2 or p3, whichever was first
	});

<a name="control-flow-join" />
### join(...)

`join` returns promise which resolves with an array of resolved values of all arguments.
Values may be anything, also errors (rejected promises, functions that thrown errors, errors itself). Returned promise always fulfills, never rejects.

<a name="control-flow-all" />
### all(...)

Same as `join`, with that difference that all arguments need to be succesful.
If there's any error, join execution is stopped (following functions are not called), and promise is rejected with error that broke the join chain. In succesful case returned promise value is same as in `join`.

<a name="control-flow-first" />
### first(...)

Fulfills with first succesfully resolved argument. If all arguments fail, then promise rejects
with error that occurred last.

<a name="control-flow-non-promise-arguments" />
### Non promise arguments

As mentioned above, join functions take any arguments, not only promises. Function arguments are called with fully resolved previous argument, if one resolved succesfully. If previous argument failed then function is never called. Error that rejected previous argument becomes also result of following function within returned result array. Any other values (neither promises or functions) are treated as if they were values of resolved promises.

<a name="control-flow-examples" />
### Examples:

#### Regular control-flow

Previous read/write file example written with `all`:

	all(
		a2p(fs.readFile, __filename, 'utf-8'),
		function (content) {
			// change content
			return content;
		},
		ba2p(fs.writeFile, __filename + '.changed')
	).end();

Concat all JavaScript files in given directory and save it to lib.js:

	all(
		// Read all filenames in given path
		a2p(fs.readdir, __dirname),

		// Filter *.js files
		function (files) {
			return files.filter(function (name) {
				return (name.slice(-3) === '.js');
			});
		},

		// Read files content
		function (files) {
			return join(files.map(function (name) {
				return a2p(fs.readFile, name, 'utf-8');
			}));
		},

		// Concat into one string
		function (data) {
			return data.join("\n");
		},

		// Write to lib.js
		ba2p(fs.writeFile, __dirname + '/lib.js')
	).end();

We can shorten it a bit with introduction of functional sugar, it's out of scope of this library but I guess worth an example:

	var invoke = require('es5-ext/lib/Function/invoke');

	all(
		// Read all filenames in given path
		a2p(fs.readdir, __dirname),

		// Filter *.js files
		invoke('filter', function (name) {
			return (name.slice(-3) === '.js');
		}),

		// Read files content
		invoke('map', function (name) {
			return a2p(fs.readFile, name, 'utf-8');
		}), join,

		// Concat into one string
		invoke('join', "\n"),

		// Write to lib.js
		ba2p(fs.writeFile, __dirname + '/lib.js')
	).end();

`invoke` implementation can be found in `es5-ext` project: https://github.com/medikoo/es5-ext/blob/master/lib/Function/invoke.js

<a name="control-flow-examples-asynchronous-loop" />
#### Asynchronous loop

Let's say we're after content that is paginated over many pages on some website (like search results). We don't know how many pages it spans. We only know by reading page _n_ whether page _n + 1_ exists.

First things first. Simple download function, it downloads page at given path from predefinied domain and returns promise:

	var http = require('http');

	var getPage = function (path) {
		var d = deferred();

		http.get({
			host: 'www.example.com',
			path: path
		}, function(res) {
			res.setEncoding('utf-8');
			var content = "";
			res.on('data', function (data) {
				content += data;
			});
			res.on('end', function () {
				d.resolve(content);
			});
		}).on('error', d.resolve);

		return d.promise;
	};

Deferred loop:

	var n = 1, result;
	getPage('/page/' + n++)
	(function process (content) {
		// populate result
		// decide whether we need to download next page
		if (isNextPage) {
			return getPage('/page/' + n++)(process);
		} else {
			return result;
		}
	})
	(function (result) {
		// play with final result
	}).end();

We can also make it with `all`:

	var n = 1, result;
	all(
		getPage('/page/' + n++),
		function process (content) {
			// populate result
			// decide whether we need to download next page
			if (isNextPage) {
				return getPage('/page/' + n++)(process);
			} else {
				return result;
			}
		},
		function (result) {
			// play with final result
		}
	).end();

<a name="comparision" />
### Comparision to other solutions that take non promise approach

Following are examples from documentation of other solutions rewritten deferred/promise way. You'll be the judge, which solution you find more powerful and friendly.

<a name="comparision-to-step" />
#### Step -> https://github.com/creationix/step

First example from Step [README](https://github.com/creationix/step/blob/master/README.markdown), using chained promises:

	a2p(fs.readFile, __filename, 'utf-8')
	(function capitalize (txt) {
		return txt.toUpperCase();
	})
	(function showIt (newTxt) {
		console.log(newTxt);
	})
	.end();

Again we can make it even more concise with functional sugar:

	a2p(fs.readFile, __filename, 'utf-8')
	(invoke('toUpperCase'))
	(console.log)
	.end();

<a name="comparision-to-async" />
#### Async -> https://github.com/caolan/async

<a name="comparision-to-async-series" />
##### async.series:

	all(
		function () {
			// do some stuff ...
			return 'one';
		},
		function () {
			// do some more stuff
			return 'two';
		}
	)
	(function (results) {
		// results is now equal to ['one', 'two']
	},
	function (err) {
		// handle err
	});

<a name="comparision-to-async-parallels" />
##### async.paralles:

For parallel execution we pass already initialized promises:

	all(
		promise1,
		a2p(asyncFunc, arg1, arg2),
		promise2
	)
	(function (results) {
		// results are resolved values of promise1, asyncFunc and promise2
	},
	function (err) {
		// handle err
	});

<a name="comparision-to-async-waterfall" />
##### async.waterfall:

Resolved values are always passed to following functions, so again we have it out of a box:

	all(
		function () {
			return ['one', 'two'];
		},
		function (args) {
			return 'three';
		},
		function (arg1) {
			// arg1 now equals 'three'
		}
	);

<a name="comparision-to-async-auto" />
##### async.auto

It's a question of combining `all` joins. First example from docs:

	all(
		all(
			a2p(get_data),
			a2p(make_folder)
		),
		ba2p(write_file)
		ba2p(email_link)
	).end();

<a name="comparision-to-async-loop" />
##### async.whilst, async.until

See [Asynchronous loop](#control-flow-examples-asynchronous-loop) example, it shows how easy is to configure loops.

<a name="comparision-to-async-array-iterators" />
##### async.forEach, async.map, async.filter ..etc.

Asynchronous handlers for array iterators, forEach and map:

	all(arr, function (item) {
		// logic
		return promise;
	})
	(function (results) {
		// deal with results
		// if it's forEach than results are obsolete
	})
	.end();

I decided not to implement array iterator functions in this library, for two reasons,
first is as you see above - it's very easy and straightforward to setup them with provided join methods, second it's unlikely we need most of them.
