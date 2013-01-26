//  TODO: This entire entity needs revisiting now that video doesn't depend on a GUID.

define(['video',
        'ytHelper',
        'programState'
       ], function (Video, ytHelper, programState) {
    'use strict';
    //TODO: Implement caching where I only query for IDs I need. Not necessary for now because I don't make many requests.
    var loadedVideos = [];
    var lastVideoRetrieved = null;

    return {
        //Optimized this because I call getTotalTime twice a second against it... :s
        //I need to rewrite this so that when the current item's video forsure has an ID it is loaded instead of polling.
        getLoadedVideoById: function (id) {
            var loadedVideo;
         
            if (lastVideoRetrieved && lastVideoRetrieved.id == id) {
                loadedVideo = lastVideoRetrieved;
            } else {
                loadedVideo = _.find(loadedVideos, function (video) {
                    return video.id == id;
                });
                lastVideoRetrieved = loadedVideo;
            }

            return loadedVideo;
        },
        //  TODO: This isn't used, but I'd expect it to be called during an addItem?
        //loadVideo: function (id, callback) {
        //    $.ajax({
        //        type: 'GET',
        //        url: programState.getBaseUrl() + 'Video/GetById',
        //        dataType: 'json',
        //        data: {
        //            id: id
        //        },
        //        success: function (data) {
        //            if (!_.contains(loadedVideos, data)) {
        //                loadedVideos.push(data);
        //            }
        //            if (callback) {
        //                callback(data);
        //            }
        //        },
        //        error: function(error) {
        //            console.error(error);
        //        }
        //    });
        //},
        loadVideos: function (ids, callback) {
            $.ajax({
                type: 'GET',
                url: programState.getBaseUrl() + 'Video/GetByIds',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                traditional: true,
                data: {
                    ids: ids
                },
                success: function (data) {
                    var savedIds = _.pluck(data, 'id');

                    //  Remove all videos from the cache that need to be updated.
                    loadedVideos = _.reject(loadedVideos, function (loadedVideo) {
                        return _.contains(savedIds, loadedVideo.id);
                    });

                    //  TODO: I don't think I can do this because then my video's aren't Backbone objects?
                    loadedVideos = loadedVideos.concat(data);

                    if (callback) {
                        callback(data);
                    }
                },
                error: function(error) {
                    console.error(error);
                }
            });
        },
        //  Call createVideo for any video intended to be saved to the DB. Otherwise, just go straight to the Video constructor
        //  for displaying video information elsewhere (suggested videos, users selecting a video from dropdown, etc)
        createVideo: function (videoInformation, playlistId) {
            var video = new Video(videoInformation, playlistId);
            return video;
        },
        saveVideo: function(video, callback) {
            $.ajax({
                type: 'POST',
                url: programState.getBaseUrl() + 'Video/SaveVideo',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(video),
                success: function (data) {
                    loadedVideos = _.reject(loadedVideos, function (loadedVideo) {
                        return loadedVideo.id === data.id;
                    });
                    
                    loadedVideos.push(data);
                    
                    if (callback) {
                        callback(data);
                    }
                },
                error: function(error) {
                    console.error(error);
                }
            });
        },
        saveVideos: function (videos, callback) {
            $.ajax({
                type: 'POST',
                url: programState.getBaseUrl() + 'Video/SaveVideos',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(videos),
                success: function (data) {
                    var savedIds = _.pluck(data, 'id');
                    //  Remove all videos from the cache that need to be updated.
                    loadedVideos = _.reject(loadedVideos, function (loadedVideo) {
                        return _.contains(savedIds, loadedVideo.id);
                    });

                    //  TODO: Not sure I should be doing this.
                    loadedVideos = loadedVideos.concat(data);

                    if (callback) {
                        callback(data);
                    }
                },
                error: function (error) {
                    console.error(error);
                }
            });
        },
        loadVideosIncrementally: function (playlistId, callback) {
            var startIndex = 1;
            var maxResultsPerSearch = 50;
            var totalVideosProcessed = 0;

            var videos = [];
            var self = this;

            var getVideosInterval = setInterval(function () {
                $.ajax({
                    url: "https://gdata.youtube.com/feeds/api/playlists/" + playlistId + "?v=2&alt=json&max-results=" + maxResultsPerSearch + "&start-index=" + startIndex,
                    success: function (result) {

                        _.each(result.feed.entry, function (entry) {

                            //  If the title is blank the video has been deleted from the playlist, no data to fetch.
                            if (entry.title.$t !== "") {
                                var videoId = entry.media$group.yt$videoid.$t;
                                ytHelper.getVideoInformation(videoId, function (videoInformation) {
                                    console.log("Video information:", videoInformation);
                                    //Video Information will be null if the video has been banned on copyright grounds.
                                    if (videoInformation !== null) {
                                        var video = self.createVideo(videoInformation, playlistId);
                                        videos.push(video);
                                        totalVideosProcessed++;
                                        
                                        if (totalVideosProcessed == result.feed.entry.length) {
                                            callback(videos);
                                        }

                                    } else {
                                        ytHelper.findPlayableByTitle(entry.title.$t, function (foundVideo) {
                                            videos.push(foundVideo);
                                            totalVideosProcessed++;

                                            if (totalVideosProcessed == result.feed.entry.length) {
                                                callback(videos);
                                            }
                                        });
                                    }
                                });
                            } else {
                                totalVideosProcessed++;

                                if (totalVideosProcessed == result.feed.entry.length) {
                                    callback(videos);
                                }
                            }
                        });
                        
                        //If X videos are received and X+C videos were requested, stop because no more videos in playlist.
                        //TODO: Maybe I just always want to return.
                        if (result.feed.entry.length < maxResultsPerSearch) {
                            clearInterval(getVideosInterval);
                        }

                        startIndex += maxResultsPerSearch;
                    },
                    error: function () {
                        clearInterval(getVideosInterval);
                        callback();
                    }
                });
            }, 5000);
        }
    };
});