Air.define('module.DrivesModel', 'module.Store', function(Store) {
    var self = this;

    self.init = function() {
        Store.get('Drives').list = [1,2,3,4,5];
    };

    self.get = function () {
        return Store.get('Drives');
    };

});
