//  Holds all the relevant data for a video.
define(['playlists', 'playlist', 'videos', 'player', 'programState'], function (Playlists, Playlist, Videos, player, programState) {
    'use strict';
    
    var Stream = Backbone.Model.extend({
        defaults: function () {
            return {
                activePlaylist: null,
                id: null,
                userId: null,
                title: '',
                playlists: new Playlists(),
                firstListId: null
            };
        },
        urlRoot: programState.getBaseUrl() + 'Video/',
        initialize: function () {
            var playlists = this.get('playlists');

            //  Data was fetched from the server. Need to convert to Backbone.
            if (!(playlists instanceof Backbone.Collection)) {
                console.log("converting this to the correct", playlists);
                playlists = new Playlists(playlists);

                this.set('playlists', playlists, {
                    //  Silent operation because it isn't technically changing - just being made correct.
                    silent: true
                });
            }

            var self = this;
            playlists.on('change:selected', function (playlist, isSelected) {
                if (isSelected) {
                    self.set('activePlaylist', playlist);
                    
                    //  TODO: Can this be abstracted down to the playlist level?
                    playlist.get('items').on('change:selected', function (item, selected) {
                        console.log("activePlaylist change selected firing");
                        if (selected) {
                            var videoId = item.get('video').get('id');
                            console.log("loading/cueuing videoId", videoId);
                            //  Maintain the playing state by loading if playing. 
                            if (player.isPlaying()) {
                                player.loadVideoById(videoId);
                            } else {
                                player.cueVideoById(videoId);
                            }
                        }
                    });

                    playlist.get('items').on('remove', function (item) {

                        if (self.get('activePlaylist').get('items').length == 0) {
                            player.pause();
                        }
                    });
                } else {
                    if (self.get('activePlaylist') == playlist) {
                        playlist.get('items').off('change:selected add remove');
                        self.set('activePlaylist', null);
                    }
                }
                
            });
            
            //  If there is a playlistItem to cue might as well have it ready to go.
            if (playlists.length > 0) {
                var localStorageKey = this.get('id') + '_selectedListId';
                var savedListId = localStorage.getItem(localStorageKey);
                
                if (savedListId === null) {
                    savedListId = this.get('firstListId');
                }

                console.log("saved list ID:", savedListId);
                //  Select the most recently selected item during initalization.
                this.selectPlaylist(savedListId);
            }

            var activePlaylist = this.get('activePlaylist');
            if (activePlaylist.get('items').length > 0) {
                console.log("Cueing an item up");
                var selectedItem = activePlaylist.getSelectedItem();
                console.log("selected item currently:", selectedItem);

                if (selectedItem == null) {
                    selectedItem = activePlaylist.get('items').at(0);
                    activePlaylist.selectItemById(selectedItem.get('id'));
                    window && console.error("Failed to find a selected item in a playlist with items, gracefully recovering.");
                } else {
                    console.log("cueing");
                    player.cueVideoById(selectedItem.get('video').get('id'));
                }
            }
        },
        
        addVideoByIdToPlaylist: function (id, playlistId) {
            this.get('playlists').get(playlistId).addVideoByIdToPlaylist(id);
        },
        
        skipItem: function(where) {
            var activePlaylist = this.get('activePlaylist');

            var nextItem;

            if (where == "next") {
                var isRadioModeEnabled = JSON.parse(localStorage.getItem('isRadioModeEnabled') || false);
                
                if (isRadioModeEnabled) {
                    var relatedVideo = activePlaylist.getRelatedVideo();
                    nextItem = activePlaylist.addItem(relatedVideo);
                } else {

                    nextItem = activePlaylist.gotoNextItem();
                }
            } else {
                nextItem = activePlaylist.gotoPreviousItem();
            }

            activePlaylist.selectItemById(nextItem.get('id'));
        },
        
        //  TODO: move this to playlist instead of stream.
        removeItem: function (item) {
            var activePlaylist = this.get('activePlaylist');

            var selectedItem = activePlaylist.getSelectedItem();

            if (selectedItem && selectedItem === item) {
                var nextItem = activePlaylist.gotoNextItem();

                //  nextItem will equal item sometimes because gotoNextItem loops around to front of list.
                if (nextItem != null && nextItem !== item) {
                    activePlaylist.selectItemById(nextItem.get('id'));
                } else {
                    //  TODO: decouple player from stream.
                    player.pause();
                }
            }

            activePlaylist.removeItem(item);
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
            var activePlaylist = this.get('activePlaylist');
            
            if (activePlaylist == null || activePlaylist.get('id') !== playlistId) {
                //  TODO: Fire event here instead of coupling to player object.
                player.pause();

                var playlist = this.get('playlists').get(playlistId);

                if (activePlaylist != null && activePlaylist.get('id') !== playlist.get('id')) {
                    activePlaylist.set({ selected: false });
                }

                //First time loading up there won't be a playlist selected yet, so just go ahead and set.
                playlist.set({ selected: true });
                localStorage.setItem('selectedPlaylistId', playlist.get('id'));

                //  TODO: Need to implement the ability to select without playing.
                //  If the newly loaded playlist has a video to play cue it to replace the currently loaded video.
                var firstItem = playlist.get('items').at(0);
                if (firstItem != null) {
                    playlist.selectItemById(firstItem.get('id'));
                    player.cueVideoById(firstItem.get('video').get('id'));
                }
            }
        }
    });
    
    return function (config) {
        var stream = new Stream(config);

        return stream;
    };
});