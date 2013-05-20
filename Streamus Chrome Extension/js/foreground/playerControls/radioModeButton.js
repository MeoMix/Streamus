define(['localStorageManager'], function (localStorageManager) {
    'use strict';

    var radioModeButton = $('#RadioModeButton').click(toggleRadioMode);
    var radioModeEnabledTitle = 'Radio Mode is enabled. Click to disable.';
    var radioModeDisabledTitle = 'Radio Mode is disabled. Click to enable.';

    var isRadioModeEnabled = localStorageManager.getIsRadioModeEnabled();
    if (isRadioModeEnabled) {
        radioModeButton
            .addClass('pressed')
            .attr('title', radioModeEnabledTitle);
    }

    function toggleRadioMode() {
        if (radioModeButton.hasClass('pressed')) {
            radioModeButton
                .removeClass('pressed')
                .attr('title', radioModeDisabledTitle);
        }
        else {
            radioModeButton
                .addClass('pressed')
                .attr('title', radioModeEnabledTitle);
        }

        localStorageManager.setIsRadioModeEnabled(radioModeButton.hasClass('pressed'));
    }

});