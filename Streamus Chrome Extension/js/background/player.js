//  TODO: Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var YouTubePlayer = null;
define(['youTubePlayerAPI', 'ytHelper', 'localStorageManager', 'iconManager'], function (youTubePlayerAPI, ytHelper, localStorageManager, iconManager) {
    'use strict';

    var youTubePlayerModel = Backbone.Model.extend({
        defaults: {
            buffering: false,
            //  Returns the elapsed time of the currently loaded video. Returns 0 if no video is playing
            currentTime: 0,
            ready: false,
            state: PlayerStates.UNSTARTED,
            volume: localStorageManager.getVolume(),
            //  This will be set after the player is ready and can communicate its true value.
            muted: false,
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

                            //  Start monitoring YouTube for current time changes, foreground will pick up on currentTime changes.
                            setInterval(function () {
                                var currentTime = self.get('youTubePlayer').getCurrentTime();

                                if (!isNaN(currentTime)) {
                                    self.set('currentTime', Math.ceil(currentTime));
                                }
                            }, 500);

                            var isMuted = self.get('youTubePlayer').isMuted();
                            self.set('muted', isMuted);

                            //  Update the volume whenever the UI modifies the volume property.
                            self.on('change:volume', function (model, volume) {
                                localStorageManager.setVolume(volume);
                                self.set('muted', false);

                                var youTubePlayer = self.get('youTubePlayer');
                                youTubePlayer.setVolume(volume);
                            });

                            self.on('change:muted', function (model, isMuted) {
                                var youTubePlayer = self.get('youTubePlayer');

                                if (isMuted) {
                                    youTubePlayer.mute();
                                } else {
                                    youTubePlayer.unMute();
                                }

                            });

                            self.on('change:volume', function (model, volume) {
                                
                                if (volume === 100) {
                                    chrome.browserAction.setIcon({
                                        path: "../../images/streamus_icon128.png"
                                    });
                                } else {
                                    chrome.browserAction.setIcon({
                                        path: "../../images/streamus_icon19.png"
                                    });
                                }

                            });
                            
                            //  Keep the player out of UNSTARTED state because seekTo will start playing if in UNSTARTED and not PAUSED
                            self.pause();
                            
                            //  Announce that the YouTube Player is ready to go.
                            self.set('ready', true);
                        },
                        'onStateChange': function (playerState) {
                            if (playerState.data === PlayerStates.BUFFERING) {
                                self.set('buffering', true);
                            }

                            //  The vidcued -> paused transition needs to be partially consumed to be visually pleasing.
                            //  If the last state was vidcued AND the current state is paused -- skip.
                            if (!(self.get('state') === PlayerStates.VIDCUED && playerState.data === PlayerStates.PAUSED)) {
                                self.set('state', playerState.data);
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
            this.pause();

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
        
        isPlaying: function () {
            return this.get('state') === PlayerStates.PLAYING;
        },

        pause: function () {
            this.set('buffering', false);
            this.get('youTubePlayer').pauseVideo();
        },
            
        play: function () {
            if (!this.isPlaying()) {

                this.set('buffering', true);
                this.get('youTubePlayer').playVideo();
            }
        },

        seekTo: function (timeInSeconds) {

            var youTubePlayer = this.get('youTubePlayer');
            //  YouTube documentation states that SeekTo will start playing when transitioning from the UNSTARTED state.
            //  This is counter-intuitive because UNSTARTED and PAUSED are the same to a user, but result in different effects.
            //  As such, I re-cue the video with a different start time if the user seeks.
            if (this.get('state') === PlayerStates.UNSTARTED) {
                var videoId = ytHelper.parseVideoIdFromUrl(youTubePlayer.getVideoUrl());
 
                youTubePlayer.cueVideoById({
                    videoId: videoId,
                    startSeconds: timeInSeconds,
                    suggestedQuality: 'default'
                });
                
            } else {
                //  The true paramater allows the youTubePlayer to seek ahead past its buffered video.
                youTubePlayer.seekTo(timeInSeconds, true);
            }
            
        }
    });

    YouTubePlayer = new youTubePlayerModel();

    return YouTubePlayer;
});