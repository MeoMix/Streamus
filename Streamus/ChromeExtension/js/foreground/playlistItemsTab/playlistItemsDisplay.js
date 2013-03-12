//  Represents the videos in a given playlist
define(['playlistItemsContextMenu', 'backgroundManager', 'player'], function (contextMenu, backgroundManager, player) {
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

            //backgroundManager.get('activePlaylist').moveItem(movedItemId, newPosition);
        }
    });

    //  Removes the old 'current' marking and move it to the newly selected row.
    function setListItemClass(itemId, itemClass) {
        playlistItemList.find('li').removeClass(itemClass);
        playlistItemList.find('li[data-itemid="' + itemId + '"]').addClass(itemClass);
    };
    
    function selectItemById(itemId) {
        var selectedItemId = backgroundManager.get('activePlaylistItem').get('id');
        
        //  If the item is already selected then it is cued up -- so just play it.
        if (selectedItemId == itemId) {
            player.play();
        } else {
            window && console.log("Playlist manager is about to select item with ID:", itemId);

            var playlistItem = backgroundManager.getPlaylistItemById(itemId);
            var playlistId = playlistItem.get('playlistId');
            var playlist = backgroundManager.getPlaylistById(playlistId);

            playlist.selectItem(playlistItem);
            backgroundManager.set('activePlaylistItem', playlistItem);

            var videoId = playlistItem.get('video').get('id');
            player.loadVideoById(videoId);
        }
    }
    
    //  TODO: Need to be a lot more fine-grained then just spamming reload. Will come back around to it.
    //  TODO: Do I need to unbind events? :s Probably.. will fire a lot of reloads, will come back to it though.
    backgroundManager.on('change:activePlaylistItem change:activePlaylist change:activeStream', reload);
    backgroundManager.get('activePlaylist').get('items').on('add remove', reload);
    
    reload();
    scrollLoadedItemIntoView(backgroundManager.get('activePlaylistItem'), false);
    
    function scrollLoadedItemIntoView(loadedItem, useAnimation) {

        //  Since we emptied our list we lost the selection, reselect.
        if (loadedItem) {
            var loadedItemId = loadedItem.get('id');
            var $loadedItem = playlistItemList.find('li[data-itemid="' + loadedItemId + '"]');
            
            if ($loadedItem.length > 0) {
                $loadedItem.scrollIntoView(useAnimation);
            }

        }
    }

    //  Refresh all the videos displayed to ensure they GUI matches background's data.
    function reload() {
        playlistItemList.empty();

        var activePlaylist = backgroundManager.get('activePlaylist');
        var activePlaylistItems = backgroundManager.get('activePlaylist').get('items');

        if (activePlaylistItems.length === 0) return;

        var firstItemId = activePlaylist.get('firstItemId');
        var currentItem = activePlaylistItems.get(firstItemId);
        
        //  Build up the ul of li's representing each playlistItem.
        do {
            (function (item) {
                var listItem = $('<li/>', {
                    'data-itemid': item.get('id')
                }).appendTo(playlistItemList);

                $('<img>', {
                    width: '50px',
                    src: 'http://img.youtube.com/vi/' + item.get('video').get('id') + '/default.jpg',
                    css: {
                        'margin-top': '3px',
                        'margin-left': '3px'
                    }
                }).appendTo(listItem);

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

        } while (currentItem.get('id') !== firstItemId)

        //  Load and start playing a video if it is double click.
        playlistItemList.children().click(function () {

            var itemId = $(this).data('itemid');
            selectItemById(itemId);
            setListItemClass(itemId, 'loaded');
            
            return false;
        });
        
        //  TODO: this might not work as hoped because what if activePlaylistItem is in a different playlist?
        var activeItem = backgroundManager.get('activePlaylistItem');

        //  Since we emptied our list we lost the selection, reselect.
        if (activeItem) {
            scrollLoadedItemIntoView(activeItem, false);

            var activeItemId = activeItem.get('id');
            setListItemClass(activeItemId, 'loaded');
        }
    }
});