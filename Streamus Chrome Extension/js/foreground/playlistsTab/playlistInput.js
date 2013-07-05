define(['contentHeader', 'ytHelper', 'backgroundManager', 'dataSource'], function (ContentHeader, ytHelper, backgroundManager, DataSource) {
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

                var dataSource = ytHelper.parseUrlForDataSource(userInput);
                var activeStream = backgroundManager.get('activeStream');

                //  If unable to parse userInput then create playlist with userInput as title and no data.
                if (dataSource == null) {
                    activeStream.addPlaylistByDataSource(userInput, null, function(playlist) {
                        backgroundManager.set('activePlaylist', playlist);
                    });
                } else {
                   
                    switch(dataSource.type) {
                        case DataSource.YOUTUBE_PLAYLIST:
                            ytHelper.getPlaylistTitle(dataSource.id, function (youTubePlaylistTitle) {
                                activeStream.addPlaylistByDataSource(youTubePlaylistTitle, dataSource, function (playlist) {
                                    backgroundManager.set('activePlaylist', playlist);
                                });
                            });
                            break;
                        case DataSource.YOUTUBE_CHANNEL:
                            var playlistTitle = dataSource.id + '\'s Feed';
                            activeStream.addPlaylistByDataSource(playlistTitle, dataSource, function (playlist) {
                                backgroundManager.set('activePlaylist', playlist);
                            });
                            break;
                        case DataSource.SHARED_PLAYLIST:
                            activeStream.addPlaylistByDataSource('', dataSource, function (playlist) {
                                backgroundManager.set('activePlaylist', playlist);
                            });
                            break;
                        default:
                            console && console.error("Unhandled dataSource type:", dataSource.type);
                    }

                }
                
            }
        });
    };
});