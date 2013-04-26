//  A stream is a collection of playlists
define(['playlists', 'playlist', 'videos', 'video', 'player', 'programState', 'ytHelper', 'localStorageManager'], function (Playlists, Playlist, Videos, Video, player, programState, ytHelper, localStorageManager) {
    'use strict';
    
    var streamModel = Backbone.Model.extend({
        defaults: function () {
            return {
                id: null,
                userId: null,
                title: '',
                playlists: new Playlists(),
                firstListId: null,
                youTubePlaylistId: null
            };
        },
        urlRoot: programState.getBaseUrl() + 'Video/',
        initialize: function () {
            var playlists = this.get('playlists');

            //  Data was fetched from the server. Need to convert to Backbone.
            if (!(playlists instanceof Backbone.Collection)) {
                playlists = new Playlists(playlists);

                this.set('playlists', playlists, {
                    //  Silent operation because it isn't technically changing - just being made correct.
                    silent: true
                });
            }

            var self = this;
            playlists.on('change:selected', function (playlist, isSelected) {
                if (isSelected) {
                    //  TODO: Can this be abstracted down to the playlist level?
                    playlist.get('items').on('change:selected', function (item, selected) {

                        if (selected) {
                            var videoId = item.get('video').get('id');

                            //  Maintain the playing state by loading if playing. 
                            if (player.isPlaying()) {
                                player.loadVideoById(videoId);
                            } else {
                                player.cueVideoById(videoId);
                            }
                        }
                    });

                    playlist.get('items').on('remove', function (item, collection) {

                        if (collection.length == 0) {
                            player.pause();
                        }
                    });
                } else {
                    if (self.getSelectedPlaylist() === playlist) {
                        playlist.get('items').off('change:selected add remove');
                    }
                }
                
            });

            this.get('playlists').on('remove', function (removedPlaylist) {
                
                var playlists = self.get('playlists');

                if (playlists.length > 0) {

                    //  Update firstList if it was removed
                    if (self.get('firstListId') === removedPlaylist.get('id')) {
                        self.set('firstListId', removedPlaylist.get('nextListId'));
                    }

                    //  Update linked list pointers
                    var previousList = playlists.get(removedPlaylist.get('previousListId'));
                    var nextList = playlists.get(removedPlaylist.get('nextListId'));

                    //  Remove the playlist from linked list.
                    previousList.set('nextListId', nextList.get('id'));
                    nextList.set('previousListId', previousList.get('id'));

                } else {
                    self.set('firstListId', '00000000-0000-0000-0000-000000000000');
                }

            });
        },
        
        addVideoByIdToPlaylist: function (id, playlistId) {
            this.get('playlists').get(playlistId).addVideoByIdToPlaylist(id);
        },
        
        addChannel: function (playlistTitle, youTubeUser, callback) {
            
            var playlist = new Playlist({
                title: playlistTitle,
                streamId: this.get('id'),
                youTubePlaylistId: youTubeUser
            });
            
            var currentPlaylists = this.get('playlists');

            var self = this;
            //  Save the playlist, but push after version from server because the ID will have changed.
            playlist.save(new Array(), {
                success: function () {
                    var playlistId = playlist.get('id');

                    if (currentPlaylists.length === 0) {
                        self.set('firstListId', playlistId);
                        playlist.set('nextListId', playlistId);
                        playlist.set('previousListId', playlistId);
                    } else {
                        var firstList = currentPlaylists.get(self.get('firstListId'));
                        var lastList = currentPlaylists.get(firstList.get('previousListId'));

                        lastList.set('nextListId', playlistId);
                        playlist.set('previousListId', lastList.get('id'));

                        firstList.set('previousListId', playlistId);
                        playlist.set('nextListId', firstList.get('id'));
                    }

                    currentPlaylists.push(playlist);

                    if (callback) {
                        callback(playlist);
                    }
                },
                error: function (error) {
                    window && console.error(error);
                }
            });
            
            //  TODO: Refactor/simplify. This loads a bulk collection of videos for a YouTube playlist.
            if (youTubeUser) {

                var startIndex = 1;
                var maxResultsPerSearch = 50;
                var unsavedVideoCount = 0;
                var videosStillProcessing = 0;

                var orderedVideoArray = [];

                var videos = new Videos();

                var getVideosInterval = setInterval(function () {

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
                            var resultCount = result.feed.entry.length;
                            videosStillProcessing += resultCount;

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
                            
                            function processVideoStep(currentResultCount) {
                                unsavedVideoCount++;

                                //  Periodicially send bursts of packets (up to 50 videos in length) to the server and trigger visual update.
                                if (unsavedVideoCount == currentResultCount) {
                                    videos.add(orderedVideoArray);
                                    playlist.addItems(videos);

                                    videos.reset();
                                    unsavedVideoCount = 0;
                                }

                                videosStillProcessing--;
                            }
                            
                            function addVideoFromInfo(videoInformation, index) {
                                var playableVideo = getVideoFromInformation(videoInformation);
                                orderedVideoArray[index] = playableVideo;
                                processVideoStep(resultCount);
                            }

                            function addVideoByIdAtIndex(videoId, videoTitle, index) {
                                ytHelper.getVideoInformationFromId(videoId, function (videoInformation) {
                                    
                                    //  videoInformation will be null if it has been banned on copyright grounds
                                    if (videoInformation === null) {
                                        window && console.log("video banned on copyright grounds, finding alternative.");

                                        ytHelper.findPlayableByTitle(videoTitle, function(playableVideoInformation) {
                                            addVideoFromInfo(playableVideoInformation, index);
                                        });

                                    } else {
                                        addVideoFromInfo(videoInformation, index);
                                    }

                                });
                            }

                            _.each(result.feed.entry, function(entry, index) {

                                //  If the title is blank the video has been deleted from the playlist, no data to fetch.
                                if (entry.title.$t !== "") {

                                    var videoId = entry.media$group.yt$videoid.$t;
                                    addVideoByIdAtIndex(videoId, entry.title.$t, index);

                                } else {
                                    processVideoStep(resultCount);
                                }
                            });

                            //  If X videos are received and X+C videos were requested, stop because no more videos in playlist.
                            if (resultCount < maxResultsPerSearch) {
                                
                                //  Can't trigger loaded until all videos have been processed though
                                var waitForProcessingInterval = setInterval(function () {
                                    if (videosStillProcessing === 0) {
                                        clearInterval(waitForProcessingInterval);
                                        playlist.trigger('loaded');
                                    }
                                }, 1000);

                                clearInterval(getVideosInterval);
                            }

                            startIndex += maxResultsPerSearch;
                        },
                        error: function(error) {
                            window && console.error(error);
                            clearInterval(getVideosInterval);
                        }
                    });
                }, 3000);
            }
        },

        addPlaylist: function (playlistTitle, youTubePlaylistId, callback) {
            var playlist = new Playlist({
                title: playlistTitle,
                streamId: this.get('id'),
                youTubePlaylistId: youTubePlaylistId
            });

            var currentPlaylists = this.get('playlists');

            var self = this;
            //  Save the playlist, but push after version from server because the ID will have changed.
            playlist.save(new Array(), {
                success: function() {
                    var playlistId = playlist.get('id');

                    if (currentPlaylists.length === 0) {
                        self.set('firstListId', playlistId);
                        playlist.set('nextListId', playlistId);
                        playlist.set('previousListId', playlistId);
                    } else {
                        var firstList = currentPlaylists.get(self.get('firstListId'));
                        var lastList = currentPlaylists.get(firstList.get('previousListId'));

                        lastList.set('nextListId', playlistId);
                        playlist.set('previousListId', lastList.get('id'));

                        firstList.set('previousListId', playlistId);
                        playlist.set('nextListId', firstList.get('id'));
                    }

                    currentPlaylists.push(playlist);

                    if (callback) {
                        callback(playlist);
                    }
                },
                error: function(error) {
                    window && console.error(error);
                }
            });
                
            //  TODO: Refactor/simplify. This loads a bulk collection of videos for a YouTube playlist.
            if (youTubePlaylistId) {
                    
                var startIndex = 1;
                var maxResultsPerSearch = 50;
                var totalVideosProcessed = 0;

                var orderedVideoArray = [];

                var videos = new Videos();

                var getVideosInterval = setInterval(function () {
                    $.ajax({

                        type: 'GET',
                        url: 'https://gdata.youtube.com/feeds/api/playlists/' + youTubePlaylistId,
                        dataType: 'json',
                        data: {
                            v: 2,
                            alt: 'json',
                            'max-results': maxResultsPerSearch,
                            'start-index': startIndex,
                        },
                        success: function (result) {
                            
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
                            
                            function addVideoByIdAtIndex(videoId, videoTitle, index) {
                                ytHelper.getVideoInformationFromId(videoId, function (videoInformation) {
                                    //  videoInformation will be null if it has been banned on copyright grounds

                                    if (videoInformation === null) {

                                        window && console.log("video banned on copyright grounds, finding alternative.");

                                        ytHelper.findPlayableByTitle(videoTitle, function (playableVideoInformation) {
                                            var playableVideo = getVideoFromInformation(playableVideoInformation);
                                            orderedVideoArray[index] = playableVideo;
                
                                            totalVideosProcessed++;

                                            if (totalVideosProcessed == result.feed.entry.length) {

                                                _.each(orderedVideoArray, function(orderedVideo) {
                                                    videos.add(orderedVideo);
                                                });

                                                playlist.addItems(videos);
                                            }
                                        });

                                    } else {

                                        var video = getVideoFromInformation(videoInformation);
                                        orderedVideoArray[index] = video;

                                        totalVideosProcessed++;

                                        if (totalVideosProcessed == result.feed.entry.length) {
                                            _.each(orderedVideoArray, function (orderedVideo) {
                                                videos.add(orderedVideo);
                                            });

                                            playlist.addItems(videos);
                                        }
                                    }

                                });
                            }

                            _.each(result.feed.entry, function (entry, index) {
                                
                                //  If the title is blank the video has been deleted from the playlist, no data to fetch.
                                if (entry.title.$t !== "") {
                                    
                                    var videoId = entry.media$group.yt$videoid.$t;
                                    addVideoByIdAtIndex(videoId, entry.title.$t, index);
                                    
                                } else {

                                    totalVideosProcessed++;

                                    if (totalVideosProcessed == result.feed.entry.length) {
                                        _.each(orderedVideoArray, function (orderedVideo) {
                                            videos.add(orderedVideo);
                                        });
                                    }
                                }
                            });

                            //  If X videos are received and X+C videos were requested, stop because no more videos in playlist.
                            if (result.feed.entry.length < maxResultsPerSearch) {
                                clearInterval(getVideosInterval);
                                playlist.trigger('loaded');
                            }

                            startIndex += maxResultsPerSearch;
                        },
                        error: function (error) {
                            window && console.error(error);
                            clearInterval(getVideosInterval);
                        }
                    });
                }, 5000); 
            }
        },
        
        removePlaylistById: function(playlistId) {
            //  TODO: When deleting the active playlist - set active playlist to the next playlist.
            var playlists = this.get('playlists');

            var playlist = playlists.get(playlistId);
                    
            if (this.get('firstListId') === playlistId) {
                var newFirstListId = playlist.get('nextListId');
                this.set('firstListId', newFirstListId);
            }

            var previousList = playlists.get(playlist.get('previousListId'));
            var nextList = playlists.get(playlist.get('nextListId'));

            //  Remove the list from our linked list.
            previousList.set('nextListId', nextList.get('id'));
            nextList.set('previousListId', previousList.get('id'));

            playlist.destroy({
                success: function () {
                    //  Remove from playlists clientside only after server responds with successful delete.
                    playlists.remove(playlist);
                },
                error: function (error) {
                    window && console.error(error);
                }
            });
        },
        
        getPlaylistById: function(playlistId) {
            var playlist = this.get('playlists').get(playlistId) || null;
           
            return playlist;
        }
    });
    
    return function (config) {
        var stream = new streamModel(config);

        return stream;
    };
});