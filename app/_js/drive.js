var drivelist = require('drivelist'),
    os = require('./os.js'),
    fs = require('fs');

class Drive {

    constructor() {

    }

    get(callback) {

        if (os.osx) this.getMacDrives(callback);

        if (os.win) this.getWindowsDrives(callback);

        if (os.linux) this.getLinuxDrives(callback);

    }

    getWindowsDrives(callback) {

        drivelist.list((error, drives) => {
            if (error) {
                throw error;
            }

            callback(drives);
        });

    }

    getMacDrives(callback) {

        var excludes = [
            'MobileBackups'
        ];

        fs.readdir('/Volumes', function(err, list) {

            list = list.filter((name) => {
                return excludes.indexOf(name) < 0;
            });

            list = list.map((name) => {
                return {
                    name: name,
                    path: '/Volumes/' + name
                };
            });

            callback(err, list);
        });

    }

};

module.exports = new Drive;
