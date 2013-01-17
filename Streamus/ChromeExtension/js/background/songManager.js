define(['song', 'ytHelper'], function(Song, ytHelper) {
    'use strict';
    //TODO: Implement caching where I only query for IDs I need. Not necessary for now because I don't make many requests.
    var loadedSongs = [];
    var lastSongRetrieved = null;

    return {
        //Optimized this because I call getTotalTime twice a second against it... :s
        //I need to rewrite this so that when the current item's song forsure has an ID it is loaded instead of polling.
        getLoadedSongByVideoId: function (videoId) {
            var loadedSong;
         
            if (lastSongRetrieved && lastSongRetrieved.videoId == videoId) {
                loadedSong = lastSongRetrieved;
            } else {
                loadedSong = _.find(loadedSongs, function(song) {
                    return song.videoId == videoId;
                });
                lastSongRetrieved = loadedSong;
            }

            return loadedSong;
        },
        loadSong: function(songId, callback) {
            $.ajax({
                type: 'GET',
                url: 'http://localhost:61975/Song/GetById',
                dataType: 'json',
                data: {
                    songId: songId
                },
                success: function (data) {
                    if (!_.contains(loadedSongs, data)) {
                        loadedSongs.push(data);
                    }
                    if (callback) {
                        callback(data);
                    }
                },
                error: function(error) {
                    console.error(error);
                }
            });
        },
        loadSongs: function (songIds, callback) {
            console.log("calling load songs with:", songIds);
            $.ajax({
                type: 'GET',
                url: 'http://localhost:61975/Song/GetByVideoIds',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                traditional: true,
                data: {
                    songIds: songIds
                },
                success: function (data) {
                    var savedVideoIds = _.pluck(data, 'videoId');
                    //Remove all songs from the cache that need to be updated.
                    loadedSongs = _.reject(loadedSongs, function (loadedSong) {
                        return _.contains(savedVideoIds, loadedSong.videoId);
                    });

                    loadedSongs = loadedSongs.concat(data);
                    console.log("loaded songs:", loadedSongs);
                    if (callback) {
                        callback(data);
                    }
                },
                error: function(error) {
                    console.error(error);
                }
            });
        },
        //Call createSong for any song intended to be saved to the DB. Otherwise, just go straight to the song constructor
        //for displaying song information elsewhere (suggested videos, users selecting a video from dropdown, etc)
        createSong: function(videoInformation, playlistId) {
            var song = new Song(videoInformation, playlistId);
            console.log("Created song. Video id:", song.videoId);
            return song;
        },
        saveSong: function(song, callback) {
            $.ajax({
                type: 'POST',
                url: 'http://localhost:61975/Song/SaveSong',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(song),
                success: function (data) {
                    loadedSongs = _.reject(loadedSongs, function(loadedSong) {
                        return loadedSong.videoId === data.videoId;
                    });
                    
                    loadedSongs.push(data);
                    
                    if (callback) {
                        callback(data);
                    }
                },
                error: function(error) {
                    console.error(error);
                }
            });
        },
        saveSongs: function (songs, callback) {
            console.log("Saving songs:", songs); 

            $.ajax({
                type: 'POST',
                url: 'http://localhost:61975/Song/SaveSongs',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(songs),
                success: function (data) {
                    console.log("data:", data);
                    var savedVideoIds = _.pluck(data, 'videoId');
                    //Remove all songs from the cache that need to be updated.
                    loadedSongs = _.reject(loadedSongs, function (loadedSong) {
                        return _.contains(savedVideoIds, loadedSong.videoId);
                    });

                    loadedSongs = loadedSongs.concat(data);

                    if (callback) {
                        callback(data);
                    }
                },
                error: function (error) {
                    console.error(error);
                }
            });
        },
        loadSongsIncrementally: function (playlistId, callback) {
            var startIndex = 1;
            var maxResultsPerSearch = 50;
            var totalVideosProcessed = 0;

            var videos = [];
            var self = this;
            console.log("How about here?", playlistId);

            var getVideosInterval = setInterval(function () {
                console.log("loadSongsIncrementally playlistId:", playlistId);
                $.ajax({
                    url: "https://gdata.youtube.com/feeds/api/playlists/" + playlistId + "?v=2&alt=json&max-results=" + maxResultsPerSearch + "&start-index=" + startIndex,
                    success: function (result) {
                        console.log("Result:", result);

                        _.each(result.feed.entry, function (entry) {
                            //If the title is blank the video has been deleted from the playlist, no data to fetch.
                            if (entry.title.$t !== "") {
                                var videoId = entry.media$group.yt$videoid.$t;
                                ytHelper.getVideoInformation(videoId, function (videoInformation) {
                                    console.log("Video information:", videoInformation);
                                    //Video Information will be null if the video has been banned on copyright grounds.
                                    if (videoInformation !== null) {
                                        var video = self.createSong(videoInformation, playlistId);
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
                        
                        //If X songs are received and X+C songs were requested, stop because no more songs in playlist.
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