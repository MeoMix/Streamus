//  Playlist holds a collection of PlaylistItems as well as properties pertaining to a playlist such as its title and
//  history of videos played. Provides methods to work with PlaylistItems such as getting, removing, updating, etc..
define(['ytHelper',
        'playlistItems',
        'playlistItemsHistory',
        'playlistItem',
        'programState'
    ], function(ytHelper, PlaylistItems, PlaylistItemsHistory, PlaylistItem, programState) {
        'use strict';

        var Playlist = Backbone.Model.extend({
            defaults: function() {
                return {
                    id: null,
                    userId: null,
                    title: 'New Playlist',
                    selected: false,
                    position: -1,
                    history: new PlaylistItemsHistory(),
                    items: new PlaylistItems()
                };
            },

            urlRoot: programState.getBaseUrl() + 'Playlist/',
            
            parse: function (data) {
                if (data.items.length > 0) {
                    //  Reset will load the server's response into items as a Backbone.Collection
                    this.get('items').reset(data.items);

                } else {
                    this.set('items', new PlaylistItems());
                }
                
                // Remove so parse doesn't set and overwrite instance after parse returns.
                delete data.items;
                
                return data;
            },
            initialize: function () {
                var items = this.get('items');

                //  Our playlistItem data was fetched from the server with the playlist. Need to convert the collection to Backbone Model entities.
                if (!(items instanceof Backbone.Collection)) {
                    var playlistItems = new PlaylistItems(items);

                    this.set('items', playlistItems, {
                        //  Silent operation because the playlist isn't technically changing - just being made correct.
                        silent: true
                    });
                }

                //  Now we for sure have a PlaylistItem collection.
                var itemCollection = this.get('items');
                
                if (itemCollection.length > 0) {
                    //  Playlists store selected item client-side because it can change so often.
                    var localStorageKey = this.get('id') + '_selectedItemId';
                    var savedItemId = localStorage.getItem(localStorageKey);

                    //  Select the most recently selected item during initalization.
                    this.selectItemById(savedItemId);
                }
                
                this.on('change:title', function () {
                    $.ajax({
                        url: programState.getBaseUrl() + 'Playlist/UpdateTitle',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            playlistId: this.get('id'),
                            title: this.get('title')
                        },
                        error: function (error) {
                            //  TODO: Rollback client-side transaction somehow?
                            console.error("Error saving title", error);
                        }
                    });
                });

            },

            //  http://danielarandaochoa.com/backboneexamples/blog/2012/08/27/extending-backbone-js-classes/
            save: function(attributes, options) {
                //  Keep track of the selected item in localStorage.
                var selectedItem = this.getSelectedItem();

                console.log("Selected item:", selectedItem);

                var selectedItemId = selectedItem ? selectedItem.get('id') : null;

                var selectedItemStorageKey = this.get('id') + '_selectedItemId';
                localStorage.setItem(selectedItemStorageKey, selectedItemId);

                return Backbone.Model.prototype.save.call(this, attributes, options);
            },

            selectItemById: function (id) {
                console.log("calling selectItemById");
                //  Deselect the currently selected item, then select the new item to have selected.
                var selectedItem = this.getSelectedItem();

                //  currentlySelected is not defined for a brand new playlist since we have no items yet selected.
                if (selectedItem != null && selectedItem.get('id') !== id) {
                    console.log("Deselecting the current item.");
                    selectedItem.set('selected', false);
                }

                var item = this.getItemById(id);
                console.log("item in selectItemById:", item);
                if (item != null && item.get('selected') === false) {
                    console.log("Selecting a new current item.");
                    item.set('selected', true);
                    item.set('playedRecently', true);

                    var history = this.get('history');
                    //  Unshift won't have an effect if item exists in history.
                    history.remove(item, { silent: true });
                    history.unshift(item);

                    localStorage.setItem(this.get('id') + '_selectedItemId', id);
                }

                console.log("returning the selected item.", item);
                return item;
            },

            getItemById: function(id) {
                return this.get('items').get(id);
            },

            getRelatedVideo: function() {
                var relatedVideos = this.get('items').getRelatedVideos();

                var randomIndex = Math.floor(Math.random() * relatedVideos.length);
                var randomRelatedVideo = relatedVideos[randomIndex];
                return randomRelatedVideo;
            },
            
            //  TODO: This method name sucks and the method itself is doing too much. Refactor!
            gotoNextItem: function() {
                var nextItem = null;
                var isShuffleEnabled = JSON.parse(localStorage.getItem('isShuffleEnabled') || false);

                if (isShuffleEnabled === true) {
                    var items = this.get('items');
                    var itemsNotPlayedRecently = items.where(function (item) {
                        return !item.playedRecently;
                    });
                    
                    if (itemsNotPlayedRecently.length === 0) {
                        items.each(function(item) {
                            item.set('playedRecently', false);
                            itemsNotPlayedRecently.push(item);
                        });
                    }

                    nextItem = _.shuffle(itemsNotPlayedRecently)[0];
                } else {
                    console.log("History:", this.get('history'));
                    var selectedItem = this.get('history').at(0);
                    console.log("Selected item from history:", selectedItem);
                    if (selectedItem) {

                        var nextItemPosition = selectedItem.get('position') + 1;
                        //  2 items in a playlist, positions 0 and 1. Position 1 is the last item, 1 + 1 = playlist length, loop back to front.
                        if (this.get('items').length === nextItemPosition) {
                            console.log("resetting my position to 0");
                            nextItemPosition = 0;
                        }

                        nextItem = this.get('items').at(nextItemPosition);
                        console.log("NEXT ITEM:", nextItem);
                    }
                }
                return nextItem;
            },
            
            //  TODO: This method name sucks and the method itself is doing too much. Refactor!
            gotoPreviousItem: function() {
                var selectedItem = this.get('history').shift();
                var previousItem = this.get('history').shift();
                
                //  If no previous item was found in the history, then just go back one item by index.
                if (!previousItem) {
                    //  Goes to the end of the current playlist.
                    var previousItemPosition = selectedItem.get('position') - 1;
                    if (previousItemPosition < 0) {
                        previousItemPosition = this.get('items').length - 1;
                    }

                    previousItem = this.get('items').at(previousItemPosition);
                }

                return previousItem;
            },

            addItems: function(videos, callback) {
                var createdPlaylistItems = [];
                var self = this;
                videos.each(function(video) {
                    var playlistItem = new PlaylistItem({
                        playlistId: self.get('id'),
                        position: self.get('items').length,
                        videoId: video.get('id'),
                        title: video.get('title'),
                        relatedVideos: [],
                        selected: false
                    });
                    createdPlaylistItems.push(playlistItem);

                    ytHelper.getRelatedVideos(playlistItem.get('videoId'), function(relatedVideos) {
                        playlistItem.set('relatedVideos', relatedVideos);
                    });

                    self.get('items').push(playlistItem);

                    //  Ensure the first playlistItem is selected if adding a bunch of new ones.
                    if (self.get('items').length === 1) {
                        var firstItem = self.get('items').at(0);
                        self.selectItemById(firstItem.get('id'));
                    }
                });

                videos.save();
                this.createItems(createdPlaylistItems, callback);
            },

            createItems: function(items, callback) {
                $.ajax({
                    url: programState.getBaseUrl() + 'Playlist/CreateItems',
                    type: 'POST',
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify(items),
                    success: function() {
                        if (callback) {
                            callback();
                        }
                    },
                    error: function(error) {
                        console.error("Saving items was unsuccessful", error);
                    }
                });
            },

            addItem: function(video, selected) {

                var playlistId = this.get('id');
                var itemCount = this.get('items').length;
                var videoId = video.get('id');

                var playlistItem = new PlaylistItem({
                    playlistId: playlistId,
                    position: itemCount,
                    videoId: videoId,
                    title: video.get('title'),
                    relatedVideos: []
                });

                ytHelper.getRelatedVideos(videoId, function (relatedVideos) {
                    playlistItem.set('relatedVideos', relatedVideos);
                });

                this.get('items').push(playlistItem);

                //  TODO: Should probably be saving a Video as part of playlistItem, maybe?
                //  TODO: Backbone documentation conflicts implementation -- need to pass in empty {} here to call save properly.
                console.log("Saving a video.")
                video.save({}, {
                    success: function () {
                        console.log("Saving playlistItem");
                        //  Need to ensure that a video saves to the database before trying to save the item for it.
                        playlistItem.save();
                    }
                });
                
                if (selected) {
                    var playlistItemId = playlistItem.get('id');
                    this.selectItemById(playlistItemId);
                }

                return playlistItem;
            },
            
            //  TODO: What happens if I remove the selected item? I won't have anything selected.
            removeItem: function(item, callback) {
                //  If localStorage is saving the currently selected item as the one being deleted, clean that up so restarting the program doesn't try and 
                //  select a playlistItem which does not exist.
                var playlistId = this.get('id');
                var itemId = item.get('id');
                if (localStorage.getItem(playlistId + '_selectedItemId') === itemId) {
                    localStorage.setItem(playlistId + '_selectedItemId', null);
                }

                //  I'm removing the item client-side before issuing a command to the server for usability sake.
                //  It is counter-intuitive to the user to click 'Delete' and have lag while the server responds.
                //  TODO: How do I handle a scenario where the server fails to delete by ID?
                this.get('items').remove(item);

                item.destroy({
                    success: callback,
                    error: function (error) {
                        console.error(error);
                    }
                });
            },
            
            moveItem: function (itemId, newPosition, callback) {
                console.log("items before moving:", this.get('items'));

                var movedItem = this.get('items').get(itemId);
                
                var oldPosition = movedItem.get('position');
                var movementDirection = oldPosition > newPosition ? 1 : -1;
                console.log("movementDirection:", movementDirection);

                var distance = Math.abs(oldPosition - newPosition);
                console.log("Old position and new position:in ", oldPosition, newPosition);

                for (; distance > 0; distance--) {
                    //  Get a new index based on moving forward or backward.
                    var itemIndex = oldPosition > newPosition ? distance - 1 : newPosition - (distance - 1);
                    console.log("item index:", itemIndex);
                    var item = this.get('items').at(itemIndex);
                    console.log("item:", item);
                    var movedItemPosition = item.get('position') + movementDirection;
                    console.log("Setting " + item.get('title') + "\'s position to " + movedItemPosition);
                    item.set('position', movedItemPosition);
                }

                console.log("Setting " + movedItem.get('title') + "\'s position to " + newPosition);
                movedItem.set('position', newPosition);

                console.log("items after moving:", this.get('items'));

                var self = this;
                this.save({}, {
                    success: function () {
                        console.log("Items after save:", self.get('items'));

                        if (callback) {
                            callback();
                        }
                    },
                    error: function(error) {
                        console.error(error);
                    }                    
                });
            },
            
            //  Returns the currently selected playlistItem or null if no item was found.
            getSelectedItem: function() {
                var items = this.get('items');
                var selectedItem = items.getSelectedItem();
                return selectedItem;
            }
        });

        return function(config) {
            var playlist = new Playlist(config);
            
            return playlist;
        };
    });