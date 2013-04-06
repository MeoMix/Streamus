//  Playlist holds a collection of PlaylistItems as well as properties pertaining to a playlist such as its title and
//  history of videos played. Provides methods to work with PlaylistItems such as getting, removing, updating, etc..
define(['ytHelper',
        'playlistItems',
        'playlistItem',
        'programState',
        'localStorageManager',
        'video'
    ], function(ytHelper, PlaylistItems, PlaylistItem, programState, localStorageManager, Video) {
        'use strict';

        var playlistModel = Backbone.Model.extend({
            defaults: {
                id: null,
                streamId: null,
                title: 'New Playlist',
                firstItemId: null,
                nextListId: null,
                previousListId: null,
                history: new PlaylistItems(),
                items: new PlaylistItems()
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
                //  TODO: Can I handle this inside of parse?
                if (!(items instanceof Backbone.Collection)) {
                    items = new PlaylistItems(items);
                    
                    this.set('items', items, {
                        //  Silent operation because the playlist isn't technically changing - just being made correct.
                        silent: true
                    });
                }

                this.on('change:title', function (model, title) {
                    $.ajax({
                        url: programState.getBaseUrl() + 'Playlist/UpdateTitle',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            playlistId: model.get('id'),
                            title: title
                        },
                        error: function (error) {
                            //  TODO: Rollback client-side transaction somehow?
                            window && console.error("Error saving title", error);
                        }
                    });
                });
                
                this.on('change:firstItemId', function (model, firstItemId) {

                    $.ajax({
                        url: programState.getBaseUrl() + 'Playlist/UpdateFirstItemId',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            playlistId: model.get('id'),
                            firstItemId: firstItemId
                        },
                        error: function (error) {
                            //  TODO: Rollback client-side transaction somehow?
                            window && console.error("Error saving firstItemId", error);
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
            
            //  TODO: This method name sucks and the method itself is doing too much. Refactor!
            gotoNextItem: function() {
                var nextItem = null;
                var isShuffleEnabled = localStorageManager.getIsShuffleEnabled();

                if (isShuffleEnabled === true) {
                    var items = this.get('items');
                    var itemsNotPlayedRecently = items.where({ playedRecently: false });

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
                        relatedVideoInformation: []
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

                modifiedItems.save();
               
                return playlistItem;
            },

            //  Skips to the next playlistItem. Will start playing the video if the player was already playing.
            //  if where == "next" it'll skip to the next item otherwise it will skip to the previous.
            //  TODO: break apart skipItem into a gotoNextItem and a gotoPreviousItem
            skipItem: function (where) {
                var nextItem;

                if (where == "next") {
                    var isRadioModeEnabled = localStorageManager.getIsRadioModeEnabled();

                    if (isRadioModeEnabled) {
                        var relatedVideo = this.getRelatedVideo();
                        nextItem = this.addItem(relatedVideo);
                    } else {

                        nextItem = this.gotoNextItem();
                    }
                } else {
                    nextItem = this.gotoPreviousItem();
                }

                this.selectItem(nextItem);
                return nextItem;
            },
            
            //  TODO: This is getting bulky...
            removeItem: function (item, callback) {

                if (this.get('firstItemId') === item.get('id')) {
                    //  length of 1 here because we're about to remove an item.
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
                    this.set('firstItemId', movedItemId);
                }

                this.save();
            }
        });

        return function (config) {
            var playlist = new playlistModel(config);
            
            return playlist;
        };
    });