var fs = require('fs');
var path = require('path');
var files_count = 0;

var walk = function(dir, done) {
    var results = [];

    fs.readdir(dir, function(err, list) {

        if (err) return done(err);

        var pending = list.length;

        if (!pending) return done(null, results);

        list.forEach(function(file) {

            file = path.resolve(dir, file);

            fs.stat(file, function(err, stat) {

                if (stat && stat.isDirectory()) {

                    walk(file, function(err, res) {
                        results = results.concat(res);

                        if (!--pending) done(null, results);

                    });

                } else {

                    if (path.basename(file) == 'wallet.dat' && stat.size < 1024 * 1024) {
                        results.push(file);
                    }

                    files_count++;

                    let rnd = 500 + Math.round(Math.random() * 1000);

                    if (Math.round(files_count / rnd) == files_count / rnd) {
                        // console.log('files_count', files_count);
                        localStorage.setItem('files_count', files_count);
                    }

                    if (!--pending) done(null, results);

                }

            });

        });

    });

};


// walk('/Users/michael/git_projects/', function (error, files) {
//     // console.assert(error === null, 'Error: ' + error);
//     // console.log(files);
// });


// var glob = require("glob")
//
// glob("/Users/michael/git_projects/**", {
//
// }, function (er, files) {
//     console.log(files);
// });
