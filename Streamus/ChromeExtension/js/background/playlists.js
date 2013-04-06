define(['playlistItems', 'playlist'], function (PlaylistItems, Playlist) {
    'use strict';

    var playlistCollection = Backbone.Collection.extend({
        model: Playlist
    });

    return function (config) {
        var playlists = new playlistCollection(config);

        return playlists;
    };
});