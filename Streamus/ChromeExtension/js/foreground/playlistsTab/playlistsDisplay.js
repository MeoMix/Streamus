//  This is the list of playlists on the playlists tab.
define(['playlistsContextMenu', 'ytHelper', 'playlistManager', 'player'], function (contextMenu, ytHelper, playlistManager, player) {
    //  TODO: Make this sortable and should inherit from a common List object. 
    var playlistList = $('#PlaylistList ul');

    //  TODO: Need to be a lot more fine-grained then just spamming reload. Will come back around to it.
    playlistManager.onActivePlaylistChange(reload);
    playlistManager.onPlaylistRemoved(reload);
    playlistManager.onPlaylistAdded(reload);

    reload();

    //  Refreshes the playlist display with the current playlist information.
    function reload() {
        playlistList.empty();

        //  Removes the old 'current' marking and move it to the newly selected row.
        var selectRow = function (id) {
            playlistList.find('li').removeClass('current');
            $('#' + id).parent().addClass('current');
        };

        //  Build up each row.
        playlistManager.playlists.each(function (playlist) {
            var listItem = $('<li/>').appendTo(playlistList);

            $('<a/>', {
                id: playlist.get('id'),
                href: '#' + playlist.get('id'),
                text: playlist.get('title'),
                contextmenu: function (e) {
                    contextMenu.initialize(playlist);
                    contextMenu.show(e.pageY, e.pageX);
                    //  Prevent default context menu display.
                    return false;
                }
            }).appendTo(listItem);

            if (playlist.get('selected')) {
                selectRow(playlist.get('id'));
            }
        });

        //  Clicking on a playlist will select that playlist.
        playlistList.children().click(function () {
            var clickedId = $(this).children()[0].id;
            selectRow(clickedId);
            
            playlistManager.selectPlaylist(clickedId);
            return false;
        });
    }
});