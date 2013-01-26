//  Holds all the relevant data for a video.
define(function(){
    'use strict';
    //  When a single video is retrieved from YouTube, use this method as we know the URL of the video.
    return function(videoInformation, playlistId) {
        //  Strip out the id. An example of $t's contents: tag:youtube.com,2008:video:UwHQp8WWMlg
        var id = videoInformation.media$group.yt$videoid.$t;

        var video = {
            id: id,
            playlistId: playlistId,
            title: videoInformation.title.$t,
            duration: parseInt(videoInformation.media$group.yt$duration.seconds, 10)
        };

        return video;
    };
});