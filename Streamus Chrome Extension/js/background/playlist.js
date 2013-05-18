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
        'repeatButtonStates'
    ], function(ytHelper, PlaylistItems, PlaylistItem, programState, localStorageManager, Video, Videos, helpers, repeatButtonStates) {
        'use strict';

        var playlistModel = Backbone.Model.extend({
            defaults: function() {
                return {
                    id: null,
                    streamId: null,
                    title: 'New Playlist',
                    firstItemId: null,
                    nextListId: null,
                    previousListId: null,
                    history: new PlaylistItems(),
                    items: new PlaylistItems(),
                    dataSource: null,
                    dataSourceLoaded: false
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
                            //  TODO: Rollback client-side transaction somehow?
                            window && console.error("Error saving title", error);
                        }
                    });
                }, 2000));
                
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
                            window && console.error("Error saving firstItemId", error, error.message);
                        }
                    });
                    
                });

                var self = this;
                this.get('items').on('remove', function (removedItem) {
                    var playlistItems = self.get('items');
                        
                    if (playlistItems.length > 0) {
                        
                        //  Update firstItem if it was removed
                        if (self.get('firstItemId') === removedItem.get('id')) {
                            self.set('firstItemId', removedItem.get('nextItemId'));
                        }
                        
                        //  Update linked list pointers
                        var previousItem = playlistItems.get(removedItem.get('previousItemId'));
                        var nextItem = playlistItems.get(removedItem.get('nextItemId'));

                        //  Remove the item from linked list.
                        previousItem.set('nextItemId', nextItem.get('id'));
                        nextItem.set('previousItemId', previousItem.get('id'));

                    } else {
                        self.set('firstItemId', '00000000-0000-0000-0000-000000000000');
                    }

                });
                
                //  Load videos from datasource if provided.
                var dataSource = this.get('dataSource');

                if (dataSource != null) {
                    var ytHelperDataFunction = null;

                    switch (dataSource.type) {
                        case DataSources.YOUTUBE_PLAYLIST:
                            ytHelperDataFunction = ytHelper.getPlaylistResults;
                            break;
                        case DataSources.YOUTUBE_CHANNEL:
                            ytHelperDataFunction = ytHelper.getFeedResults;
                            break;
                        default:
                            window && console.error("Unhandled dataSource type:", dataSource.type);
                    }
                    
                    if (ytHelperDataFunction != null) {

                        var getVideosCallCount = 0;
                        var unsavedVideoCount = 0;
                        var orderedVideosArray = [];

                        var getVideosInterval = setInterval(function () {

                            ytHelperDataFunction(dataSource.id, getVideosCallCount, function (results) {

                                //  Results will be null if an error occurs while fetching data.
                                if (results == null || results.length === 0) {
                                    clearInterval(getVideosInterval);
                                    self.set('dataSourceLoaded', true);
                                } else {

                                    _.each(results, function (entry, index) {
                                        var videoId = entry.media$group.yt$videoid.$t;
                                        addVideoByIdAtIndex(videoId, entry.title.$t, index, results.length);
                                    });

                                    getVideosCallCount++;
                                }

                            });

                            function addVideoByIdAtIndex(videoId, videoTitle, index, resultCount) {
                                ytHelper.getVideoInformation(videoId, videoTitle, function (videoInformation) {

                                    if (videoInformation != null) {
                                        var video = getVideoFromInformation(videoInformation);
                                        //  Insert at index to preserve order of videos retrieved from YouTube API
                                        orderedVideosArray[index] = video;
                                    }

                                    unsavedVideoCount++;

                                    //  Periodicially send bursts of packets (up to 50 videos in length) to the server and trigger visual update.
                                    if (unsavedVideoCount == resultCount) {

                                        var videos = new Videos(orderedVideosArray);
                                        
                                        //  orderedVideosArray may have some empty slots which get converted to empty Video objects; drop 'em.
                                        var videosWithIds = videos.withIds();
                                        
                                        self.addItems(videosWithIds);
                                        orderedVideosArray = [];
                                        unsavedVideoCount = 0;
                                    }

                                });
                            }

                            //  TODO: Rewrite the Video constructor such that it can create a Video object from videoInformation
                            function getVideoFromInformation(videoInformation) {
                                var id = videoInformation.media$group.yt$videoid.$t;
                                var durationInSeconds = parseInt(videoInformation.media$group.yt$duration.seconds, 10);
                                var author = videoInformation.author[0].name.$t;

                                return new Video({
                                    id: id,
                                    title: videoInformation.title.$t,
                                    duration: durationInSeconds,
                                    author: author
                                });
                            }


                        }, 4000);
                    }
                }

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
            
            gotoNextItem: function () {

                var nextItem = null;

                var isRadioModeEnabled = localStorageManager.getIsRadioModeEnabled();
                var isShuffleEnabled = localStorageManager.getIsShuffleEnabled();
                var repeatButtonState = localStorageManager.getRepeatButtonState();
                
                //  Radio mode overrides the other settings
                if (isRadioModeEnabled) {
                    var relatedVideo = this.getRelatedVideo();
                    nextItem = this.addItem(relatedVideo);
                } else {
                    //  If repeat video is enabled then keep on the last item in history
                    if (repeatButtonState === repeatButtonStates.REPEAT_VIDEO_ENABLED) {
                        //  TODO: potentially need to be popping from history so gotoPrevious doesn't loop through same item a lot
                        nextItem = this.get('history').at(0);
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

                        nextItem = _.shuffle(itemsNotPlayedRecently)[0];

                    } else {

                        var currentItem = this.get('history').at(0);
                        var nextItemId = currentItem.get('nextItemId');
                        var firstItemId = this.get('firstItemId');
                        
                        if (nextItemId === firstItemId && repeatButtonState === repeatButtonStates.REPEAT_PLAYLIST_ENABLED) {
                            nextItem = this.get('items').get(nextItemId);
                        }
                        else if (nextItemId !== firstItemId) {
                            nextItem = this.get('items').get(nextItemId);
                        }

                    }

                }
                
                if (nextItem !== null) {
                    this.selectItem(nextItem);
                }

                return nextItem;
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

                //  Strip out the id. An example of $t's contents: tag:youtube.com,2008:video:UwHQp8WWMlg
                var id = videoInformation.media$group.yt$videoid.$t;
                var durationInSeconds = parseInt(videoInformation.media$group.yt$duration.seconds, 10);
                var author = videoInformation.author[0].name.$t;

                var video = new Video({
                    type: 'youTubeApi',
                    id: id,
                    title: videoInformation.title.$t,
                    duration: durationInSeconds,
                    author: author
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
            
            addItems: function (videos, callback) {
                var itemsToSave = new PlaylistItems();
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
                        //  This triggers an event which saves the firstItemId
                        self.set('firstItemId', playlistItemId);
                        playlistItem.set('nextItemId', playlistItemId);
                        playlistItem.set('previousItemId', playlistItemId);
                    } else {
                        var firstItem = playlistItems.get(self.get('firstItemId'));
                        var lastItem = playlistItems.get(firstItem.get('previousItemId'));

                        lastItem.set('nextItemId', playlistItemId);
                        playlistItem.set('previousItemId', lastItem.get('id'));

                        firstItem.set('previousItemId', playlistItemId);
                        playlistItem.set('nextItemId', firstItem.get('id'));

                        itemsToSave.add(firstItem, { merge: true });
                        itemsToSave.add(lastItem, { merge: true });
                    }

                    itemsToSave.push(playlistItem);
                    self.get('items').push(playlistItem);
                });

                //  TODO: Could probably be improved for very large playlists being added.
                //  Take a statistically significant sample of the videos added and fetch their relatedVideo information.
                var sampleSize = videos.length > 30 ? 30 : videos.length;
                var randomSampleIndices = helpers.getRandomNonOverlappingNumbers(sampleSize, videos.length);

                _.each(randomSampleIndices, function (randomIndex) {
                    var randomVideo = videos.at(randomIndex);
                    
                    ytHelper.getRelatedVideoInformation(randomVideo.get('id'), function (relatedVideoInformation) {

                        var playlistItem = self.get('items').find(function (item) {
                            return item.get('video').get('id') == randomVideo.get('id');
                        });

                        playlistItem.set('relatedVideoInformation', relatedVideoInformation);
                    });
                });

                itemsToSave.save({}, {
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
                        window && console.error(error);
                    }
                });
            }
        });

        return function (config) {
            var playlist = new playlistModel(config);
            
            return playlist;
        };
    });