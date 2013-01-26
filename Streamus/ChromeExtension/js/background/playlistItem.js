//PlaylistItems have a one-to-one relationship with a Video object via the videoId property.
define(function() {
    'use strict';
    var PlaylistItem = Backbone.Model.extend({
        defaults: function() {
            return {
                //PK is a composite key of playlistId and position so that server and client can both derive PK without waiting on each other.
                playlistId: null,
                position: -1,
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
        return playlistItem;
    };
});