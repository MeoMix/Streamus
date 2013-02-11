define(['playlistItems', 'playlist'], function (PlaylistItems, Playlist) {
    'use strict';

    var Playlists = Backbone.Collection.extend({
        model: Playlist
    });

    return function (config) {
        console.log("Creating a new Playlists", config);
        var playlists = new Playlists(config);

        return playlists;
    };
});