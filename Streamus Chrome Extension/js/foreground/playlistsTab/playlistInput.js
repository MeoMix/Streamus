define(['contentHeader', 'ytHelper', 'backgroundManager'], function (ContentHeader, ytHelper, backgroundManager) {
    'use strict';
    
    var contentHeader = new ContentHeader({
        selector: '#PlaylistDisplay',
        addText: 'Add Playlist',
        addInputPlaceholder: 'Enter a new playlist name or YouTube playlist URL',
        expanded: false
    });

    var addInput = $(contentHeader.addInputElement);

    //  Whenever the user submits a name for a new playlist create a new playlist with that name.
    addInput.on('input', function (event) {

        if (event.which === $.ui.keyCode.ENTER) {
            processInput();
        }
    }).on('paste drop', function () {
        processInput();
    });

    function processInput() {
        setTimeout(function () {
            var userInput = addInput.val();
            var youtubePlaylistId = ytHelper.parseUrlForPlaylistId(userInput);

            if (youtubePlaylistId !== null) {
                contentHeader.flashMessage('Thanks!', 2000);

                ytHelper.getPlaylistTitle(youtubePlaylistId, function (playlistTitle) {
                    if (playlistTitle) {
                        backgroundManager.get('activeStream').addPlaylist(playlistTitle, youtubePlaylistId);
                    }
                });
            }
            else {
                //  Only add the playlist if a name was provided.
                if (userInput.trim() !== '') {
                    backgroundManager.get('activeStream').addPlaylist(userInput);
                    contentHeader.flashMessage('Thanks!', 2000);
                }
            }
        });
    };
});