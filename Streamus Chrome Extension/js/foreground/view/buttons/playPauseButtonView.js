//  The play/pause icon.
define(['player', 'spinnerBuilder', 'playerState', 'streamItems'], function (player, SpinnerBuilder, PlayerState, StreamItems) {
    'use strict';
    
    var PlayPauseButtonView = Backbone.View.extend({
        el: $('#PlayPauseButton'),
        
        events: {
            'click': 'togglePlayingState'
        },
        
        spinner: SpinnerBuilder.buildPlayPauseSpinner(),
        
        disabledTitle: 'Play disabled. Try adding a video to your playlist, first!',
        pauseTitle: 'Click to pause the current video.',
        playTitle: 'Click to play the current video.',
        
        render: function () {

            if (StreamItems.where({ selected: true }).length > 0) {
                this.enable();
            } else {
                this.disable();
            }

            var pauseIcon = $('#PauseIcon');
            var playIcon = $('#PlayIcon');
            
            //  Whenever the YouTube player changes playing state -- update whether icon shows play or pause.
            var playerState = player.get('state');

            if (playerState === PlayerState.BUFFERING) {
                //  Show buffering icon and hide the others.
                this.spinner.spin($('#LoadingSpinner')[0]);

                playIcon.hide();
                pauseIcon.hide();
            } else {
                // Not buffering, so hide the spinner.
                this.spinner.stop();

                if (playerState === PlayerState.PLAYING) {
                    //  Change the music button to the 'Pause' image
                    pauseIcon.show();
                    playIcon.hide();
                    this.$el.attr('title', this.pauseTitle);
                } else {
                    //  Change the music button to the 'Play' image
                    this.spinner.stop();
                    pauseIcon.hide();
                    playIcon.show();
                    this.$el.attr('title', this.playTitle);
                }
            }

            return this;
        },
        
        initialize: function () {
            
            this.listenTo(StreamItems, 'change:selected empty remove', this.render);
            this.listenTo(player, 'change:state', this.render);
            
            this.render();
        },
        
        //  Only allow changing once every 100ms to preent spamming.
        togglePlayingState: _.debounce(function () {

            if (!this.$el.hasClass('disabled')) {
                if (player.isPlaying()) {
                    player.pause();
                } else {
                    player.play();
                }
            }

        }, 100, true),

        //  Paint button's path black and allow it to be clicked
        enable: function() {
            this.$el.removeClass('disabled');
            this.$el.attr('title', this.playTitle);
        },
        
        //  Paint the button's path gray and disallow it to be clicked
        disable: function() {
            this.$el.addClass('disabled');
            this.$el.attr('title', this.disabledTitle);
        },
    });

    return new PlayPauseButtonView;
});