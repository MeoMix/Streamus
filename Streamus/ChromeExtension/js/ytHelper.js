//  A global object which abstracts more difficult implementations of retrieving data from YouTube.
define(['geoplugin', 'levenshtein'], function (geoplugin, levDist) {
    'use strict';

    //  Performs a search of YouTube with the provided text and returns a list of playable videos (<= max-results)
    function search(text, callback) {

        var searchIndex = 1;
        var timeInterval = 200;
        var timeToSpendSearching = 500;
        var elapsedTime = 0;

        var videoInformationList = [];
        var maxResultsPerSearch = 50;

        var searchInterval = setInterval(function () {
            elapsedTime += timeInterval;

            if (elapsedTime < timeToSpendSearching) {
                //  Be sure to filter out videos and suggestions which are restricted by the users geographic location.
                $.ajax({
                    type: 'GET',
                    url: 'https://gdata.youtube.com/feeds/api/videos',
                    dataType: 'json',
                    data: {
                        category: 'Music',
                        time: 'all_time',
                        'max-results': maxResultsPerSearch,
                        'start-index': searchIndex,
                        format: 5,
                        v: 2,
                        alt: 'json',
                        //restriction: geoplugin.countryCode,
                        q: text,
                        fields: 'entry(title,media:group(yt:videoid,yt:duration))',
                        strict: true
                    },
                    success: function(result) {

                        if (result.feed.entry) {
                            videoInformationList = videoInformationList.concat(result.feed.entry);
                        }

                        searchIndex += maxResultsPerSearch;
                    },
                    error: function(error) {
                        window && console.error(error);
                    }
                });
            }
            else {
                clearInterval(searchInterval);

                callback(videoInformationList);
            }
        }, timeInterval);
    };
    
    return {
        //  When a video comes from the server it won't have its related videos, so need to fetch and populate.
        getRelatedVideoInformation: function (videoId, callback) {

            //  Do an async request for the videos's related videos. There isn't a hard dependency on them existing right as a video is created.
            $.ajax({
                type: 'GET',
                url: 'https://gdata.youtube.com/feeds/api/videos/' + videoId + '/related',
                dataType: 'json',
                data: {
                    category: 'Music',
                    v: 2,
                    alt: 'json',
                    //  TODO: Retrieve restricted youtube data and filter on that.
                    fields: 'entry(title,media:group(yt:videoid,yt:duration))',
                    //  Don't really need that many suggested videos, take 5.
                    'max-results': 5,
                    strict: true
                },
                success: function (result) {
                    if (callback) {
                        callback(result.feed.entry);
                    }
                },
                error: function(error) {
                    window && console.error(error);
                }
            });
        },
        search: search,
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
                type: 'GET',
                url: "https://gdata.youtube.com/feeds/api/playlists/" + playlistId,
                dataType: 'json',
                data: {
                    v: 2,
                    alt: 'json',
                    fields: 'title',
                    strict: true
                },
                success: function (result) {
                    if (callback) {
                        callback(result.feed.title.$t);
                    }
                },
                error: function (error) {
                    window && console.error(error);
                }
            });
        },
        
        //  Returns NULL if the request throws a 403 error if videoId has been banned on copyright grounds.
        getVideoInformationFromId: function (videoId, callback) {
            $.ajax({
                type: 'GET',
                url: 'https://gdata.youtube.com/feeds/api/videos/' + videoId,
                dataType: 'json',
                data: {
                    v: 2,
                    alt: 'json',
                    fields: 'title,media:group(yt:videoid,yt:duration)',
                    strict: true
                },
                success: function (result) {

                    console.log("Result", result);

                    if (callback) {
                        callback(result.entry);
                    }
                },
                error: function (error) {
                    window && console.error(error);
                    callback(null);
                }
            });
        },

        findPlayableByTitle: function(title, callback) {
            search(title, function (videoInformationList) {

                videoInformationList.sort(function(a, b) {
                    return levDist(a.title.$t, title) - levDist(b.title.$t, title);
                });

                var videoInformation = videoInformationList.length > 0 ? videoInformationList[0] : null;
                callback(videoInformation);
            });
        }
    };
});