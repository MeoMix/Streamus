define(['playlistItem', 'ytHelper', 'video', 'videos', 'levenshtein', 'programState', 'helpers'],
    function (PlaylistItem, ytHelper, Video, Videos, levDistance, programState, helpers) {
        'use strict';

    var playlistItemsCollection = Backbone.Collection.extend({
        model: PlaylistItem,
        
        save: function (attributes, options) {
            
            //  TODO: This doesn't support saving old items yet -- only a bunch of brand new ones.
            if (this.filter(function(item) {
                return !item.isNew();
            }).length > 0) {
                throw "Not Supported Yet";
            }

            var newItems = this.filter(function (item) {
                return item.isNew();
            });

            var newItemsJqXhr = false;
            if (newItems.length === 1) {
                //  Default to Backbone if Collection is creating only 1 item.
                newItems[0].save({}, {
                    success: options ? options.success : null,
                    error: options ? options.error : null
                });
            }
            else if (newItems.length > 1) {
                
                //  Otherwise revert to a CreateMultiple
                newItemsJqXhr = $.ajax({
                    url: programState.getBaseUrl() + 'PlaylistItem/CreateMultiple',
                    type: 'POST',
                    dataType: 'json',
                    data: JSON.stringify(newItems),
                    error: options ? options.error : null
                });
                
            }

            $.when(newItemsJqXhr).done(function (createdItems) {
   
                if (createdItems) {

                    //var getCharCodes = function (s) {

                    //    var cc = [];

                    //    for (var i = 0; i < s.length; ++i)
                    //        cc[i] = s.charCodeAt(i);

                    //    return cc;
                    //};
                    
                    //  For each of the createdItems, remap properties back to the old items.
                    _.each(createdItems, function (createdItem) {

                        var matchingItemToCreate = _.find(newItems, function (newItem) {

                            //console.log("new item:", newItem.get('title'), getCharCodes(newItem.get('title')));
                            //console.log("Created item:", createdItem.title, getCharCodes(createdItem.title));

                            //  If two items have the same title then they're equal -- skip ones already set to a savedItem by checking isNew
                            return newItem.get('title') == createdItem.title && newItem.isNew();
                        });

                        //console.log("Created Item:", createdItem);
                        //console.log("newItems:", newItems);
                        //console.log("MatchingItemToCreate:", matchingItemToCreate);
                        


                        //  Call parse to emulate going through the Model's save logic.
                        var parsedCreatedItem = matchingItemToCreate.parse(createdItem);

                        console.log("parsed create item:", parsedCreatedItem);

                        //  Call set to move attributes from parsedCreatedItem to matchingItemToCreate.
                        matchingItemToCreate.set(parsedCreatedItem);

                    });

                    //  TODO: Pass intelligent paramaters back to options.success
                    if (options.success) {
                        options.success();
                    }
                    
                }

            });

        },

        getRelatedVideos: function() {
            //  Take each playlist item's array of related videos, pluck them all out into a collection of arrays
            //  then flatten the arrays into a collection of videos.

            var relatedVideos = _.flatten(this.map(function (item) {

                return _.map(item.get('relatedVideoInformation'), function(videoInformation) {

                    return new Video({
                        videoInformation: videoInformation
                    });
                    
                });

            }));

            //  Don't add any videos that are already in playlist.
            var self = this;
            relatedVideos = _.filter(relatedVideos, function (relatedVideo) {
                var alreadyExistingItem = self.find(function (item) {
                    var sameVideoId = item.get('video').get('id') === relatedVideo.get('id');
                    var similiarVideoName = levDistance(item.get('video').get('title'), relatedVideo.get('title')) < 3;

                    return sameVideoId || similiarVideoName;
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

            return relatedVideos;
        }
    });

    //  Public exposure of a constructor for building new PlaylistItem objects.
    return function(config) {
        var playlistItems = new playlistItemsCollection(config);
        
        //  TODO: Can I move this to an initialize?
        
        //  TODO: Could probably be improved for very large playlists being added.
        //  Take a statistically significant sample of the videos added and fetch their relatedVideo information.
        var sampleSize = playlistItems.length > 30 ? 30 : playlistItems.length;
        var randomSampleIndices = helpers.getRandomNonOverlappingNumbers(sampleSize, playlistItems.length);

        _.each(randomSampleIndices, function (randomIndex) {
            
            var randomItem = playlistItems.at(randomIndex);
            
            //  Fetch all the related videos for videos on load. I don't want to save these to the DB because they're bulky and constantly change.
            //  Data won't appear immediately as it is an async request, I just want to get the process started now.
            ytHelper.getRelatedVideoInformation(randomItem.get('video').get('id'), function (relatedVideoInformation) {
                randomItem.set('relatedVideoInformation', relatedVideoInformation);
            });
        });

        return playlistItems;
    };
});