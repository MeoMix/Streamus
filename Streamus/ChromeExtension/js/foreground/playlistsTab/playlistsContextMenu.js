//Responsible for showing options when interacting with a Playlist in Playlist_List.
define(['contextMenu'], function (contextMenu) {
    'use strict';
    var playlistContextMenu = {};

    $.extend(playlistContextMenu, contextMenu, {
        initialize: function(playlist) {
            this.empty();
            this.addContextMenuItem('Delete playlist', function() {
                //TODO: I need to gray out the option to delete, but still show it.
                //Should I gray out when clicking on last playlist or current playlist?
                if (playlist !== null && !playlist.get('selected')) {
                    chrome.extension.getBackgroundPage().PlaylistManager.removePlaylistById(playlist.get('id'));
                }
            });
        }
    });

    return playlistContextMenu;
});