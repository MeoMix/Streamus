//  Responsible for showing options when interacting with a Video in PlaylistItemList.
define(['contextMenu', 'backgroundManager'], function (contextMenu, backgroundManager) {
    'use strict';
    var playlistItemsContextMenu = { };

    $.extend(playlistItemsContextMenu, contextMenu, {
        initialize: function(item) {
            this.empty();

            this.addContextMenuItem('Copy URL', function() {
                if (item != null) {
                    chrome.extension.sendMessage({ text: 'http://youtu.be/' + item.get('video').get('id') });
                }
            });

            this.addContextMenuItem('Delete', function() {
                if (item != null) {
                    backgroundManager.get('activePlaylist').removeItem(item);
                }
            });
        }
    });

    return playlistItemsContextMenu;
});