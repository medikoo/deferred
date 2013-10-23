'use strict';

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

var fs = require('fs')
  , path = require('path')
  , jsdom = require('jsdom')
  , deferred = require('deferred')

// Convert Node.js async functions, into ones that return a promise
  , promisify = require('deferred').promisify
  , readdir = promisify(fs.readdir)
  , readFile = promisify(fs.readFile)

  , extract;

extract = function (html) {
	var def = deferred();

	// Process HTML with jsdom parser
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

module.exports = function (root) {
	var result = {};
	// Read folder
	return readdir(root).map(function (fileName) {
		// Process only HTML files
		if (path.extname(fileName) !== '.html') return;

		// Read file content
		return readFile(path.resolve(root, fileName))
		// Read meta data out of it
			.then(extract)
		// Assign to result
			.aside(function (data) {
				result[fileName] = data;
			});
	})(result);
};
