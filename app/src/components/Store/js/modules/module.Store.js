Air.define('module.Store', '', function() {
    var self = this,
        state_data;

    self.get = function (key) {

        if (key === undefined) {

            return state_data;

        } else {

            if (state_data[key] === undefined) {

                state_data[key] = {};

            }

            return state_data[key];

        }
    };

    self.init = function() {
        state_data = {};

        window.Store = state_data;
    };

});
