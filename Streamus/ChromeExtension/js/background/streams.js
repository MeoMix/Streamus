define(['stream'], function (Stream) {
    'use strict';

    var Streams = Backbone.Collection.extend({
        model: Stream
    });

    return function (config) {
        var streams = new Streams(config);

        return streams;
    };
});