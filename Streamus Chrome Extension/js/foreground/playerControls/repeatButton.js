//  The repeat icon.
define(['backgroundManager', 'player', 'repeatButtonStates'], function(backgroundManager, player) {
    'use strict';

    var repeatButton = $('#RepeatButton');
    var repeatVideoIcon = $('#RepeatVideoSvgWrapper');
    var repeatPlaylistIcon = $('#RepeatPlaylistSvgWrapper');

    repeatButton.click(function () {
        
        if (repeatVideoIcon.is(':visible') && repeatVideoIcon.hasClass('pressed')) {
            repeatVideoIcon.hide();
            repeatVideoIcon.removeClass('pressed');
            repeatPlaylistIcon.show();
        }
        else if (repeatVideoIcon.is(':visible')) {
            repeatVideoIcon.addClass('pressed');
        }
        else if (repeatPlaylistIcon.is(':visible')) {
            repeatPlaylistIcon.hide();
            repeatVideoIcon.show();
        }

        //var state = RepeatButtonStates.DISABLED;
        
        //localStorageManager.setRepeatButtonState({
        //    state: state
        //});

    });

    repeatButton.tooltip();

});