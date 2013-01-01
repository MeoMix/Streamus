require(['jquery', 'jqueryUi', 'jqueryMousewheel', 'playerStates', 'helpers', 'underscore', 'oauth2'], function () {
    'use strict';
    $(function () {
        //If the foreground is opened before the background has had a chance to load, wait for the background.
        //This is easier than having every control on the foreground guard against the background not existing.
        var waitforPlayerInterval = setInterval(function () {
            if (chrome.extension.getBackgroundPage().YoutubePlayer) {
                clearInterval(waitforPlayerInterval);
                //Load foreground when the background indicates it has loaded.
                require(['foreground']);
            }
        //TODO: This is sooooo arbitrary. Do I have other options?
        }, 200);
    });
});