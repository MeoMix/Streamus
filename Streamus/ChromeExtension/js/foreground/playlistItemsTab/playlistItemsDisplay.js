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

            throw "Not implemented.";

            //var movedItemId = ui.item.data('itemid');
            //var newPosition = ui.item.index();

            //playlistManager.getStream().get('activePlaylist').moveItem(movedItemId, newPosition);
        }
    });

    //  Removes the old 'current' marking and move it to the newly selected row.
    var selectRow = function (itemId) {
        playlistItemList.find('li').removeClass('current');
        playlistItemList.find('li[data-itemid="' + itemId + '"]').addClass('current');
    };
    
    //  TODO: Need to be a lot more fine-grained then just spamming reload. Will come back around to it.
    // TODO: This will need to be reworked to support >1 streams.
    var stream = playlistManager.getStream();
    stream.on('change:activePlaylist', reload);
    stream.get('activePlaylist').on('add:items', reload);
    stream.get('activePlaylist').on('remove:items', reload);
    stream.get('activePlaylist').on('change:items', reload);

    reload();

    //  Refresh all the videos displayed to ensure they GUI matches background's data.
    function reload() {
        playlistItemList.empty();
        
        var activePlaylist = playlistManager.getStream().get('activePlaylist');
        var activePlaylistItems = activePlaylist.get('items');
        if (activePlaylistItems.length === 0) return;

        var firstItemId = activePlaylist.get('firstItemId');
        var currentItem = activePlaylistItems.get(firstItemId);
        
        //  Build up the ul of li's representing each playlistItem.
        do {
            (function (item) {
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
            })(currentItem);

            currentItem = activePlaylistItems.get(currentItem.get('nextItemId'));

        } while(currentItem.get('id') !== firstItemId)

        //  Load and start playing a video if it is clicked.
        //  TODO: double click
        playlistItemList.children().click(function () {
            console.log("click detected");
            var itemId = $(this).data('itemid');

            var selectedItemId = playlistManager.getStream().get('activePlaylist').getSelectedItem().get('id');
            //  If the item is already selected then it is cued up -- so just play it.
            if (selectedItemId == itemId) {
                console.log("Calling play");
                player.play();
            } else {
                window && console.log("Playlist manager is about to select item with ID:", itemId);
                var item = playlistManager.getStream().get('activePlaylist').selectItemById(itemId);
                player.loadVideoById(item.get('video').get('id'));
            }
            
            return false;
        });

        var selectedItem = playlistManager.getStream().get('activePlaylist').getSelectedItem();
        
        //  Since we emptied our list we lost the selection, reselect.
        if (selectedItem) {
            selectRow(selectedItem.get('id'));
        }
      
    }
});