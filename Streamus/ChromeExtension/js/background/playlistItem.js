//  PlaylistItems have a one-to-one relationship with a Video object via the videoId property.
define(['helpers', 'programState', 'loginManager'], function(helpers, programState, loginManager) {
    'use strict';
    
    //  TODO: Need to figure out why overriding parse doesn't seem to matter.
    //  I don't want to send selected / playedRecently / relatedVideos in my requests, but I can't figure out how to prevent save from overriding them with
    //  default values -- so I am sending and then getting the exact same value back from server and writing it back to the item. Bleh.
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
                //  Used to weight randomness in shuffle.
                playedRecently: false,
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