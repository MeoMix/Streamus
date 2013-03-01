var YoutubePlayer = null;
define(['ytPlayerApiHelper'], function (ytPlayerApiHelper) {
    'use strict';

    //  The actual youtubePlayer API object.
    var player = null;
    var isReady;
    var lastStateWasVidCued;

    console.log("binding to onApiReady");
    //  Initialize the player by creating YT player iframe.
    ytPlayerApiHelper.once('change:ready', function () {

        //  https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
        //  After the API's JavaScript code loads, the API will call the onYouTubeIframeAPIReady function.
        //  At which point you can construct a YT.Player object to insert a video player on your page. 
        player = new YT.Player('MusicHolder', {
            events: {
                'onReady': function () {
                    isReady = true;
                    player.unMute();
                    $(document).trigger('player.onReady');
                },
                'onStateChange': function (playerState) {
                    //  The vidcued event is no good for us because player sends a pause event when transitioning
                    //  from vidcued to play. Consume this pause event.
                    if (!lastStateWasVidCued || playerState.data !== PlayerStates.PAUSED) {
                        $(document).trigger('player.onStateChange', playerState.data);
                    }
                    
                    if (playerState.data === PlayerStates.PLAYING) {
                        YoutubePlayer.isBuffering = false;
                    }

                    lastStateWasVidCued = playerState.data === PlayerStates.VIDCUED;
                },
                'onError': function(error) {
                    window && console.error("An error was encountered.", error);

                    switch (error.data) {
                        case 100:
                            alert("Video requested is not found. This occurs when a video has been removed or it has been marked as private.");
                            break;
                        case 101:
                        case 150:
                            alert("Video requested does not allow playback in the embedded players.");
                            break;
                    }
                }
            }
        });
    });
    
    //  Handles communications between the GUI and the YT Player API.
    YoutubePlayer = {
        isSeeking: false,
        isBuffering: false,

        wasPlayingBeforeSeek: false,
            
        onReady: function (event) {
            if (isReady) {
                event();
            } else {
                $(document).on('player.onReady', event);
            }
        },
            
        onStateChange: function(event) {
            $(document).on('player.onStateChange', event);
        },
        
        onBufferVideo: function (event) {
            $(document).on('player.onBufferVideo', event);
        },
        
        get isReady() {
            return isReady;
        },
            
        get playerState() {
            var state = PlayerStates.UNSTARTED;
            
            if (player && player.getPlayerState) {
                state = player.getPlayerState();
            }

            return state;
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

        cueVideoById: function (videoId) {
            player.cueVideoById({
                'videoId': videoId,
                'startSeconds': 0,
                'suggestedQuality': 'default'
            });
        },
            
        loadVideoById: function (videoId) {
            $(document).trigger('player.onBufferVideo');
            this.isBuffering = true;
            
            player.loadVideoById({
                'videoId': videoId,
                'startSeconds': 0,
                'suggestedQuality': 'default'
            });
        },
            
        play: function () {
            $(document).trigger('player.onBufferVideo');
            this.isBuffering = true;
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
            this.wasPlayingBeforeSeek = this.playerState === PlayerStates.PLAYING;
            this.pause();
        },
            
        seekTo: function(timeInSeconds) {
            //  Once the user has seeked to the new value let our update function run again.
            //  Wrapped in a set timeout because there is some delay before the seekTo finishes executing and I want to prevent flickering.
            var self = this;
            setTimeout(function() {
                self.isSeeking = false;
            }, 1500);

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