//  Responsible for showing options when interacting with a Video in PlaylistItemList.
define(['contextMenu', 'player', 'backgroundManager'], function (contextMenu, player, backgroundManager) {
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

            this.addContextMenuItem('Delete', function () {

                if (item != null) {
                    var playlistId = item.get('playlistId');
                    var playlist = backgroundManager.getPlaylistById(playlistId);
                    playlist.removeItem(item);

                    if (backgroundManager.get('activePlaylistItem') == null) {

                        if (playlist.get('items').length > 0) {
                            var newlyActiveItem = playlist.skipItem('next');
                            backgroundManager.set('activePlaylistItem', newlyActiveItem);
                        } else {
                            player.pause();
                        }
                    }
                }
            });
        }
    });

    return playlistItemsContextMenu;
});