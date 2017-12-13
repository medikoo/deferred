"use strict";

// Read meta data out of each html file in given directory.
// Requires jsdom package installed:
//
// $ npm install jsdom
//
// and folder with some html files
//
// Usage:
//
// var extract = require('deferred/examples/process-directory-of-html-files');
// extract('/some/path/to/html/files').done(function (result) {
//   console.log("Result:", result);
// });

var fs       = require("fs")
  , path     = require("path")
  , jsdom    = require("jsdom")
  , deferred = require("deferred");

// Convert Node.js async functions, into ones that return a promise
var promisify = deferred.promisify
  , readdir = promisify(fs.readdir)
  , open = promisify(fs.open)
  , read = promisify(fs.read)
  , close = promisify(fs.close)
  , stat = promisify(fs.stat)
  , extract
  , readFirstBytes;

extract = function (html) {
	var def = deferred(), data = this;

	// Process HTML with jsdom parser
	jsdom.env({
		html: String(html),
		done: function (errors, window) {
			var elems;
			if (errors) {
				def.reject(new Error(errors));
				return;
			}

			// The title is the content of the 1st "h1" element
			elems = window.document.getElementsByTagName("h1");
			if (elems.length) data.title = elems[0].textContent;

			// The description is the content of the 1st "p" element
			elems = window.document.getElementsByTagName("p");
			if (elems.length) data.description = elems[0].textContent;
			def.resolve(data);
		}
	});

	return def.promise;
};

readFirstBytes = function (filePath, byteCount) {
	return open(filePath, "r").then(function (fd) {
		var buffer = Buffer.alloc(byteCount);
		return read(fd, buffer, 0, buffer.length, null).then(
			// The callback of fs.read has 2 args: bytesRead, buffer
			function (args) {
				close(fd);
				return String(args[1]);
			}
		);
	});
};

module.exports = function (rootPath) {
	var result = {};

	// Read folder
	//
	// Note: If you are about to process large numbers of files, on some systems
	// you may approach EMFILE error, which means that your process tried to open
	// more file descriptors than it's allowed to. You can workaround it in two
	// ways:
	// 1. Load `descriptorsHandler` from fs2 package
	//    (see https://github.com/medikoo/fs2#descriptorshandler ),
	//    note it must not be loaded from generic package, but only at the top of
	//    your start program.
	//
	// 2. Limit initialization of concurrent asynchronous operations with
	//    `deferred.gate`:
	//
	//    readdir(root).map(deferred.gate(function (fileName) { ... }, 100);
	//
	//    Above will invoke no more than 100 concurrent async calls of `readFile`
	//    as they're called in function passed to `gate`

	return readdir(rootPath).map(function (fileName) {
		// Process only HTML files
		if (path.extname(fileName) !== ".html") return null;

		// Note: You  may also use `readdir` from `fs2` package (needs to be
		// installed aside), then you can configure `readdir` so it results only
		// with expected set of filenames and additionally you can recurse into sub
		// directories:
		//
		// var readdir = require('fs2/readdir');
		//
		// readdir(root, {
		//   depth: Infinity      // Recurse into subdirectories
		//   type: { file: true } // Only files (no directories, symlinks etc)
		//   pattern: /.*\.html$/ // Only files with .html extension
		// }).map(function (fileName) {
		//
		// `readdir` from fs2 returns promise by itself, so it doesn't have to be
		// promisified

		// Resolve full path to file
		fileName = path.resolve(rootPath, fileName);

		// Read file stats
		return stat(fileName).then(function (stats) {
			var data = { stats: stats, fileName: fileName };
			result[fileName] = data;

			// We read just first 12k bytes, but you can also parse whole HTML
			// document with following:
			//
			// var readFile = promisify(fs.readFile);
			// return readFile(fileName);

			return readFirstBytes(fileName, 12000).then(extract.bind(data));
		});
	})(result);
};
