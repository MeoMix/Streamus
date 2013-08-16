define([
    'contentHeader',
    'youTubeDataAPI',
    'backgroundManager',
    'dataSource'
], function (ContentHeader, YouTubeDataAPI, BackgroundManager, DataSource) {
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
                contentHeader.addInputElement.val('');

                var dataSource = YouTubeDataAPI.parseUrlForDataSource(userInput);
                //  TODO: Instead of reading from activeFolder this should be ActiveFolderView's model, but that'll be a circular reference so need to fix.
                var activeFolder = BackgroundManager.get('activeFolder');

                switch (dataSource.type) {
                    case DataSource.USER_INPUT:
                        activeFolder.addPlaylistByDataSource(userInput, dataSource);
                        break;
                    case DataSource.YOUTUBE_PLAYLIST:

                        YouTubeDataAPI.getPlaylistTitle(dataSource.id, function (youTubePlaylistTitle) {
                            activeFolder.addPlaylistByDataSource(youTubePlaylistTitle, dataSource);
                        });

                        break;
                    case DataSource.YOUTUBE_CHANNEL:
                        
                        YouTubeDataAPI.getChannelName(dataSource.id, function (channelName) {
                            var playlistTitle = channelName + '\'s Feed';
                            activeFolder.addPlaylistByDataSource(playlistTitle, dataSource);
                        });

                        break;
                    case DataSource.SHARED_PLAYLIST:
                        activeFolder.addPlaylistByDataSource('', dataSource);
                        break;
                    default:
                        console && console.error("Unhandled dataSource type:", dataSource.type);
                }
                
            }
        });
    };
});