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

        var activePlaylistItem = backgroundManager.get('activePlaylistItem');

        //  If the item is already selected then it is cued up -- so just play it.
        if (activePlaylistItem !== null && activePlaylistItem.get('id') === itemId) {
            player.play();
        } else {
            var playlistItem = backgroundManager.getPlaylistItemById(itemId);
            
            var playlistId = playlistItem.get('playlistId');
            var playlist = backgroundManager.getPlaylistById(playlistId);

            playlist.selectItem(playlistItem);
            backgroundManager.set('activePlaylistItem', playlistItem);

            var videoId = playlistItem.get('video').get('id');
            player.loadVideoById(videoId);
        }
    }
    
    backgroundManager.on('change:activePlaylistItem change:activePlaylist', reload);
    backgroundManager.get('allPlaylistItems').on('add remove', reload);
    reload();
    scrollActiveItemIntoView(backgroundManager.get('activePlaylistItem'), false);
    
    function scrollActiveItemIntoView(activeItem, useAnimation) {

        //  Since we emptied our list we lost the selection, reselect.
        if (activeItem) {
            var loadedItemId = activeItem.get('id');
            var $activeItem = playlistItemList.find('li[data-itemid="' + loadedItemId + '"]');

            if ($activeItem.length > 0) {
                $activeItem.scrollIntoView(useAnimation);
            }

        }
    }

    //  Refresh all the videos displayed to ensure they GUI matches background's data.
    function reload() {
        playlistItemList.empty();

        var activePlaylist = backgroundManager.get('activePlaylist');

        if (activePlaylist == null || activePlaylist.get('items').length === 0) return;
        
        var firstItemId = activePlaylist.get('firstItemId');
        var currentItem = activePlaylist.get('items').get(firstItemId);
        
        //  Build up the ul of li's representing each playlistItem.
        do {
            (function (item) {
                var listItem = $('<li/>', {
                    'data-itemid': item.get('id'),
                    contextmenu: function (e) {
                        contextMenu.initialize(item);
                        contextMenu.show(e.pageY, e.pageX);

                        //  Prevent default context menu display.
                        return false;
                    }
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
                    text: item.get('title')
                }).appendTo(listItem);
            })(currentItem);

            currentItem = activePlaylist.get('items').get(currentItem.get('nextItemId'));

        } while (currentItem.get('id') !== firstItemId)

        //  TODO: Can I just early-bind this and not have to reapply every time?
        //  Load and start playing a video if it is double click.
        playlistItemList.children().click(function () {

            var itemId = $(this).data('itemid');
            selectItemById(itemId);
            setListItemClass(itemId, 'loaded');
        });
        
        //  TODO: Does not work when activePlaylist is not visible.
        var activeItem = backgroundManager.get('activePlaylistItem');

        //  Since we emptied our list we lost the selection, reselect.
        if (activeItem) {
            scrollActiveItemIntoView(activeItem, false);

            var activeItemId = activeItem.get('id');
            setListItemClass(activeItemId, 'loaded');
        }
    }
});