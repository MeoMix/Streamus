//  This is the list of playlists on the playlists tab.
define(['contextMenuView', 'ytHelper', 'backgroundManager', 'helpers', 'spinnerManager', 'dataSource', 'streamItems'], function (ContextMenuView, ytHelper, backgroundManager, helpers, spinnerManager, DataSource, StreamItems) {
    //  TODO: Make this sortable and should inherit from a common List object. 
    var playlistList = $('#PlaylistList ul');

    var spinner = spinnerManager.getPlaylistSpinner();

    backgroundManager.on('change:activeFolder', reload);
    backgroundManager.get('allPlaylists').on('remove change:title reset', reload);

    backgroundManager.on('change:activePlaylist', function (collection, playlist) {

        if (playlist !== null) {
            visuallySelectPlaylist(playlist);

        } else {
            playlistList.find('li').removeClass('loaded');
            
        }

    });
    
    backgroundManager.get('allPlaylistItems').on('add remove', function (playlistItem, other) {
        console.log("Playlist item added:", playlistItem, other);
        throttledUpdatePlaylistDescription(playlistItem);
    });

    //  Playlists keep track of how many videos they have. When adding a lot of items -- throttle.
    var throttledUpdatePlaylistDescription = _.throttle(function (playlistItem) {
        
        var playlistId = playlistItem.get('playlistId');
        var playlistLink = playlistList.find('li[data-playlistid="' + playlistId + '"]');

        var playlist = backgroundManager.getPlaylistById(playlistId);

        var currentItems = playlist.get('items');
        var currentVideos = currentItems.map(function (currentItem) {
            return currentItem.get('video');
        });

        var currentVideosDurations = currentVideos.map(function (currentVideo) {
            return currentVideo.get('duration');
        });

        var sumVideosDurations = _.reduce(currentVideosDurations, function (memo, duration) {
            return memo + duration;
        }, 0);

        var playlistLinkDescription = 'Videos: ' + currentVideos.length + ', Duration: ' + helpers.prettyPrintTime(sumVideosDurations);
        playlistLink.find('.playlistLinkDescription').text(playlistLinkDescription);
    }, 100);
    
    backgroundManager.get('allPlaylists').on('add', function (playlist) {
        reload();

        if (playlist.has('dataSource')) {

            var dataSourceType = playlist.get('dataSource').type;

            if (dataSourceType === DataSource.YOUTUBE_PLAYLIST || dataSourceType === DataSource.YOUTUBE_CHANNEL) {

                var playlistLink = playlistList.find('li[data-playlistid="' + playlist.get('id') + '"]');
                spinner.spin(playlistLink[0]);

                playlist.once('change:dataSourceLoaded', function() {
                    spinner.stop();
                });

            }
        }
        
        scrollIntoView(playlist, true);
    });
    
    //  Removes the old 'current' marking and move it to the newly selected row.
    function visuallySelectPlaylist(playlist) {
        //  Since we emptied our list we lost the selection, reselect.
        scrollIntoView(playlist, false);

        playlistList.find('li').removeClass('loaded');
        playlistList.find('li[data-playlistid="' + playlist.get('id') + '"]').addClass('loaded');
    };
    
    reload();
    scrollIntoView(backgroundManager.get('activePlaylist'), false);
    
    //  TODO: Needs to be dry with playlistItemsDisplay
    function scrollIntoView(activePlaylist, useAnimation) {

        //  Since we emptied our list we lost the selection, reselect.
        if (activePlaylist) {
            var loadedPlaylistId = activePlaylist.get('id');
            var $activePlaylist = playlistList.find('li[data-playlistid="' + loadedPlaylistId + '"]');

            if ($activePlaylist.length > 0) {
                $activePlaylist.scrollIntoView(useAnimation);
            }

        }
    }

    //  Refreshes the playlist display with the current playlist information.
    function reload() {
        playlistList.empty();

        var activeFolder = backgroundManager.get('activeFolder');

        if (activeFolder.get('playlists').length === 0) return;

        var firstPlaylistId = activeFolder.get('firstPlaylistId');
        var currentPlaylist = activeFolder.get('playlists').get(firstPlaylistId);

        //  Build up each row.
        do {

            if(currentPlaylist == null) break;

            var listItem = $('<li/>', {
                'data-playlistid': currentPlaylist.get('id'),
                contextmenu: function (event) {
                    
                    var clickedPlaylistId = $(this).data('playlistid');
                    var clickedPlaylist = activeFolder.get('playlists').get(clickedPlaylistId);

                    //  Don't allow deleting of the last playlist in a folder ( at least for now )
                    var isDeleteDisabled = clickedPlaylist.get('nextPlaylistId') === clickedPlaylist.get('id');

                    ContextMenuView.addGroup({
                        position: 0,
                        items: [{
                            position: 0,
                            text: 'Copy URL',
                            onClick: function () {

                                clickedPlaylist.getShareCode(function (shareCode) {

                                    var shareCodeShortId = shareCode.get('shortId');
                                    var urlFriendlyEntityTitle = shareCode.get('urlFriendlyEntityTitle');

                                    var playlistShareUrl = 'http://share.streamus.com/playlist/' + shareCodeShortId + '/' + urlFriendlyEntityTitle;

                                    chrome.extension.sendMessage({
                                        method: 'copy',
                                        text: playlistShareUrl
                                    });

                                });

                            }
                        }, {
                            position: 1,
                            text: 'Delete',
                            disabled: isDeleteDisabled,
                            title: isDeleteDisabled ? 'This is your last Playlist, so you can\'t delete it' : '',
                            onClick: function () {
              
                                if (!isDeleteDisabled) {
                                    clickedPlaylist.destroy({
                                        error: function (error) {
                                            console.error(error);
                                        }
                                    });
                                }
                            }
                        }, {
                            position: 2,
                            text: 'Add Playlist to Stream',
                            onClick: function () {

                                clickedPlaylist.get('items').each(function (playlistItem) {

                                    StreamItems.add({
                                        video: playlistItem.get('video'),
                                        title: playlistItem.get('title'),
                                        videoImageUrl: 'http://img.youtube.com/vi/' + playlistItem.get('video').get('id') + '/default.jpg'
                                    });

                                });

                            }
                        }]
                    });

                    ContextMenuView.show({
                        top: event.pageY,
                        left: event.pageX + 1
                    });

                    return false;
                },

                //  Clicking on a playlist will select that playlist.
                click: function() {
                    var playlistId = $(this).data('playlistid');
                    var playlist = backgroundManager.getPlaylistById(playlistId);

                    visuallySelectPlaylist(playlist);
                    backgroundManager.set('activePlaylist', playlist);
                },
                
                dblclick: function () {
                    //  TODO: Terrible coupling, but it's a user QoL decision...
                    $('#HomeMenuButton').click();
                }
            }).appendTo(playlistList);
            
            var textWrapper = $('<div>', {
                'class': 'textWrapper'
            }).appendTo(listItem);

            var currentPlaylistTitle = $('<span/>', {
                text: currentPlaylist.get('title')
            });
            currentPlaylistTitle.appendTo(textWrapper);

            var currentItems = currentPlaylist.get('items');
            var currentVideos = currentItems.map(function(currentItem) {
                return currentItem.get('video');
            });

            var currentVideosDurations = currentVideos.map(function (currentVideo) {
                return currentVideo.get('duration');
            });

            var sumVideosDurations = _.reduce(currentVideosDurations, function (memo, duration) {
                 return memo + duration;
            }, 0);
            
            $('<span/>', {
                'class': 'playlistLinkDescription',
                text: 'Videos: ' + currentVideos.length + ', Duration: ' + helpers.prettyPrintTime(sumVideosDurations)
            }).appendTo(textWrapper);
            
            helpers.scrollElementInsideParent(currentPlaylistTitle);
            
            currentPlaylist = activeFolder.get('playlists').get(currentPlaylist.get('nextPlaylistId'));

        } while (currentPlaylist.get('id') !== firstPlaylistId)

        var activePlaylist = backgroundManager.get('activePlaylist');
        if (activePlaylist !== null) {
            visuallySelectPlaylist(activePlaylist);
        }
       
    }
});