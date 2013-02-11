define(['playlistItems', 'playlist'], function (PlaylistItems, Playlist) {
    'use strict';

    console.log("PlaylistItems and Playlist", PlaylistItems, Playlist);

    var Playlists = Backbone.Collection.extend({
        model: Playlist,
        initialize: function(model) {
            console.log("Playlists is initializing", model);
            
            var items = this.get('items');
            //  Our playlists data was fetched from the server. Need to convert the collection to Backbone Model entities.
            if (!(items instanceof Backbone.Collection)) {
                console.log("Here", PlaylistItems);
                var test = new PlaylistItems();
                console.log("Test:", test);
                this.set('items', new PlaylistItems(), {
                    //  Silent operation because the playlists isn't technically changing - just being made correct.
                    silent: true
                });
            }


        }
    });

    return function (config) {
        console.log("Creating a new Playlists", config);
        var playlists = new Playlists(config);

        return playlists;
    };
});