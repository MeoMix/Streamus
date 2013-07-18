define(function () {
    'use strict';

    var ContextMenuItem = Backbone.Model.extend({
        defaults: function () {
            return {
                position: -1,
                text: '',
                onClick: null
            };
        }
    });

    return ContextMenuItem;
});