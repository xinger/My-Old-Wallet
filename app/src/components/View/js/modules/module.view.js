Air.define('module.view', 'lib.DOM', function($) {
    var self = this,
        views = [];

    self.render = function (data) {

        Vue.component('todo-item', {
            props: ['todo'],
            template: '<li>{{ todo.text }}</li>'
        });

        window.vue = new Vue({
            el: '#app',
            template: `
            <div>
                <p>{{ message }}</p>
                <input v-model="message">

                <todo-item
                    v-for="item in items"
                    v-bind:todo="item"></todo-item>
            </div>
            `,
            data: function () {
                return data;
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
