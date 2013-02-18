var YoutubePlayer = null;
define(['playerBuilder'], function (playerBuilder) {
    'use strict';

    //  The actual youtubePlayer API object.
    var player = null;

    //  Initialize the player by creating YT player iframe.
    playerBuilder.buildPlayer('MusicHolder', onReady, onStateChange, onPlayerError, function (builtPlayer) {
        console.log("player is built");
        player = builtPlayer;
    });

    function onReady() {
        console.log("triggering ready");
        $(document).trigger('player.onReady');
    };

    function onStateChange(playerState) {
        $(document).trigger('player.onStateChange', playerState.data);
    };

    function onPlayerError(error) {
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
    
    //  Handles communications between the GUI and the YT Player API.
    YoutubePlayer = {
        isSeeking: false,
            
        wasPlayingBeforeSeek: false,
            
        onReady: function(event) {
            $(document).on('player.onReady', event);
        },
            
        onStateChange: function(event) {
            $(document).on('player.onStateChange', event);
        },
            
        get playerState() {
            return (player && player.getPlayerState) ? player.getPlayerState() : PlayerStates.UNSTARTED;
        },

        //  Returns the elapsed time of the currently loaded video. Returns 0 if no video is playing.
        get currentTime() {
            var currentTime = 0;
                
            if (player && player.getCurrentTime) {
                var playerCurrentTime = player.getCurrentTime();
                        
                if (!isNaN(playerCurrentTime)) {
                    currentTime = Math.ceil(playerCurrentTime);
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

        cueVideoById: function(videoId) {
            player.cueVideoById(videoId);
        },
            
        loadVideoById: function (videoId) {
            player.loadVideoById(videoId);
        },
            
        play: function() {
            player.playVideo();
        },
        
        pause: function() {
            player.pauseVideo();
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
            //  Once the user has seeked to the new value let our update function run again.
            //  Wrapped in a set timeout because there is some delay before the seekTo finishes executing and I want to prevent flickering.
            var self = this;
            setTimeout(function() {
                self.isSeeking = false;
            }, 1500);

            //  allowSeekAhead determines whether the player will make a new request to the server if the time specified is outside of the currently buffered video data.
            player.seekTo(timeInSeconds, true);
            if (this.wasPlayingBeforeSeek) {
                this.play();
            } else {
                this.pause();
            }
        }
    };

    return YoutubePlayer;
});