//  TODO: Exposed globally for the foreground. Is there a better way?
var PlaylistManager = null;

//Manages an array of Playlist objects.
define(['playlist',
        'playlists',
        'playlistItem',
        'playlistItems',
        'loginManager',
        'player',
        'ytHelper',
        'videos'
    ], function(Playlist, Playlists, PlaylistItem, PlaylistItems, loginManager, player, ytHelper, Videos) {
        'use strict';

        ytHelper.getRelatedVideoInformation('QN7UAPOJZxM');

        var playlists = new Playlists();
        var activePlaylist = null;

        var events = {
            onActivePlaylistTitleChange: 'playlistManager.onActivePlaylistTitleChange',
            onPlaylistRemoved: 'playlistManager.onPlaylistRemoved',
            onPlaylistAdded: 'playlistManager.onPlaylistAdded',
            onActivePlaylistChange: 'playlistManager.onActivePlaylistChange',
            onActivePlaylistSelectedItemChanged: 'playlistManager.onActivePlaylistSelectedItemChanged',
            onActivePlaylistItemAdd: 'playlistManager.onActivePlaylistItemAdd',
            onActivePlaylistItemRemove: 'playlistManager.onActivePlaylistItemRemove',
            onActivePlaylistEmptied: 'playlistManager.onActivePlaylistEmptied'
        };

        loginManager.onLoggedIn(function() {
            player.onReady(function() {
                initializeWithUser();
            });
        });
        
        function initializeWithUser() {
            playlists = loginManager.get('user').get('playlistCollections').at(0).get('playlists');

            playlists.on('change:selected', function (playlist, isSelected) {
                if (isSelected) {
                    activePlaylist = playlist;
                    activePlaylist.get('items').on('change:selected', function (item) {

                        if (item.get('selected')) {
                            var videoId = item.get('video').get('id');
                            
                            //  Maintain the playing state by loading if playing. 
                            if (player.playerState === PlayerStates.PLAYING) {
                                player.loadVideoById(videoId);
                            } else {
                                player.cueVideoById(videoId);
                            } 
                        }

                        $(document).trigger(events.onActivePlaylistSelectedItemChanged, item);
                    });

                    activePlaylist.get('items').on('add', function (item) {
                        $(document).trigger(events.onActivePlaylistItemAdd, item);
                    });

                    activePlaylist.get('items').on('remove', function (item) {
                        $(document).trigger(events.onActivePlaylistItemRemove, item);

                        if (activePlaylist.get('items').length == 0) {
                            player.pause();
                            $(document).trigger(events.onActivePlaylistEmptied, item);
                        }
                    });
                } else {
                    if (activePlaylist == playlist) {
                        activePlaylist.get('items').off('change:selected add remove');
                        activePlaylist = null;
                    }
                }
            });

            playlists.on('remove', function () {
                $(document).trigger(events.onPlaylistRemoved);
            });

            playlists.on('add', function () {
                $(document).trigger(events.onPlaylistAdded);
            });

            //  PlaylistManager will remember the selected playlist via localStorage.
            var savedId = localStorage.getItem('selectedPlaylistId');
            var playlistToSelect = playlists.get(savedId) || playlists.at(0);

            setSelectedPlaylist(playlistToSelect);

            //  If there is a playlistItem to cue might as well have it ready to go.
            if (activePlaylist.get('items').length > 0) {
                var selectedItem = activePlaylist.getSelectedItem();

                if (selectedItem == null) {
                    selectedItem = activePlaylist.get('items').at(0);
                    activePlaylist.selectItemById(selectedItem.get('id'));
                    window && console.error("Failed to find a selected item in a playlist with items, gracefully recovering.");
                } else {
                    player.cueVideoById(selectedItem.get('video').get('id'));
                }

            }
        }
        
        player.onStateChange(function(event, playerState) {
            //  If the video stopped playing and there's another playlistItem to skip to, do so.
            if (playerState === PlayerStates.ENDED) {
                //  Don't pass message to UI if it is closed. Handle sock change in the background.
                //  The player can be playing in the background and UI changes may try and be posted to the UI, need to prevent.
                var isRadioModeEnabled = JSON.parse(localStorage.getItem('isRadioModeEnabled')) || false;

                var nextItem;
                if (isRadioModeEnabled) {
                    var nextVideo = activePlaylist.getRelatedVideo();
                    nextItem = activePlaylist.addItem(nextVideo);

                } else {
                    nextItem = activePlaylist.gotoNextItem();
                }
                
                var selectedItem = activePlaylist.selectItemById(nextItem.get('id'));
                player.loadVideoById(selectedItem.get('video').get('id'));
            }

        });

        function setSelectedPlaylist(playlistToSelect) {

            if (activePlaylist != null && activePlaylist.get('id') != playlistToSelect.get('id')) {
                activePlaylist.set({ selected: false });
            }

            //First time loading up there won't be a playlist selected yet, so just go ahead and set.
            playlistToSelect.set({ selected: true });
            localStorage.setItem('selectedPlaylistId', playlistToSelect.get('id'));
            $(document).trigger(events.onActivePlaylistChange, playlistToSelect);
        }

        PlaylistManager = {
            onActivePlaylistEmptied: function(event) {
                $(document).on(events.onActivePlaylistEmptied, event);
            },
            onActivePlaylistItemAdd: function(event) {
                $(document).on(events.onActivePlaylistItemAdd, event);
            },
            onActivePlaylistItemRemove: function(event) {
                $(document).on(events.onActivePlaylistItemRemove, event);
            },
            onActivePlaylistSelectedItemChanged: function (event) {
                $(document).on(events.onActivePlaylistSelectedItemChanged, event);
            },
            onActivePlaylistChange: function(event) {
                $(document).on(events.onActivePlaylistChange, event);
            },
            //  TODO: Replace when more backboney
            onActivePlaylistTitleChange: function(event) {
                $(document).on(events.onActivePlaylistTitleChange, event);
            },
            onPlaylistRemoved: function (event) {
                $(document).on(events.onPlaylistRemoved, event);
            },
            onPlaylistAdded: function(event) {
                $(document).on(events.onPlaylistAdded, event);
            },
            get playlists() {
                return playlists;
            },
            get activePlaylist() {
                return activePlaylist;
            },
            get playlistTitle() {
                return this.activePlaylist.get('title');
            },
            set playlistTitle(value) {
                this.activePlaylist.set('title', value);
                $(document).trigger(events.onActivePlaylistTitleChange, value);
            },
            
            set activePlaylist(value) {
                setSelectedPlaylist(value);
            },
            
            addVideoByIdToPlaylist: function (id, playlistId) {
                var playlist = this.getPlaylistById(playlistId);
                playlist.addVideoById(id);
            },
                        
            //  Skips to the next playlistItem. Will start playing the video if the player was already playing.
            //  if where == "next" it'll skip to the next item otherwise it will skip to the previous.
            skipItem: function(where) {
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
            
            removeItem: function (item) {
                var selectedItem = activePlaylist.getSelectedItem();

                if (selectedItem && selectedItem === item) {
                    var nextItem = activePlaylist.gotoNextItem();

                    //  nextItem will equal item sometimes because gotoNextItem loops around to front of list.
                    if (nextItem != null && nextItem !== item) {
                        activePlaylist.selectItemById(nextItem.get('id'));
                    } else {
                        player.pause();
                    }
                }

                activePlaylist.removeItem(item);
            },
            
            selectPlaylist: function (playlistId) {
                if (activePlaylist.get('id') !== playlistId) {
                    player.pause();

                    var playlist = playlists.get(playlistId);
                    setSelectedPlaylist(playlist);

                    //  TODO: Need to implement the ability to select without playing.
                    //  If the newly loaded playlist has a video to play cue it to replace the currently loaded video.
                    var firstItem = activePlaylist.get('items').at(0);
                    if (firstItem != null) {
                        activePlaylist.selectItemById(firstItem.get('id'));
                        player.cueVideoById(firstItem.get('video').get('id'));
                    }
                }
            },
            
            addPlaylist: function (playlistTitle, optionalPlaylistId, callback) {
                var user = loginManager.get('user');
                var playlistCollection = user.get('playlistCollections').at(0);

                var playlist = new Playlist({
                    title: playlistTitle,
                    collectionId: playlistCollection.get('id')
                });

                var currentPlaylists = playlistCollection.get('playlists');

                //  Save the playlist, but push after version from server because the ID will have changed.
                playlist.save(new Array(), {
                    success: function() {
                        var playlistId = playlist.get('id');
                        console.log("Save success:", playlistId);
                        console.log("playlistCollection:", playlistCollection);

                        if (currentPlaylists.length === 0) {
                            playlistCollection.set('firstListId', playlistId);
                            playlist.set('nextListId', playlistId);
                            playlist.set('previousListId', playlistId);
                        } else {
                            var firstList = currentPlaylists.get(playlistCollection.get('firstListId'));
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
            
            removePlaylistById: function (playlistId) {
                //Don't allow removing of active playlist.
                //TODO: Perhaps just don't allow deleting the last playlist? More difficult.
                if (activePlaylist.get('id') !== playlistId) {
                    var playlist = playlists.get(playlistId);
                    
                    var user = loginManager.get('user');
                    var playlistCollection = user.get('playlistCollections').at(0);
                    
                    if (playlistCollection.get('firstListId') === playlistId) {
                        var newFirstListId = playlist.get('nextListId');
                        playlistCollection.set('firstListId', newFirstListId);
                    }

                    var previousList = playlistCollection.get('playlists').get(playlist.get('previousListId'));
                    var nextList = playlistCollection.get('playlists').get(playlist.get('nextListId'));

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
                }
            }
        };

        return PlaylistManager;
    });