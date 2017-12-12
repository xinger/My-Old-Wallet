Air.define('module.view', 'lib.DOM', function($) {
    var self = this,
        views = [];

    self.render = function () {

        var app = new Vue({
            el: '#app',
            template: '<h1>{{message}}</h1>',
            data: function () {
                return window.aaa;
            }
        });

    };

    self.init = function() {

    };

    self.refresh = function() {

    };

    self.destroy = function() {

    };

});
