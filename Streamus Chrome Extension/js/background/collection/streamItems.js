var StreamItems;

define(['streamItem'], function (StreamItem) {
    'use strict';

    var streamItemsCollection = Backbone.Collection.extend({
        model: StreamItem
    });

    StreamItems = new streamItemsCollection;

    console.log('Set streamItems:', StreamItems);

    return StreamItems;
});