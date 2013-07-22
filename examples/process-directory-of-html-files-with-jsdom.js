
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

/**
 * Lists the content of the DOC_FOLDER_PATH, only at first level, ie not recursively.
 */
function listDocs() {
    readdir(DOC_FOLDER_PATH)
        .invoke('filter', function(file_name) {
            // Unix hidden files (such as .DS_Store, etc.) are unwanted
            return file_name.indexOf('.') !== 0;
        })
        .map(addModifiedForFiles)
        .invoke('filter', function(doc_metadata) {
            // Filtering out directories
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

function addModifiedForFiles(file_name) {
    var file_path = path.join(DOC_FOLDER_PATH, file_name);
    return stat(file_path).then(function(stats) {
        var doc_metadata = {
            path: file_path,
            modified: stats.mtime
        };

        // Directories are unwanted, null is to filter them out later on
        if (!stats.isFile()) {
            return null;
        }
        return doc_metadata;
    });
}

function addContent(doc_metadata) {
    var def = deferred();

    readFile(doc_metadata.path).done(function(data) {
        doc_metadata.html = data;
        def.resolve(doc_metadata);
    }, function(err) {
        def.resolve(new Error(err));
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
