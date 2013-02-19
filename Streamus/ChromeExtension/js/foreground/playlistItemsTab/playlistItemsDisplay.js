//  Represents the videos in a given playlist
define(['playlistItemsContextMenu', 'playlistManager', 'player'], function (contextMenu, playlistManager, player) {
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

            playlistManager.activePlaylist.moveItem(movedItemId, newPosition);
        }
    });

    //  Removes the old 'current' marking and move it to the newly selected row.
    var selectRow = function (itemId) {
        playlistItemList.find('li').removeClass('current');
        playlistItemList.find('li[data-itemid="' + itemId + '"]').addClass('current');
    };
    
    //  TODO: Need to be a lot more fine-grained then just spamming reload. Will come back around to it.
    playlistManager.onActivePlaylistChange(reload);
    playlistManager.onActivePlaylistItemAdd(reload);
    playlistManager.onActivePlaylistItemRemove(reload);
    playlistManager.onActivePlaylistSelectedItemChanged(reload);

    reload();

    //  Refresh all the videos displayed to ensure they GUI matches background's data.
    function reload() {
        playlistItemList.empty();

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

            var selectedItemId = playlistManager.activePlaylist.getSelectedItem().get('id');
            //  If the item is already selected then it is cued up -- so just play it.
            if (selectedItemId == itemId) {
                player.play();
            } else {
                var item = playlistManager.activePlaylist.selectItemById(itemId);
                player.loadVideoById(item.get('video').get('id'));
            }
            
            return false;
        });

        var selectedItem = playlistManager.activePlaylist.getSelectedItem();
        
        //  Since we emptied our list we lost the selection, reselect.
        if (selectedItem) {
            selectRow(selectedItem.get('id'));
        }
    }
});