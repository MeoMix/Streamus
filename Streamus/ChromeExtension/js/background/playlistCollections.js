define(['playlistCollection'], function (PlaylistCollection) {
    'use strict';

    var PlaylistCollections = Backbone.Collection.extend({
        model: PlaylistCollection
    });

    return function (config) {
        var playlistCollections = new PlaylistCollections(config);

        return playlistCollections;
    };
});