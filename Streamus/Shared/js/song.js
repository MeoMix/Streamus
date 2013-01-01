//Holds all the relevant data for a song.
define(function(){
    'use strict';
    //When a single song is retrieved from YouTube, use this method as we know the URL of the video.
    return function(videoInformation, playlistId) {
        //Strip out the videoid. An example of $t's contents: tag:youtube.com,2008:video:UwHQp8WWMlg
        var videoId = videoInformation.media$group.yt$videoid.$t;

        var song = {
            //ID is provided after saving to the server.
            id: null,
            playlistId: playlistId,
            videoId: videoId,
            title: videoInformation.title.$t,
            duration: parseInt(videoInformation.media$group.yt$duration.seconds, 10),
            relatedVideos: []
        };

        return song;
    };
});