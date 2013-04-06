//  Responsible for showing options when interacting with a Playlist in Playlist_List.
define(['contextMenu', 'backgroundManager'], function (contextMenu, backgroundManager) {
    'use strict';
    var playlistContextMenu = {};

    $.extend(playlistContextMenu, contextMenu, {
        initialize: function(playlist) {
            this.empty();
            this.addContextMenuItem('Delete playlist', function () {

                //  TODO: When would this be null? :s
                if (playlist !== null) {
                    var playlistId = playlist.get('id');
                    backgroundManager.get('activeStream').removePlaylistById(playlistId);
                }
            });
        }
    });

    return playlistContextMenu;
});