var YoutubePlayer = null;
define(['playlistManager', 'videoManager', 'playerBuilder'], function (playlistManager, videoManager, playerBuilder) {
    'use strict';

    //  Handles communications between the GUI and the YT Player API.
    YoutubePlayer = (function() {
        //  The actual youtubePlayer API object.
        var player = null;

        //  A communication port to the foreground. Needs to be re-established everytime foreground opens.
        var port = null;

        //  Initialize the player
        (function () {
            var onReady = function () {
                //  If there is a playlistItem to cue might as well have it ready to go.
                if (playlistManager.activePlaylist.get('items').length > 0) {
                    var selectedItem = playlistManager.activePlaylist.getSelectedItem();
                    cueItem(selectedItem);
                }
                
                refreshUI();
            };

            var onStateChange = function(playerState) {
                //If the video stopped playing and there's another playlistItem to skip to, do so.
                if (playerState.data === PlayerStates.ENDED) {
                    //Don't pass message to UI if it is closed. Handle sock change in the background.
                    //The player can be playing in the background and UI changes may try and be posted to the UI, need to prevent.
                    var isRadioModeEnabled = JSON.parse(localStorage.getItem('isRadioModeEnabled')) || false;

                    if (isRadioModeEnabled) {
                        var nextVideo = playlistManager.activePlaylist.getRelatedVideo();
                        var addedItem = playlistManager.activePlaylist.addItem(nextVideo);
                        
                        loadItem(addedItem);
                        
                    } else if (playlistManager.activePlaylist.get('items').length > 1) {
                        var nextItem = playlistManager.activePlaylist.gotoNextItem();
                        loadItem(nextItem);
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
                    alert("Video requested does not allow playback in the embedded players.");
                    break;
                }
            };

            //  Create YT player iframe.
            playerBuilder.buildPlayer('MusicHolder', onReady, onStateChange, onPlayerError, function(builtPlayer) {
                player = builtPlayer;
                
                //  Detect flash crashing and recover.
                setInterval(function() {
                    try {
                        player.getPlayerState();
                    } catch (e) {
                        console.error("FLASH HAS CRASHED GO GO GO!");
                        return;
                    }
                }, 1000);
            });
        })();

        function refreshUI() {
            if (port && port.postMessage) {
                port.postMessage();
            }
        };

        function cueItem(item) {
            var selectedItem = playlistManager.activePlaylist.selectItemById(item.get('id'));
            player.cueVideoById(selectedItem.get('videoId'));
        };

        function loadItem(item) {
            var selectedItem = playlistManager.activePlaylist.selectItemById(item.get('id'));
            player.loadVideoById(selectedItem.get('videoId'));
        };
        
        function loadItemById(id) {
            var selectedItem = playlistManager.activePlaylist.selectItemById(id);
            player.loadVideoById(selectedItem.get('videoId'));
        }

        function addItemByVideo(video) {
            var isFirstVideo = playlistManager.activePlaylist.get('items').length === 0;
            var addedItem = playlistManager.activePlaylist.addItem(video, isFirstVideo);

            if (isFirstVideo) {
                cueItem(addedItem);
            }
            
            refreshUI();
            return addedItem;
        };

        function removeItem(item) {
            var selectedItem = playlistManager.activePlaylist.getSelectedItem();
            if (selectedItem && selectedItem === item) {
                var nextItem = playlistManager.activePlaylist.gotoNextItem();
                
                //nextItem will equal item sometimes because gotoNextItem loops around to front of list.
                if (nextItem != null && nextItem !== item) {
                    if (player.getPlayerState() == PlayerStates.PLAYING) {
                        loadItem(nextItem);
                    } else {
                        cueItem(nextItem);
                    }
                } else {
                    player.pauseVideo();
                }
            }
            
            playlistManager.activePlaylist.removeItem(item);
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
            
            //  Returns the elapsed time of the currently loaded video. Returns 0 if no video is playing.
            get currentTime() {
                var currentTime = 0;
                if (playlistManager.activePlaylist.getSelectedItem()) {
                    if (player && player.getCurrentTime) {
                        var playerCurrentTime = player.getCurrentTime();
                        
                        if (!isNaN(playerCurrentTime)) {
                            currentTime = Math.ceil(playerCurrentTime);
                        }
                    }
                }

                return currentTime;
            },
           
            //  Return undefined until player has state VIDCUED
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

                    playlistManager.setActivePlaylistById(playlistId);

                    //  If the newly loaded playlist has a video to play cue it to replace the currently loaded video.
                    var firstItem = playlistManager.activePlaylist.get('items').at(0);
                    if (firstItem != null) {
                        cueItem(firstItem);
                    }

                    refreshUI();
                }
            },
            
            addPlaylist: function(playlistName, youtubePlaylistId) {
                playlistManager.addPlaylist(playlistName, function (playlist) {
                    //  Refresh the UI now to show that the playlist has been added.
                    refreshUI();

                    if (youtubePlaylistId) {
                        videoManager.loadVideosIncrementally(youtubePlaylistId, function (loadedVideos) {

                            if (loadedVideos) {
                                playlist.addItems(loadedVideos);
                                //  Continue refreshing the UI with every burst of videos loaded.
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
            
            addVideoByIdToPlaylist: function(id, playlistId){
                var playlist = playlistManager.getPlaylistById(playlistId);
                playlist.addVideoById(id);
            },
            
            getItemById: function(id) {
                return playlistManager.activePlaylist.getItemById(id);
            },
            
            orderByPositions: function (positions) {
                playlistManager.activePlaylist.orderByPositions(positions);
            },
            
            //  Called when the user clicks mousedown on the progress bar dragger.
            seekStart: function() {
                this.isSeeking = true;
                //  Need to record this to decide if should be playing after seek ends. You'd think that seek would handle this, but
                //  it does it incorrectly when a video hasn't been started. It will start to play a video if you seek in an unplayed video.
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
            
            loadItem: loadItem,
            loadItemById: loadItemById,
            
            cueItem: cueItem,
            
            removeItem: removeItem,
            
            //  Adds a video to the activePlaylist. If it is the first video in the activePlaylist, that video is loaded as the current video.
            addItemByVideo: addItemByVideo,
            
            play: function () {
                player.playVideo();
            },
            
            pause: function () {
                player.pauseVideo();
            },
            
            toggleVideo: function () {
                if( player.getPlayerState() === PlayerStates.PLAYING ){
                    this.pause();
                }
                else{
                    this.play();
                }
            },
            
            //  Skips to the next video. Will start playing the video if the player was already playing.
            //  if where == "next" it'll skip to the next video. otherwise it will skip to the previous video.
            skipVideo: function(where) {
                var nextItem;

                if (where == "next") {
                    var isRadioModeEnabled = JSON.parse(localStorage.getItem('isRadioModeEnabled') || false);
                    if (isRadioModeEnabled) {
                        var relatedVideo = playlistManager.activePlaylist.getRelatedVideo();

                        nextItem = playlistManager.activePlaylist.addItem(relatedVideo);
                    } else {

                        nextItem = playlistManager.activePlaylist.gotoNextItem();
                    }
                } else { //(where == "previous")
                    nextItem = playlistManager.activePlaylist.gotoPreviousItem();
                }

                if (this.playerState === PlayerStates.PLAYING) {
                    loadItem(nextItem);
                } else {
                    cueItem(nextItem);
                }
            },
            
            addNewItem: function (videoInformation) {
                var video = videoManager.createVideo(videoInformation, this.currentPlaylistId);
                addItemByVideo(video);
            },
            
            moveItem: playlistManager.activePlaylist.moveItem
        };
    })();
});