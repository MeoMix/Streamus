//  Responsible for showing options when interacting with a Video in PlaylistItemList.
define(['contextMenu', 'backgroundManager'], function (contextMenu) {
    'use strict';
    
    var playlistItemsContextMenu = { };

    $.extend(playlistItemsContextMenu, contextMenu, {
        initialize: function(item) {
            this.empty();

            this.addContextMenuItem('Copy URL', function () {

                chrome.extension.sendMessage({
                    method: 'copy',
                    text: 'http://youtu.be/' + item.get('video').get('id')
                });

            });

            this.addContextMenuItem('Delete', function () {
                item.destroy({
                    success: function() {
                    },
                    error: function(error) {
                        window && console.error(error);
                    }
                });
            });
        }
    });

    return playlistItemsContextMenu;
});