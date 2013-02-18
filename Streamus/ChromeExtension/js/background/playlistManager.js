//  TODO: Exposed globally for the foreground. Is there a better way?
var PlaylistManager = null;

//Manages an array of Playlist objects.
define(['playlist',
        'playlists',
        'playlistItem',
        'playlistItems',
        'loginManager',
        'videoManager',
        'player'
    ], function(Playlist, Playlists, PlaylistItem, PlaylistItems, loginManager, videoManager, player) {
        'use strict';

        console.log("loaded stuff:", player);

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

        loginManager.once('loggedIn', function () {
            playlists = loginManager.get('user').get('playlistCollections').at(0).get('playlists');
            
            playlists.on('change:selected', function (playlist, isSelected) {
                if (isSelected) {
                    activePlaylist = playlist;
                    activePlaylist.get('items').on('change:selected', function (item) {
                        $(document).trigger(events.onActivePlaylistSelectedItemChanged, item);
                    });

                    activePlaylist.get('items').on('add', function(item) {
                        $(document).trigger(events.onActivePlaylistItemAdd, item);
                    });

                    activePlaylist.get('items').on('remove', function (item) {
                        $(document).trigger(events.onActivePlaylistItemRemove, item);
                        
                        if (activePlaylist.get('items').length == 0) {
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

            playlists.on('remove', function() {
                $(document).trigger(events.onPlaylistRemoved);
            });

            playlists.on('add', function() {
                $(document).trigger(events.onPlaylistAdded);
            });

            //  PlaylistManager will remember the selected playlist via localStorage.
            var savedId = localStorage.getItem('selectedPlaylistId');
            var playlistToSelect = playlists.get(savedId) || playlists.at(0);

            setSelectedPlaylist(playlistToSelect);

            //  If there is a playlistItem to cue might as well have it ready to go.
            if (activePlaylist.get('items').length > 0) {
                var selectedItem = activePlaylist.getSelectedItem();
                player.cueVideoById(selectedItem.get('videoId'));
            }
        });

        
        //  TODO: Should be able to login asynchronously.
        player.onReady(function () {
            loginManager.login();
        });

        player.onStateChange(function(event, playerState) {
            //  If the video stopped playing and there's another playlistItem to skip to, do so.
            if (playerState.data === PlayerStates.ENDED) {
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
                player.loadVideoById(selectedItem.get('videoId'));
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
                if (this.playerState === PlayerStates.PLAYING) {
                    player.loadVideoById(nextItem.get('videoId'));
                } else {
                    player.cueVideoById(nextItem.get('videoId'));
                }
            },
            
            removeItem: function (item) {
                var selectedItem = activePlaylist.getSelectedItem();

                if (selectedItem && selectedItem === item) {
                    var nextItem = activePlaylist.gotoNextItem();

                    //  nextItem will equal item sometimes because gotoNextItem loops around to front of list.
                    if (nextItem != null && nextItem !== item) {
                        activePlaylist.selectItemById(nextItem.get('id'));
                        
                        if (player.getPlayerState() == PlayerStates.PLAYING) {
                            player.loadVideoById(nextItem.get('videoId'));
                            
                        } else {
                            player.cueVideoById(nextItem.get('videoId'));
                        }
                    } else {
                        player.pauseVideo();
                    }
                }

                activePlaylist.removeItem(item);
            },
            
            selectPlaylist: function (playlistId) {
                if (activePlaylist.get('id') !== playlistId) {
                    player.pause();

                    var playlist = playlists.get(id);
                    setSelectedPlaylist(playlist);

                    //  TODO: Need to implement the ability to select without playing.
                    //  If the newly loaded playlist has a video to play cue it to replace the currently loaded video.
                    var firstItem = activePlaylist.get('items').at(0);
                    if (firstItem != null) {
                        activePlaylist.selectItemById(firstItem.get('id'));
                        player.cueVideoById(firstItem.get('videoId'));
                    }
                }
            },
            
            addPlaylist: function (playlistTitle, optionalPlaylistId, callback) {
                var user = loginManager.get('user');
                var collectionId = user.get('playlistCollections').at(0).get('id');

                var playlist = new Playlist({
                    title: playlistTitle,
                    position: playlists.length,
                    collectionId: collectionId
                });

                //  Save the playlist, but push after version from server because the ID will have changed.
                playlist.save(new Array(), {
                    success: function() {
                        playlists.push(playlist);

                        if (callback) {
                            callback(playlist);
                        }
                    },
                    error: function(error) {
                        console.error(error);
                    }
                });
                
                if (optionalPlaylistId) {
                    videoManager.loadVideosIncrementally(optionalPlaylistId, function (loadedVideos) {

                        if (loadedVideos) {
                            playlist.addItems(loadedVideos);
                        }
                    });
                }
            },
            
            removePlaylistById: function (playlistId) {
                //Don't allow removing of active playlist.
                //TODO: Perhaps just don't allow deleting the last playlist? More difficult.
                if (activePlaylist.get('id') !== playlistId) {
                    var playlist = playlists.get(playlistId);

                    playlist.destroy({
                        success: function () {
                            //  Remove from playlists clientside only after server responds with successful delete.
                            playlists.remove(playlist);
                        },
                        error: function (error) {
                            console.error(error);
                        }
                    });
                }
            }
        };

        return PlaylistManager;
    });