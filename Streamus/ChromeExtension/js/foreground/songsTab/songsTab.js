define(['contentHeader', 'songsDisplay', 'songInput'], function(contentHeaderFunc, songsDisplay, songInput) {
    'use strict';
    var contentHeader = contentHeaderFunc('#CurrentSongDisplay', 'Add Songs', 'Search for artists or songs');
    contentHeader.expand();

    songInput.initialize();
    songInput.onValidInputEvent(function () {
        contentHeader.flashMessage('Thanks!', 2000);
    });

    //Serves to initialize the song list;
    songsDisplay.reload();

    return {
        reload: function() {
            var playlistTitle = chrome.extension.getBackgroundPage().YoutubePlayer.playlistTitle;
            contentHeader.title = playlistTitle;
            songsDisplay.reload();
        }
    };
});