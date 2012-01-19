# Asynchronous JavaScript with deferred and promises

Promises in a simple and powerful way. It was built with the _less is more_ mantra in mind. It's just few functions that should give all you need to easily configure complicated asynchronous control flow.

This work is inspired by other deferred/promise implementations, in particular [Q](https://github.com/kriskowal/q) by [Kris Kowal](https://github.com/kriskowal).

<a name="example" />
## Example

Concat all JavaScript files in a given directory and save it to lib.js.

Plain Node.js:

	var fs = require('fs')

	  , readdir = fs.readdir
	  , readFile = fs.readFile
	  , writeFile = fs.writeFile

	// Read all filenames in given path
	readdir(__dirname, function (err, files) {
		var result, waiting;
		if (err) {
			// if we're unable to get file listing throw error
			throw err;
		}

		// Filter *.js files
		files = files.filter(function (file) {
			return (file.slice(-3) === '.js') && (file !== 'lib.js');
		});

		// Read content of each file
		waiting = 0;
		result = [];
		files.forEach(function (file, index) {
			++waiting;
			readFile(file, 'utf8', function (err, content) {
				if (err) {
					// We were not able to read file content, throw error
					throw err;
				}
				result[index] = content;

				if (!--waiting) {
					// Got content of all files
					// Concatenate into one string and write into lib.js
					writeFile(__dirname + '/lib.js', result.join("\n"), function (err) {
						if (err) {
							// We cannot write lib.js file, throw error
							throw err;
						}
					});
				}
			});
		});
	});

Promises approach:

	var deferred = require('deferred')
	  , fs = require('fs')

	// We prepare promisified versions of each asynchronous function
	  , readdir = deferred.promisify(fs.readdir)
	  , readFile = deferred.promisify(fs.readFile)
	  , writeFile = deferred.promisify(fs.writeFile);

	writeFile(__dirname + '/lib.js',
		// Read all filenames in given path
		readdir(__dirname)

		// Filter *.js files
		.invoke('filter', function (file) {
			return (file.slice(-3) === '.js') && (file !== 'lib.js');
		})

		// Read content of all files
		.map(function (file) {
			return readFile(file, 'utf-8');
		})

		// Concatenate files content into one string
		.invoke('join', '\n')

	).end(); // If there was eny error on the way throw it

* [Installation](#installation)
	* [Node.js](#installation-nodejs)
	* [Browser](#installation-browser)
* [Deferred/Promise concept](#concept)
	* [Deferred](#concept-deferred)
	* [Promise](#concept-promise)
		* [Chaining](#concept-promise-chaining)
		* [Nesting](#concept-promise-nesting)
		* [Error handling](#concept-promise-errorhandling)
		* [Ending chain](#concept-promise-errorhandling)
		* [Creating resolved promises](#concept-promise-creatingresolved)
* [Promisify - working with asynchronous functions as we know it from Node.js](#promisify)
* [Grouping promises](#grouping)
* [Processing collections](#collections)
	* [Map](#collections-map)
	* [Reduce](#collections-reduce)
* [Promise extensions](#extensions)
	* [cb](#extensions-cb)
	* [get](#extensions-get)
	* [invoke](#extensions-invoke)
	* [map](#extensions-map)
	* [match](#extensions-match)
	* [reduce](#extensions-reduce)
* [Tests](#tests)

<a name="installation" />
## Installation

<a name="installation-nodejs" />
### Node.js

In your project path:

	$ npm install deferred

<a name="installation-browser" />
### Browser

You can easily create browser bundle with help of [modules-webmake](https://github.com/medikoo/modules-webmake). Mind that it relies on EcmaScript5 features, so for older browsers you need as well [es5-shim](https://github.com/kriskowal/es5-shim)

<a name="concept" />
## Deferred/Promise concept

<a name="concept-deferred" />
### Deferred

For work that doesn't return immediately (asynchronous) you may create deferred object. Deferred contains two function properties `resolve` and `promise`. Common pattern is to return `promise` to outer world and when you have value ready resolve it via `resolve` function

Let's create generic `delay` function, that would produce delayed version of any function that was passed to it.

	var deferred = require('deferred');

	var delay = function (fn, timeout) {
		return function () {
			var d = deferred()
			  , self = this
			  , args = arguments;

			setTimeout(function () {
				d.resolve(fn.apply(self, args));
			}, timeout);

			return d.promise;
		};
	};

	var delayedAdd = delay(function (a, b) {
		return a + b;
	}, 100);

	var resultPromise = delayedAdd(2, 3);

	console.log(deferred.isPromise(resultPromise)); // true

	resultPromise(function (value) {
		// Invoked after 100 milliseconds
		console.log(value); // 5
	});

<a name="concept-promise" />
### Promise

Promise is a promise of a value that will be available in a future. It may succed or fail.
In `deferred` (and most of the other promise implementations) you may listen for the value by passing observers to `then` function:

	promise.then(onsuccess, onfail);

In __deferred__ promise is really a `then` function, so you may use promise _function_ directly:

	promise === promise.then; // true
	promise(onsuccess, onfail)

`onsuccess` and `onfail` are optional, you may pass just one of those

A promise can be resolved only once, and callbacks passed to `promise` are also called only once (only either onsuccess or onfail is called) no exceptions.

<a name="concept-promise-chaining" />
#### Chaining

Promise function (formally `promise.then`)  takes callback(s) and returns another promise which is promise of a value that would be returned by attached callbacks. This way promises can be chained:

	delayedAdd(2, 3)
	(function (result) {
		return result*result
	})
	(function (result) {
		console.log(result); // 25
	});

It's not just function arguments that promise function can take, it can be other promises or any other JavaScript value (however `null` or `undefined` will be treated as no value). With such approach you may override result of a promise chain with specific value. It may seem awkward approach at first, but it can be handy when you work with sophisticated promises chains.

<a name="concept-promise-nesting" />
#### Nesting

Promises can be nested. If a promise resolves with another promise, it's not really resolved. It's resolved only when final promise returns a real value:

	var d = deferred();
	d.resolve(delayedAdd(2, 3));
	d.promise(function (result) {
		console.log(5); // 5;
	});

<a name="concept-promise-errorhandling" />
#### Error handling

Errors in promises are handled with separate control flow, that's one of the reasons why code written with promises is more readable and maintanable then when using plain asynchronous approach.

A promise resolved with an error (rejected), propagates its error to all promises that were initiated by its observers. Also if observer function crash with error or returns error, its promise is rejected with the error.

To handle error, pass dedicated callback as second argument to promise function:

	delayedAdd(2, 3)
	(function (result) {
		throw new Error('Error!')
	})
	(function () {
		// never called
	}, function (e) {
		// handle error;
	});

<a name="concept-promise-end" />
#### Ending chain

When there is no error callback passed, eventual error is silent. To expose the error, end promise chain with `.end()`, then error that broke the chain will be thrown:

	delayedAdd(2, 3)
	(function (result) {
		throw new Error('Error!')
	})
	(function (result) {
		// never executed
	})
	.end(); // throws error!

__It's very important to end your promise chains with `end` otherwise eventual errors that were not handled will not be exposed__. `end` is exit from promises flow. You can call it with one callback argument and it will be called same way as callback passed to Node.js style asynchronous function:

	promise(function (value) {
		// process
	}).end(function (err, result) {
		if (err) {
			// handle error
			return;
		}
		// process result
	});

Altenatively you can pass two callbacks _onsuccess_ and _onerror_ and that will resemble way `.then` works, with that difference that it won't extend chain with another promise:

	promise(function (value) {
		// process
	}).end(function (result) {
		// process result
	}, function (err) {
		// handle error
	});

Just _onerror_ may be provided:

	promise(function (value) {
		// process
	}).end(null, function (err) {
		// handle error
	});

<a name="concept-promise-creatingresolved" />
#### Creating resolved promises

With `deferred` function you may create initially resolved promises. It may make no sense at first glance but it's useful in for example function that is supposed to return promise, but have it's return value already available

	var promise = deferred(1);

	promise(function (result) {
		console.log(result); // 1;
	});

<a name="promisify" />
## Promisify - working with asynchronous functions as we know it from Node.js

There is a known convention (coined by Node.js) for working with asynchronous calls. The following approach is widely used:

	var fs = require('fs');

	fs.readFile(__filename, 'utf-8', function (err, content) {
		if (err) {
			// handle error;
			return;
		}
		// process content
	});

An asynchronous function receives a callback argument which handles both error and expected value.

`deferred` was created to make work with asynchronous flow straightforward and easy, however to take advantage of that, we need to work with functions that will actually return promises instead of taking callbacks. We can turn function that takes callback into one that returns promise with `deferred.promisify`:

	var deferred = require('deferred')
		, fs = require('fs')

		, readFile = deferred.promisify(fs.readFile);

		readFile(__filename, 'utf-8')
		(function (content) {
			// process content
		}, function (err) {
			// handle error
		});

There's no clear advantage of using `deffered` just for one asynchronous call, and I wouldn't recommend that. However it's different story when there's a lot of them, see [example](#example) this document starts with

<a name="grouping" />
## Grouping promises

When we have some promises that we want to observe as a group. We may do it again with help `deferred` function:

	deferred(delayedAdd(2, 3), delayedAdd(3, 5), delayedAdd(1, 7))
	(function (result) {
		console.log(result); // [5, 8, 8]
	});

<a name="collections" />
## Processing collections

<a name="collections-map" />
### Map

It's analogous to Array's map, with that difference that it returns promise (of an array) that would be resolved when promises for all items are resolved. Any error that would occur will reject map promise and resolve it with same error.

Let's say we have list of filenames and we want to get each file's content:

	var readFile = deferred.promisify(fs.readFile);

	deferred.map(filenames, function (filename) {
		return readFile(filename, 'utf-8');
	})
	(function (result) {
		// result is an array of file's contents
	});

`map` is also available directly on a promise object, so we may invoke it directly on promise of a collection.

Let's try again previous example but this time instead of relying on already existing filenames, we take list of files from current directory:

	var readdir = deferred.promisify(fs.readdir)
		, readFile = deferred.promisify(fs.readFile);

	readdir(__dirname).map(function (filename) {
		return readFile(filename, 'utf-8');
	})
	(function (result) {
		// result is an array of file's contents
	});

<a name="collections-reduce" />
### Reduce

It's same as Array's reduce with that difference that it calls callback only after previous accummulated value is resolved, this way we may accumulate results of collection of promises or invoke some asynchronous tasks one after another.

	deferred.reduce([delayedAdd(2, 3), delayedAdd(3, 5), delayedAdd(1, 7)], function (a, b) {
		return delayedAdd(a, b);
	})
	(function (result) {
		console.log(result); // 21
	});

As with `map`, `reduce` is also available directly as an extension on promise object.

<a name="extensions" />
## Promise extensions

Promise objects are equipped with some useful extensions. All extension are optional but are loaded by default when `deferred` is loaded via `require('deferred')` import, and that's the recommended way when you work with Node.js.
When preparing client-side file (with help of e.g. [modules-webmake](https://github.com/medikoo/modules-webmake)) you are free to decide, which extensions you want to take (see source of `lib/index.js` on how to do it)

<a name="extensions-get" />
### get

If you're interested not in promised object, but rather in one of it's properties then use `get`

	var promise = deferred({ foo: 'bar' });

	promise(function (obj) {
		console.log(obj.foo); // 'bar';
	})

	promise.get('foo')(function (value) {
		console.log(value); // 'bar'
	});

<a name="extensions-invoke" />
### invoke

Schedule function call on promised object

	var promise = deferred({ foo: function (arg) { return arg*arg; } });

	promise.invoke('foo', 3)
	(function (result) {
		console.log(result); // 9
	});

	// It works also with asynchronous functions
	var promise = deferred({ foo: function (arg, callback) {
		setTimeout(function () {
			callback(null, arg*arg);
		}, 100);
	} });

	promise.invoke('foo', 3)
	(function (result) {
		console.log(result); // 9
	});

<a name="extensions-map" />
### map

As described in [Processing collections](#collections-map) section it's promise aware version of Array's map

<a name="extensions-match" />
### match

If promise expected value is a list that you want to match into function arguments then use `match`

	var promise = deferred([2, 3]);

	promise.match(function (a, b) {
		console.log(a + b); // 5
	});

<a name="extensions-reduce" />
### reduce

Described under [Processing collections](#collections-reduce) section. Promise aware version of Array's reduce

<a name="tests" />
## Tests

Before running tests make sure you've installed project with dev dependencies
`npm install --dev`

	$ npm test
