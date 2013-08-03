define(['playlist'], function (Playlist) {
    'use strict';

    var Playlists = Backbone.Collection.extend({
        model: Playlist
    });

    return Playlists;
});