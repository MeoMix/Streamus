//PlaylistItems have a one-to-one relationship with a Song object via the songId property.
//The properties title and videoId are denormalized from the Song object for ease-of-coding.
define(function() {
    'use strict';
    var PlaylistItem = Backbone.Model.extend({
        defaults: function() {
            return {
                //PK is a composite key of playlistId and position so that server and client can both derive PK without waiting on each other.
                playlistId: null,
                position: -1,
                songId: null,
                videoId: '',
                title: '',
                selected: false,
                relatedVideos: [] //Not stoked about having these here, but doing it for convenience for now.
            };
        }
    });

    //Public exposure of a constructor for building new PlaylistItem objects.
    return function (config) {
        var playlistItem = new PlaylistItem(config);
        console.log("PlaylistItem after using Backbone.Model.extend:", playlistItem);
        playlistItem.set('songId', null);
        return playlistItem;
    };
});