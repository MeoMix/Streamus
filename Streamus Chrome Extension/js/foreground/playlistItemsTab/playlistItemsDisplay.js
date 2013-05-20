//  Represents the videos in a given playlist
define(['playlistItemsContextMenu', 'backgroundManager', 'player', 'helpers'], function (contextMenu, backgroundManager, player, helpers) {
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
            var newIndex = ui.item.index();
            var nextIndex = newIndex + 1;

            var nextListItem = playlistItemList.children('ul li:eq(' + nextIndex + ')');

            if (nextListItem == null) {
                nextListItem = playlistItemList.children('ul li:eq(0)'); 
            }

            var nextItemId = nextListItem.data('itemid');

            backgroundManager.get('activePlaylist').moveItem(movedItemId, nextItemId);
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
    
    backgroundManager.on('change:activePlaylist', reload);
    backgroundManager.get('allPlaylistItems').on('add', function(item) {

        var listItem = buildListItem(item);

        if (playlistItemList.find('li').length > 0) {
            
            var previousItemId = item.get('previousItemId');
            var previousItemLi = playlistItemList.find('li[data-itemid="' + previousItemId + '"]');
            listItem.insertAfter(previousItemLi);
            
        } else {
            listItem.appendTo(playlistItemList);
        }

        //  Since we emptied our list we lost the selection, reselect.
        scrollIntoView(item, true);
    });

    backgroundManager.on('change:activePlaylistItem', function (model, playlistItem) {
        
        if (playlistItem !== null) {
            visuallySelectItem(playlistItem);
        } else {
            playlistItemList.find('li').removeClass('loaded');
        }

    });

    backgroundManager.get('allPlaylistItems').on('remove', function (item) {
        playlistItemList.find('li[data-itemid="' + item.get('id') + '"]').remove();
    });

    reload();
    scrollIntoView(backgroundManager.get('activePlaylistItem'), false);
    
    function buildListItem(item) {
        
        var listItem = $('<li/>', {
            'data-itemid': item.get('id'),
            contextmenu: function (e) {
                
                var activePlaylist = backgroundManager.get('activePlaylist');

                var clickedItemId = $(this).data('itemid');
                var clickedItem = activePlaylist.get('items').get(clickedItemId);

                contextMenu.initialize(clickedItem);

                //  +1 offset because if contextmenu appears directly under mouse, hover css will be removed from element.
                contextMenu.show(e.pageY, e.pageX + 1);
                //  Prevent default context menu display.
                return false;
            },
            click: function() {
                var itemId = $(this).data('itemid');
                selectItemById(itemId);
                setListItemClass(itemId, 'loaded');
            }
        });
        
        var video = item.get('video');

        $('<div>', {
            'class': 'playlistItemVideoImage',
            css: {
                backgroundImage: 'url(' + 'http://img.youtube.com/vi/' + video.get('id') + '/default.jpg' + ')',
            }
        }).appendTo(listItem);

        var textWrapper = $('<div>', {
            'class': 'textWrapper'
        }).appendTo(listItem);

        var itemTitle = $('<span/>', {
            text: item.get('title')
        });
        itemTitle.appendTo(textWrapper);

        $('<span/>', {
            text: helpers.prettyPrintTime(video.get('duration')) + ' by ' + video.get('author')
        }).appendTo(textWrapper);
        
        helpers.scrollElementInsideParent(itemTitle, textWrapper);

        return listItem;
    }
    
    function visuallySelectItem(item) {
        //  Since we emptied our list we lost the selection, reselect.
        scrollIntoView(item, false);

        var activeItemId = item.get('id');
        setListItemClass(activeItemId, 'loaded');
    }
    
    function scrollIntoView(activeItem, useAnimation) {

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
        var item = activePlaylist.get('items').get(firstItemId);
        
        //  Build up the ul of li's representing each playlistItem.
        
        do {
            
            if (item !== null) {

                var listItem = buildListItem(item);
                listItem.appendTo(playlistItemList);

                item = activePlaylist.get('items').get(item.get('nextItemId'));

            }

        } while (item && item.get('id') !== firstItemId)
        
        //  TODO: Does not work when activePlaylist is not visible.
        var activeItem = backgroundManager.get('activePlaylistItem');

        //  Since we emptied our list we lost the selection, reselect.
        if (activeItem) {
            visuallySelectItem(activeItem);
        }
    }
});