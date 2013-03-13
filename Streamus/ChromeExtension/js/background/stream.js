//  Holds all the relevant data for a video.
define(['playlists', 'playlist', 'videos', 'player', 'programState'], function (Playlists, Playlist, Videos, player, programState) {
    'use strict';
    
    var Stream = Backbone.Model.extend({
        defaults: function () {
            return {
                id: null,
                userId: null,
                title: '',
                playlists: new Playlists(),
                firstListId: null
            };
        },
        urlRoot: programState.getBaseUrl() + 'Video/',
        initialize: function () {
            window && console.log("Stream is initializing");
            var playlists = this.get('playlists');

            //  Data was fetched from the server. Need to convert to Backbone.
            if (!(playlists instanceof Backbone.Collection)) {
                console.log("Playlists BEFORE:", playlists);
                playlists = new Playlists(playlists);

                this.set('playlists', playlists, {
                    //  Silent operation because it isn't technically changing - just being made correct.
                    silent: true
                });

                console.log("Playlists AFTER:", playlists, this.get('playlists'));
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
            
            //  If there is a playlistItem to cue might as well have it ready to go.
            //if (playlists.length > 0) {
            //    var localStorageKey = this.get('id') + '_selectedListId';
            //    var savedListId = localStorage.getItem(localStorageKey);
                
            //    if (savedListId === null) {
            //        savedListId = this.get('firstListId');
            //    }
                
            //    //  Select the most recently selected item during initalization.
            //    this.selectPlaylist(savedListId);
            //}

            //var selectedPlaylist = this.getSelectedPlaylist();
            //if (selectedPlaylist.get('items').length > 0) {
            //    console.log("setting playlist selectedItem in stream?");
            //    var selectedItem = selectedPlaylist.getSelectedItem();

            //    if (selectedItem == null) {
            //        selectedItem = selectedPlaylist.get('items').at(0);
            //        selectedPlaylist.selectItem(selectedItem);
            //        window && console.error("Failed to find a selected item in a playlist with items, gracefully recovering.");
            //    } else {

            //        player.cueVideoById(selectedItem.get('video').get('id'));
            //    }
            //}
        },
        
        addVideoByIdToPlaylist: function (id, playlistId) {
            this.get('playlists').get(playlistId).addVideoByIdToPlaylist(id);
        },

        addPlaylist: function (playlistTitle, optionalPlaylistId, callback) {
            var playlist = new Playlist({
                title: playlistTitle,
                streamId: this.get('id')
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
            if (optionalPlaylistId) {
                    
                var startIndex = 1;
                var maxResultsPerSearch = 50;
                var totalVideosProcessed = 0;

                var videos = new Videos();

                var getVideosInterval = setInterval(function () {
                    $.ajax({

                        type: 'GET',
                        url: 'https://gdata.youtube.com/feeds/api/playlists/' + optionalPlaylistId,
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

                                    ytHelper.getVideoInformationFromId(videoId, function (videoInformation) {
                                        //  videoInformation will be null if it has been banned on copyright grounds

                                        if (videoInformation === null) {

                                            ytHelper.findPlayableByTitle(entry.title.$t, function (playableVideoInformation) {
                                                var id = playableVideoInformation.media$group.yt$videoid.$t;
                                                var durationInSeconds = parseInt(playableVideoInformation.media$group.yt$duration.seconds, 10);

                                                videos.push({
                                                    id: id,
                                                    playlistId: playlistId,
                                                    title: playableVideoInformation.title.$t,
                                                    duration: durationInSeconds
                                                });
                                                    
                                                totalVideosProcessed++;

                                                if (totalVideosProcessed == result.feed.entry.length) {
                                                    playlist.addItems(videos);
                                                }
                                            });

                                        } else {

                                            videos.add(video);
                                            totalVideosProcessed++;

                                            if (totalVideosProcessed == result.feed.entry.length) {
                                                playlist.addItems(videos);
                                            }
                                        }

                                    });
                                } else {

                                    totalVideosProcessed++;

                                    if (totalVideosProcessed == result.feed.entry.length) {
                                        playlist.addItems(videos);
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
        
        selectPlaylist: function(playlistId) {
            var selectedPlaylist = this.getSelectedPlaylist();
            
            if (selectedPlaylist == null || selectedPlaylist.get('id') !== playlistId) {

                //  Deselect any currently selected playlist.
                if (selectedPlaylist != null) {
                    selectedPlaylist.set({ selected: false });
                }
                
                //  Mark the new playlist as selected and save this state to localStorage for future UI openings.
                this.get('playlists').get(playlistId).set({ selected: true });
                localStorage.setItem('selectedPlaylistId', playlistId);
            }
        },
        
        getSelectedPlaylist: function() {
            return this.get('playlists').find(function(playlist) {
                return playlist.get('selected');
            });
        }
    });
    
    return function (config) {
        var stream = new Stream(config);

        return stream;
    };
});