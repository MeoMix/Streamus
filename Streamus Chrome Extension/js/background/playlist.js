//  Playlist holds a collection of PlaylistItems as well as properties pertaining to a playlist such as its title and
//  history of videos played. Provides methods to work with PlaylistItems such as getting, removing, updating, etc..
define(['ytHelper',
        'playlistItems',
        'playlistItem',
        'programState',
        'localStorageManager',
        'video',
        'videos',
        'helpers',
        'repeatButtonState',
        'shareCode',
        'shareableEntityType'
], function (ytHelper, PlaylistItems, PlaylistItem, programState, localStorageManager, Video, Videos, helpers, RepeatButtonState, ShareCode, ShareableEntityType) {
        'use strict';

        var playlistModel = Backbone.Model.extend({
            defaults: function() {
                return {
                    id: null,
                    streamId: null,
                    title: 'New Playlist',
                    firstItemId: null,
                    nextPlaylistId: null,
                    previousPlaylistId: null,
                    history: new PlaylistItems(),
                    items: new PlaylistItems(),
                    dataSource: null,
                    dataSourceLoaded: false
                };
            },

            urlRoot: programState.getBaseUrl() + 'Playlist/',
            
            //  Convert data which is sent from the server back to a proper Backbone.Model.
            //  Need to recreate submodels as Backbone.Models else they will just be regular Objects.
            parse: function (playlistDto) {

                //  Convert C# Guid.Empty into BackboneJS null
                for (var key in playlistDto) {
                    if (playlistDto.hasOwnProperty(key) && playlistDto[key] == '00000000-0000-0000-0000-000000000000') {
                        playlistDto[key] = null;
                    }
                }

                if (playlistDto.items.length > 0) {
                    //  Reset will load the server's response into items as a Backbone.Collection
                    this.get('items').reset(playlistDto.items);

                } else {
                    this.set('items', new PlaylistItems());
                }
                
                // Remove so parse doesn't set and overwrite instance after parse returns.
                delete playlistDto.items;
                
                return playlistDto;
            },
            initialize: function () {
                var items = this.get('items');

                //  Our playlistItem data was fetched from the server with the playlist. Need to convert the collection to Backbone Model entities.
                //  TODO: Can I handle this inside of parse?
                if (!(items instanceof Backbone.Collection)) {
                    items = new PlaylistItems(items);
                    
                    this.set('items', items, {
                        //  Silent operation because the playlist isn't technically changing - just being made correct.
                        silent: true
                    });
                }

                //  Debounce because I want automatic typing but no reason to spam server with saves.
                this.on('change:title', _.debounce(function (model, title) {
                    $.ajax({
                        url: programState.getBaseUrl() + 'Playlist/UpdateTitle',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            playlistId: model.get('id'),
                            title: title
                        },
                        error: function (error) {
                            console.error("Error saving title", error);
                        }
                    });
                }, 2000));
                
                this.on('change:firstItemId', function (model, firstItemId) {

                    console.log("First Item ID has changed to:", firstItemId);

                    $.ajax({
                        url: programState.getBaseUrl() + 'Playlist/UpdateFirstItem',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            playlistId: model.get('id'),
                            firstItemId: firstItemId
                        },
                        error: function (error) {
                            console.error("Error saving firstItemId", error, error.message);
                        }
                    });
                    
                });

            },
            
            selectItem: function (playlistItem) {
                playlistItem.set('playedRecently', true);

                var history = this.get('history');
                //  Unshift won't have an effect if item exists in history, so remove silently.
                history.remove(playlistItem, { silent: true });
                history.unshift(playlistItem);
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
            
            //  TODO: I don't like this needing a callback, but it is necessary due to getRelatedVideo requiring a callback to save.
            //  In the future, I think that relatedVideo should be moved out into its own thing, but there are a few dependencies on this right now.
            gotoNextItem: function (callback) {

                var isRadioModeEnabled = localStorageManager.getIsRadioModeEnabled();
                var isShuffleEnabled = localStorageManager.getIsShuffleEnabled();
                var repeatButtonState = localStorageManager.getRepeatButtonState();

                var self = this;

                var setNextItem = function (nextItem) {

                    console.log("nextItem:", nextItem);

                    if (nextItem !== null) {
                        self.selectItem(nextItem);
                    }
                    
                    if (callback) {
                        callback(nextItem);
                    }
                };
                
                //  Radio mode overrides the other settings
                if (isRadioModeEnabled) {
                    
                    var relatedVideo = this.getRelatedVideo();
                    this.addItem(relatedVideo, setNextItem);

                } else {
                    
                    //  If repeat video is enabled then keep on the last item in history
                    if (repeatButtonState === RepeatButtonState.REPEAT_VIDEO_ENABLED) {
                        //  TODO: potentially need to be popping from history so gotoPrevious doesn't loop through same item a lot
                        setNextItem(this.get('history').at(0));
                    }
                    else if (isShuffleEnabled) {

                        var items = this.get('items');
                        var itemsNotPlayedRecently = items.where({ playedRecently: false });

                        if (itemsNotPlayedRecently.length === 0) {
                            items.each(function (item) {
                                item.set('playedRecently', false);
                                itemsNotPlayedRecently.push(item);
                            });
                        }

                        setNextItem(_.shuffle(itemsNotPlayedRecently)[0]);

                    } else {

                        var currentItem = this.get('history').at(0);
                        var nextItemId = currentItem.get('nextItemId');

                        setNextItem(this.get('items').get(nextItemId));

                    }

                }

            },
            
            gotoPreviousItem: function () {
                var selectedItem = this.get('history').shift();
                var previousItem = this.get('history').shift();
                
                //  If no previous item was found in the history, then just go back one item
                if (!previousItem) {
                    var previousItemId = selectedItem.get('previousItemId');
                    previousItem = this.get('items').get(previousItemId);
                }
                
                this.selectItem(previousItem);

                return previousItem;
            },

            //  This is generally called from the foreground to not couple the Video object with the foreground.
            addItemByInformation: function (videoInformation) {

                var video = new Video({
                    videoInformation: videoInformation
                });

                this.addItem(video);
            },

            addItem: function (video, callback) {

                var playlistItem = new PlaylistItem({
                    playlistId: this.get('id'),
                    video: video
                });
                
                var self = this;

                //  Save the playlistItem, but push after version from server because the ID will have changed.
                playlistItem.save({}, {
                    
                    success: function () {

                        //  Update client-side pointers for other items which are affected. The saved playlistItem updates implicitly.
                        var playlistItemId = playlistItem.get('id');
                        var currentItems = self.get('items');
                        
                        if (currentItems.length === 0) {
                            self.set('firstItemId', playlistItemId);
                        } else {
                            var firstItem = currentItems.get(self.get('firstItemId'));
                            var lastItem = currentItems.get(firstItem.get('previousItemId'));
                            
                            lastItem.set('nextItemId', playlistItemId);
                            firstItem.set('previousItemId', playlistItemId);
                        }
                        
                        ytHelper.getRelatedVideoInformation(video.get('id'), function (relatedVideoInformation) {
                            playlistItem.set('relatedVideoInformation', relatedVideoInformation);
                        });

                        self.get('items').push(playlistItem);
  
                        if (callback) {
                            callback(playlistItem);
                        }

                    },
                    
                    error: function(error) {
                        console.error(error);
                    }
                    
                });
            },
            
            addItems: function (videos, callback) {
                var itemsToSave = new PlaylistItems();
                var self = this;

                videos.each(function (video) {

                    var playlistItem = new PlaylistItem({
                        playlistId: self.get('id'),
                        video: video
                    });

                    itemsToSave.push(playlistItem);
                });

                itemsToSave.save({}, {
                    success: function () {
                        
                        var currentItems = self.get('items');

                        console.log("Current items:", currentItems, currentItems.length);
                        console.log("Items to save:", itemsToSave, itemsToSave.length);

                        //  After a bulk save the following properties are still out of date on the playlist:
                        //  -  firstItemId will have changed if playlist items was empty before.
                        //  -  firstItem's lastItemId will have changed if playlist was not empty before.
                        //  -  lastItem's nextItemId will have changed if playlist was not empty before.
                        //if (currentItems.length === 0) {
                        //    //  Silent because the data just came from the sever
                        //    self.set('firstItemId', itemsToSave.at(0).get('id'), {
                        //        silent: true
                        //    });

                        //    console.log("itemsToSave first:", itemsToSave.at(0), itemsToSave);

                        //} else {
                        //    var firstItem = currentItems.get(self.get('firstItemId'));
                        //    var lastItem = currentItems.get(firstItem.get('previousItemId'));

                        //    lastItem.set('nextItemId', itemsToSave.at(0).get('id'));
                        //    firstItem.set('previousItemId', itemsToSave.at(itemsToSave.length - 1).get('id'));

                        //    console.log("first item and list item:", firstItem, lastItem);
                        //}
                        
                        ////  TODO: I think I should be able to just go through .add but it fires the playlistItem constructor oddly.
                        //itemsToSave.each(function (itemToSave) {
                        //    self.get('items').push(itemToSave);
                        //});

                        ////  TODO: Could probably be improved for very large playlists being added.
                        ////  Take a statistically significant sample of the videos added and fetch their relatedVideo information.
                        //var sampleSize = videos.length > 30 ? 30 : videos.length;
                        //var randomSampleIndices = helpers.getRandomNonOverlappingNumbers(sampleSize, videos.length);

                        //_.each(randomSampleIndices, function (randomIndex) {
                        //    var randomVideo = videos.at(randomIndex);

                        //    ytHelper.getRelatedVideoInformation(randomVideo.get('id'), function (relatedVideoInformation) {

                        //        var playlistItem = self.get('items').find(function (item) {
                        //            return item.get('video').get('id') == randomVideo.get('id');
                        //        });

                        //        playlistItem.set('relatedVideoInformation', relatedVideoInformation);
                        //    });
                        //});

                        if (callback) {
                            callback();
                        }

                    },
                    error: function (error) {
                        console.error("There was an issue saving" + self.get('title'), error);
                    }
                });
            },
            
            moveItem: function (movedItemId, nextItemId) {
                
                var movedItem = this.get('items').get(movedItemId);
                
                //  The previous and next items of the movedItem's original position. Need to update these pointers.
                var movedPreviousItem = this.get('items').get(movedItem.get('previousItemId'));
                var movedNextItem = this.get('items').get(movedItem.get('nextItemId'));
                
                movedPreviousItem.set('nextItemId', movedNextItem.get('id'));
                movedNextItem.set('previousItemId', movedPreviousItem.get('id'));
                
                //  The item right in front of movedItem which got 'bumped forward 1' after the move.
                var nextItem = this.get('items').get(nextItemId);

                var previousItemId = nextItem.get('previousItemId');
                //  The item right behind movedItem which stayed in the same position.
                var previousItem = this.get('items').get(nextItem.get('previousItemId'));

                //  Fix the movedItem's pointers.
                nextItem.set('previousItemId', movedItemId);
                movedItem.set('nextItemId', nextItemId);
                movedItem.set('previousItemId', previousItemId);
                previousItem.set('nextItemId', movedItemId);

                //  If bumped forward the firstItem, update to new firstItemId.
                if (nextItemId == this.get('firstItemId')) {
                    //  This saves automatically with a triggered event.
                    this.set('firstItemId', movedItemId);
                }
                
                //  Save just the items that changed -- don't save the whole playlist because that is too costly for a move.
                var itemsToSave = new PlaylistItems();
                itemsToSave.add(movedItem);
                itemsToSave.add(movedPreviousItem);
                itemsToSave.add(movedNextItem);
                itemsToSave.add(nextItem);
                itemsToSave.add(previousItem);
                
                itemsToSave.save({}, {
                    success: function() {
                        
                    },
                    error: function (error) {
                        console.error(error);
                    }
                });
            },
            
            getShareCode: function(callback) {

                var self = this;
                $.ajax({
                    url: programState.getBaseUrl() + 'ShareCode/GetShareCode',
                    type: 'GET',
                    dataType: 'json',
                    data: {
                        entityType: ShareableEntityType.PLAYLIST,
                        entityId: self.get('id')
                    },
                    success: function (shareCodeJson) {
                        var shareCode = new ShareCode(shareCodeJson);

                        callback(shareCode);
                    },
                    error: function (error) {
                        console.error("Error retrieving share code", error, error.message);
                    }
                });

            }
        });

        return function (config) {
            var playlist = new playlistModel(config);
            
            return playlist;
        };
    });