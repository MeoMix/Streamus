define(['contentHeader', 'youTubeDataAPI', 'backgroundManager', 'dataSource'], function (ContentHeader, youTubeDataAPI, backgroundManager, DataSource) {
    'use strict';
    
    var contentHeader = new ContentHeader({
        selector: '#PlaylistDisplay',
        addText: 'Add Playlist',
        addInputPlaceholder: 'Enter a new playlist name or YouTube playlist URL',
        expanded: false
    });

    var addInput = $(contentHeader.addInputElement);

    //  Whenever the user submits a name for a new playlist create a new playlist with that name.
    addInput.keydown(function(event) {

        if (event.which === $.ui.keyCode.ENTER) {
            processInput();
        }
    }).on('paste drop focus', function () {
        processInput();
    });
    
    function processInput() {
        setTimeout(function () {
            var userInput = addInput.val();
            
            //  Only add the playlist if something was provided.
            if (userInput.trim() !== '') {
                contentHeader.flashMessage('Thanks!', 2000);

                var dataSource = youTubeDataAPI.parseUrlForDataSource(userInput);
                var activeFolder = backgroundManager.get('activeFolder');

                switch (dataSource.type) {
                    case DataSource.USER_INPUT:
                        activeFolder.addPlaylistByDataSource(userInput, dataSource, function (playlist) {
                            backgroundManager.set('activePlaylist', playlist);
                        });
                        break;
                    case DataSource.YOUTUBE_PLAYLIST:
                        youTubeDataAPI.getPlaylistTitle(dataSource.id, function (youTubePlaylistTitle) {
                            activeFolder.addPlaylistByDataSource(youTubePlaylistTitle, dataSource, function (playlist) {
                                backgroundManager.set('activePlaylist', playlist);
                            });
                        });
                        break;
                    case DataSource.YOUTUBE_CHANNEL:
                        
                        youTubeDataAPI.getChannelName(dataSource.id, function (channelName) {
                            var playlistTitle = channelName + '\'s Feed';
                            activeFolder.addPlaylistByDataSource(playlistTitle, dataSource, function (playlist) {
                                backgroundManager.set('activePlaylist', playlist);
                            });
                        });

                        break;
                    case DataSource.SHARED_PLAYLIST:
                        activeFolder.addPlaylistByDataSource('', dataSource, function (playlist) {
                            backgroundManager.set('activePlaylist', playlist);
                        });
                        break;
                    default:
                        console && console.error("Unhandled dataSource type:", dataSource.type);
                }
                
            }
        });
    };
});