define(['localStorageManager'], function (localStorageManager) {
    'use strict';

    var settingsSliderWrapper = $('#SettingsSliderWrapper');
    var settingsControl = $('.settingsControl');

    settingsControl.mouseover(function () {
        settingsSliderWrapper.css("top", "70px");
    }).mouseout(function () {
        settingsSliderWrapper.css("top", "-35px");
    });

    var radioModeButton = $('#RadioModeButton').click(toggleRadioMode);

    var isRadioModeEnabled = localStorageManager.getIsRadioModeEnabled();
    if (isRadioModeEnabled) {
        radioModeButton.addClass('pressed');
    }

    function toggleRadioMode() {
        if (radioModeButton.hasClass('pressed')) {
            radioModeButton.removeClass('pressed');
        }
        else {
            radioModeButton.addClass('pressed');
        }

        localStorageManager.setIsRadioModeEnabled(radioModeButton.hasClass('pressed'));
    }
});