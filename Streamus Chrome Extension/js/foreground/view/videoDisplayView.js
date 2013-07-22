define(['streamItems', 'player', 'playerState'], function (StreamItems, player, PlayerState) {
    'use strict';

    var VideoDisplayView = Backbone.View.extend({
        el: $('#VideoDisplayView'),
        
        events: {
            click: 'togglePlayerState'
        },

        render: function () {

            //  Stop drawing entirely when the player stops.
            if (window != null) {

                var streamItemExists = StreamItems.length > 0;
                this.$el.toggleClass('clickable', streamItemExists);
                
                if (streamItemExists) {                    

                    var playerState = player.get('state');

                    if (playerState == PlayerState.PLAYING) {
                        //  Continously render if playing.
                        if (playerState == PlayerState.PLAYING) {

                            var self = this;
                            window.requestAnimationFrame(function () {
                                self.render();
                            });

                        }

                        this.context.drawImage(this.video, 0, 0, this.el.width, this.el.height);
                    } else {

                        var loadedVideoId = player.get('loadedVideoId');

                        if (loadedVideoId != '') {
                            this.videoDefaultImage.src = 'http://i2.ytimg.com/vi/' + loadedVideoId + '/mqdefault.jpg ';
                        }

                    }
                    
                } else {

                    var self = this;
                    setTimeout(function() {
                        //  Clear the canvas by painting over it with black.
                        //  TODO: Perhaps something more visually appealing / indicative than black fill?
                        self.context.rect(0, 0, self.el.width, self.el.height);
                        self.context.fillStyle = 'black';
                        self.context.fill();
                    }, 0);

                    
                }
                
            }
        },
            
        togglePlayerState: function () {
            
            if (StreamItems.length > 0) {
                
                if (player.isPlaying()) {
                    player.pause();
                } else {
                    player.play();
                }

            }

        },
        
        videoDefaultImage: new Image(),
        
        initialize: function () {

            this.context = this.el.getContext('2d');
            this.video = $(chrome.extension.getBackgroundPage().document).find('#YouTubeVideo')[0];

            var self = this;
            this.videoDefaultImage.onload = function () {
                self.context.drawImage(this, 0, 0, self.el.width, self.el.height);
            };
            
            this.listenTo(player, 'change:state', this.render);
            this.listenTo(StreamItems, 'add empty change:selected', this.render);

            this.render();
        }
    });

    return new VideoDisplayView;
});