//  A global object which abstracts more difficult implementations of retrieving data from YouTube.
define(['geoplugin', 'levenshtein'], function (geoplugin, levDist) {
    'use strict';

    var videoInformationFields = 'author,title,media:group(yt:videoid,yt:duration)';
    var videosInformationFields = 'entry(' + videoInformationFields + ')';
    var developerKey = 'AI39si7voIBGFYe-bcndXXe8kex6-N_OSzM5iMuWCdPCSnZxLB_qIEnQ-HMijHrwN1Y9sFINBi_frhjzVVrYunHH8l77wfbLCA';
    
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

            console.log("Elapsed time:", elapsedTime);

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
                        key: developerKey,
                        fields: videosInformationFields,
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

                console.log("Done. Search time and result count:", elapsedTime, videoInformationList.length);

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
                    key: developerKey,
                    //  TODO: Retrieve restricted youtube data and filter on that.
                    fields: videosInformationFields,
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
        
        parseUrlForDataSource: function (url) {

            var dataSource = {
                type: '',
                id: ''
            };
            
            //  Try for PlaylistId:
            var urlTokens = url.split('list=PL');

            if (urlTokens.length > 1) {
                var videoId = url.split('list=PL')[1];
                var ampersandPosition = videoId.indexOf('&');
                if (ampersandPosition !== -1) {
                    dataSource.id = videoId.substring(0, ampersandPosition);
                    dataSource.type = 'youTubePlaylist';
                }
            }
            
            //  Try feed from a user URL
            urlTokens = url.split('/user/');

            if (urlTokens.length > 1) {
                var youTubeUser = url.split('/user/')[1];

                var ampersandPosition = youTubeUser.indexOf('&');
                if (ampersandPosition !== -1) {
                    dataSource.id = youTubeUser.substring(0, ampersandPosition);
                    dataSource.type = 'youTubePlaylist';
                }

            }
            
            //  TODO: Try feed URL



        },

        //  TODO: Change to parseUrlForDataSource
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
        
        parseUrlForYouTubeUser: function (url) {
            var urlTokens = url.split('/user/');
            var youTubeUser = null;
            
            if (urlTokens.length > 1) {
                youTubeUser = url.split('/user/')[1];
                
                var ampersandPosition = youTubeUser.indexOf('&');
                if (ampersandPosition !== -1) {
                    youTubeUser = youTubeUser.substring(0, ampersandPosition);
                }

            }

            return youTubeUser;
        },
        
        getPlaylistTitle: function (playlistId, callback) {
            
            $.ajax({
                type: 'GET',
                url: "https://gdata.youtube.com/feeds/api/playlists/" + playlistId,
                dataType: 'json',
                data: {
                    v: 2,
                    alt: 'json',
                    key: developerKey,
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
        getVideoInformation: function (videoId, videoTitle, callback) {

            var self = this;

            $.ajax({
                type: 'GET',
                url: 'https://gdata.youtube.com/feeds/api/videos/' + videoId,
                dataType: 'json',
                data: {
                    v: 2,
                    alt: 'json',
                    key: developerKey,
                    fields: videoInformationFields,
                    strict: true
                },
                success: function (result) {

                    //  result will be null if it has been banned on copyright grounds
                    if (result == null) {
                        window && console.log("video banned on copyright grounds, finding alternative.");

                        self.findPlayableByTitle(videoTitle, function(playableVideoInformation) {

                            if (callback) {
                                callback(playableVideoInformation);
                            }

                        });
                    } else {

                        if (callback) {
                            callback(result.entry);
                        }

                    }

                },
                //  This error is silently consumed and handled -- it is an OK scenario if we don't get a video... sometimes
                //  they are banned on copyright grounds. No need to log this error.
                error: function () {
                    callback(null);
                }
            });
        },
        
        getFeedResults: function (youTubeUser, getVideosCallCount, callback) {

            var maxResultsPerSearch = 50;
            var startIndex = 1 + (maxResultsPerSearch * getVideosCallCount);

            $.ajax({
                type: 'GET',
                url: 'https://gdata.youtube.com/feeds/api/users/' + youTubeUser + '/uploads',
                dataType: 'json',
                data: {
                    v: 2,
                    alt: 'json',
                    key: 'AI39si7voIBGFYe-bcndXXe8kex6-N_OSzM5iMuWCdPCSnZxLB_qIEnQ-HMijHrwN1Y9sFINBi_frhjzVVrYunHH8l77wfbLCA',
                    'max-results': maxResultsPerSearch,
                    'start-index': startIndex,
                },
                success: function (result) {
                    
                    var feedResults = result.feed.entry;

                    //  If the title is blank the video has been deleted from the playlist, no data to fetch.
                    var validfeedResults = _.filter(feedResults, function (feedResult) {
                        return $.trim(feedResult.title.$t) !== '';
                    });

                    if (callback) {
                        callback(validfeedResults);
                    }
                },
                error: function(error) {
                    window && console.error(error);
                    callback(null);
                }
            });
        },
        
        getPlaylistResults: function (youTubePlaylistId, getVideosCallCount, callback) {
            
            var maxResultsPerSearch = 50;
            var startIndex = 1 + (maxResultsPerSearch * getVideosCallCount);

            $.ajax({
                type: 'GET',
                url: 'https://gdata.youtube.com/feeds/api/playlists/' + youTubePlaylistId,
                dataType: 'json',
                data: {
                    v: 2,
                    alt: 'json',
                    key: 'AI39si7voIBGFYe-bcndXXe8kex6-N_OSzM5iMuWCdPCSnZxLB_qIEnQ-HMijHrwN1Y9sFINBi_frhjzVVrYunHH8l77wfbLCA',
                    'max-results': maxResultsPerSearch,
                    'start-index': startIndex,
                },
                success: function (result) {

                    var playlistResults = result.feed.entry;
                    
                    //  If the title is blank the video has been deleted from the playlist, no data to fetch.
                    var validPlaylistResults = _.filter(playlistResults, function(playlistResult) {
                        return $.trim(playlistResult.title.$t) !== '';
                    });

                    if (callback) {
                        callback(validPlaylistResults);
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