define(['playlist'],
    function (Playlist) {
    'use strict';

    var Playlists = Backbone.Collection.extend({
        model: Playlist,
    });

    return function(config) {
        var playlists = new Playlists(config);

        return playlists;
    };
});