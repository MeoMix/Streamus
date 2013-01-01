//The buttons, sliders, etc. which serve as the middle-men between user interactions and player responses.
define(['volumeSlider', 'playPauseButton', 'skipButton', 'previousButton', 'shuffleButton'], function(volumeSlider, playPauseButton, skipButton, previousButton) {
    'use strict';
    return {
        refreshControls: function () {
            playPauseButton.refresh();
            volumeSlider.refresh();
            skipButton.refresh();
            previousButton.refresh();
        }
    };
});