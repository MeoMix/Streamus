//  Represents the videos in a given playlist
define(['playlistItemsContextMenu'], function (contextMenu) {
    'use strict';
    var playlistItemList = $('#PlaylistItemList ul');

    //  Allows for drag-and-drop of videos
    playlistItemList.sortable({
        axis: 'y',
        //  Adding this helps prevent unwanted clicks to play
        delay: 100,
        //  Whenever a video row is moved inform the Player of the new video list order
        update: function (event, ui) {
            var movedItemId = ui.item.data('itemid');
            var newPosition = ui.item.index();

            chrome.extension.getBackgroundPage().PlaylistManager.activePlaylist.moveItem(movedItemId, newPosition);
        }
    });

    //  Removes the old 'current' marking and move it to the newly selected row.
    var selectRow = function (itemId) {
        playlistItemList.find('li').removeClass('current');
        playlistItemList.find('li[data-itemid="' + itemId + '"]').addClass('current');
    };

    return {
        //  Refresh all the videos displayed to ensure they GUI matches background's data.
        reload: function () {
            playlistItemList.empty();

            var playlistManager = chrome.extension.getBackgroundPage().PlaylistManager;

            //  Build up the ul of li's representing each playlistItem.
            playlistManager.activePlaylist.get('items').each(function (item) {
                var listItem = $('<li/>', {
                    'data-itemid': item.get('id')
                }).appendTo(playlistItemList);

                $('<a/>', {
                    text: item.get('title'),
                    contextmenu: function (e) {
                        contextMenu.initialize(item);
                        contextMenu.show(e.pageY, e.pageX);

                        //  Prevent default context menu display.
                        return false;
                    }
                }).appendTo(listItem);
            });

            //  Load and start playing a video if it is clicked.
            //  TODO: double click
            playlistItemList.children().click(function () {
                var itemId = $(this).data('itemid');
 
                chrome.extension.getBackgroundPage().YoutubePlayer.loadItemById(itemId);
                return false;
            });

            var selectedItem = playlistManager.activePlaylist.getSelectedItem();
            //  Since we emptied our list we lost the selection, reselect.
            if (selectedItem) {
                selectRow(selectedItem.get('id'));
            }
        }
    };
});