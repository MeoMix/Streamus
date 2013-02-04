//  Responsible for showing options when interacting with a Video in PlaylistItemList.
define(['contextMenu'], function(contextMenu) {
    'use strict';
    var playlistItemsContextMenu = { };

    $.extend(playlistItemsContextMenu, contextMenu, {
        initialize: function(item) {
            this.empty();

            this.addContextMenuItem('Copy URL', function() {
                if (item != null) {
                    chrome.extension.sendMessage({ text: 'http://youtu.be/' + item.get('videoId') });
                }
            });

            this.addContextMenuItem('Delete', function() {
                if (item != null) {
                    chrome.extension.getBackgroundPage().YoutubePlayer.removeItem(item);
                }
            });
        }
    });

    return playlistItemsContextMenu;
});