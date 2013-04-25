//  This is the list of playlists on the playlists tab.
define(['playlistsContextMenu', 'ytHelper', 'backgroundManager', 'helpers', 'spin'], function (contextMenu, ytHelper, backgroundManager, helpers, Spin) {
    //  TODO: Make this sortable and should inherit from a common List object. 
    var playlistList = $('#PlaylistList ul');
   
    var spinner = new Spin({
        lines: 13, // The number of lines to draw
        length: 6, // The length of each line
        width: 2, // The line thickness
        radius: 8, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb
        speed: 2, // Rounds per second
        trail: 25, // Afterglow percentage
        shadow: true, // Whether to render a shadow
        hwaccel: true, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000),
        top: 0
    });

    backgroundManager.on('change:activeStream change:activePlaylist', reload);
    backgroundManager.get('allPlaylists').on('remove', reload);
    
    backgroundManager.get('allPlaylistItems').on('add remove', function (playlistItem) {
        var playlistId = playlistItem.get('playlistId');
        var playlistLink = $('#' + playlistId);

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

        var playlistLinkDescription = 'Videos: ' + currentVideos.length + ' | Duration: ' + helpers.prettyPrintTime(sumVideosDurations);
        playlistLink.next('.playlistLinkDescription').text(playlistLinkDescription);
    });
    
    backgroundManager.get('allPlaylists').on('add', function (playlist) {
        reload();

        if (playlist.get('youTubePlaylistId') !== null) {
            var playlistLink = $('#' + playlist.get('id'));
            spinner.spin(playlistLink[0]);

            playlist.once('loaded', function() {
                spinner.stop();
            });
        }
    });
    
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
                'class': 'playlistLinkDescription',
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