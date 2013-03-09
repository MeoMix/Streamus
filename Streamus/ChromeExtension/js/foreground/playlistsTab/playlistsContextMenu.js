//  Responsible for showing options when interacting with a Playlist in Playlist_List.
define(['contextMenu', 'backgroundManager'], function (contextMenu, backgroundManager) {
    'use strict';
    var playlistContextMenu = {};

    $.extend(playlistContextMenu, contextMenu, {
        initialize: function(playlist) {
            this.empty();
            this.addContextMenuItem('Delete playlist', function() {

                if (playlist !== null && !playlist.get('selected')) {
                    backgroundManager.get('activeStream').removePlaylistById(playlist.get('id'));
                }
            });
        }
    });

    return playlistContextMenu;
});