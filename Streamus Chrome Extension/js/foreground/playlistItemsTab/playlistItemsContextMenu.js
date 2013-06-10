//  Responsible for showing options when interacting with a Video in PlaylistItemList.
define(['contextMenu', 'backgroundManager'], function (contextMenu) {
    'use strict';

    var playlistItemsContextMenu = $.extend({}, contextMenu, {
        
        initialize: function (item) {
            this.remove();

            this.addContextMenuItem({
                text: 'Copy URL',
                click: function () {
                    
                    chrome.extension.sendMessage({
                        method: 'copy',
                        text: 'http://youtu.be/' + item.get('video').get('id')
                    });

                }
            });

            this.addContextMenuItem({
                text: 'Delete',
                click: function () {

                    item.destroy({
                        success: function() {
                        },
                        error: function (error) {
                            console.error("Failed to destroy item", error);
                        }
                    });
                    
                } 
            });
        }
        
    });

    return playlistItemsContextMenu;
});