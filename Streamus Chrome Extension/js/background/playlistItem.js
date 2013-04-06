//  PlaylistItems have a one-to-one relationship with a Video object via the videoId property.
define(['helpers', 'programState', 'video'], function(helpers, programState, Video) {
    'use strict';
    
    var playlistItemModel = Backbone.Model.extend({
        defaults: function() {
            return {
                //  Backend saves as composite key with playlistId, so its OK to generate id client-side.
                id: helpers.generateGuid(),
                playlistId: null,
                nextItemId: null,
                previousItemId: null,
                video: null,
                title: '',
                //  Used to weight randomness in shuffle. Resets to false when all in collection are set to true.
                playedRecently: false,
                relatedVideoInformation: [] 
            };
        },
        urlRoot: programState.getBaseUrl() + 'PlaylistItem/',
        destroy: function (options) {
            //  Override URL
            options || (options = {});
            options.url = this.url() + '/' + this.get('playlistId');

            //  Call Model.destroy().
            //  We are reusing the existing functionality from Backbone.Model.destroy().
            Backbone.Model.prototype.destroy.apply(this, arguments);
        },
        parse: function (data) {
            // Take json of video and set into model. Delete to prevent overriding on return of data object.
            
            this.get('video').set(data.video);
            delete data.video;

            return data;
        },
        initialize: function () {

            var video = this.get('video');
            
            //  Data was fetched from the server. Need to convert to Backbone.
            if (!(video instanceof Backbone.Model)) {

                this.set('video', new Video(video), {
                    //  Silent operation because it isn't technically changing - just being made correct.
                    silent: true
                });
                
            }
        }
    });

    //  Public exposure of a constructor for building new PlaylistItem objects.
    return function (config) {
        var playlistItem = new playlistItemModel(config);

        return playlistItem;
    };
});