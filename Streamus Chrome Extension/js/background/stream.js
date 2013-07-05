//  A stream is a collection of playlists
define(['playlists', 'playlist', 'videos', 'video', 'player', 'programState', 'dataSource'], function (Playlists, Playlist, Videos, Video, player, programState, DataSource) {
    'use strict';
    
    var streamModel = Backbone.Model.extend({
        defaults: function () {
            return {
                id: null,
                userId: null,
                title: '',
                playlists: new Playlists(),
                firstPlaylistId: null,
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

                } else {
                    if (self.getSelectedPlaylist() === playlist) {
                        playlist.get('items').off('change:selected add remove');
                    }
                }
                
            });

            this.get('playlists').on('remove', function (removedPlaylist) {
                
                var playlists = self.get('playlists');

                if (playlists.length > 0) {

                    //  Update firstPlaylistId if it was removed
                    if (self.get('firstPlaylistId') === removedPlaylist.get('id')) {
                        self.set('firstPlaylistId', removedPlaylist.get('nextPlaylistId'));
                    }

                    //  Update linked list pointers
                    var previousPlaylist = playlists.get(removedPlaylist.get('previousPlaylistId'));
                    var nextPlaylist = playlists.get(removedPlaylist.get('nextPlaylistId'));

                    //  Remove the playlist from linked list.
                    previousPlaylist.set('nextPlaylistId', nextPlaylist.get('id'));
                    nextPlaylist.set('previousPlaylistId', previousPlaylist.get('id'));

                } else {
                    self.set('firstPlaylistId', '00000000-0000-0000-0000-000000000000');
                }

            });

        },
        
        addVideoByIdToPlaylist: function (id, playlistId) {
            this.get('playlists').get(playlistId).addVideoByIdToPlaylist(id);
        },
        
        addPlaylistByShareData: function (shareCodeShortId, urlFriendlyEntityTitle, callback) {
            var self = this;

            $.ajax({
                url: programState.getBaseUrl() + 'Playlist/CreateAndGetCopyByShareCode',
                type: 'GET',
                dataType: 'json',
                data: {
                    shareCodeShortId: shareCodeShortId,
                    urlFriendlyEntityTitle: urlFriendlyEntityTitle,
                    streamId: self.get('id')
                },
                success: function (playlistCopy) {
                    //  Convert back from JSON to a backbone object.
                    playlistCopy = new Playlist(playlistCopy);

                    var playlistId = playlistCopy.get('id');
                    
                    var currentPlaylists = self.get('playlists');
                    if (currentPlaylists.length === 0) {
                        self.set('firstPlaylistId', playlistId);;
                    } else {
                        var firstPlaylist = currentPlaylists.get(self.get('firstPlaylistId'));
                        var lastPlaylist = currentPlaylists.get(firstPlaylist.get('previousPlaylistId'));

                        lastPlaylist.set('nextPlaylistId', playlistId);
                        firstPlaylist.set('previousPlaylistId', playlistId);
                    }

                    currentPlaylists.push(playlistCopy);

                    callback(playlistCopy);
                },
                error: function (error) {
                    console.error("Error adding playlist by share data", error);
                    callback();
                }
            });

        },

        addPlaylistByDataSource: function (playlistTitle, dataSource, callback) {
            var self = this;
            
            var playlist = new Playlist({
                title: playlistTitle,
                streamId: this.get('id'),
                dataSource: dataSource
            });

            var ytHelperDataFunction = null;

            switch (dataSource.type) {
                case DataSource.YOUTUBE_PLAYLIST:
                    ytHelperDataFunction = ytHelper.getPlaylistResults;
                    break;
                case DataSource.YOUTUBE_CHANNEL:
                    ytHelperDataFunction = ytHelper.getFeedResults;
                    break;
                    //  This datasource works differently.
                case DataSource.SHARED_PLAYLIST:
                    ytHelperDataFunction = null;
                    break;
                default:
                    console.error("Unhandled dataSource type:", dataSource.type);
            }

            if (ytHelperDataFunction != null) {

                var getVideosCallCount = 0;
                var videosHandled = 0;
                var orderedVideosArray = [];

                var getVideosInterval = setInterval(function () {

                    ytHelperDataFunction(dataSource.id, getVideosCallCount, function (results) {

                        console.log("Feed results:", results);

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
                        ytHelper.getVideoInformation({
                            videoId: videoId,
                            videoTitle: videoTitle,
                            success: function (videoInformation) {
                                if (videoInformation != null) {
                                    var video = getVideoFromInformation(videoInformation);
                                    //  Insert at index to preserve order of videos retrieved from YouTube API
                                    orderedVideosArray[index] = video;
                                }

                                handleVideo(resultCount);
                            },
                            error: function () {
                                console.error("Error getting video information for:", videoTitle);
                                handleVideo(resultCount);
                            }
                        });
                    }

                    //  Periodicially send bursts of packets (up to 50 videos in length) to the server and trigger visual update.
                    function handleVideo(resultCount) {
                        videosHandled++;

                        console.log("Videos handled / result count:", videosHandled, resultCount);
                        if (videosHandled == resultCount) {

                            var videos = new Videos(orderedVideosArray);

                            //  orderedVideosArray may have some empty slots which get converted to empty Video objects; drop 'em.
                            var videosWithIds = videos.withIds();

                            self.addItems(videosWithIds);
                            orderedVideosArray = [];
                            videosHandled = 0;
                        }
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

            //  Save the playlist, but push after version from server because the ID will have changed.
            playlist.save({}, {
                success: function () {

                    var playlistId = playlist.get('id');
                    var currentPlaylists = self.get('playlists');

                    if (currentPlaylists.length === 0) {
                        self.set('firstPlaylistId', playlistId);
                        playlist.set('nextPlaylistId', playlistId);
                        playlist.set('previousPlaylistId', playlistId);
                    } else {
                        var firstPlaylist = currentPlaylists.get(self.get('firstPlaylistId'));
                        var lastPlaylist = currentPlaylists.get(firstPlaylist.get('previousPlaylistId'));

                        lastPlaylist.set('nextPlaylistId', playlistId);
                        playlist.set('previousPlaylistId', lastPlaylist.get('id'));

                        firstPlaylist.set('previousPlaylistId', playlistId);
                        playlist.set('nextPlaylistId', firstPlaylist.get('id'));
                    }

                    currentPlaylists.push(playlist);

                    if (callback) {
                        callback(playlist);
                    }

                },
                error: function (error) {
                    console.error(error);
                }
            });

        },
        
        removePlaylistById: function(playlistId) {
            //  TODO: When deleting the active playlist - set active playlist to the next playlist.
            var playlists = this.get('playlists');

            var playlist = playlists.get(playlistId);
                    
            if (this.get('firstPlaylistId') === playlistId) {
                var newFirstPlaylistId = playlist.get('nextPlaylistId');
                this.set('firstPlaylistId', newFirstPlaylistId);
            }

            var previousPlaylist = playlists.get(playlist.get('previousPlaylistId'));
            var nextPlaylist = playlists.get(playlist.get('nextPlaylistId'));

            //  Remove the list from our linked list.
            previousPlaylist.set('nextPlaylistId', nextPlaylist.get('id'));
            nextPlaylist.set('previousPlaylistId', previousPlaylist.get('id'));

            playlist.destroy({
                success: function () {
                    //  Remove from playlists clientside only after server responds with successful delete.
                    playlists.remove(playlist);
                },
                error: function (error) {
                    console.error(error);
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