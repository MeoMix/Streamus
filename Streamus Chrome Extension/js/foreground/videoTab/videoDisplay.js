define(['backgroundManager', 'player'], function (backgroundManager, player) {
    'use strict';

    var videoDisplayModel = Backbone.Model.extend({
        el: $('#VideoDisplay'),

        render: function() {
            //  Stop drawing entirely when the player stops.
            if (window != null && player.isPlaying()) {
                var self = this;
                window.requestAnimationFrame(function() {
                    self.render();
                });
                this.context.drawImage(this.video, 0, 0, this.el[0].width, this.el[0].height);
            }
        },
        
        initialize: function () {

            //  TODO: Shouldn't el not be a jquery element??
            this.context = this.el[0].getContext('2d');
            this.video = $(chrome.extension.getBackgroundPage().document).find('#YouTubeVideo')[0];
            
            var initialImage = new Image();

            var self = this;
            //  TODO: Can I condense this code with what happens on the change activeplalyistitem bit? I think so
            initialImage.onload = function () {
                self.context.drawImage(this, 0, 0, self.el[0].width, self.el[0].height);
            };

            if (backgroundManager.get('activePlaylistItem') == null) {
                this.clear();
            } else {

                var playerState = player.get('state');
                if (playerState == PlayerStates.PLAYING || playerState == PlayerStates.PAUSED) {
                    this.context.drawImage(this.video, 0, 0, this.el[0].width, this.el[0].height);
                } else {

                    var loadedVideoId = player.get('loadedVideoId');

                    if (loadedVideoId != '') {
                        initialImage.src = 'http://i2.ytimg.com/vi/' + loadedVideoId + '/mqdefault.jpg ';
                    }
                    
                }

            }
            
            this.listenTo(backgroundManager, 'change:activePlaylistItem', function (model, activePlaylistItem) {

                if (activePlaylistItem === null) {
                    this.clear();
                } else {
                    var videoId = activePlaylistItem.get('video').get('id');
                    initialImage.src = 'http://i2.ytimg.com/vi/' + videoId + '/mqdefault.jpg ';
                }
                
            });

            //  Start drawing again when the player is playing.
            this.listenTo(player, 'change:state', function (model, playerState) {

                if (playerState === PlayerStates.PLAYING) {

                    //  Lagging for a little to avoid this black blip on the video when clicking next on a playing song.
                    //  If you can figure it out -- go for it.
                    setTimeout(function () {
                        self.render();
                    }, 0);

                }
            });

            this.render();
        },
        
        //  Clear the canvas by painting over it with black.
        //  TODO: Perhaps something more visually appealing / indicative than black fill?
        clear: function () {
            
            this.context.rect(0, 0, this.el[0].width, this.el[0].height);
            this.context.fillStyle = 'black';
            this.context.fill();
            
        }
    });

    var videoDisplay = new videoDisplayModel;

});