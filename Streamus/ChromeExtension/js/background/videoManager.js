//  TODO: Exposed globally for the foreground. Is there a better way?
var VideoManager = null;

define(['video',
        'videos',
        'ytHelper',
        'programState'
       ], function (Video, Videos, ytHelper, programState) {
    'use strict';
    //  TODO: Implement caching where I only query for IDs I need. Not necessary for now because I don't make many requests.
    var loadedVideos = new Videos();
    var lastVideoRetrieved = null;

    VideoManager = {
        //  Optimized this because I call getTotalTime twice a second against it... :s
        //  I need to rewrite this so that when the current item's video forsure has an ID it is loaded instead of polling.
        getLoadedVideoById: function (id) {
            var loadedVideo;
         
            if (lastVideoRetrieved && lastVideoRetrieved.get('id') === id) {
                loadedVideo = lastVideoRetrieved;
            } else {
                loadedVideo = loadedVideos.get(id);
                lastVideoRetrieved = loadedVideo;
            }

            return loadedVideo;
        },
        //  Could be just a video or an array of videos, either way is fine.
        cache: function(videos) {
            loadedVideos.add(videos);
        },
        loadVideo: function (id, callback) {
            if (loadedVideos.get(id) == null) {
                var video = new Video({ id: id });

                video.fetch({
                    success: function (data) {
                        loadedVideos.add(data);

                        if (callback) {
                            callback(data);
                        }
                    },
                    error: function (error) {
                        console.error(error);
                    }
                });
            }
        },
        loadVideos: function (ids, callback) {
            //  Don't load any videos we already have cached.
            var idsNotYetLoaded = _.reject(ids, function (id) { return loadedVideos.get(id) != null });

            if (idsNotYetLoaded.length > 0) {
                //  TODO: Anything in Backbone that can simplify this more?
                $.ajax({
                    type: 'GET',
                    url: programState.getBaseUrl() + 'Video/GetByIds',
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    traditional: true,
                    data: {
                        ids: idsNotYetLoaded
                    },
                    success: function (data) {
                        //  TODO: Pass merge paramater if videos can update properties, they can't currently
                        loadedVideos.add(data);

                        if (callback) {
                            callback(data);
                        }
                    },
                    error: function (error) {
                        console.error(error);
                    }
                });
            }
        },
        //  TODO: I think the video constructor should handle this.
        //  Call createVideo for any video intended to be saved to the DB. Otherwise, just go straight to the Video constructor
        //  for displaying video information elsewhere (suggested videos, users selecting a video from dropdown, etc)
        createVideo: function (videoInformation, playlistId) {

            //  Strip out the id. An example of $t's contents: tag:youtube.com,2008:video:UwHQp8WWMlg
            var id = videoInformation.media$group.yt$videoid.$t;
            var durationInSeconds = parseInt(videoInformation.media$group.yt$duration.seconds, 10);

            var video = new Video({
                id: id,
                playlistId: playlistId,
                title: videoInformation.title.$t,
                duration: durationInSeconds
            });

            return video;
        },
        loadVideosIncrementally: function (playlistId, callback) {
            var startIndex = 1;
            var maxResultsPerSearch = 50;
            var totalVideosProcessed = 0;

            var videos = new Videos();

            var getVideosInterval = setInterval(function () {
                $.ajax({

                    type: 'GET',
                    url: 'https://gdata.youtube.com/feeds/api/playlists/' + playlistId,
                    dataType: 'json',
                    data: {
                        v: 2,
                        alt: 'json',
                        'max-results': maxResultsPerSearch,
                        'start-index': startIndex,
                    },
                    success: function (result) {

                        _.each(result.feed.entry, function (entry) {
                            //  If the title is blank the video has been deleted from the playlist, no data to fetch.
                            if (entry.title.$t !== "") {
                                var videoId = entry.media$group.yt$videoid.$t;

                                ytHelper.getVideoFromId(videoId, function(video) {
                                    //  Video will be null if it has been banned on copyright grounds
  
                                    if (video === null) {
                                        console.log("Video was null, finding playable by title:", entry.title.$t);

                                        ytHelper.findPlayableByTitle(entry.title.$t, function (foundVideo) {
                                            videos.push(foundVideo);
                                            totalVideosProcessed++;

                                            if (totalVideosProcessed == result.feed.entry.length) {
                                                callback(videos);
                                            }
                                        });
                                        
                                    } else {

                                        videos.add(video);
                                        totalVideosProcessed++;

                                        if (totalVideosProcessed == result.feed.entry.length) {
                                            callback(videos);
                                        }
                                    }

                                });
                            } else {
                                console.log("title is totally empty");
                                totalVideosProcessed++;

                                if (totalVideosProcessed == result.feed.entry.length) {
                                    callback(videos);
                                }
                            }
                        });
                        
                        //If X videos are received and X+C videos were requested, stop because no more videos in playlist.
                        //TODO: Maybe I just always want to return.
                        if (result.feed.entry.length < maxResultsPerSearch) {
                            console.log("clearing because didn't get enough so at the end", result.feed.entry.length);
                            clearInterval(getVideosInterval);
                        }

                        startIndex += maxResultsPerSearch;
                    },
                    error: function (error) {
                        console.error(error);
                        console.log("clearing interval on error");
                        clearInterval(getVideosInterval);
                    }
                });
            }, 5000);
        }
    };
           
    return VideoManager;
});