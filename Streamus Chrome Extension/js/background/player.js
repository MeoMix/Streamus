//  TODO: Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var YouTubePlayer = null;

define(['youTubePlayerAPI', 'ytHelper', 'iconManager'], function (youTubePlayerAPI, ytHelper, iconManager) {
    'use strict';

    var youTubePlayerModel = Backbone.Model.extend({
        defaults: {
            buffering: false,
            //  Returns the elapsed time of the currently loaded video. Returns 0 if no video is playing
            currentTime: 0,
            ready: false,
            state: PlayerStates.UNSTARTED,
            videoStreamSrc: null,
            //  This will be set after the player is ready and can communicate its true value.
            //  Default to 50 because having the music on and audible, but not blasting, seems like the best default if we fail for some reason.
            volume: 50,
            //  This will be set after the player is ready and can communicate its true value.
            muted: false,
            loadedVideoId: '',
            //  The video object which will hold the iframe-removed player
            streamusPlayer: null,
            //  The actual YouTube player API object.
            youTubePlayer: null,
            wasBuffering: false
        },
        
        //  Initialize the player by creating a YouTube Player IFrame hosting an HTML5 player
        initialize: function () {
            var self = this;
   
            //  Update the volume whenever the UI modifies the volume property.
            self.on('change:volume', function (model, volume) {
                self.set('muted', false);
                //  We want to update the youtube player's volume no matter what because it persists between browser sessions
                //  thanks to YouTube saving it -- so should keep it always sync'ed.
                self.get('youTubePlayer').setVolume(volume);
                
                var streamusPlayer = self.get('streamusPlayer');
                
                if (streamusPlayer != null) {
                    streamusPlayer.volume = volume / 100;
                } 
            });

            self.on('change:muted', function (model, isMuted) {
                var youTubePlayer = self.get('youTubePlayer');
                //  Same logic here as with the volume
                if (isMuted) {
                    youTubePlayer.mute();
                } else {
                    youTubePlayer.unMute();
                }
                
                var streamusPlayer = self.get('streamusPlayer');
                
                if (streamusPlayer != null) {
                    streamusPlayer.muted = isMuted;
                }

                iconManager.setIcon(this.get('state'), isMuted, this.get('volume'));
            });

            self.on('change:state', function (model, state) {
                iconManager.setIcon(state, this.get('muted'), this.get('volume'));
            });

            self.on('change:volume', function (model, volume) {
                iconManager.setIcon(this.get('state'), this.get('muted'), volume);
            });

            this.on('change:loadedVideoId', function() {
                clearInterval(seekToInterval);
            });

            var seekToInterval = null;
            this.on('change:videoStreamSrc', function (model, videoStreamSrc) {
                var youTubeVideo = $('#YouTubeVideo');
                
                //  Resetting streamusPlayer because it might not be able to play on src change.
                self.set('streamusPlayer', null);

                youTubeVideo.attr('src', videoStreamSrc);
                
                youTubeVideo.on('canplay', function (event) {

                    var streamusPlayer = event.target;
                    self.set('streamusPlayer', streamusPlayer);
                    
                    //  I store volume out of 100 and volume on HTML5 player is range of 0 to 1 so divide by 100.
                    streamusPlayer.volume = self.get('volume') / 100;

                    //  This ensure that youTube continues to update blob data.
                    if (videoStreamSrc.indexOf('blob') > -1) {
                        seekToInterval = setInterval(function () {
                            var youTubePlayer = self.get('youTubePlayer');

                            if (self.get('streamusPlayer') != null) {
                                var currentTime = self.get('streamusPlayer').currentTime;
                                youTubePlayer.seekTo(currentTime, true);
                            }


                        }, 10000);
                    }

                });

                youTubeVideo.on('play', function () {
                    self.set('state', PlayerStates.PLAYING);
                });

                youTubeVideo.on('pause', function () {
                    self.set('state', PlayerStates.PAUSED);
                });

                youTubeVideo.on('waiting', function () {
                    self.set('buffering', true);
                    self.set('state', PlayerStates.BUFFERING);
                });
                
                //  TODO: Other events?

                youTubeVideo.on('error', function(error) {
                    window && console.error("Error:", error);
                });

            });

            youTubePlayerAPI.once('change:ready', function () {

                //  https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
                //  After the API's JavaScript code loads, the API will call the onYouTubeIframeAPIReady function.
                //  At which point you can construct a YT.Player object to insert a video player on your page.
                self.set('youTubePlayer', new window.YT.Player('MusicHolder', {
                    events: {
                        'onReady': function (event) {
                            var youTubePlayer = event.target;

                            self.set('muted', youTubePlayer.isMuted());
                            self.set('volume', youTubePlayer.getVolume());
                            
                            //  Start monitoring YouTube for current time changes, foreground will pick up on currentTime changes.
                            setInterval(function () {

                                var streamusPlayer = self.get('streamusPlayer');
                                var currentTime;

                                if (streamusPlayer == null) {
                                    currentTime = youTubePlayer.getCurrentTime();
                                } else {
                                    currentTime = streamusPlayer.currentTime;
                                }

                                if (!isNaN(currentTime)) {
                                    self.set('currentTime', Math.ceil(currentTime));
                                }

                            }, 500);

                            //  Keep the player out of UNSTARTED state because seekTo will start playing if in UNSTARTED and not PAUSED
                            self.pause();

                            iconManager.setIcon(self.get('state'), self.get('muted'), self.get('volume'));

                            //  Announce that the YouTube Player is ready to go.
                            self.set('ready', true);
                        },
                        'onStateChange': function (playerState) {

                            //  Skip unstarted events because they cause the UI to flicker
                            if (playerState.data === PlayerStates.UNSTARTED) {
                                return;
                            }

                            if (playerState.data === PlayerStates.BUFFERING) {
                                self.set('buffering', true);
                            } else {
                                if (self.get('buffering')) {
                                    self.set('wasBuffering', true);
                                } else {
                                    self.set('wasBuffering', false);
                                }
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
            this.set('loadedVideoId', videoId);
            
            this.get('youTubePlayer').cueVideoById({
                videoId: videoId,
                startSeconds: 0,
                suggestedQuality: 'default'
            });
        },
            
        loadVideoById: function (videoId) {
            this.set('buffering', true);
            this.set('loadedVideoId', videoId);
            
            this.get('youTubePlayer').loadVideoById({
                videoId: videoId,
                startSeconds: 0,
                suggestedQuality: 'default'
            });
        },
        
        isPlaying: function () {
            return this.get('state') === PlayerStates.PLAYING;
        },
        
        mute: function () {
            this.set('muted', true);

            var streamusPlayer = this.get('streamusPlayer');

            if (streamusPlayer) {
                streamusPlayer.muted = true;
            } else {
                this.get('youTubePlayer').mute();
            }
        },
        
        unMute: function () {
            this.set('muted', false);
            
            var streamusPlayer = this.get('streamusPlayer');

            if (streamusPlayer) {
                streamusPlayer.muted = false;
            } else {
                this.get('youTubePlayer').unMute();
            }

        },

        pause: function () {
            this.set('buffering', false);
            
            var streamusPlayer = this.get('streamusPlayer');

            if (streamusPlayer) {
                streamusPlayer.pause();
            } else {
                this.get('youTubePlayer').pauseVideo();
            }
        },
            
        play: function () {
            if (!this.isPlaying()) {

                this.set('buffering', true);
                
                var streamusPlayer = this.get('streamusPlayer');

                if (streamusPlayer) {
                    streamusPlayer.play();
                } else {
                    this.get('youTubePlayer').playVideo();
                }

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

                var streamusPlayer = this.get('streamusPlayer');

                if (streamusPlayer) {
                    streamusPlayer.currentTime = timeInSeconds;
                }

                //  Seek even if streamusPlayer is defined because we probably need to update the blob if it is.
                //  The true paramater allows the youTubePlayer to seek ahead past its buffered video.
                youTubePlayer.seekTo(timeInSeconds, true);
            }
            
        }
    });

    YouTubePlayer = new youTubePlayerModel();

    return YouTubePlayer;
});