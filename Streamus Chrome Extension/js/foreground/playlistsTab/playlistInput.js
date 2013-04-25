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
            
            //  Only add the playlist if something was provided.
            if (userInput.trim() !== '') {
               
                var youTubePlaylistId = ytHelper.parseUrlForPlaylistId(userInput);

                if (youTubePlaylistId !== null) {
                    contentHeader.flashMessage('Thanks!', 2000);

                    ytHelper.getPlaylistTitle(youTubePlaylistId, function (playlistTitle) {
                        if (playlistTitle) {
                            backgroundManager.get('activeStream').addPlaylist(playlistTitle, youTubePlaylistId);
                        }
                    });
                }
                else {

                    var youTubeUser = ytHelper.parseUrlForYouTubeUser(userInput);
                    
                    if (youTubeUser !== null) {
                        contentHeader.flashMessage('Thanks!', 2000);
                        backgroundManager.get('activeStream').addChannel(youTubeUser + '\'s Channel', youTubeUser);
                    }

                    backgroundManager.get('activeStream').addPlaylist(userInput);
                    contentHeader.flashMessage('Thanks!', 2000);
                }
                
            }
        });
    };
});