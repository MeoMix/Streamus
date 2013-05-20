//  The repeat icon.
define(['repeatButtonStates', 'localStorageManager'], function (repeatButtonStates, localStorageManager) {
    'use strict';

    var repeatButton = $('#RepeatButton');
    var repeatVideoIcon = $('#RepeatVideoSvgWrapper');
    var repeatPlaylistIcon = $('#RepeatPlaylistSvgWrapper');
    
    var repeatButtonState = localStorageManager.getRepeatButtonState();
    repeatButton.data('state', repeatButtonState);

    setRepeatButtonIcon(repeatButtonState);

    repeatButton.click(function () {

        var currentState = $(this).data('state');
        var nextState = null;
        
        switch(currentState) {
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
                window && console.error("Unhandled repeatButtonState:", currentState);
                break;
        }

        repeatButton.data('state', nextState);
        localStorageManager.setRepeatButtonState(nextState);
        setRepeatButtonIcon(nextState);

    });
    
    function setRepeatButtonIcon(state) {
        switch (state) {
            case repeatButtonStates.DISABLED:

                repeatVideoIcon
                    .show()
                    .removeClass('pressed');
                repeatPlaylistIcon.hide();
                repeatButton.attr('title', 'Repeat is disabled. Click to enable Repeat Video.');

                break;
            case repeatButtonStates.REPEAT_VIDEO_ENABLED:

                repeatVideoIcon.addClass('pressed');
                repeatButton.attr('title', 'Repeat Video is enabled. Click to enable Repeat Playlist.');

                break;
            case repeatButtonStates.REPEAT_PLAYLIST_ENABLED:

                repeatPlaylistIcon.show();
                repeatVideoIcon.hide();
                repeatButton.attr('title', 'Repeat Playlist is enabled. Click to disable.');
                
                break;
            default:
                window && console.error("Unhandled repeatButtonState:", state);
                break;
        }
    }

});