Air.define('module.StateMain', 'module.Store, module.DrivesModel', function(Store, DrivesModel) {
    var self = this,
        vue_instance;

    self.init = function() {

        vue_instance = new Vue({
            el: '[air-module="module.StateMain"] state',
            template: self.config.tpl.main,
            data: Store.get(),
            mounted: function() {
                this.$on('drive_click', function (item) {
                    _log(item);
                });
            }
        });

    };

    self.refresh = function() {

    };

    self.destroy = function() {

    };

});
