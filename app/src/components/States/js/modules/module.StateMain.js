Air.define('module.StateMain', 'module.Store', function(Store) {
    var self = this;

    self.init = function() {

        var data = {
            state: 'main'
        };

        _log('self.config.tpl.root', self.config.tpl.root);

        window.vue = new Vue({
            el: '[air-module="module.StateMain"] state',
            template: self.config.tpl.root,
            data: function () {
                return data;
            }
        });



    };

    self.refresh = function() {

    };

    self.destroy = function() {

    };

});
