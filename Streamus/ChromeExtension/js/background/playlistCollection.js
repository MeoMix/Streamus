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
        initialize: function () {
            var playlists = this.get('playlists');

            //  Our playlists data was fetched from the server. Need to convert the collection to Backbone Model entities.
            if (!(playlists instanceof Backbone.Collection)) {

                this.set('playlists', new Playlists(playlists), {
                    //  Silent operation because the playlists isn't technically changing - just being made correct.
                    silent: true
                });
            }
        }
    });

    return function (config) {
        var playlistCollection = new PlaylistCollection(config);

        return playlistCollection;
    };
});