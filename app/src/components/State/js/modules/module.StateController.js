Air.define('module.StateController', 'module.Store', function(Store, util) {
    var self = this,
        vue_instance;

    var onAirReady = function () {
        window.onAirReady = null;
        util.build( '/', {
            finish: () => setTimeout(observeModules, 0)
        } );
    };

    var observeModules = function () {
        var targetNode = document.body;

        var config = { childList: true, subtree:true };

        var callback = function(mutationsList) {
            _log(mutationsList);
            util.build( '/' );
        };

        var observer = new MutationObserver(callback);

        observer.observe(targetNode, config);
    };

    self.init = function() {
        var data = Store.get('state');

        data.name = 'main';

        vue_instance = new Vue({
            el: '#app',
            template: self.config.tpl.controller,
            data: data
        });

        // vue_instance.$watch('name', function () {
        //
        //     util.build( '/' );
        //
        // });

        window.onAirReady = onAirReady;

    };

    self.refresh = function() {

    };

    self.destroy = function() {

    };

});
