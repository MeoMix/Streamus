define(['playlistItem', 'ytHelper', 'videoManager'],
    function (PlaylistItem, ytHelper, videoManager) {
    'use strict';

    var PlaylistItems = Backbone.Collection.extend({
        model: PlaylistItem,
        comparator: function(playlistItem) {
            return playlistItem.get('position');
        },
        getSelectedItem: function () {
            var selectedItem = this.find(function(item) {
                return item.get('selected');
            }) || null;
            
            return selectedItem;
        },
        getRelatedVideos: function () {
            //  Take each playlist item's array of related videos, pluck them all out into a collection of arrays
            //  then flatten the arrays into a collection of videos.
            
            var relatedVideos = _.flatten(this.map(function(item) {
                return item.get('relatedVideos');
            }));

            return relatedVideos;
        }
    });

    //  Public exposure of a constructor for building new PlaylistItem objects.
    return function (config) {
        var playlistItems = new PlaylistItems(config);
        //  Run the following code aftewards because initialization converts config to Backbone.Models

        var videoIds = [];

        playlistItems.each(function(item) {
            //  TODO: Man I dunno how I feel about this. It is potentially a huge amount of data to ask for all the time.
            //  Fetch all the related videos for videos on load. I don't want to save these to the DB because they're bulky and constantly change.
            //  Data won't appear immediately as it is an async request, I just want to get the process started now.

            var videoId = item.get('videoId');
            videoIds.push(videoId);

            ytHelper.getRelatedVideos(videoId, function (relatedVideos) {
                item.set('relatedVideos', relatedVideos);
            });
        });
        
        if (videoIds.length > 0) {
            //  Cache in our video manager all the related songs for our items. This will allow for tooltips with
            //  more details information in the future, but without the need to incur all the overhead on load.

            videoManager.loadVideos(videoIds);
        }

        return playlistItems;
    };
});