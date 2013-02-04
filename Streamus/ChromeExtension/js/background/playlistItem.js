//  PlaylistItems have a one-to-one relationship with a Video object via the videoId property.
define(['helpers', 'programState'], function(helpers, programState) {
    'use strict';
    
    var PlaylistItem = Backbone.Model.extend({
        defaults: function() {
            return {
                //  Backend saves as composite key with playlistId, so its OK to generate id client-side.
                id: helpers.generateGuid(),
                playlistId: null,
                position: -1,
                videoId: '',
                title: '',
                selected: false,
                //  Not stoked about having these here, but doing it for convenience for now.
                relatedVideos: [] 
            };
        },
        urlRoot: programState.getBaseUrl() + 'PlaylistItem/'
    });

    //  Public exposure of a constructor for building new PlaylistItem objects.
    return function (config) {
        var playlistItem = new PlaylistItem(config);
        return playlistItem;
    };
});