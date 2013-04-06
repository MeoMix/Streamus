define(['stream'], function (Stream) {
    'use strict';

    var streamCollection = Backbone.Collection.extend({
        model: Stream
    });

    return function (config) {
        var streams = new streamCollection(config);

        return streams;
    };
});