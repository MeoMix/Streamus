//  Playlist holds a collection of PlaylistItems as well as properties pertaining to a playlist such as its title and
//  history of videos played. Provides methods to work with PlaylistItems such as getting, removing, updating, etc..
define(['ytHelper',
        'playlistItems',
        'playlistItemsHistory',
        'playlistItem',
        'programState',
        'video'
    ], function(ytHelper, PlaylistItems, PlaylistItemsHistory, PlaylistItem, programState, Video) {
        'use strict';

        var Playlist = Backbone.Model.extend({
            defaults: function() {
                return {
                    id: null,
                    collectionId: null,
                    title: 'New Playlist',
                    selected: false,
                    firstItemId: null,
                    nextListId: null,
                    previousListId: null,
                    history: new PlaylistItemsHistory(),
                    items: new PlaylistItems()
                };
            },

            urlRoot: programState.getBaseUrl() + 'Playlist/',
            
            //  Convert data which is sent from the server back to a proper Backbone.Model.
            //  Need to recreate submodels as Backbone.Models else they will just be regular Objects.
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
                    
                    this.set('items', new PlaylistItems(items), {
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
                            window && console.error("Error saving title", error);
                        }
                    });
                });
                
                this.on('change:firstItemId', function () {
                    console.log("firstItemId has changed, updating");
                    $.ajax({
                        url: programState.getBaseUrl() + 'Playlist/UpdateFirstItemId',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            playlistId: this.get('id'),
                            firstItemId: this.get('firstItemId')
                        },
                        error: function (error) {
                            //  TODO: Rollback client-side transaction somehow?
                            window && console.error("Error saving firstItemId", error);
                        }
                    });
                });

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
                //  Deselect the currently selected item, then select the new item to have selected.
                var selectedItem = this.getSelectedItem();

                //  currentlySelected is not defined for a brand new playlist since we have no items yet selected.
                if (selectedItem != null && selectedItem.get('id') !== id) {
                    selectedItem.set('selected', false);
                }

                var item = this.getItemById(id);

                if (item != null && item.get('selected') === false) {
                    item.set('selected', true);
                    item.set('playedRecently', true);

                    var history = this.get('history');
                    //  Unshift won't have an effect if item exists in history.
                    history.remove(item, { silent: true });
                    history.unshift(item);

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

                    var selectedItem = this.get('history').at(0);

                    if (selectedItem) {
                        var nextItemId = selectedItem.get('nextItemId');
                        nextItem = this.get('items').get(nextItemId);
                    }
                }
                return nextItem;
            },
            
            gotoPreviousItem: function() {
                var selectedItem = this.get('history').shift();
                var previousItem = this.get('history').shift();
                
                //  If no previous item was found in the history, then just go back one item
                if (!previousItem) {
                    var previousItemId = selectedItem.get('previousItemId');
                    previousItem = this.get('items').get(previousItemId);
                }

                return previousItem;
            },

            addItems: function(videos, callback) {
                var createdItems = new PlaylistItems();
                var self = this;

                videos.each(function (video) {

                    var playlistItem = new PlaylistItem({
                        playlistId: self.get('id'),
                        video: video,
                        //  PlaylistItem title is mutable, video title is immutable.
                        title: video.get('title'),
                        relatedVideoInformation: [],
                        selected: false
                    });

                    var playlistItems = self.get('items');
                    var playlistItemId = playlistItem.get('id');
                    if (playlistItems.length === 0) {
                        
                        self.set('firstItemId', playlistItemId);
                        playlistItem.set('nextItemId', playlistItemId);
                        playlistItem.set('previousItemId', playlistItemId);
                    } else {
                        var firstItem = playlistItems.get(self.get('firstItemId'));
                        var lastItem = playlistItems.get(firstItem.get('previousItemId'));

                        lastItem.set('nextItemId', playlistItemId);
                        playlistItem.set('previousItemId', lastItem.get('id'));

                        firstItem.set('previousItemId', playlistItemId);
                        playlistItemId.set('nextItemId', firstItem.get('id'));

                    }

                    createdItems.push(playlistItem);

                    ytHelper.getRelatedVideoInformation(video.get('id'), function (relatedVideoInformation) {
                        playlistItem.set('relatedVideoInformation', relatedVideoInformation);
                    });

                    self.get('items').push(playlistItem);

                    //  Ensure the first playlistItem is selected if adding a bunch of new ones.
                    if (self.get('items').length === 1) {
                        self.selectItemById(self.get('firstItemId'));
                    }
                });
                
                createdItems.save({}, {
                    success: callback,
                    error: function(error) {
                        window && console.error(error);
                    }
                });
            },

            //  This is generally called from the foreground to not couple the Video object with the foreground.
            addItemByInformation: function (videoInformation) {

                //  Strip out the id. An example of $t's contents: tag:youtube.com,2008:video:UwHQp8WWMlg
                var id = videoInformation.media$group.yt$videoid.$t;
                var durationInSeconds = parseInt(videoInformation.media$group.yt$duration.seconds, 10);

                var video = new Video({
                    id: id,
                    title: videoInformation.title.$t,
                    duration: durationInSeconds
                });
                
                return this.addItem(video);
            },

            addItem: function (video) {

                var modifiedItems = new PlaylistItems();

                var playlistId = this.get('id');

                var playlistItem = new PlaylistItem({
                    playlistId: playlistId,
                    video: video,
                    title: video.get('title'),
                    relatedVideoInformation: []
                });
                
                var playlistItems = this.get('items');
                var playlistItemId = playlistItem.get('id');
                if (playlistItems.length === 0) {
                    console.log("setting firstItemId to:", playlistItemId);
                    this.set('firstItemId', playlistItemId);
                    playlistItem.set('nextItemId', playlistItemId);
                    playlistItem.set('previousItemId', playlistItemId);
                } else {
                    var firstItem = playlistItems.get(this.get('firstItemId'));
                    var lastItem = playlistItems.get(firstItem.get('previousItemId'));

                    lastItem.set('nextItemId', playlistItemId);
                    playlistItem.set('previousItemId', lastItem.get('id'));

                    firstItem.set('previousItemId', playlistItemId);
                    playlistItem.set('nextItemId', firstItem.get('id'));
                    modifiedItems.push(firstItem);
                    modifiedItems.push(lastItem);
                }
                
                modifiedItems.push(playlistItem);

                ytHelper.getRelatedVideoInformation(video.get('id'), function (relatedVideoInformation) {
                    playlistItem.set('relatedVideoInformation', relatedVideoInformation);
                });

                this.get('items').push(playlistItem);

                console.log("modified items:", modifiedItems);

                modifiedItems.save();
                
                if (this.get('items').length === 1) {
                    this.selectItemById(this.get('firstItemId'));
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
                
                if (this.get('firstItemId') === itemId) {
                    var newFirstItemId = this.get('items').length === 1 ? '00000000-0000-0000-0000-000000000000' : item.get('nextItemId');
                    this.set('firstItemId', newFirstItemId);
                }

                var previousItem = this.get('items').get(item.get('previousItemId'));
                var nextItem = this.get('items').get(item.get('nextItemId'));
                
                //  Remove the item from our linked list.
                previousItem.set('nextItemId', nextItem.get('id'));
                nextItem.set('previousItemId', previousItem.get('id'));

                //  I'm removing the item client-side before issuing a command to the server for usability sake.
                //  It is counter-intuitive to the user to click 'Delete' and have lag while the server responds.
                //  TODO: How do I handle a scenario where the server fails to delete by ID?
                this.get('items').remove(item);

                item.destroy({
                    success: callback,
                    error: function (error) {
                        window && console.error(error);
                    }
                });
            },
            
            //TODO: Reimplement moveItem without using position.
            //moveItem: function (itemId, newPosition, callback) {
            //    var movedItem = this.get('items').get(itemId);
                
            //    var oldPosition = movedItem.get('position');
            //    var movementDirection = oldPosition > newPosition ? 1 : -1;
                
            //    var distance = Math.abs(oldPosition - newPosition);

            //    for (; distance > 0; distance--) {
            //        //  Get a new index based on moving forward or backward.
            //        var itemIndex = oldPosition > newPosition ? distance - 1 : newPosition - (distance - 1);

            //        var item = this.get('items').at(itemIndex);

            //        var movedItemPosition = item.get('position') + movementDirection;

            //        item.set('position', movedItemPosition);
            //    }

            //    movedItem.set('position', newPosition);

            //    this.save({}, {
            //        success: function () {
            //            if (callback) {
            //                callback();
            //            }
            //        },
            //        error: function(error) {
            //            window && console.error(error);
            //        }                    
            //    });
            //},
            
            //  Returns the currently selected playlistItem or null if no item was found.
            getSelectedItem: function() {
                var items = this.get('items');
                var selectedItem = items.getSelectedItem();
                return selectedItem;
            }
            
        });

        return function (config) {
            var playlist = new Playlist(config);
            
            return playlist;
        };
    });