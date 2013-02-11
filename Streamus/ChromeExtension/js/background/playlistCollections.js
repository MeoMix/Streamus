define(['playlistCollection'], function (PlaylistCollection) {
    'use strict';

    var PlaylistCollections = Backbone.Collection.extend({
        model: PlaylistCollection
    });

    return function (config) {
        console.log("Creating a new PlaylistCollections", config);
        var playlistCollections = new PlaylistCollections(config);

        return playlistCollections;
    };
});