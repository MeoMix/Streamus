define([], function () {

    'use strict';

    var Dialog = Backbone.Model.extend({

        defaults: function () {
            return {

                text: ''

            };
        },

        initialize: function () {

        }

    });

    return Dialog;
});