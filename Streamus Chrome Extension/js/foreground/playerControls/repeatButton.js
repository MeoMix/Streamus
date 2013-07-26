//  The repeat icon.
define(['repeatButtonState', 'settingsManager'], function (RepeatButtonState, settingsManager) {
    'use strict';

    var repeatButtonView = Backbone.View.extend({
        el: $('#RepeatButton'),

        events: {
            'click': 'toggleRepeat'
        },
        
        disabledTitle: 'Repeat is disabled. Click to enable Repeat Video.',
        repeatVideoEnabledTitle: 'Repeat Video is enabled. Click to enable Repeat Playlist.',
        repeatPlaylistEnabledTitle: 'Repeat Playlist is enabled. Click to disable.',

<<<<<<< HEAD
        state: '',
=======
        state: settingsManager.get('repeatButtonState'),
>>>>>>> origin/Development
        
        render: function () {
            var repeatVideoSvg = $('#RepeatVideoSvg');
            var repeatPlaylistSvg = $('#RepeatPlaylistSvg');

            switch(this.state) {
<<<<<<< HEAD
                case repeatButtonStates.DISABLED:
=======
                case RepeatButtonState.DISABLED:
>>>>>>> origin/Development
                    //  Can't use .removeClass() on svg elements.
                    repeatVideoSvg
                        .show()
                        .attr('class', '');
                    
                    repeatPlaylistSvg.hide();
                    this.$el.attr('title', this.disabledTitle);

                    break;
<<<<<<< HEAD
                case repeatButtonStates.REPEAT_VIDEO_ENABLED:                    
=======
                case RepeatButtonState.REPEAT_VIDEO_ENABLED:
>>>>>>> origin/Development
                    //  Can't use .addClass() on svg elements.
                    repeatVideoSvg.attr('class', 'pressed');
                    this.$el.attr('title', this.repeatVideoEnabledTitle);

                    break;
<<<<<<< HEAD
                case repeatButtonStates.REPEAT_PLAYLIST_ENABLED:
=======
                case RepeatButtonState.REPEAT_STREAM_ENABLED:
>>>>>>> origin/Development

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
<<<<<<< HEAD
            
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
=======
            this.render();
        },
        
        toggleRepeat: function() {

            var nextState = null;

            switch (this.state) {
                case RepeatButtonState.DISABLED:
                    nextState = RepeatButtonState.REPEAT_VIDEO_ENABLED;
                    break;
                case RepeatButtonState.REPEAT_VIDEO_ENABLED:
                    nextState = RepeatButtonState.REPEAT_STREAM_ENABLED;
                    break;
                case RepeatButtonState.REPEAT_STREAM_ENABLED:
                    nextState = RepeatButtonState.DISABLED;
>>>>>>> origin/Development
                    break;
                default:
                    console.error("Unhandled repeatButtonState:", this.state);
                    break;
            }

            this.state = nextState;
<<<<<<< HEAD
            localStorageManager.setRepeatButtonState(nextState);
=======
            settingsManager.set('repeatButtonState', nextState);
>>>>>>> origin/Development

            this.render();
        }

    });

    var repeatButton = new repeatButtonView;

});