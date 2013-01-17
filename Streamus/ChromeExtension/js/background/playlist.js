//  Playlist objects hold PlaylistItems and are going to be stored in PlaylistCollections.
//  Provides methods to work with PlaylistItems such as getting, removing, updating, shuffling etc..
define(['ytHelper',
        'songManager',
        'playlistItem'],
    function(ytHelper, songManager, PlaylistItem) {
        'use strict';

        //  Call this whenever Player loads/cues a song.
        //  Takes shuffledItems, finds an item to remove by position, and then if there's nothing left
        //  in shuffled items -- reloads the available songs. Helps ensure an even distribution of shuffled items for less repeats.
        function syncShuffledItems(position) {
            this.set('shuffledItems', _.reject(this.shuffledItems, function(s) {
                return s.position === position;
            }));

            if (this.get('shuffledItems').length === 0) {
                this.set('shuffledItems', _.shuffle(this.items));
            }
        }

        var Playlist = Backbone.Model.extend({
            defaults: function() {
                return {
                    id: null,
                    userId: null,
                    title: 'New Playlist',
                    selected: false,
                    position: 0,
                    shuffledItems: [],
                    history: [],
                    items: []
                };
            },
            url: function (type) {
                var urlRoot = this.urlRoot;
                switch(type) {
                    case "POST":
                        break;
                    case "PUT":
                        urlRoot += JSON.stringify(self);
                        break;
                    case "DELETE":
                        break;
                    case "GET":
                        break;
                }
                return urlRoot;
            },
            urlRoot: 'http://localhost:61975/Playlist/',
            initialize: function() {
                //  Our playlistItem data was fetched from the server with the playlist. Need to convert the collection to Backbone Model entities.
                if (this.get('items').length > 0) {

                    this.set('items', _.map(this.get('items'), function(playlistItemData) {
                        var returnValue;
                        //  This is a bit more robust. If any items in our playlist weren't Backbone.Models (could be loaded from server data), auto-convert during init.
                        if (playlistItemData instanceof Backbone.Model) {
                            returnValue = playlistItemData;
                        } else {
                            returnValue = new PlaylistItem(playlistItemData);
                        }
                        return returnValue;
                    }));

                    //  Fetch all the related videos for songs on load. I don't want to save these to the DB because they're bulky and constantly change.
                    //  Data won't appear immediately as it is an async request, I just want to get the process started now.
                    _.each(this.get('items'), function(item) {
                        ytHelper.getRelatedVideos(item.get('videoId'), function(relatedVideos) {
                            item.set('relatedVideos', relatedVideos);
                        });
                    });

                    //  Playlists will remember their length via localStorage w/ their ID.
                    var savedItemPosition = JSON.parse(localStorage.getItem(this.get('id') + '_selectedItemPosition'));
                    this.selectItemByPosition(savedItemPosition !== null ? parseInt(savedItemPosition, 10) : 0);

                    var songIds = _.map(this.get('items'), function(item) {
                        return item.get('songId');
                    });

                    songManager.loadSongs(songIds);

                    this.set('shuffledItems', _.shuffle(this.get('items')));
                }
            },
            validate: function() {
                //  TODO: Validation.
            },
            //  http://danielarandaochoa.com/backboneexamples/blog/2012/08/27/extending-backbone-js-classes/
            save: function (attributes, options) {
                // Keep track of the selected item in localStorage.
                var selectedItem = this.getSelectedItem();
                var selectedItemPosition = selectedItem ? selectedItem.get('position') : null;
                
                var selectedItemStorageKey = this.get('id') + '_selectedItemPosition';
                localStorage.setItem(selectedItemStorageKey, selectedItemPosition);

                return Backbone.Model.prototype.save.call(this, attributes, options);
            },
            selectItemByPosition: function(position) {
                //  Deselect the currently selected item, then select the new item to have selected.
                var currentlySelected = this.getSelectedItem();
                //  currentlySelected is not defined for a brand new playlist since we have no items yet selected.
                if (currentlySelected != null && currentlySelected.get('position') !== position) {
                    currentlySelected.set('selected', false);
                }

                var item = this.getItemByPosition(position);
                console.log("item at position:", item, position);
                
                if (item != null && item.get('selected') === false) {
                    var itemPosition = item.get('position');

                    item.set('selected', true);
                    this.get('history').unshift(item);
                    syncShuffledItems.call(this, itemPosition);
                    localStorage.setItem(this.get('id') + '_selectedItemPosition', itemPosition);
                }

                return item;
            },
            getItemByPosition: function(position) {
                var items = this.get('items');
                console.log("getItemByPosition:", items);
                return _.find(items, function (item) {
                    return item.get('position') === position;
                });
            },
            getRelatedVideo: function() {
                //  Take each playlist item's array of related videos, pluck them all out into a collection of arrays
                //  then flatten the arrays into a collection of songs.
                var relatedVideos = _.flatten(_.map(this.get('items'), function(item) {
                    return item.get('relatedVideos');
                }));

                var randomIndex = Math.floor(Math.random() * relatedVideos.length);
                var randomRelatedVideo = relatedVideos[randomIndex];
                return randomRelatedVideo;
            },
            //TODO: This method name sucks and the method itself is doing too much. Refactor!
            gotoNextItem: function() {
                var nextItem = null;
                var isShuffleEnabled = JSON.parse(localStorage.getItem('isShuffleEnabled')) || false;

                if (isShuffleEnabled === true) {
                    nextItem = this.get('shuffledItems')[0];
                } else {
                    var selectedItem = this.get('history')[0];
                    if (selectedItem) {

                        var nextItemPosition = selectedItem.get('position') + 1;
                        //  2 items in a playlist, positions 0 and 1. Position 1 is the last item, 1 + 1 = playlist length, loop back to front.
                        if (this.get('items').length === nextItemPosition) {
                            nextItemPosition = 0;
                        }
                        nextItem = this.getItemByPosition(nextItemPosition);
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
                    // Goes to the end of the current playlist.
                    var previousItemPosition = selectedItem.get('position') - 1;
                    if (previousItemPosition < 0) {
                        previousItemPosition = this.get('items').length - 1;
                    }
                    previousItem = this.getItemByPosition(previousItemPosition);
                }

                return previousItem;
            },
            addItems: function(songs, callback) {
                var createdPlaylistItems = [];
                var self = this;
                _.each(songs, function(song) {
                    var playlistItem = new PlaylistItem({
                        playlistId: self.get('id'),
                        position: self.get('items').length,
                        videoId: song.videoId,
                        title: song.title,
                        relatedVideos: [],
                        songId: -1,
                        selected: false
                    });
                    createdPlaylistItems.push(playlistItem);

                    ytHelper.getRelatedVideos(playlistItem.get('videoId'), function(relatedVideos) {
                        playlistItem.set('relatedVideos', relatedVideos);
                    });

                    self.get('items').push(playlistItem);
                    self.get('shuffledItems').push(playlistItem);
                    self.set('shuffledItems', _.shuffle(self.get('shuffledItems')));

                    //  Ensure the first playlistItem is selected if adding a bunch of new ones.
                    if (self.get('items').length === 1) {
                        self.selectItemByPosition(0);
                    }
                });

                //  TODO: I don't have a good way of linking my savedSongs back to their playlist item.
                //  I'm using the videoId for now because all the songs that get added, if they have same video id,
                //  must be identical during creation, so its fine to mix up the two.
                songManager.saveSongs(songs, function(savedSongs) {

                    _.each(savedSongs, function(song) {
                        var foundItem = _.find(createdPlaylistItems, function(playlistItem) {
                            return playlistItem.get('videoId') === song.videoId && playlistItem.get('songId') === null;
                        });

                        foundItem.set('videoId', song.videoId);
                    });

                    self.createItems(createdPlaylistItems, callback);
                });
            },
            createItems: function(items, callback) {
                $.ajax({
                    url: 'http://localhost:61975/Playlist/CreateItems',
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
            addItem: function(song, selected) {
                var playlistId = this.get('id');
                var itemCount = this.get('items').length;

                var playlistItem = new PlaylistItem({
                    playlistId: playlistId,
                    position: itemCount,
                    videoId: song.videoId,
                    title: song.title,
                    relatedVideos: []
                });

                ytHelper.getRelatedVideos(playlistItem.get('videoId'), function(relatedVideos) {
                    playlistItem.set('relatedVideos', relatedVideos);
                });

                this.get('items').push(playlistItem);
                this.get('shuffledItems').push(playlistItem);
                this.set('shuffledItems', _.shuffle(this.get('shuffledItems')));

                if (selected) {
                    this.selectItemByPosition(playlistItem.get('position'));
                }

                //TODO: It's clear that I should probably be saving a Song as part of playlistItem, maybe?
                songManager.saveSong(song, function() {
                    $.ajax({
                        type: 'POST',
                        url: 'http://localhost:61975/Playlist/CreateItem',
                        dataType: 'json',
                        data: {
                            playlistId: playlistItem.get('playlistId'),
                            position: playlistItem.get('position'),
                            songId: playlistItem.get('songId'),
                            title: playlistItem.get('title'),
                            videoId: playlistItem.get('videoId')
                        },
                        success: function() {
                        },
                        error: function(error) {
                            console.error(error);
                        }
                    });
                });

                return playlistItem;
            },
            //TODO: What happens if I remove the selected item? I won't have anything selected.
            removeItemByPosition: function(position, callback) {
                //  If localStorage is saving the currently selected item as the one being deleted, clean that up so restarting the program doesn't try and 
                //  select a playlistItem which does not exist.
                if (localStorage.getItem(this.get('id') + '_selectedItemPosition') === position) {
                    localStorage.setItem(this.get('id') + '_selectedItemPosition', null);
                }

                //  I'm removing the item client-side before issuing a command to the server for usability sake.
                //  It is counter-intuitive to the user to click 'Delete' and have lag while the server responds.
                //  TODO: How do I handle a scenario where the server fails to delete by ID?
                this.set('items', _.reject(this.get('items'), function(s) { return s.get('position') === position; }));
                syncShuffledItems.call(this, position);
                var self = this;
                $.ajax({
                    url: 'http://localhost:61975/Playlist/DeleteItemByPosition',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        playlistId: self.get('id'),
                        position: position,
                        userId: self.get('userId')
                    },
                    success: function() {
                        callback(true);
                    },
                    error: function(error) {
                        //  TODO: Rollback client-side transaction somehow?
                        console.error("Delete item unsuccessful", error);
                        callback(false);
                    }
                });
            },
            
            updateItemPosition: function (oldPosition, newPosition, callback) {
                var movedItem = this.getItemByPosition(oldPosition);

                var distance = Math.abs(oldPosition - newPosition);
                console.log("distance:", distance);

                while (distance > 0) {
                    
                    //  Determine if the item moved forward or backward in the list.
                    var itemBeingIteratedUpon;
                    var newItemPosition;
                    
                    if (oldPosition > newPosition) {
                        //  Item moved forward in the list.
                        //  Every item with a position from one less than old position to new position gets incremented by one.
                        
                        itemBeingIteratedUpon = this.getItemByPosition(distance - 1);
                        newItemPosition = itemBeingIteratedUpon.get('position') + 1; 
                    } else {
                        //  Item moved backward in the list.
                        //  Every item from old position to one less than new position gets decremented by one.
                        
                        var positionIndex = newPosition - (distance - 1);
                        itemBeingIteratedUpon = this.getItemByPosition(positionIndex);
                        
                        newItemPosition = itemBeingIteratedUpon.get('position') - 1;
                    }
                    
                    itemBeingIteratedUpon.set('position', newItemPosition);
                    distance--;
                }

                movedItem.set('position', newPosition);
                
                //  Need to update positions server-side with a save after updating client-side list.
                var self = this;
                $.ajax({
                    url: 'http://localhost:61975/Playlist/UpdateItemPosition',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        playlistId: self.get('id'),
                        detachedItems: self.get('items')
                    },
                    success: function() {
                        callback(true);
                    },
                    error: function(error) {
                        //  TODO: Rollback client-side transaction somehow?
                        console.error("Error saving in updateItemPosition", error);
                        callback(false);
                    }
                });
            },
            
            //  Returns the currently selected playlistItem or null if no item was found.
            getSelectedItem: function () {
                var items = this.get('items');
                console.log("items in getSelectedItem:", items);
                var selectedItem = _.find(items, function (item) {
                    return item.get('selected');
                }) || null;
                console.log("selectdItem:", selectedItem);
                return selectedItem;
            }
        });

        return function(config) {
            var playlist = new Playlist(config);

            playlist.on('change:title', function () {
                var self = this;
                $.ajax({
                    url: 'http://localhost:61975/Playlist/UpdateTitle',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        playlistId: self.get('id'),
                        title: self.get('title')
                    },
                    error: function (error) {
                        //  TODO: Rollback client-side transaction somehow?
                        console.error("Error saving title", error);
                    }
                });
            });
            
            return playlist;
        };
    });