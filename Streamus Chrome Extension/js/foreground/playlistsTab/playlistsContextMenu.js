//  Responsible for showing options when interacting with a Playlist in Playlist_List.
define(['contextMenu', 'backgroundManager'], function (contextMenu, backgroundManager) {
    'use strict';
    
    var playlistContextMenu = {};

    $.extend(playlistContextMenu, contextMenu, {
        initialize: function (playlist) {

            this.empty();

            var stream = backgroundManager.getStreamById(playlist.get('streamId'));
            //  Don't allow deleting of the last playlist in a stream ( at least for now )
            var isDeleteDisabled = stream.get('playlists').length === 1;

            console.log("is Delete Disabled:", isDeleteDisabled);

            this.addContextMenuItem('Delete playlist', isDeleteDisabled, function () {

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