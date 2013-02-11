//  Holds all the relevant data for a video.
define(['playlists','programState'], function (Playlists, programState) {
    'use strict';

    var PlaylistCollection = Backbone.Model.extend({
        defaults: function () {
            return {
                id: null,
                userId: null,
                title: '',
                playlists: new Playlists()
            };
        },
        urlRoot: programState.getBaseUrl() + 'Video/',
        initialize: function (model) {
            var playlists = this.get('playlists');
            console.log("playlistCollection is initializing with model:", model);

            //  Our playlists data was fetched from the server. Need to convert the collection to Backbone Model entities.
            if (!(playlists instanceof Backbone.Collection)) {

                console.log("Playlists func:", Playlists);
                
                this.set('playlists', new Playlists(playlists), {
                    //  Silent operation because the playlists isn't technically changing - just being made correct.
                    silent: true
                });
            }

            
        }
    });

    return function (config) {
        console.log("Creating a new PlaylistCollection object with: ", config);
        var playlistCollection = new PlaylistCollection(config);

        return playlistCollection;
    };
});