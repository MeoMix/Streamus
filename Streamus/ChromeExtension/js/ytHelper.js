//A global object which abstracts more difficult implementations of retrieving data from YouTube.
define(['geoplugin', 'levenshtein', 'video', 'videos'], function (geoplugin, levDist, Video, Videos) {
    'use strict';

    var findPlayableByTitle = function (title, callback) {
        search(title, null, function (videos) {
            videos.sort(function (a, b) {
                return levDist(a.title, title) - levDist(b.title, title);
            });
            
            var video = videos.length ? videos[0] : null;
            callback(video);
        });
    };

    //Be sure to filter out videos and suggestions which are restricted by the users geographic location.
    var buildSearchUrl = function (searchIndex, maxResults, searchText) {
        return "https://gdata.youtube.com/feeds/api/videos?category=Music&orderBy=relevance&start-index=" + searchIndex + "&time=all_time&max-results=" + maxResults + "&format=5&v=2&alt=json&callback=?&restriction=" + geoplugin.countryCode + "&q=" + searchText;
    };

    //Performs a search of YouTube with the provided text and returns a list of playable videos (<= max-results)
    var search = function (text, playlistId, callback) {

        var searchIndex = 1;
        var timeInterval = 200;
        var timeToSpendSearching = 500;
        var elapsedTime = 0;
        var videos = new Videos();
        var maxResultsPerSearch = 50;

        var searchInterval = setInterval(function () {
            elapsedTime += timeInterval;

            if (elapsedTime < timeToSpendSearching) {
                var searchUrl = buildSearchUrl(searchIndex, maxResultsPerSearch, text);

                $.getJSON(searchUrl, function (response) {

                    //  Add all playable videos to a list and return.
                    _.each(response.feed.entry, function(videoInformation) {
                        
                        //  Strip out the id. An example of $t's contents: tag:youtube.com,2008:video:UwHQp8WWMlg
                        var id = videoInformation.media$group.yt$videoid.$t;
                        var durationInSeconds = parseInt(videoInformation.media$group.yt$duration.seconds, 10);
                        
                        videos.push({
                            id: id,
                            playlistId: playlistId,
                            title: videoInformation.title.$t,
                            duration: durationInSeconds
                        });
                    });

                    searchIndex += maxResultsPerSearch;
                });
            }
            else {
                clearInterval(searchInterval);

                callback(videos);
            }
        }, timeInterval);
    };

    //Takes a videoId which is presumed to have content restrictions and looks through YouTube
    //for a video with a similiar name that might be the right video to play.
    var findPlayableByVideoId = function (videoId, callback) {
        this.getVideoInformation(videoId, function (videoInformation) {
            if (videoInformation) {
                findPlayableByTitle(videoInformation.title.$t, callback);
            }
        });
    };

    return {
        //  TODO: Do I need to debounce this?
        //  When a video comes from the server it won't have its related videos, so need to fetch and populate.
        getRelatedVideos: function (videoId, callback) {

            //  Do an async request for the videos's related videos. There isn't a hard dependency on them existing right as a video is created.
            $.ajax({
                url: 'https://gdata.youtube.com/feeds/api/videos/' + videoId + '/related?v=2&alt=json',
                success: function(result) {
                    //  Don't set length to 0 here because relatedVideos property probably doesn't exist since it just came from server.
                    var relatedVideos = [];

                    //  Don't really need that many suggested videos. 
                    for (var i = 0; i < 5; i++) {
                        var relatedVideoInformation = result.feed.entry[i];

                        //  Strip out the id. An example of $t's contents: tag:youtube.com,2008:video:UwHQp8WWMlg
                        var id = relatedVideoInformation.media$group.yt$videoid.$t;
                        var durationInSeconds = parseInt(relatedVideoInformation.media$group.yt$duration.seconds, 10);

                        //  Don't forget to set the playlistId after adding a related video to a playlist later.
                        var video = new Video({
                            id: id,
                            title: relatedVideoInformation.title.$t,
                            duration: durationInSeconds
                        });

                        relatedVideos.push(video);
                    }

                    if (callback) {
                        callback(relatedVideos);
                    }
                },
                error: function(error) {
                    console.error("Error getting related videos", error);
                }
            });
        },
        search: search,
        findPlayableByVideoId: findPlayableByVideoId,
        //  Takes a URL and returns parsed URL information such as schema and video id if found inside of the URL.
        parseVideoIdFromUrl: function (url) {
            var videoId = null;

            var match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.*?\&v=)([^#\&\?]*).*/);
            if (match && match[2].length === 11) {
                videoId = match[2];
            }

            return videoId;
        },

        parseUrlForPlaylistId: function (url) {
            var urlTokens = url.split('list=PL');
            var videoId = null;

            if (urlTokens.length > 1) {
                videoId = url.split('list=PL')[1];
                var ampersandPosition = videoId.indexOf('&');
                if (ampersandPosition !== -1) {
                    videoId = videoId.substring(0, ampersandPosition);
                }
            }

            return videoId;
        },
        
        getPlaylistTitle: function (playlistId, callback) {
            $.ajax({
                url: "https://gdata.youtube.com/feeds/api/playlists/" + playlistId + "?v=2&alt=json",
                success: function(result) {
                    callback(result.feed.title.$t);
                },
                error: function (error) {
                    console.error(error);
                    callback(null);
                }
            });
        },

        // Returns NULL if the request throws a 403 error if videoId has been banned on copyright grounds.
        getVideoInformation: function (videoId, callback) {
            $.ajax({
                url: 'https://gdata.youtube.com/feeds/api/videos/' + videoId + '?v=2&alt=json',
                success: function (result) {
                    callback(result.entry);
                },
                error: function () {
                    callback(null);
                },
                dataType: "json"
            });
        },
        findPlayableByTitle: findPlayableByTitle

        //findVideo: function (videoTitle, callback) {
        //    $.ajax({
        //        url: "http://gdata.youtube.com/feeds/api/videos",
        //        data: {
        //            alt: "json",
        //            q: videoTitle // + " - " + video.artists
        //        },
        //        success: function (json) {
        //            //Find the video most related to our video by duration.
        //            var videos = json.feed.entry;
        //            //TODO: Do we also want to compare levenshtein distance of video titles?
        //            var closestVideo = _.sortBy(videos, function (video) {
        //                //TODO: Duration would be nice, but I can't use it always if I don't have video information already.
                        
        //                //var duration = video.media$group.yt$duration.seconds;
        //                //var durationDifference = Math.abs(video.duration - duration);
        //                //return durationDifference;
        //            })[0];

        //            callback(closestVideo);
        //        }
        //    });
        //}
    };
});