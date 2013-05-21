//  Responsible for showing options when interacting with a Video in PlaylistItemList.
define(['contextMenu', 'backgroundManager'], function (contextMenu) {
    'use strict';
    
    var playlistItemsContextMenu = { };

    $.extend(playlistItemsContextMenu, contextMenu, {
        initialize: function(item) {
            this.empty();

            this.addContextMenuItem('Copy URL', false, function () {

                chrome.extension.sendMessage({
                    method: 'copy',
                    text: 'http://youtu.be/' + item.get('video').get('id')
                });

            });

            this.addContextMenuItem('Delete', false, function () {
                item.destroy({
                    success: function() {
                    },
                    error: function (error) {
                        window && console.error("Failed to destroy item", error);
                    }
                });
            });
        }
    });

    return playlistItemsContextMenu;
});