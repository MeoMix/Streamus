var YoutubePlayer = null;
define(['playlistManager', 'songManager', 'playerBuilder', 'ytHelper'], function(playlistManager, songManager, playerBuilder, ytHelper) {
    'use strict';
    console.log('inside player');
    //Handles communications between the GUI and the YT Player API.
    YoutubePlayer = (function() {
        //The actual youtubePlayer API object.
        var player = null;

        //A communication port to the foreground. Needs to be re-established everytime foreground opens.
        var port = null;

        //Initialize the player
        (function () {
            var onReady = function () {
                //If there is a song to cue might as well have it ready to go.
                if (playlistManager.activePlaylist.get('items').length > 0) {
                    console.log("cueuing item by position!");
                    cueItemByPosition(playlistManager.activePlaylist.getSelectedItem().get('position'));
                }
                refreshUI();
            };

            var onStateChange = function(playerState) {
                //If the song stopped playing and there's another song to skip to, do so.
                if (playerState.data === PlayerStates.ENDED) {
                    //Don't pass message to UI if it is closed. Handle sock change in the background.
                    //The player can be playing in the background and UI changes may try and be posted to the UI, need to prevent.
                    var isRadioModeEnabled = JSON.parse(localStorage.getItem('isRadioModeEnabled')) || false;
                    if (isRadioModeEnabled) {
                        var nextSong = playlistManager.activePlaylist.getRelatedVideo();
                        console.log("nextSong relatedVideo:", nextSong);
                        var addedItem = playlistManager.activePlaylist.addItem(nextSong);
                        loadItemByPosition(addedItem.get('position'));
                    } else {
                        if (playlistManager.activePlaylist.get('items').length > 1) {
                            var nextItem = playlistManager.activePlaylist.gotoNextItem();
                            loadItemByPosition(nextItem.get('position'));
                        }
                    }
                }

                refreshUI();
            };

            var onPlayerError = function (error) {
                console.error("An error was encountered.", error);

                switch (error.data) {
                case 100:
                    alert("Video requested is not found. This occurs when a video has been removed or it has been marked as private.");
                    break;
                case 101:
                case 150:
                    alert("Video requested does not allow playback in the embedded players. Finding replacement song.");
                    break;
                }
            };

            console.log("trying to build player");
            //Create YT player iframe.
            playerBuilder.buildPlayer('MusicHolder', onReady, onStateChange, onPlayerError, function(builtPlayer) {
                console.log("successfully built player");
                player = builtPlayer;
                //Detect flash crashing and recover.
                setInterval(function() {
                    try {
                        player.getPlayerState();
                    } catch (e) {
                        console.error("FLASH HAS CRASHED GO GO GO!");
                        return;
                    }
                }, 1000); // check it out every one second
            });
        })();

        function refreshUI() {
            if (port && port.postMessage) {
                port.postMessage();
            }
        };

        function cueItemByPosition(position) {
            var selectedItem = playlistManager.activePlaylist.selectItemByPosition(position);
            player.cueVideoById(selectedItem.get('videoId'));
        };

        function loadItemByPosition(position) {
            var selectedItem = playlistManager.activePlaylist.selectItemByPosition(position);
            player.loadVideoById(selectedItem.get('videoId'));
        };

        function addItemBySong(song) {
            var isFirstSong = playlistManager.activePlaylist.get('items').length === 0;
            var addedItem = playlistManager.activePlaylist.addItem(song, isFirstSong);
            console.log("Successfully added item by song:", addedItem);
            if (isFirstSong) {
                cueItemByPosition(addedItem.get('position'));
            }
            
            refreshUI();
            return addedItem;
        };

        var removeItemByPosition = function (position) {
            var selectedItem = playlistManager.activePlaylist.getSelectedItem();
            if (selectedItem && selectedItem.get('position') === position) {
                var nextItem = playlistManager.activePlaylist.gotoNextItem();
                
                //nextItem position will equal position sometimes because gotoNextItem loops around to front of list.
                if (nextItem != null && nextItem.get('position') !== position) {
                    if (player.getPlayerState() == PlayerStates.PLAYING) {
                        loadItemByPosition(nextItem.get('position'));
                    } else {
                        cueItemByPosition(nextItem.get('position'));
                    }
                } else {
                    player.pauseVideo();
                }
            }
            
            playlistManager.activePlaylist.removeItemByPosition(position);
            refreshUI();
        };

        return {
            isSeeking: false,
            wasPlayingBeforeSeek: false,
            get playlistTitle() {
                return playlistManager.activePlaylist.get('title');
            },
            
            set playlistTitle(value) {
                playlistManager.activePlaylist.set('title', value);
                refreshUI();
            },
            
            get playlists() {
                return playlistManager.playlists;
            },
            
            get playerState() {
                return (player && player.getPlayerState) ? player.getPlayerState() : PlayerStates.UNSTARTED;
            },
            
            get items() {
                return playlistManager.activePlaylist.get('items');
            },
            
            get currentPlaylistId() {
                return playlistManager.activePlaylist.get('id');
            },
            
            get selectedItem() {
                return playlistManager.activePlaylist.getSelectedItem();
            },
            
            //Returns the elapsed time of the currently loaded song. Returns 0 if no song is playing.
            get currentTime() {
                var currentTime = 0;
                if (playlistManager.activePlaylist.getSelectedItem()) {
                    if (player && player.getCurrentTime) {
                        currentTime = Math.ceil(player.getCurrentTime());
                    }
                }

                return currentTime;
            },
            
            //Gets the total time of the currently loaded song. Returns 0 if there is no song loaded.
            //TODO: I really don't like how this has to query songManager every time.
            get totalTime() {
                var totalTime = 0;
                var selectedItem = playlistManager.activePlaylist.getSelectedItem();

                if (selectedItem) {
                    var selectedVideoId = selectedItem.get('videoId');
                    var currentSong = songManager.getLoadedSongByVideoId(selectedVideoId);
                    totalTime = currentSong ? currentSong.duration : 0;
                }

                return totalTime;
            },
            
            //Return undefined until player has state VIDCUED
            get volume() {
                return (player && player.getVolume) ? player.getVolume() : 0;
            },
            
            set volume(value) {
                if (value) {
                    player.setVolume(value);
                } else {
                    player.mute();
                }
            },
            
            connect: function() {
                //Open a connection between the background and foreground. The connection will become invalid every time the foreground closes.
                port = chrome.extension.connect({ name: "statusPoller" });
                port.onDisconnect.addListener(function() {
                    port = null;
                });
            },
            
            selectPlaylist: function(playlistId) {
                if (playlistManager.activePlaylist.get('id') !== playlistId) {
                    this.pause();

                    console.log("selecting playlist by id:", playlistId);
                    playlistManager.setActivePlaylistById(playlistId);
                    console.log("active playlist title and items:", playlistManager.activePlaylist.get('title'), playlistManager.activePlaylist.get('items'));
                    //If the newly loaded playlist has a song to play cue it to replace the currently loaded song.
                    if (playlistManager.activePlaylist.get('items').length > 0) {
                        cueItemByPosition(0);
                    }

                    refreshUI();
                }
            },
            
            addPlaylist: function(playlistName, youtubePlaylistId) {
                playlistManager.addPlaylist(playlistName, function (playlist) {
                    //Refresh the UI now to show that the playlist has been added.
                    refreshUI();

                    if (youtubePlaylistId) {
                        songManager.loadSongsIncrementally(youtubePlaylistId, function (loadedSongs) {
                            console.log("load songs incrementally returned:", loadedSongs);
                            if (loadedSongs) {
                                playlist.addItems(loadedSongs);
                                //Continue refreshing the UI with every burst of songs loaded.
                                refreshUI();
                            }
                        });
                    }
                });
            },
            
            removePlaylistById: function(playlistId) {
                //Don't allow removing of active playlist.
                //TODO: Perhaps just don't allow deleting the last playlist? More difficult.
                if (playlistManager.activePlaylist.get('id') !== playlistId) {
                    playlistManager.removePlaylistById(playlistId);
                    refreshUI();
                }
            },
            
            addSongToPlaylist: function(videoId, playlistId){
                var playlist = playlistManager.getPlaylistById(playlistId);
                playlist.addSongByVideoId(videoId);
            },
            
            getItemByPosition: function(position) {
                return playlistManager.activePlaylist.getItemByPosition(position);
            },
            
            orderByPositions: function (positions) {
                playlistManager.activePlaylist.orderByPositions(positions);
            },
            
            //Called when the user clicks mousedown on the progress bar dragger.
            seekStart: function() {
                this.isSeeking = true;
                //Need to record this to decide if should be playing after seek ends. You'd think that seek would handle this, but
                //it does it incorrectly when a song hasn't been started. It will start to play a song if you seek in an unplayed song.
                this.wasPlayingBeforeSeek = player.getPlayerState() === PlayerStates.PLAYING;
                this.pause();
            },
            
            seekTo: function(timeInSeconds) {
                //Once the user has seeked to the new value let our update function run again.
                //Wrapped in a set timeout because there is some delay before the seekTo finishes executing and I want to prevent flickering.
                var self = this;
                setTimeout(function() {
                    self.isSeeking = false;
                }, 1500);

                //allowSeekAhead determines whether the player will make a new request to the server if the time specified is outside of the currently buffered video data.
                player.seekTo(timeInSeconds, true);
                if (this.wasPlayingBeforeSeek) {
                    this.play();
                } else {
                    this.pause();
                }
            },
            
            loadItemByPosition: loadItemByPosition,
            
            cueItemByPosition: cueItemByPosition,
            
            removeItemByPosition: removeItemByPosition,
            
            //Adds a song to the activePlaylist. If it is the first song in the activePlaylist, that song is loaded as the current song.
            addItemBySong: addItemBySong,
            
            play: function () {
                player.playVideo();
            },
            
            pause: function () {
                player.pauseVideo();
            },
            
            toggleSong: function () {
                if( player.getPlayerState() === PlayerStates.PLAYING ){
                    this.pause();
                }
                else{
                    this.play();
                }
            },
            
            //Skips to the next song. Will start playing the song if the player was already playing.
            //if where == "next" it'll skip to the next song. otherwise it will skip to the previous song.
            skipSong: function(where) {
                var nextItem;

                if (where == "next") {
                    var isRadioModeEnabled = JSON.parse(localStorage.getItem('isRadioModeEnabled')) || false;

                    if (isRadioModeEnabled) {
                        var relatedVideo = playlistManager.activePlaylist.getRelatedVideo();
                        console.log("related Video:", relatedVideo);
                        nextItem = playlistManager.activePlaylist.addItem(relatedVideo);
                    } else {
                        nextItem = playlistManager.activePlaylist.gotoNextItem();
                    }
                } else { //(where == "previous")
                    nextItem = playlistManager.activePlaylist.gotoPreviousItem();
                }

                if (this.playerState === PlayerStates.PLAYING) {
                    loadItemByPosition(nextItem.get('position'));
                } else {
                    cueItemByPosition(nextItem.get('position'));
                }
            },
            
            addNewItem: function (videoInformation) {
                var song = songManager.createSong(videoInformation, this.currentPlaylistId);
                console.log("created new song:", song);
                addItemBySong(song);
            },
            
            updatePlaylistItemPosition: function(oldPosition, newPosition) {
                playlistManager.activePlaylist.updateItemPosition(oldPosition, newPosition);
            }
        };
    })();
});