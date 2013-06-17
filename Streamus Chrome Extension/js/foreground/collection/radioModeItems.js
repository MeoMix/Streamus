define(['radioModeItem'], function (RadioModeItem) {
    'use strict';

    var RadioModeItems = Backbone.Collection.extend({
        model: RadioModeItem
    });

    return RadioModeItems;
});