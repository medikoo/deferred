
var logger = console;
var path = require('path');
var fs = require('fs');
var jsdom = require('jsdom');

var deferred = require('deferred');

// Convert Node.js async functions, into ones that return a promise
var promisify = require('deferred').promisify;
var readdir = promisify(fs.readdir);

// Put some HTML files in this folder
var DOC_FOLDER_PATH = '/tmp/test';

/**
 * Lists the content of the DOC_FOLDER_PATH, only at first level, ie not recursively.
 */
function listDocs() {
    readdir(DOC_FOLDER_PATH)
        .map(function(file_name) {
            // Unix "hidden" files (such as .DS_Store, etc.) are unwanted
            if (file_name.indexOf('.') === 0) {
                return null;
            }
            var file_path = path.join(DOC_FOLDER_PATH, file_name);
            var doc_metadata = {
                path: file_path
            };
            return doc_metadata;
        })
        .map(addModifiedForFiles)
        .invoke('filter', function(doc_metadata) {
            // Filtering to keep only the wanted files (not hidden, not
            // directories).
            return !!doc_metadata;
        })
        .map(addContent)
        .map(addTitleAndDescription)
        .done(function(result) {
            logger.info("result:", result);
        }, function(err) {
            logger.error(err);
        });
}

function addModifiedForFiles(doc_metadata) {
    var def = deferred();

    if (!doc_metadata) {
        def.resolve(null);
    }

    fs.stat(doc_metadata.path, function(err, stats) {
        // Directories are unwanted
        if (!stats.isFile()) {
            def.resolve(null);
            return;
        }
        doc_metadata.modified = stats.mtime;
        def.resolve(doc_metadata);
    });

    return def.promise;
}

function addContent(doc_metadata) {
    var def = deferred();

    fs.readFile(doc_metadata.path, function(err, data) {
        doc_metadata.html = data;
        def.resolve(doc_metadata);
    });

    return def.promise;
}

function addTitleAndDescription(doc_metadata) {
    var def = deferred();

    // In the metadata we are interested in the file relative path and not the
    // file absolute path (this is just a choice for this example not related
    // with promises or deferred).
    var rpath = path.relative(DOC_FOLDER_PATH, doc_metadata.path);
    doc_metadata.path = rpath;

    jsdom.env({
        html: doc_metadata.html,
        done: function (errors, window) {
            if (errors) {
                logger.error(errors);
                def.resolve(new Error(errors));
            }

            // Deleting the HTML content that is not needed anymore
            delete doc_metadata.html;

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
            def.resolve(doc_metadata);
        }
    });

    return def.promise;
}

listDocs();
