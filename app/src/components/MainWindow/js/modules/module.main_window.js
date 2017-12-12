Air.define('module.main_window', 'lib.DOM, module.view', function($, View) {
    var self = this;

    self.init = function() {

        View.render({
            message: 'Artem',
            items: [
                {
                    text: '1'
                },
                {
                    text: '2'
                },
                {
                    text: '3'
                }
            ]
        });

    };

    self.refresh = function() {

    };

    self.destroy = function() {

    };

});
