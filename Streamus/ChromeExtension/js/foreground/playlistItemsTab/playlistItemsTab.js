define(['contentHeader', 'playlistItemsDisplay', 'playlistItemInput'], function (contentHeaderFunc, playlistItemsDisplay, playlistItemInput) {
    'use strict';
    var contentHeader = contentHeaderFunc('#CurrentPlaylistItemDisplay', 'Add Videos', 'Search for artists or videos');
    contentHeader.expand();

    playlistItemInput.initialize();
    playlistItemInput.onValidInputEvent(function () {
        contentHeader.flashMessage('Thanks!', 2000);
    });

    //  Serves to initialize the video list;
    playlistItemsDisplay.reload();

    return {
        reload: function() {
            var playlistTitle = chrome.extension.getBackgroundPage().YoutubePlayer.playlistTitle;
            contentHeader.title = playlistTitle;
            playlistItemsDisplay.reload();
        }
    };
});