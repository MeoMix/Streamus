//  Responsible for showing options when interacting with a Playlist in Playlist_List.
define(['contextMenu'], function (contextMenu) {
    'use strict';
    
    var playlistContextMenu = {};

    $.extend(playlistContextMenu, contextMenu, {
        initialize: function (playlist) {

            this.empty();
            this.addContextMenuItem('Delete playlist', function () {

                playlist.destroy({
                    success: function () {
                    },
                    error: function (error) {
                        window && console.error(error);
                    }
                });

            });
        }
    });

    return playlistContextMenu;
});