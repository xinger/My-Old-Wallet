Air.define('module.StateController', 'module.Store', function(Store) {
    var self = this;

    self.init = function() {
        var data = Store.get('state');

        data.name = 'main';

        // _log('self.config.tpl.root', self.config.tpl.root);

        window.vue = new Vue({
            el: '#app',
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
