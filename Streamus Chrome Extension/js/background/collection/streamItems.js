var StreamItems;

define(['streamItem', 'settingsManager', 'repeatButtonState', 'ytHelper', 'video', 'player'], function (StreamItem, settingsManager, RepeatButtonState, ytHelper, Video, player) {
    'use strict';

    var streamItemsCollection = Backbone.Collection.extend({
        model: StreamItem,
        
        initialize: function () {
            //  Give StreamItems a history: https://github.com/jashkenas/backbone/issues/1442
            _.extend(this, { history: [] });

            var self = this;
            
            this.on('add', function (addedStreamItem) {

                //  Ensure only one streamItem is selected at a time by de-selecting all other selected streamItems.
                if (addedStreamItem.get('selected')) {
                    addedStreamItem.trigger('change:selected', addedStreamItem, true);
                }

                //  If the Stream has any items in it, one should be selected.
                if (self.length === 1) {
                    addedStreamItem.set('selected', true);
                    player.play();
                }

                //  TODO: I used to take a sample of items for bulk add. I think that this will cause network issues if a user enqueues their playlist.
                ytHelper.getRelatedVideoInformation(addedStreamItem.get('video').get('id'), function (relatedVideoInformation) {
                    addedStreamItem.set('relatedVideoInformation', relatedVideoInformation);
                });

            });

            this.on('change:selected', function (changedStreamItem, selected) {
                console.log("This on change selected:", changedStreamItem, selected);
                //  Ensure only one streamItem is selected at a time by de-selecting all other selected streamItems.
                if (selected) {
                    this.deselectAllExcept(changedStreamItem.cid);
                }

            });

            this.on('remove', function (removedStreamItem) {
                if (this.length === 0) {
                    console.log("triggering empty", this);
                    this.trigger('empty');
                }

                if (removedStreamItem.get('selected') && this.length > 0) {
                    this.selectNext();
                }
            });
            
            this.on('change:playedRecently', function () {
            
                //  When all streamItems have been played recently, reset to not having been played recently.
                //  Allows for de-prioritization of played streamItems during shuffling.
                if (self.where({ playedRecently: true }).length === this.length) {
                    self.each(function(streamItem) {
                        streamItem.set('playedRecently', false);
                    });
                }

            });

        },
        
        deselectAllExcept: function (streamItemCid) {
            
            this.each(function (streamItem) {
                console.log("Cid and streamCid:", streamItem.cid, streamItemCid);
                if (streamItem.cid != streamItemCid) {
                    streamItem.set('selected', false);
                }

            });
            
        },
        
        getRandomRelatedVideo: function () {
            
            //  Take each streamItem's array of related videos, pluck them all out into a collection of arrays
            //  then flatten the arrays into a collection of videos.
            var relatedVideos = _.flatten(this.map(function (streamItem) {

                return _.map(streamItem.get('relatedVideoInformation'), function (relatedVideoInformation) {

                    return new Video({
                        videoInformation: relatedVideoInformation
                    });
                    
                });

            }));

            //  Don't add any videos that are already in the stream.
            var self = this;
            relatedVideos = _.filter(relatedVideos, function (relatedVideo) {
                var alreadyExistingItem = self.find(function (streamItem) {
                    var sameVideoId = streamItem.get('video').get('id') === relatedVideo.get('id');
                    //  TODO: I don't think this does quite what I want it to do.
                    //var similiarVideoName = levDistance(item.get('video').get('title'), relatedVideo.get('title')) < 3;

                    return sameVideoId; // || similiarVideoName;
                });

                return alreadyExistingItem == null;
            });
            
            // Try to filter out 'playlist' songs, but if they all get filtered out then back out of this assumption.
            var tempFilteredRelatedVideos = _.filter(relatedVideos, function(relatedVideo) {
                //  assuming things >8m are playlists.
                var isJustOneSong = relatedVideo.get('duration') < 480;
                var isNotLive = relatedVideo.get('title').toLowerCase().indexOf('live') === -1;
                
                return isJustOneSong && isNotLive;
            });
            
            if (tempFilteredRelatedVideos.length !== 0) {
                relatedVideos = tempFilteredRelatedVideos;
            }

            return relatedVideos[_.random(0, relatedVideos.length)];;
        },
        
        selectNext: function () {
   
            var repeatButtonState = settingsManager.get('repeatButtonState');
                
            if (repeatButtonState === RepeatButtonState.REPEAT_VIDEO_ENABLED) {
                var selectedItem = this.findWhere({ selected: true });
                selectedItem.trigger('change:selected', selectedItem, true);
            } else if (settingsManager.get('shuffleEnabled')) {

                var shuffledItems = _.shuffle(this.where({ playedRecently: false }));
                shuffledItems[0].set('selected', true);

            } else {
                //  Select the next item by index. Potentially loop around to the front.
                var selectedItemIndex = this.indexOf(this.findWhere({ selected: true }));

                if (selectedItemIndex + 1 === this.length) {
                        
                    if (repeatButtonState === RepeatButtonState.REPEAT_STREAM_ENABLED) {
                        this.at(0).set('selected', true);
                            
                        //  Only one item in the playlist and it was already selected, resend selected trigger.
                        if (this.length == 1) {
                            this.at(0).trigger('change:selected', this.at(0), true);
                        }
                    } else if (settingsManager.get('radioModeEnabled')) {

                        var randomRelatedVideo = this.getRandomRelatedVideo();

                        this.add({
                            video: randomRelatedVideo,
                            title: randomRelatedVideo.get('title'),
                            videoImageUrl: 'http://img.youtube.com/vi/' + randomRelatedVideo.get('id') + '/default.jpg',
                            selected: true
                        });

                    }

                } else {
                    this.at(selectedItemIndex + 1).set('selected', true);
                }

            }

        },
        
        selectPrevious: function() {

            //  Peel off currentStreamItem from the top of history.
            this.history.shift();
            var previousStreamItem = this.history.shift();
            
            //  If no previous item was found in the history, then just go back one item
            if (previousStreamItem == null) {

                var repeatButtonState = settingsManager.get('repeatButtonState');

                if (repeatButtonState === RepeatButtonState.REPEAT_VIDEO_ENABLED) {
                    var selectedItem = this.findWhere({ selected: true });
                    selectedItem.trigger('change:selected', selectedItem, true);
                } else if (settingsManager.get('shuffleEnabled')) {

                    var shuffledItems = _.shuffle(this.where({ playedRecently: false }));
                    shuffledItems[0].set('selected', true);

                } else {
                    //  Select the previous item by index. Potentially loop around to the back.
                    var selectedItemIndex = this.indexOf(this.findWhere({ selected: true }));

                    if (selectedItemIndex === 0) {

                        if (repeatButtonState === RepeatButtonState.REPEAT_STREAM_ENABLED) {
                            this.at(this.length - 1).set('selected', true);
                        }

                    } else {
                        this.at(selectedItemIndex - 1).set('selected', true);
                    }

                }

            } else {
                previousStreamItem.set('selected', true);
            }


        }
    });

    StreamItems = new streamItemsCollection;

    return StreamItems;
});