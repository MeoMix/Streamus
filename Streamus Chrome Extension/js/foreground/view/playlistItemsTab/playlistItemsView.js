//  Represents the videos in a given playlist
define([
    'contextMenuView',
    'backgroundManager',
    'streamItems',
    'playlistItemView'
], function (ContextMenuView, BackgroundManager, StreamItems, PlaylistItemView) {
    'use strict';

    var PlaylistItemsView = Backbone.View.extend({
        
        el: $('#PlaylistItemsView'),
        
        ul: $('#PlaylistItemsView ul'),
        
        emptyNotification: $('#PlaylistItemsView .emptyListNotification'),
        
        events: {
            'contextmenu': 'showContextMenu',
            'contextmenu ul li': 'showItemContextMenu',
            'click ul li': 'addItemToStream'
        },
        
        render: function () {
            this.ul.empty();

            var activePlaylist = BackgroundManager.get('activePlaylist');

            // TODO: Why am I calling render on activePlaylistItems if activePlaylist is null?
            if (activePlaylist === null || activePlaylist.get('items').length === 0) {
                this.emptyNotification.show();
            } else {
                this.emptyNotification.hide();

                var firstItemId = activePlaylist.get('firstItemId');
                var playlistItem = activePlaylist.get('items').get(firstItemId);

                //  Build up the ul of li's representing each playlistItem.
                var listItems = [];
                do {

                    var playlistItemView = new PlaylistItemView({
                        model: playlistItem
                    });

                    var element = playlistItemView.render().el;
                    listItems.push(element);

                    var nextItemId = playlistItem.get('nextItemId');
                    playlistItem = activePlaylist.get('items').get(nextItemId);

                } while (playlistItem && playlistItem.get('id') !== firstItemId)

                //  Do this all in one DOM insertion to prevent lag in large playlists.
                this.ul.append(listItems);
            }

            this.$el.find('img.lazy').lazyload({
                effect : 'fadeIn',
                container: this.$el,
                event: 'scroll manualShow'
            });

            return this;
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

                    BackgroundManager.get('activePlaylist').moveItem(movedItemId, nextItemId);
                }
            });

            this.listenTo(BackgroundManager, 'change:activePlaylist', this.render);
            this.listenTo(BackgroundManager.get('allPlaylistItems'), 'add', this.addItem);
            
            //  TODO: THIS IS INCORRECT. Instead of allPlaylistItems it should be when the activePlaylist is empty, but I need to be able to change the activePlaylist listener.
            this.listenTo(BackgroundManager.get('allPlaylistItems'), 'empty', function () {
                self.emptyNotification.show();
            });

            this.render();
        },
        
        addItem: function (playlistItem) {
            var playlistItemView = new PlaylistItemView({
                model: playlistItem
            });

            var element = playlistItemView.render().$el;

            if (this.ul.find('li').length > 0) {

                var previousItemId = playlistItem.get('previousItemId');

                var previousItemLi = this.ul.find('li[data-itemid="' + previousItemId + '"]');
                element.insertAfter(previousItemLi);

            } else {
                element.appendTo(this.ul);
            }
            
            element.find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: this.$el,
                event: 'scroll manualShow'
            });

            this.emptyNotification.hide();
            this.scrollItemIntoView(playlistItem);
        },
        
        showContextMenu: function (event) {
            
            ContextMenuView.addGroup({
                position: 0,
                items: [{
                    position: 0,
                    text: 'Add Playlist to Stream',
                    onClick: function () {

                        var activePlaylist = BackgroundManager.get('activePlaylist');

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

            var activePlaylist = BackgroundManager.get('activePlaylist');
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
            var playlistItem = BackgroundManager.getPlaylistItemById(itemId);

            StreamItems.add({
                id: _.uniqueId('streamItem_'),
                video: playlistItem.get('video'),
                title: playlistItem.get('title'),
                videoImageUrl: 'http://img.youtube.com/vi/' + playlistItem.get('video').get('id') + '/default.jpg'
            });
            
        },
        
        scrollItemIntoView: function(item) {
            var itemId = item.get('id');
            var activeItem = this.ul.find('li[data-itemid="' + itemId + '"]');

            if (activeItem.length > 0) {
                activeItem.scrollIntoView(true);
            }
        }
        
    });

    return new PlaylistItemsView;
});