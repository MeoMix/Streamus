//  TODO: Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var YouTubePlayer = null;
define(['youTubePlayerAPI'], function (youTubePlayerAPI) {
    'use strict';

    var YouTubePlayerModel = Backbone.Model.extend({
        defaults: {
            buffering: false,
            //  Returns the elapsed time of the currently loaded video. Returns 0 if no video is playing
            currentTime: 0,
            lastStateWasVidCued: false,
            ready: false,
            seeking: false,
            state: PlayerStates.UNSTARTED,
            //  Starts at 0, but is set when a video is set to VIDCUED.
            volume: 0,
            //  The actual YouTube player API object.
            youTubePlayer: null
        },
        
        //  Initialize the player by creating a YouTube Player IFrame hosting an HTML5 player
        initialize: function () {
            var self = this;
            youTubePlayerAPI.once('change:ready', function () {

                //  https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
                //  After the API's JavaScript code loads, the API will call the onYouTubeIframeAPIReady function.
                //  At which point you can construct a YT.Player object to insert a video player on your page.
                self.set('youTubePlayer', new window.YT.Player('MusicHolder', {
                    events: {
                        'onReady': function () {
                            self.set('ready', true);
                            //  TODO: Is this necessary?
                            self.get('youTubePlayer').unMute();

                            //  Start monitoring YouTube for current time changes.
                            setInterval(function () {
                                var currentTime = self.get('youTubePlayer').getCurrentTime();
                                        
                                if (!isNaN(currentTime)) {
                                    self.set('currentTime', Math.ceil(currentTime));
                                }
                            }, 500);

                            //  Update the volume whenever the UI modifies the volume property.
                            self.on('change:volume', function(volume) {
                                var youTubePlayer = self.get('youTubePlayer');
                                
                                if (volume) {
                                    youTubePlayer.setVolume(volume);
                                } else {
                                    youTubePlayer.muted();
                                }
                            });
                        },
                        'onStateChange': function (playerState) {
                            console.log("onStateChange received:", playerState.data);
                            //  The vidcued event is no good for us because player sends a pause event when transitioning
                            //  from vidcued to play. Consume this pause event.
                                
                            //  If the last state was vidcued AND the current state is paused -- don't go.
                            if (!(self.get('lastStateWasVidCued') && playerState.data === PlayerStates.PAUSED)) {
                                console.log("setting state to:", playerState.data);
                                self.set('state', playerState.data);
                            }
                                
                            switch (playerState.data) {
                                case PlayerStates.PLAYING:
                                    self.set('buffering', false);
                                    break;
                                case PlayerStates.VIDCUED:
                                    //  Returns undefined until youTubePlayer is in VIDCUED state.
                                    var volume = self.get('youTubePlayer').getVolume();
                                    self.set('volume', volume);
                                    self.set('lastStateWasVidCued', true);
                                    break;
                                default:
                                    break;
                            }

                        },
                        'onError': function (error) {
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
                }));
            });
        },
            
        cueVideoById: function (videoId) {
            this.get('youTubePlayer').cueVideoById({
                videoId: videoId,
                startSeconds: 0,
                suggestedQuality: 'default'
            });
        },
            
        loadVideoById: function (videoId) {
            this.set('buffering', true);

            this.get('youTubePlayer').loadVideoById({
                videoId: videoId,
                startSeconds: 0,
                suggestedQuality: 'default'
            });
        },

        pause: function () {
            this.get('youTubePlayer').pauseVideo();
        },
            
        play: function () {
            this.set('buffering', true);
            this.get('youTubePlayer').playVideo();
        },

        //  Called when the user clicks mousedown on the progress bar dragger.
        seekStart: function () {
            this.set('seeking', true);
            //  Need to record this to decide if should be playing after seek ends. You'd think that seek would handle this, but
            //  it does it incorrectly when a video hasn't been started. It will start to play a video if you seek in an unplayed video.
            this.wasPlayingBeforeSeek = this.playerState === PlayerStates.PLAYING;
            this.pause();
        },

        seekTo: function (timeInSeconds) {
            //  Once the user has seeked to the new value let our update function run again.
            //  Wrapped in a set timeout because there is some delay before the seekTo finishes executing and I want to prevent flickering.
            var self = this;
            //  TODO: Check this... Its probably just bad coding.
            setTimeout(function () {
                self.set('seeking', false);
            }, 1500);

            //  The true paramater allows the youTubePlayer to seek ahead past its buffered video.
            this.get('youTubePlayer').seekTo(timeInSeconds, true);

            if (this.get('playingBeforeSeek')) {
                this.play();
            } else {
                this.pause();
            }
        }
    });

    YouTubePlayer = new YouTubePlayerModel();

    return YouTubePlayer;
});