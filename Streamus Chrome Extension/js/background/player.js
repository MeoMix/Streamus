//  TODO: Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var YouTubePlayer = null;

define(['youTubePlayerAPI', 'ytHelper', 'iconManager'], function (youTubePlayerAPI, ytHelper, iconManager) {
    'use strict';

    var youTubePlayerModel = Backbone.Model.extend({
        defaults: {
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
            youTubePlayer: null
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
            
            var youTubeVideo = $('#YouTubeVideo');
            youTubeVideo.off('play').on('play', function () {
                console.log("setting myself to play");
                self.set('state', PlayerStates.PLAYING);
            });

            youTubeVideo.on('pause', function () {
                self.set('state', PlayerStates.PAUSED);
            });

            youTubeVideo.on('waiting', function () {
                self.set('state', PlayerStates.BUFFERING);
            });

            youTubeVideo.on('seeking', function () {
                if (self.get('state') === PlayerStates.PLAYING) {
                    self.set('state', PlayerStates.BUFFERING);
                }
            });

            youTubeVideo.on('seeked', function () {
                if (self.get('state') === PlayerStates.BUFFERING) {
                    self.set('state', PlayerStates.PLAYING);
                }
            });

            youTubeVideo.on('ended', function () {
                self.set('state', PlayerStates.ENDED);
            });

            youTubeVideo.on('error', function (error) {

                window && console.error("Error:", error);
            });

            //  TODO: Would be nice to use this instead of a polling interval.
            youTubeVideo.on('timeupdate', function() {
                self.set('currentTime', Math.ceil(this.currentTime));
            });
            
            youTubeVideo.on('loadedmetadata', function () {
                console.log("loadedmetadata, setting my current time:", self.get('currentTime'));
                this.currentTime = self.get('currentTime');
            });
            
            var seekToInterval = null;
            youTubeVideo.on('canplay', function () {
                self.set('streamusPlayer', this);

                //  I store volume out of 100 and volume on HTML5 player is range of 0 to 1 so divide by 100.
                this.volume = self.get('volume') / 100;

                var videoStreamSrc = youTubeVideo.attr('src');

                //  TODO: Probably need to turn this polling on/off intelligently.
                //  This ensure that youTube continues to update blob data.
                if (videoStreamSrc.indexOf('blob') > -1) {
                    seekToInterval = setInterval(function () {
                        console.log("Fetching data to keep blob going");
                        var youTubePlayer = self.get('youTubePlayer');

                        if (self.get('streamusPlayer') != null) {
                            var currentTime = self.get('streamusPlayer').currentTime;
                            youTubePlayer.seekTo(currentTime, true);
                        }

                    }, 10000);
                }

            });

            this.on('change:loadedVideoId', function() {
                youTubeVideo.currentTime = 0;
            });
            
            this.on('change:videoStreamSrc', function (model, videoStreamSrc) {

                //  Resetting streamusPlayer because it might not be able to play on src change.
                self.set('streamusPlayer', null);
                youTubeVideo.attr('src', videoStreamSrc);
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
                            
                            //  Keep the player out of UNSTARTED state because seekTo will start playing if in UNSTARTED and not PAUSED
                            self.pause();

                            iconManager.setIcon(self.get('state'), self.get('muted'), self.get('volume'));

                            //  Announce that the YouTube Player is ready to go.
                            self.set('ready', true);
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
            
            this.set('loadedVideoId', videoId);

            var streamusPlayer = this.get('streamusPlayer');
            
            if (streamusPlayer != null) {
                streamusPlayer.pause();
                $(streamusPlayer).removeAttr('autoplay');
            }

            this.get('youTubePlayer').loadVideoById({
                videoId: videoId,
                startSeconds: 0,
                suggestedQuality: 'default'
            });
        },
            
        loadVideoById: function (videoId) {
            var streamusPlayer = this.get('streamusPlayer');

            if (streamusPlayer != null) {
                //streamusPlayer.pause();
                $(streamusPlayer).attr('autoplay', true);
            }
            
            this.set('state', PlayerStates.BUFFERING);
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
        
        stop: function () {

            this.set('state', PlayerStates.UNSTARTED);

            //$('#YouTubeVideo').attr('src', '');
            
            var streamusPlayer = this.get('streamusPlayer');

            if (streamusPlayer) {
                streamusPlayer.pause();
            }
            
            this.set('streamusPlayer', null);

            this.get('youTubePlayer').stopVideo();
            this.set('loadedVideoId', '');
        },

        pause: function () {
            var streamusPlayer = this.get('streamusPlayer');

            if (streamusPlayer) {
                streamusPlayer.pause();
            } else {
                //  If YouTubeVideo is loading its metadata we need to keep its state in sync regardless.
                $('#YouTubeVideo').removeAttr('autoplay');
                this.get('youTubePlayer').pauseVideo();
            }
        },
            
        play: function () {
  
            if (!this.isPlaying()) {

                this.set('state', PlayerStates.BUFFERING);
                var streamusPlayer = this.get('streamusPlayer');

                if (streamusPlayer) {
                    streamusPlayer.play();
                } else {
                    //  If YouTubeVideo is loading its metadata we need to keep its state in sync regardless.
                    $('#YouTubeVideo').attr('autoplay', 'true');
                    this.get('youTubePlayer').playVideo();
                }

            }
        },

        seekTo: function (timeInSeconds) {

            this.set('currentTime', timeInSeconds);
            var streamusPlayer = this.get('streamusPlayer');

            if (streamusPlayer != null) {
                streamusPlayer.currentTime = timeInSeconds;
            }
            
            //  Seek even if streamusPlayer is defined because we probably need to update the blob if it is.
            //  The true paramater allows the youTubePlayer to seek ahead past its buffered video.
            this.get('youTubePlayer').seekTo(timeInSeconds, true);
        }
    });

    YouTubePlayer = new youTubePlayerModel();

    return YouTubePlayer;
});