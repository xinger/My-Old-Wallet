var fs = require('fs'),
    path = require('path'),
    Ractive = require('ractive');

class Renderer {

    constructor() {
        this.path_to_tpl = path.join(__dirname, '..', 'tpl');

        this.cached_templates = {};

        // this.cacheAllTemplates();
    }

    cacheAllTemplates() {
        var self = this;

        fs.readdir(this.path_to_tpl , function(err, list) {

            list.forEach(function (file_name) {

                self.load(file_name, function (err, content) {

                    self.cached_templates[file_name] = content;

                });

            });

        });
    }

    load(tpl_name, callback) {

        if (this.cached_templates[tpl_name] === undefined) {

            fs.readFile(path.join(this.path_to_tpl, tpl_name), 'utf-8', function (err, content) {
                callback(err, content);
            });

        }else{

            callback(null, this.cached_templates[tpl_name]);

        }

    }

    render(tpl_name, target, data, callback) {
        var ractive_instance;

        this.load(tpl_name, function (err, template) {

            ractive_instance = Ractive({
                target: target,
                template: template,
                data: data
            });

            callback(ractive_instance);

        });

    }

};

module.exports = new Renderer;
