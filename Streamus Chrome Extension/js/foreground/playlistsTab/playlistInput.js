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
    addInput.keydown(function (event) {

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
                contentHeader.flashMessage('Thanks!', 2000);

                //var dataSource = ytHelper.parseUrlForDataSource(userInput);

                var youTubePlaylistId = ytHelper.parseUrlForPlaylistId(userInput);
                var dataSource = null;

                if (youTubePlaylistId !== null) {

                    ytHelper.getPlaylistTitle(youTubePlaylistId, function (youTubePlaylistTitle) {
                        if (youTubePlaylistTitle) {
                            dataSource = {
                                type: 'youTubePlaylist',
                                id: youTubePlaylistId
                            };
                            backgroundManager.get('activeStream').addPlaylistByDataSource(youTubePlaylistTitle, dataSource);
                        }
                    });
                }
                else {

                    var youTubeUser = ytHelper.parseUrlForYouTubeUser(userInput);
                    
                    if (youTubeUser !== null) {

                        var playlistTitle = youTubeUser + '\'s Feed';
                        dataSource = {
                            type: 'youTubeChannel',
                            id: youTubeUser
                        };

                        backgroundManager.get('activeStream').addPlaylistByDataSource(playlistTitle, dataSource);
                    } else {
                        console.log("adding playlist by title:", userInput);
                        backgroundManager.get('activeStream').addPlaylistByDataSource(userInput, dataSource);
                    }

                }
                
            }
        });
    };
});