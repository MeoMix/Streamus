//  PlaylistItems have a one-to-one relationship with a Video object via the videoId property.
define(['helpers', 'programState', 'loginManager'], function(helpers, programState, loginManager) {
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
        urlRoot: programState.getBaseUrl() + 'PlaylistItem/',
        destroy: function (options) {
            //  Override URL
            options || (options = {});
            options.url = this.url() + '/' + this.get('playlistId') + '/' + loginManager.get('user').get('id');

            // Call Model.destroy().
            // We are reusing the existing functionality from Backbone.Model.destroy().
            Backbone.Model.prototype.destroy.apply(this, arguments);
        }
    });

    //  Public exposure of a constructor for building new PlaylistItem objects.
    return function (config) {
        var playlistItem = new PlaylistItem(config);
        return playlistItem;
    };
});