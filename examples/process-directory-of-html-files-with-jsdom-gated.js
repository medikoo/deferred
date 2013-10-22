'use strict';

// Read meta data out of each HTML file in given directory.
// Requires jsdom package installed, and a tree structure of HTML files, for
// example:
// $ cd /var/tmp
// $ mkdir test
// $ cd test
// $ httrack https://developer.mozilla.org/
// Please be nice with https://developer.mozilla.org/ and only get a part of it

var fs = require('fs')
  , path = require('path')
  , jsdom = require('jsdom')
  , deferred = require('deferred')
  , fs2 = require('fs2')
  , readdir = fs2.readdir

// Convert Node.js async functions, into ones that return a promise
  , promisify = require('deferred').promisify
  , readFile = promisify(fs.readFile)
  , stat = promisify(fs.stat)

// Provide path containing some HTML files (replace with a valid path for you)
  , root = '/var/tmp/test/developer.mozilla.org'

// On a Unix `ulimit -n` usually returns 1024
  , CONCURRENT_TASKS_RUNNING_LIMIT = 500

  , extract, indexDocs, result = {};

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

            // Freeing memory associated with the window
            window.close();

            def.resolve(data);
        }
    });

    return def.promise;
};

indexDocs = function () {
    var def = deferred();

    // WARNING:
    // Functions promisified in fs2 don't auto-resolve input arguments
    // as function generated by promisify.
    // This will change in the next versions of fs2.
    readdir(root,
            {
                depth: Infinity,
                type: {file: true},
                pattern: /.*\.html$/
            })
        .map(deferred.gate(function (file_path) {
            console.log("file_path:", file_path);
            file_path = path.join(root, file_path);
            return stat(file_path).then(function(stat) {
                var doc_metadata = {
                    path: file_path,
                    modified: stat.mtime,
                    size: stat.size
                };
                result[file_path] = doc_metadata;
                return readFile(file_path);
            }).then(extract).aside(function (data) {
                result[file_path].title = data.title;
                result[file_path].description = data.description;
                console.log("result items:",
                            Object.getOwnPropertyNames(result).length,
                            ", last item:", result[file_path]);
            });
        }), CONCURRENT_TASKS_RUNNING_LIMIT)
        .done(function (data) {
            def.resolve(result);
        },function (err) {
            def.resolve(err);
        });

    return def.promise;
};

indexDocs().done(function (result) {
    console.log("result:", result);
},function (err) {
    console.error("err:", err);
});

