//Responsible for showing options when interacting with a Song in SongList.
define(['contextMenu'], function(contextMenu) {
    'use strict';
    var songsContextMenu = { };

    $.extend(songsContextMenu, contextMenu, {
        initialize: function(item) {
            this.empty();

            this.addContextMenuItem('Copy song', function() {
                if (item != null) {
                    chrome.extension.sendMessage({ text: 'http://youtu.be/' + item.get('videoId') });
                }
            });

            this.addContextMenuItem('Delete song', function() {
                if (item != null) {
                    chrome.extension.getBackgroundPage().YoutubePlayer.removeItemByPosition(item.get('position'));
                }
            });
        }
    });

    return songsContextMenu;
});