//  The foreground can be destroyed, but with a log message still attempting to execute. This wrapper ensures logging doesn't throw errors.
console = window && console;

require([
    'jquery',
    'underscore',
    'backbone',
    'loadingSpinnerView',
    'lazyload',
    'jqueryUi',
    'scrollIntoView'
], function ($, _, Backbone, LoadingSpinnerView) {
    'use strict';

    //  TODO: This is a really shitty encapsulation break, but it's a lot of work to put a loading over the foreground properly...
    var loadingSpinnerView = new LoadingSpinnerView;
    $('body').append(loadingSpinnerView.render().el);

    //  If the user opens the foreground SUPER FAST then requireJS won't have been able to load everything in the background in time.
    var player = chrome.extension.getBackgroundPage().YouTubePlayer;
    var user = chrome.extension.getBackgroundPage().User;

    if (player == null || user == null) {

        var checkBackgroundLoadedInterval = setInterval(function () {

            player = chrome.extension.getBackgroundPage().YouTubePlayer;
            user = chrome.extension.getBackgroundPage().User;

            if (player != null && user != null) {

                clearInterval(checkBackgroundLoadedInterval);
                waitForUserLoaded();
            }

        }, 100);

    }
    else {
        waitForUserLoaded();
    }

    function waitForUserLoaded() {

        //  If the foreground is opened before the background has had a chance to load, wait for the background.
        //  This is easier than having every control on the foreground guard against the background not existing.
        if (user.get('loaded')) {
            console.log("User is loaded, calling wait for player");
            waitForPlayerReady();
        } else {
            console.log("Waiting for user to change to loaded...");
            user.once('change:loaded', waitForPlayerReady);
        }

    }

    function waitForPlayerReady() {

        if (player.get('ready')) {
            console.log("Player is ready, calling load foreground.");
            //  Load foreground when the background indicates it has loaded.
            loadForeground();
        } else {
            console.log("Waiting for player to change to ready...", player.get('ready'));
            player.once('change:ready', loadForeground);
        }

    }

    function loadForeground() {

        console.log("Loading foreground");

        $('body').removeClass('backgroundUnloaded');
        loadingSpinnerView.remove();
        require(['foreground']);
    }
});