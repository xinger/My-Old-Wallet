var drive = require('./drive.js'),
    View = require('./main_window_view.js'),
    walk = require('walk');

class MainWindowController {

    constructor() {
        var self = this;
        // drive.get((err, list) => {
        //
        //     // this.walk(list, function(root, stats) {
        //     //     if (stats.name === 'wallet.dat') {
        //     //         console.log('found', root, stats);
        //     //     }
        //     // });
        // });

        // this.walk(['/Users/michael/git_projects/electron/MyOldWallet'], (root, stats) => {
        //     if (this.isWallet(root, stats)) {
        //         console.log('found', root, stats);
        //     }
        // }, () => {
        //     console.log('DONE');
        // });


        View.renderStructure({
            results: 'no results'
        },function (structure_ractive) {

            drive.get((err, list) => {

                View.renderDriveList(list, function (ractive_instance) {

                    ractive_instance.on('select_drive', function (event, path) {
                        console.log('path', path);

                        // ['/Users/michael/git_projects/electron/MyOldWallet']
                        self.walk([path], (root, stats) => {
                            structure_ractive.set('progress', stats.name);

                            if (self.isWallet(root, stats)) {
                                structure_ractive.set('results', 'found: ' + stats.name);
                            }
                        }, () => {
                            console.log('DONE');
                        });

                    })

                });

            });

        });
    }

    walkOne(path, progress, done) {
        var walker = walk.walk(path, {

        });

        walker.on("file", progress);

        walker.on("end", done);
    }

    walk(paths, progress, done) {

        var current_path = paths.pop();

        if (current_path) {
            this.walkOne(current_path, (root, stats, next) => {
                progress(root, stats);
                next();
            }, () => {
                this.walk(paths, progress, done);
            });
        } else {
            done();
        }

    }

    isWallet(root, stats) {
        return stats.name === 'wallet.dat';
    }
}

module.exports = new MainWindowController;




// glob.readdirStream('/Users/michael/git_projects/*', {
//
// }).on('data', function(file) {
//     console.log(file);
// });
