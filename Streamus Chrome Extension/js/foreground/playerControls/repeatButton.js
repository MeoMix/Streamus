//  The repeat icon.
define(['repeatButtonState', 'localStorageManager'], function (RepeatButtonState, localStorageManager) {
    'use strict';

    var repeatButtonView = Backbone.View.extend({
        el: $('#RepeatButton'),

        events: {
            'click': 'toggleRepeat'
        },
        
        disabledTitle: 'Repeat is disabled. Click to enable Repeat Video.',
        repeatVideoEnabledTitle: 'Repeat Video is enabled. Click to enable Repeat Playlist.',
        repeatPlaylistEnabledTitle: 'Repeat Playlist is enabled. Click to disable.',

        state: '',
        
        render: function () {
            var repeatVideoSvg = $('#RepeatVideoSvg');
            var repeatPlaylistSvg = $('#RepeatPlaylistSvg');

            switch(this.state) {
                case RepeatButtonState.DISABLED:
                    //  Can't use .removeClass() on svg elements.
                    repeatVideoSvg
                        .show()
                        .attr('class', '');
                    
                    repeatPlaylistSvg.hide();
                    this.$el.attr('title', this.disabledTitle);

                    break;
                case RepeatButtonState.REPEAT_VIDEO_ENABLED:
                    //  Can't use .addClass() on svg elements.
                    repeatVideoSvg.attr('class', 'pressed');
                    this.$el.attr('title', this.repeatVideoEnabledTitle);

                    break;
                case RepeatButtonState.REPEAT_PLAYLIST_ENABLED:

                    repeatPlaylistSvg.show();
                    repeatVideoSvg.hide();
                    this.$el.attr('title', this.repeatPlaylistEnabledTitle);

                    break;
                default:
                    console.error("Unhandled repeatButtonState:", state);
                    break;
            }

        },
        
        initialize: function () {
            
            this.state = localStorageManager.getRepeatButtonState();
            this.render();

        },
        
        toggleRepeat: function() {

            var nextState = null;

            switch (this.state) {
                case RepeatButtonState.DISABLED:
                    nextState = RepeatButtonState.REPEAT_VIDEO_ENABLED;
                    break;
                case RepeatButtonState.REPEAT_VIDEO_ENABLED:
                    nextState = RepeatButtonState.REPEAT_PLAYLIST_ENABLED;
                    break;
                case RepeatButtonState.REPEAT_PLAYLIST_ENABLED:
                    nextState = RepeatButtonState.DISABLED;
                    break;
                default:
                    console.error("Unhandled repeatButtonState:", this.state);
                    break;
            }

            this.state = nextState;
            localStorageManager.setRepeatButtonState(nextState);

            this.render();
        }

    });

    var repeatButton = new repeatButtonView;

});