//  This is the list of playlists on the playlists tab.
define(['contextMenuView', 'ytHelper', 'backgroundManager', 'helpers', 'spinnerManager', 'dataSource', 'streamItems'], function (ContextMenuView, ytHelper, backgroundManager, helpers, spinnerManager, DataSource, StreamItems) {

    //  TODO: Make this sortable and should inherit from a common List object. 
    var playlistListUl = $('#PlaylistList ul');

    playlistListUl.on('contextmenu', 'li', function (event) {
        var activeFolder = backgroundManager.get('activeFolder');

        var clickedPlaylistId = $(this).data('playlistid');
        var clickedPlaylist = activeFolder.get('playlists').get(clickedPlaylistId);

        //  Don't allow deleting of the last playlist in a folder ( at least for now )
        var isDeleteDisabled = clickedPlaylist.get('nextPlaylistId') === clickedPlaylist.get('id');
        var isAddPlaylistDisabled = clickedPlaylist.get('items').length === 0;

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
                        clickedPlaylist.destroy();
                    }
                }
            }, {
                position: 2,
                text: 'Add Playlist to Stream',
                disabled: isAddPlaylistDisabled,
                title: isAddPlaylistDisabled ? 'You need to add items to your Playlist first' : '',
                onClick: function () {

                    if (!isAddPlaylistDisabled) {

                        var streamItems = clickedPlaylist.get('items').map(function (playlistItem) {
                            return {
                                id: _.uniqueId('streamItem_'),
                                video: playlistItem.get('video'),
                                title: playlistItem.get('title'),
                                videoImageUrl: 'http://img.youtube.com/vi/' + playlistItem.get('video').get('id') + '/default.jpg'
                            };
                        });

                        StreamItems.addMultiple(streamItems);
                    }

                }
            }]
        });

        ContextMenuView.show({
            top: event.pageY,
            left: event.pageX + 1
        });

        return false;
    });
    //  Clicking on a playlist will select that playlist.
    playlistListUl.on('click', 'li', function () {

        var playlistId = $(this).data('playlistid');
        var playlist = backgroundManager.getPlaylistById(playlistId);

        visuallySelectPlaylist(playlist);
        backgroundManager.set('activePlaylist', playlist);

    });

    var spinner = spinnerManager.getPlaylistSpinner();

    backgroundManager.on('change:activeFolder', reload);
    backgroundManager.get('allPlaylists').on('remove change:title reset', reload);

    backgroundManager.on('change:activePlaylist', function (collection, playlist) {

        if (playlist !== null) {
            visuallySelectPlaylist(playlist);

        } else {
            playlistListUl.find('li').removeClass('loaded');

        }

    });

    backgroundManager.get('allPlaylistItems').on('add remove', function (playlistItem, other) {
        throttledUpdatePlaylistDescription(playlistItem);
    });

    //  Playlists keep track of how many videos they have. When adding a lot of items -- throttle.
    var throttledUpdatePlaylistDescription = _.throttle(function (playlistItem) {

        var playlistId = playlistItem.get('playlistId');
        var playlistLink = playlistListUl.find('li[data-playlistid="' + playlistId + '"]');

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

                var playlistLink = playlistListUl.find('li[data-playlistid="' + playlist.get('id') + '"]');
                spinner.spin(playlistLink[0]);

                playlist.once('change:dataSourceLoaded', function () {
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

        playlistListUl.find('li').removeClass('loaded');
        playlistListUl.find('li[data-playlistid="' + playlist.get('id') + '"]').addClass('loaded');
    };

    reload();
    scrollIntoView(backgroundManager.get('activePlaylist'), false);

    //  TODO: Needs to be dry with playlistItemsView
    function scrollIntoView(activePlaylist, useAnimation) {

        //  Since we emptied our list we lost the selection, reselect.
        if (activePlaylist) {
            var loadedPlaylistId = activePlaylist.get('id');
            var $activePlaylist = playlistListUl.find('li[data-playlistid="' + loadedPlaylistId + '"]');

            if ($activePlaylist.length > 0) {
                $activePlaylist.scrollIntoView(useAnimation);
            }

        }
    }

    function buildListItem(playlist) {
        var listItem = $('<li/>', {
            'data-playlistid': playlist.get('id')
        });

        var textWrapper = $('<div>', {
            'class': 'textWrapper'
        }).appendTo(listItem);

        var currentPlaylistTitle = $('<span/>', {
            text: playlist.get('title')
        });
        currentPlaylistTitle.appendTo(textWrapper);

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

        $('<span/>', {
            'class': 'playlistLinkDescription',
            text: 'Videos: ' + currentVideos.length + ', Duration: ' + helpers.prettyPrintTime(sumVideosDurations)
        }).appendTo(textWrapper);

        helpers.scrollElementInsideParent(currentPlaylistTitle);

        return listItem;
    }

    //  Refreshes the playlist display with the current playlist information.
    function reload() {
        playlistListUl.empty();

        var activeFolder = backgroundManager.get('activeFolder');

        if (activeFolder === null || activeFolder.get('playlists').length === 0) return;

        var firstPlaylistId = activeFolder.get('firstPlaylistId');
        var currentPlaylist = activeFolder.get('playlists').get(firstPlaylistId);

        var listItems = [];
        //  Build up each row.
        do {

            var listItem = buildListItem(currentPlaylist);
            listItems.push(listItem);

            currentPlaylist = activeFolder.get('playlists').get(currentPlaylist.get('nextPlaylistId'));

        } while (currentPlaylist.get('id') !== firstPlaylistId)

        playlistListUl.append(listItems);

        var activePlaylist = backgroundManager.get('activePlaylist');
        if (activePlaylist !== null) {
            visuallySelectPlaylist(activePlaylist);
        }

    }
});