//  PlaylistItems have a one-to-one relationship with a Video object via the videoId property.
define(['helpers', 'programState', 'video'], function(helpers, programState, Video) {
    'use strict';
    
    var playlistItemModel = Backbone.Model.extend({
        defaults: function() {
            return {
                id: null,
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
        parse: function (playlistItemDto) {
            
            //  Convert C# Guid.Empty into BackboneJS null
            for (var key in playlistItemDto) {
                if (playlistItemDto.hasOwnProperty(key) && playlistItemDto[key] == '00000000-0000-0000-0000-000000000000') {
                    playlistItemDto[key] = null;
                }
            }

            // Take json of video and set into model. Delete to prevent overriding on return of data object.
            this.get('video').set(playlistItemDto.video);
            delete playlistItemDto.video;

            return playlistItemDto;
        },
        toJSON: function () {
            


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
        
        //  Default the PlaylistItem's title to the Video's title, but allow overriding.
        if (config && config.title === undefined || config.title === '') {
            console.log("Config:", config);
            config.title = config.video.get('title');
        }

        var playlistItem = new playlistItemModel(config);

        return playlistItem;
    };
});