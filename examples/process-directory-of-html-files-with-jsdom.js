'use strict';

// Lists the content of the DOC_FOLDER_PATH, only at first level, ie not
// recursively.

var logger = console;
var path = require('path');
var fs = require('fs');
var jsdom = require('jsdom');

var deferred = require('deferred');

// Convert Node.js async functions, into ones that return a promise
var promisify = require('deferred').promisify;
var readdir = promisify(fs.readdir);
var stat = promisify(fs.stat);
var readFile = promisify(fs.readFile);

// Put some HTML files in this folder
var DOC_FOLDER_PATH = '/tmp/test';

readdir(DOC_FOLDER_PATH)
    .invoke('filter', function(fileName) {
        // Unix hidden files (such as .DS_Store, etc.) are unwanted
        return fileName.indexOf('.') !== 0;
    })
    .map(addModifiedForFiles)
    .invoke('filter', function(docMetadata) {
        // Filtering out directories
        return !!docMetadata;
    })
    .map(function(docMetadata) {
        return addContent(docMetadata).then(addTitleAndDescription);
    })
    .done(function(result) {
        logger.info("result:", result);
    }, function(err) {
        logger.error(err);
    });

function addModifiedForFiles(fileName) {
    var filePath = path.join(DOC_FOLDER_PATH, fileName);
    return stat(filePath).then(function(stats) {
        var docMetadata = {
            path: filePath,
            modified: stats.mtime
        };

        // Directories are unwanted, null is to filter them out later on
        if (!stats.isFile()) {
            return null;
        }
        return docMetadata;
    });
}

function addContent(docMetadata) {
    return readFile(docMetadata.path).then(function(data) {
        docMetadata.html = data;
        return docMetadata;
    });
}

function addTitleAndDescription(docMetadata) {
    var def = deferred();

    // In the metadata we are interested in the file relative path and not the
    // file absolute path (this is just a choice for this example not related
    // with promises or deferred).
    var rpath = path.relative(DOC_FOLDER_PATH, docMetadata.path);
    docMetadata.path = rpath;

    jsdom.env({
        html: docMetadata.html,
        done: function (errors, window) {
            if (errors) {
                logger.error(errors);
                def.resolve(new Error(errors));
            }

            // Deleting the HTML content that is not needed anymore
            delete docMetadata.html;

            var elems;
            // Default the title to the file relative path
            var title = rpath;
            // The title is the content of the 1st "h1" element
            elems = window.document.getElementsByTagName('h1');
            if (elems.length) {
                title = elems[0].textContent;
            }
            docMetadata.title = title;
            var description = "";
            // The description is the content of the 1st "p" element
            elems = window.document.getElementsByTagName('p');
            if (elems.length) {
                description = elems[0].textContent;
            }
            docMetadata.description = description;
            def.resolve(docMetadata);
        }
    });

    return def.promise;
}
