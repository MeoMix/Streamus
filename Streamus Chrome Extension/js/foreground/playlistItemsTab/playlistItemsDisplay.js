//  Represents the videos in a given playlist
define(['contextMenuView', 'backgroundManager', 'player', 'helpers', 'streamItems'], function (ContextMenuView, backgroundManager, player, helpers, StreamItems) {
    'use strict';

    var PlaylistItemsView = Backbone.View.extend({
        //  TODO: Change this to view
        el: $('#PlaylistItemList'),
        
        //  TODO: Not sure if this is quite how I want to do this.
        ul: $('#PlaylistItemList ul'),
        
        emptyNotification: $('#PlaylistItemList .emptyListNotification'),
        
        events: {
            'contextmenu': 'showContextMenu',
            'contextmenu ul li': 'showItemContextMenu',
            'click ul li': 'addItemToStream'
        },
        
        initialize: function() {

            var self = this;
            
            //  Allows for drag-and-drop of videos
            this.ul.sortable({
                axis: 'y',
                //  Adding this helps prevent unwanted clicks to play
                delay: 100,
                //  Whenever a video row is moved inform the Player of the new video list order
                update: function (event, ui) {

                    var movedItemId = ui.item.data('itemid');
                    var newIndex = ui.item.index();
                    var nextIndex = newIndex + 1;

                    var nextListItem = self.ul.children('ul li:eq(' + nextIndex + ')');

                    if (nextListItem == null) {
                        nextListItem = self.ul.children('ul li:eq(0)');
                    }

                    var nextItemId = nextListItem.data('itemid');

                    backgroundManager.get('activePlaylist').moveItem(movedItemId, nextItemId);
                }
            });

            this.listenTo(backgroundManager, 'change:activePlaylist', this.reload);
            this.listenTo(backgroundManager.get('allPlaylistItems'), 'add', this.addItem);
            this.listenTo(backgroundManager.get('allPlaylistItems'), 'remove', this.removeItem);

            this.reload();
        },
        
        addItem: function (playlistItem) {
            console.log("addItem is firing");

            var listItem = buildListItem(playlistItem);

            if (this.ul.find('li').length > 0) {

                var previousItemId = playlistItem.get('previousItemId');

                var previousItemLi = this.ul.find('li[data-itemid="' + previousItemId + '"]');
                listItem.insertAfter(previousItemLi);

            } else {
                listItem.appendTo(this.ul);
            }

            this.emptyNotification.hide();
            this.scrollIntoView(item);
            
        },
        
        removeItem: function (playlistItem) {
            console.log("Remove item is firing");
            this.ul.find('li[data-itemid="' + playlistItem.get('id') + '"]').remove();

            if (this.ul.find('li').length === 0) {
                this.emptyNotification.show();
            }

        },
        
        showContextMenu: function (event) {
            
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
        },
        
        showItemContextMenu: function (event) {

            var activePlaylist = backgroundManager.get('activePlaylist');
            var clickedItemId = $(event.currentTarget).data('itemid');
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
            
        },
        
        addItemToStream: function (event) {
            
            //  Add item to stream on dblclick.
            var itemId = $(event.currentTarget).data('itemid');
            var playlistItem = backgroundManager.getPlaylistItemById(itemId);

            StreamItems.add({
                id: _.uniqueId('streamItem_'),
                video: playlistItem.get('video'),
                title: playlistItem.get('title'),
                videoImageUrl: 'http://img.youtube.com/vi/' + playlistItem.get('video').get('id') + '/default.jpg'
            });
            
        },
        
        //  TODO: Reload should be called render.
        //  Refresh all the videos displayed to ensure they GUI matches background's data.
        reload: function () {
            console.log("Reload is firing");

            this.ul.empty();

            var activePlaylist = backgroundManager.get('activePlaylist');

            var listItems = [];

            if (activePlaylist.get('items').length === 0) {
                this.emptyNotification.show();
            } else {
                this.emptyNotification.hide();

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
                this.ul.append(listItems);
            }
            
        },
        
        scrollItemIntoView: function(item) {
            var itemId = item.get('id');
            var $activeItem = this.ul.find('li[data-itemid="' + itemId + '"]');

            if ($activeItem.length > 0) {
                $activeItem.scrollIntoView(true);
            }
        }
        
    });

    //  TODO: This should become a template.
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

    return new PlaylistItemsView;
});