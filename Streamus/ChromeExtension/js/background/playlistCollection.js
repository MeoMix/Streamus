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

            //  Data was fetched from the server. Need to convert to Backbone.
            if (!(playlists instanceof Backbone.Collection)) {

                this.set('playlists', new Playlists(playlists), {
                    //  Silent operation because it isn't technically changing - just being made correct.
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