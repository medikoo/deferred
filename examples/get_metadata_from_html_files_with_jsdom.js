
var logger = console;
var path = require('path');
var fs = require('fs');
var jsdom = require('jsdom');

// Convert Node.js async functions, into ones that return a promise
var promisify = require('deferred').promisify;
var readdir = promisify(fs.readdir);
var readFile = promisify(fs.readFile, 1);

// Put some HTML files in this folder
var DOC_FOLDER_PATH = '/tmp/test';

/**
 * Lists the content of the DOC_FOLDER_PATH, only at first level, ie not recursively.
 */
function listDocs() {
    readdir(DOC_FOLDER_PATH).
        map(function(file_name) {
            // Unix "hidden" files (such as .DS_Store, etc.) are unwanted
            if (file_name.indexOf('.') == 0) {
                return null;
            }
            var file_path = path.join(DOC_FOLDER_PATH, file_name);
            var stats = fs.statSync(file_path);
            // Directories are unwanted
            if (!stats.isFile()) {
                return null;
            }
            var doc_metadata = {
                path: file_path,
                modified: stats.mtime
            };
            return doc_metadata;
        }).
        invoke('filter', function(doc_metadata) {
            // Filtering to keep only the wanted files (files, not directories
            // and not hidden).
            return !!doc_metadata;
        }).
        map(pGetMetadata).
        done(function(result) {
            logger.info("result:", result);
        }, function(err) {
            logger.error(err);
        });
};

/**
 * @param {Object} doc_metadata contains the file path
 * @param {Function} callback
 */
function getMetadata(doc_metadata, callback) {
    var html = fs.readFileSync(doc_metadata.path);

    // In the metadata we are interested in the file relative path and not the
    // file absolute path (this is just a choice for this example not related
    // with promises or deferred).
    var rpath = path.relative(DOC_FOLDER_PATH, doc_metadata.path);
    doc_metadata.path = rpath;

    jsdom.env({
        html: html,
        done: function (errors, window) {
            if (errors) {
                logger.error(errors);
                callback(errors);
            }
            var elems;
            // Default the title to the file relative path
            var title = rpath;
            // The title is the content of the 1st "h1" element
            elems = window.document.getElementsByTagName('h1');
            if (elems.length) {
                title = elems[0].textContent;
            }
            doc_metadata.title = title;
            var description = "";
            // The description is the content of the 1st "p" element
            elems = window.document.getElementsByTagName('p');
            if (elems.length) {
                description = elems[0].textContent;
            }
            doc_metadata.description = description;
            callback(doc_metadata);
        }
    });
}
var pGetMetadata = promisify(getMetadata, 1);

listDocs();
