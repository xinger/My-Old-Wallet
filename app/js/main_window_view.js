var os = require('./os.js'),
    fs = require('fs'),
    renderer = require('./renderer.js');

class MainWindowView {

    constructor() {

    }

    renderStructure(data, callback) {

        renderer.render('structure.html', document.querySelector('window content'), data, callback);

    }

    renderDriveList(data, callback) {

        renderer.render('drive_list.html', document.querySelector('.drive_list'), {
            list: data
        }, callback);

    }

};

module.exports = new MainWindowView;
