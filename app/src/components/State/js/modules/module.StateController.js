Air.define('module.StateController', 'module.Store', function(Store, util) {
    var self = this,
        vue_instance;

    var onAirReady = function () {
        window.onAirReady = null;
        util.build( '/' );
    };

    self.init = function() {
        var data = Store.get('state');

        data.name = 'main';

        vue_instance = new Vue({
            el: '#app',
            template: self.config.tpl.root,
            data: data
        });

        vue_instance.$watch('name', function () {

            util.build( '/' );

        });

        window.onAirReady = onAirReady;

    };

    self.refresh = function() {

    };

    self.destroy = function() {

    };

});
