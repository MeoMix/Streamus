define(['contentHeader', 'ytHelper', 'backgroundManager'], function (ContentHeader, ytHelper, backgroundManager) {
    'use strict';
    
    var contentHeader = new ContentHeader('#PlaylistDisplay', 'Add Playlist', 'Enter a playlist name');
    contentHeader.contract();

    var addInput = $('#PlaylistDisplay .addInput').attr('placeholder', 'Enter a playlist name or YouTube playlist URL');

    //Whenever the user submits a name for a new playlist create a new playlist with that name.
    addInput.keyup(function (e) {
        var code = e.which;
        //ENTER: 13
        if (code === 13) {
            processInput();
        }
    }).bind('paste drop', function () {
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