//  The repeat icon.
define(['repeatButtonStates', 'localStorageManager'], function (repeatButtonStates, localStorageManager) {
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
                case repeatButtonStates.DISABLED:
                    //  Can't use .removeClass() on svg elements.
                    repeatVideoSvg
                        .show()
                        .attr('class', '');
                    
                    repeatPlaylistSvg.hide();
                    this.$el.attr('title', this.disabledTitle);

                    break;
                case repeatButtonStates.REPEAT_VIDEO_ENABLED:                    
                    //  Can't use .addClass() on svg elements.
                    repeatVideoSvg.attr('class', 'pressed');
                    this.$el.attr('title', this.repeatVideoEnabledTitle);

                    break;
                case repeatButtonStates.REPEAT_PLAYLIST_ENABLED:

                    repeatPlaylistSvg.show();
                    repeatVideoSvg.hide();
                    this.$el.attr('title', this.repeatPlaylistEnabledTitle);

                    break;
                default:
                    window && console.error("Unhandled repeatButtonState:", state);
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
                case repeatButtonStates.DISABLED:
                    nextState = repeatButtonStates.REPEAT_VIDEO_ENABLED;
                    break;
                case repeatButtonStates.REPEAT_VIDEO_ENABLED:
                    nextState = repeatButtonStates.REPEAT_PLAYLIST_ENABLED;
                    break;
                case repeatButtonStates.REPEAT_PLAYLIST_ENABLED:
                    nextState = repeatButtonStates.DISABLED;
                    break;
                default:
                    window && console.error("Unhandled repeatButtonState:", this.state);
                    break;
            }

            this.state = nextState;
            localStorageManager.setRepeatButtonState(nextState);

            this.render();
        }

    });

    var repeatButton = new repeatButtonView;

});