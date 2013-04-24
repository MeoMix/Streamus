//  This is the list of playlists on the playlists tab.
define(['playlistsContextMenu', 'ytHelper', 'backgroundManager', 'helpers'], function (contextMenu, ytHelper, backgroundManager, helpers) {
    //  TODO: Make this sortable and should inherit from a common List object. 
    var playlistList = $('#PlaylistList ul');

    backgroundManager.on('change:activeStream change:activePlaylist', reload);
    backgroundManager.get('allPlaylists').on('add remove', reload);
    reload();

    //  Refreshes the playlist display with the current playlist information.
    function reload() {
        playlistList.empty();

        var activeStream = backgroundManager.get('activeStream');

        if (activeStream.get('playlists').length === 0) return;

        var firstListId = activeStream.get('firstListId');
        var currentPlaylist = activeStream.get('playlists').get(firstListId);
        
        //  Build up each row.
        do {

            if(currentPlaylist == null) break;

            var listItem = $('<li/>', {
                'data-playlistid': currentPlaylist.get('id'),
                contextmenu: function (e) {
                        
                    var clickedPlaylistId = $(this).data('playlistid');
                    var clickedPlaylist = activeStream.get('playlists').get(clickedPlaylistId);
                    contextMenu.initialize(clickedPlaylist);
                    //  +1 offset because if contextmenu appears directly under mouse, hover css will be removed from element.
                    contextMenu.show(e.pageY, e.pageX + 1);
                    //  Prevent default context menu display.
                    return false;
                }
            }).appendTo(playlistList);

            $('<a/>', {
                id: currentPlaylist.get('id'),
                href: '#' + currentPlaylist.get('id'),
                text: currentPlaylist.get('title')
            }).appendTo(listItem);

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
            
            $('<a/>', {
                text: 'Videos: ' + currentVideos.length + ' | Duration: ' + helpers.prettyPrintTime(sumVideosDurations)
            }).appendTo(listItem);
            
            currentPlaylist = activeStream.get('playlists').get(currentPlaylist.get('nextListId'));

        } while (currentPlaylist.get('id') !== firstListId)

        var activePlaylist = backgroundManager.get('activePlaylist');
        if (activePlaylist !== null) {
            selectRow(activePlaylist.get('id'));
        }
        
        //  Removes the old 'current' marking and move it to the newly selected row.
        function selectRow(id) {
            playlistList.find('li').removeClass('loaded');
            $('#' + id).parent().addClass('loaded');
        };

        //  Clicking on a playlist will select that playlist.
        playlistList.children().click(function () {
            var playlistId = $(this).children()[0].id;
            selectRow(playlistId);

            var playlist = backgroundManager.getPlaylistById(playlistId);
            backgroundManager.set('activePlaylist', playlist);
        });
    }
});