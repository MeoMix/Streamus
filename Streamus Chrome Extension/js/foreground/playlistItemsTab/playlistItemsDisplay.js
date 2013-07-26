//  Represents the videos in a given playlist
define(['contextMenuView', 'backgroundManager', 'player', 'helpers', 'streamItems'], function (ContextMenuView, backgroundManager, player, helpers, StreamItems) {
    'use strict';

    var playlistItemList = $('#PlaylistItemList');

    playlistItemList.contextmenu(function() {

        ContextMenuView.addGroup({
            position: 0,
            items: [{
                position: 0,
                text: 'Add Playlist to Stream',
                onClick: function () {

                    var activePlaylist = backgroundManager.get('activePlaylist');
                    
                    var streamItems = activePlaylist.get('items').map(function (playlistItem) {
                        return {
                            id: _.uniqueId('streamItem_'),
                            video: playlistItem.get('video'),
                            title: playlistItem.get('title'),
                            videoImageUrl: 'http://img.youtube.com/vi/' + playlistItem.get('video').get('id') + '/default.jpg'
                        };
                    });

                    StreamItems.addMultiple(streamItems);

                }
            }]
        });

        ContextMenuView.show({
            top: event.pageY,
            left: event.pageX + 1
        });

        return false;
    });

    var playlistItemListUl = $('#PlaylistItemList ul');

    playlistItemListUl.on('contextmenu', 'li', function (event) {

        var activePlaylist = backgroundManager.get('activePlaylist');
        var clickedItemId = $(this).data('itemid');
        var clickedItem = activePlaylist.get('items').get(clickedItemId);

        ContextMenuView.addGroup({
            position: 0,
            items: [{
                position: 0,
                text: 'Copy URL',
                onClick: function () {
                    chrome.extension.sendMessage({
                        method: 'copy',
                        text: 'http://youtu.be/' + clickedItem.get('video').get('id')
                    });
                }
            }, {
                position: 1,
                text: 'Copy Title - URL',
                onClick: function () {

                    chrome.extension.sendMessage({
                        method: 'copy',
                        text: '"' + clickedItem.get('title') + '" - http://youtu.be/' + clickedItem.get('video').get('id')
                    });
                }
            }, {
                position: 2,
                text: 'Delete Video',
                onClick: function () {
                    clickedItem.destroy();
                }
            }, {
                position: 3,
                text: 'Add Video to Stream',
                onClick: function () {
                    StreamItems.add({
                        id: _.uniqueId('streamItem_'),
                        video: clickedItem.get('video'),
                        title: clickedItem.get('title'),
                        videoImageUrl: 'http://img.youtube.com/vi/' + clickedItem.get('video').get('id') + '/default.jpg'
                    });
                }
            }]
        });

        ContextMenuView.addGroup({
            position: 1,
            items: [{
                position: 0,
                text: 'Add Playlist to Stream',
                onClick: function () {

                    var streamItems = activePlaylist.get('items').map(function (playlistItem) {
                        return {
                            id: _.uniqueId('streamItem_'),
                            video: playlistItem.get('video'),
                            title: playlistItem.get('title'),
                            videoImageUrl: 'http://img.youtube.com/vi/' + playlistItem.get('video').get('id') + '/default.jpg'
                        };
                    });

                    StreamItems.addMultiple(streamItems);

                }
            }]
        });

        ContextMenuView.show({
            top: event.pageY,
            left: event.pageX + 1
        });

        return false;
    });
    
    playlistItemListUl.on('click', 'li', function () {

        //  Add item to stream on dblclick.
        var itemId = $(this).data('itemid');
        var playlistItem = backgroundManager.getPlaylistItemById(itemId);

        StreamItems.add({
            id: _.uniqueId('streamItem_'),
            video: playlistItem.get('video'),
            title: playlistItem.get('title'),
            videoImageUrl: 'http://img.youtube.com/vi/' + playlistItem.get('video').get('id') + '/default.jpg'
        });

    });

    //  Allows for drag-and-drop of videos
    playlistItemListUl.sortable({
        axis: 'y',
        //  Adding this helps prevent unwanted clicks to play
        delay: 100,
        //  Whenever a video row is moved inform the Player of the new video list order
        update: function (event, ui) {

            var movedItemId = ui.item.data('itemid');
            var newIndex = ui.item.index();
            var nextIndex = newIndex + 1;

            var nextListItem = playlistItemListUl.children('ul li:eq(' + nextIndex + ')');

            if (nextListItem == null) {
                nextListItem = playlistItemListUl.children('ul li:eq(0)');
            }

            var nextItemId = nextListItem.data('itemid');

            backgroundManager.get('activePlaylist').moveItem(movedItemId, nextItemId);
        }
    });

<<<<<<< HEAD
    //  Removes the old 'current' marking and move it to the newly selected row.
    function setListItemClass(itemId, itemClass) {
        playlistItemList.find('li').removeClass(itemClass);
        playlistItemList.find('li[data-itemid="' + itemId + '"]').addClass(itemClass);
    };
    
    function selectItemById(itemId) {

        var activePlaylistItem = backgroundManager.get('activePlaylistItem');

        //  If the item is already selected then it is cued up -- so just play it.
        if (activePlaylistItem !== null && activePlaylistItem.get('id') === itemId) {
            
            if (player.isPlaying()) {
                player.pause();
            } else {
                player.play();
            }

        } else {
            var playlistItem = backgroundManager.getPlaylistItemById(itemId);
            
            var playlistId = playlistItem.get('playlistId');
            var playlist = backgroundManager.getPlaylistById(playlistId);

            playlist.selectItem(playlistItem);
            backgroundManager.set('activePlaylistItem', playlistItem);
        }
    }
    

    backgroundManager.on('change:activePlaylist', function() {
        reload();
    });
    
=======
    backgroundManager.on('change:activePlaylist', function () {
        reload();
    });

>>>>>>> origin/Development
    var emptyPlaylistNotificationId = 'EmptyPlaylistNotification';
    backgroundManager.get('allPlaylistItems').on('add', function(item) {

        var listItem = buildListItem(item);

        if (playlistItemListUl.find('li').length > 0) {
            
            var previousItemId = item.get('previousItemId');
            
            var previousItemLi = playlistItemListUl.find('li[data-itemid="' + previousItemId + '"]');
            listItem.insertAfter(previousItemLi);
            
        } else {
            listItem.appendTo(playlistItemListUl);
        }

        $('#' + emptyPlaylistNotificationId).remove();
        scrollIntoView(item);
    });

    backgroundManager.get('allPlaylistItems').on('remove', function (item) {
        playlistItemListUl.find('li[data-itemid="' + item.get('id') + '"]').remove();
        
        if (playlistItemListUl.find('li').length === 0) {
            showEmptyPlaylistNotification();
        }

    });

    reload();

    function showEmptyPlaylistNotification() {
        
        if ($('#' + emptyPlaylistNotificationId).length == 0) {
            
            var emptyPlaylistNotification = $('<div>', {
                id: emptyPlaylistNotificationId,
                text: 'Your Playlist is empty. Try adding some videos by clicking above.'
            });

            emptyPlaylistNotification.insertBefore(playlistItemListUl);
            
        }

    }
    
    function buildListItem(item) {
        
        var listItem = $('<li/>', {
            'data-itemid': item.get('id')
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
        
        helpers.scrollElementInsideParent(itemTitle);

        return listItem;
    }
    
    function scrollIntoView(item) {
        var itemId = item.get('id');
        var $activeItem = playlistItemListUl.find('li[data-itemid="' + itemId + '"]');

        if ($activeItem.length > 0) {
            $activeItem.scrollIntoView(true);
        }
    }

    //  Refresh all the videos displayed to ensure they GUI matches background's data.
    function reload() {

        playlistItemListUl.empty();

        var activePlaylist = backgroundManager.get('activePlaylist');

        var listItems = [];

        if (activePlaylist.get('items').length === 0) {
            showEmptyPlaylistNotification();
        } else {
            $('#' + emptyPlaylistNotificationId).remove();

            var firstItemId = activePlaylist.get('firstItemId');

            var item = activePlaylist.get('items').get(firstItemId);

            //  Build up the ul of li's representing each playlistItem.
            do {

                if (item !== null) {

                    var listItem = buildListItem(item);
                    listItems.push(listItem);
  
                    item = activePlaylist.get('items').get(item.get('nextItemId'));
                }

            } while (item && item.get('id') !== firstItemId)
       
            //  Do this all in one DOM insertion to prevent lag in large playlists.
            playlistItemListUl.append(listItems);
        }
    }
});