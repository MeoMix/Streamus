//  Responsible for showing options when interacting with a Video in VideoList.
define(['contextMenu'], function(contextMenu) {
    'use strict';
    var videosContextMenu = { };

    $.extend(videosContextMenu, contextMenu, {
        initialize: function(item) {
            this.empty();

            this.addContextMenuItem('Copy video', function() {
                if (item != null) {
                    chrome.extension.sendMessage({ text: 'http://youtu.be/' + item.get('videoId') });
                }
            });

            this.addContextMenuItem('Delete video', function() {
                if (item != null) {
                    chrome.extension.getBackgroundPage().YoutubePlayer.removeItemByPosition(item.get('position'));
                }
            });
        }
    });

    return videosContextMenu;
});