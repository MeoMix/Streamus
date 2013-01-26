define(['contentHeader', 'videosDisplay', 'videoInput'], function (contentHeaderFunc, videosDisplay, videoInput) {
    'use strict';
    var contentHeader = contentHeaderFunc('#CurrentVideoDisplay', 'Add Videos', 'Search for artists or videos');
    contentHeader.expand();

    videoInput.initialize();
    videoInput.onValidInputEvent(function () {
        contentHeader.flashMessage('Thanks!', 2000);
    });

    //  Serves to initialize the video list;
    videosDisplay.reload();

    return {
        reload: function() {
            var playlistTitle = chrome.extension.getBackgroundPage().YoutubePlayer.playlistTitle;
            contentHeader.title = playlistTitle;
            videosDisplay.reload();
        }
    };
});