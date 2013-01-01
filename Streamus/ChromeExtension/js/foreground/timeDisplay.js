//Holds onto the currentTime and totalTime song labels as well as the elapsed time progress bar.
define(['helpers'], function(helpers) {
    'use strict';
    var currentTimeLabel = $('#CurrentTimeLabel'), totalTimeLabel = $('#TotalTimeLabel');

    function updateLabel(currentTime, totalTime) {
        currentTimeLabel.text(currentTime);
        totalTimeLabel.text(totalTime);
    }

    (function initialize() {
        //Generally player will always be defined here, but if someone's internet is slow and they quickly open the UI it might not be.
        var currentTime = chrome.extension.getBackgroundPage().YoutubePlayer.currentTime;
        var totalTime = chrome.extension.getBackgroundPage().YoutubePlayer.totalTime;
        updateLabel(helpers.prettyPrintTime(currentTime), helpers.prettyPrintTime(totalTime));
        //Update the time every half a second.
        setInterval(function() {
            update();
        }, 500);
    }());

    //In charge of updating the time labels
    var update = function(currentTimeInSeconds) {
        var playerIsSeeking = chrome.extension.getBackgroundPage().YoutubePlayer.isSeeking;

        //Do not update from automatic updates if the progress bar is being dragged.
        if (currentTimeInSeconds || !playerIsSeeking) {
            //If told to update to a specific time (by user interaction) then use that time, otherwise get the players current time (automatic update)
            var totalTime = chrome.extension.getBackgroundPage().YoutubePlayer.totalTime;
            var currentTime = currentTimeInSeconds ? currentTimeInSeconds : chrome.extension.getBackgroundPage().YoutubePlayer.currentTime;
            updateLabel(helpers.prettyPrintTime(currentTime), helpers.prettyPrintTime(totalTime));
        }
    };

    return {
        update: update
    };
});