Air.define('module.StateMain', 'module.Store', function(Store) {
    var self = this;

    self.init = function() {
        var data = Store.get('StateMain');

        window.vue = new Vue({
            el: '[air-module="module.StateMain"] state',
            template: self.config.tpl.main,
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
