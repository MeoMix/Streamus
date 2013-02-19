define(['playlistItem', 'ytHelper', 'video'],
    function (PlaylistItem, ytHelper, Video) {
        'use strict';

    var PlaylistItems = Backbone.Collection.extend({
        model: PlaylistItem,
        comparator: function(playlistItem) {
            return playlistItem.get('position');
        },
        getSelectedItem: function() {
            var selectedItem = this.find(function(item) {
                return item.get('selected');
            }) || null;

            return selectedItem;
        },
        //TODO: Move this property to Video not playlistItem
        getRelatedVideos: function() {
            //  Take each playlist item's array of related videos, pluck them all out into a collection of arrays
            //  then flatten the arrays into a collection of videos.

            var relatedVideos = _.flatten(this.map(function (item) {

                var videoInformation = item.get('relatedVideoInformation');
                
                //  Strip out the id. An example of $t's contents: tag:youtube.com,2008:video:UwHQp8WWMlg
                var id = videoInformation.media$group.yt$videoid.$t;
                var durationInSeconds = parseInt(videoInformation.media$group.yt$duration.seconds, 10);

                //  Don't forget to set the playlistId after adding a related video to a playlist later.
                var video = new Video({
                    id: id,
                    title: videoInformation.title.$t,
                    duration: durationInSeconds
                });

                return video;
            }));

            return relatedVideos;
        }
    });

    //  Public exposure of a constructor for building new PlaylistItem objects.
    return function(config) {
        var playlistItems = new PlaylistItems(config);

        playlistItems.each(function(item) {
            //  TODO: Man I dunno how I feel about this. It is potentially a huge amount of data to ask for all the time.
            //  Fetch all the related videos for videos on load. I don't want to save these to the DB because they're bulky and constantly change.
            //  Data won't appear immediately as it is an async request, I just want to get the process started now.

            ytHelper.getRelatedVideoInformation(item.get('video').get('id'), function(relatedVideoInformation) {
                item.set('relatedVideoInformation', relatedVideoInformation);
            });
        });

        return playlistItems;
    };
});