'use strict';

// Read meta data out of each html file in given directory.
// Requires jsdom package installed, and some html files

var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var deferred = require('deferred');

// Convert Node.js async functions, into ones that return a promise
var promisify = require('deferred').promisify;
var readdir = promisify(fs.readdir);
var readFile = promisify(fs.readFile);

// Put some HTML files in this folder
var root = '/replace/with/valid/path';

var process, result = {};

process = function (html) {
	var def = deferred();

	// In the metadata we are interested in the file relative path and not the
	// file absolute path (this is just a choice for this example not related
	// with promises or deferred).
	jsdom.env({
		html: String(html),
		done: function (errors, window) {
			var data, elems;
			if (errors) {
				def.reject(new Error(errors));
				return;
			}

			data = {};
			// The title is the content of the 1st "h1" element
			elems = window.document.getElementsByTagName('h1');
			if (elems.length) data.title = elems[0].textContent;

			// The description is the content of the 1st "p" element
			elems = window.document.getElementsByTagName('p');
			if (elems.length) data.description = elems[0].textContent;
			def.resolve(data);
		}
	});

	return def.promise;
};

// Read folder
readdir(root).map(function (fileName) {
	// Process only HTML files
	if (path.extname(fileName) !== '.html') return;

	// Read file content
	return readFile(path.resolve(root, fileName))
		// Read meta data out of it
		.then(process)
		// Assign to result
		.aside(function (data) {
			result[fileName] = data;
		});
}).done(function () {
	// Print final result
	console.info("Result:", result);
});
