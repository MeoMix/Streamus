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

            //playlistManager.getStream().getSelectedPlaylist().moveItem(movedItemId, newPosition);
        }
    });

    //  Removes the old 'current' marking and move it to the newly selected row.
    var selectRow = function (itemId) {
        playlistItemList.find('li').removeClass('current');
        playlistItemList.find('li[data-itemid="' + itemId + '"]').addClass('current');
    };
    
    //  TODO: Need to be a lot more fine-grained then just spamming reload. Will come back around to it.
    //  TODO: This will need to be reworked to support >1 streams.
    var stream = playlistManager.getStream();

    stream.get('playlists').on('change:selected', function(playlist, isSelected) {
        if (isSelected) {
            playlist.get('items').on('add remove change:selected', reload);

            reload();
        } else {
            playlist.get('items').off('add remove change:selected');
        }

    });
    
    //  TODO: Not sure what change on items is doing or why I need it.
    stream.getSelectedPlaylist().get('items').on('add remove change:selected', reload);

    reload();

    //  Refresh all the videos displayed to ensure they GUI matches background's data.
    function reload() {
        playlistItemList.empty();
        
        var selectedPlaylist = playlistManager.getStream().getSelectedPlaylist();
        var selectedPlaylistItems = selectedPlaylist.get('items');

        if (selectedPlaylistItems.length === 0) return;

        var firstItemId = selectedPlaylist.get('firstItemId');

        var currentItem = selectedPlaylistItems.get(firstItemId);
        
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

            currentItem = selectedPlaylistItems.get(currentItem.get('nextItemId'));

        } while(currentItem.get('id') !== firstItemId)

        //  Load and start playing a video if it is clicked.
        //  TODO: double click
        playlistItemList.children().click(function () {

            var itemId = $(this).data('itemid');

            var selectedItemId = playlistManager.getStream().getSelectedPlaylist().getSelectedItem().get('id');
            //  If the item is already selected then it is cued up -- so just play it.
            if (selectedItemId == itemId) {

                player.play();
            } else {
                window && console.log("Playlist manager is about to select item with ID:", itemId);
                var item = playlistManager.getStream().getSelectedPlaylist().selectItemById(itemId);
                player.loadVideoById(item.get('video').get('id'));
            }
            
            return false;
        });

        var selectedItem = selectedPlaylist.getSelectedItem();

        //  Since we emptied our list we lost the selection, reselect.
        if (selectedItem) {
            selectRow(selectedItem.get('id'));
        }
      
    }
});