//  Playlist holds a collection of PlaylistItems as well as properties pertaining to a playlist such as its title and
//  history of videos played. Provides methods to work with PlaylistItems such as getting, removing, updating, etc..
define(['ytHelper',
        'videoManager',
        'playlistItems',
        'playlistItemsHistory',
        'playlistItem',
        'programState',
        'loginManager'
    ], function(ytHelper, videoManager, PlaylistItems, PlaylistItemsHistory, PlaylistItem, programState, loginManager) {
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
                    items: new PlaylistItems(),
                    shuffledItems: new PlaylistItems()
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

            },

            //  http://danielarandaochoa.com/backboneexamples/blog/2012/08/27/extending-backbone-js-classes/
            save: function(attributes, options) {
                //  Keep track of the selected item in localStorage.
                var selectedItem = this.getSelectedItem();
                var selectedItemId = selectedItem ? selectedItem.get('id') : null;

                var selectedItemStorageKey = this.get('id') + '_selectedItemId';
                localStorage.setItem(selectedItemStorageKey, selectedItemId);

                return Backbone.Model.prototype.save.call(this, attributes, options);
            },

            selectItemById: function (id) {
                console.log("SELECTING ITEM BY ID:", id);
                //  Deselect the currently selected item, then select the new item to have selected.
                var selectedItem = this.getSelectedItem();
                console.log("CURRENTLY SELECTED:", selectedItem);
                //  currentlySelected is not defined for a brand new playlist since we have no items yet selected.
                if (selectedItem != null && selectedItem.get('id') !== id) {
                    selectedItem.set('selected', false);
                }

                var item = this.getItemById(id);

                console.log("Selecting an item by ID:", item);
                if (item != null && item.get('selected') === false) {
                    item.set('selected', true);
                    console.log("unshifting item onto history", item);
                    var history = this.get('history');
                    //  Unshift won't have an effect if item exists in history.
                    history.remove(item, { silent: true });
                    history.unshift(item);

                    syncShuffledItems.call(this, id);
                    localStorage.setItem(this.get('id') + '_selectedItemId', id);
                }

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
            
            //TODO: This method name sucks and the method itself is doing too much. Refactor!
            gotoNextItem: function() {
                var nextItem = null;
                var isShuffleEnabled = JSON.parse(localStorage.getItem('isShuffleEnabled') || false);

                if (isShuffleEnabled === true) {
                    nextItem = this.get('shuffledItems').at(0);
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
                //  Move the currently playing item out of history and into the front of shuffledItems so that if
                //  a user clicks 'next' or plays forward the item that was ahead will still be ahead instead of random item.

                var selectedItem = this.get('history').shift();
                this.get('shuffledItems').unshift(selectedItem);

                //  Get the previous item by history if possible.
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

                    var shuffledItems = self.get('shuffledItems');
                    shuffledItems.push(playlistItem);
                    shuffledItems.shuffle();

                    //  Ensure the first playlistItem is selected if adding a bunch of new ones.
                    if (self.get('items').length === 1) {
                        var firstItem = self.get('items').at(0);
                        self.selectItemById(firstItem.get('id'));
                    }
                });

                videoManager.saveVideos(videos);
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
                videoManager.loadVideo(videoId);

                var shuffledItems = this.get('shuffledItems');
                shuffledItems.push(playlistItem);
                //TODO: Can I chain?
                shuffledItems.shuffle();

                if (selected) {
                    var playlistItemId = playlistItem.get('id');
                    this.selectItemById(playlistItemId);
                }

                //TODO: Should probably be saving a Video as part of playlistItem, maybe?
                videoManager.saveVideo(video, function () {
                    //  Need to ensure that a video saves to the database before trying to save the item for it.
                    playlistItem.save();
                });
                

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

                syncShuffledItems.call(this, itemId);

                item.destroy({
                    data: $.param({
                        playlistId: playlistId,
                        userId: loginManager.get('user').get('id')
                    }),
                    success: callback,
                    error: function (error) {
                        console.error(error);
                    }
                });
            },
            
            moveItem: function (itemId, newPosition, callback) {
                var playlistItems = this.get('items');

                var movedItem = playlistItems.get(itemId);
                var oldPosition = movedItem.get('position');
                console.log("old position:", oldPosition);

                var distance = Math.abs(oldPosition - newPosition);

                console.log("Distance being moved:", distance);

                while (distance > 0) {
                    
                    //  Determine if the item moved forward or backward in the list.
                    var itemBeingIteratedUpon;
                    var newItemPosition;

                    if (oldPosition > newPosition) {
                        //  Every item with a position from one less than old position to new position gets incremented by one.

                        itemBeingIteratedUpon = playlistItems.at(distance - 1);
                        newItemPosition = itemBeingIteratedUpon.get('position') + 1;
                    } else {
                        //  Every item from old position to one less than new position gets decremented by one.

                        var positionIndex = newPosition - (distance - 1);
                        console.log("position index:", positionIndex);

                        itemBeingIteratedUpon = playlistItems.at(positionIndex);
                        newItemPosition = itemBeingIteratedUpon.get('position') - 1;
                    }

                    itemBeingIteratedUpon.set('position', newItemPosition);
                    console.log("Setting " + itemBeingIteratedUpon.get('title') + " to " + newItemPosition);
                    distance--;
                }

                console.log("Setting " + movedItem.get('title') + " to:", newPosition);
                movedItem.set('position', newPosition);

                var playlistId = this.get('id');

                //  Need to update positions server-side with a save after updating client-side list.
                $.ajax({
                    url: programState.getBaseUrl() + 'Playlist/UpdateItemPosition',
                    type: 'POST',
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify({
                        playlistId: playlistId,
                        detachedItems: playlistItems
                    }),
                    success: function () {
                        callback(true);
                    },
                    error: function (error) {
                        //  TODO: Rollback client-side transaction somehow?
                        console.error(error);
                        callback(false);
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
        

        //  Called whenever Player loads/cues a video. Takes shuffledItems, finds an item to remove by id,
        //  and then if there's nothing left in shuffled items -- reloads the available videos.
        //  Helps ensure an even distribution of shuffled items for less repeats.

        function syncShuffledItems(itemId) {
            var shuffledItems = this.get('shuffledItems');

            var item = shuffledItems.get(itemId);
            shuffledItems.remove(item);

            //  TODO: Event listener?
            //  When all videos have been played once in shuffle mode, reset the shuffle playlist. Helps provide even distribution of 'random'
            if (shuffledItems.length === 0) {
                var items = this.get('items');
                loadShuffledItems.call(this, items);
            }
        }

        function loadShuffledItems(items) {
            console.log("loadShuffledItems items", items);
            //  I keep track of shuffledItems in its own collection because the logic for keeping
            //  track of shuffled state gets a bit more complicated than one would expect.
            var shuffledItemPositions = _.shuffle(items.pluck('position'));

            //  TODO: Can I improve the O(n) of this? It's pretty atrocious.
            var shuffledItemArray = _.map(shuffledItemPositions, function (position) {
                return items.at(position);
            });

            console.log("shuffledItemArray:", shuffledItemArray);
            
            if (shuffledItemArray.length > 0) {
                this.get('shuffledItems').reset(shuffledItemArray);
            } else {
                this.get('shuffledItems').reset();
            }
        }

        return function(config) {
            var playlist = new Playlist(config);
            console.log("Created playlist with config:", playlist, config);

            //  Call this after initialize because items has to be for sure a Backbone.Collection
            var items = playlist.get('items');

            loadShuffledItems.call(playlist, items);

            playlist.on('change:title', function() {
                $.ajax({
                    url: programState.getBaseUrl() + 'Playlist/UpdateTitle',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        playlistId: this.get('id'),
                        title: this.get('title')
                    },
                    error: function(error) {
                        //  TODO: Rollback client-side transaction somehow?
                        console.error("Error saving title", error);
                    }
                });
            });

            return playlist;
        };
    });