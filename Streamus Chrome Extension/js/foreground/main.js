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
    $('#contentWrapper').append(loadingSpinnerView.render().el);

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
            waitForPlayerReady();
        } else {
            user.on('change:loaded', function (model, loaded) {
                if (loaded) {
                    waitForPlayerReady();
                }
            });
        }

    }

    function waitForPlayerReady() {

        if (player.get('ready')) {
            //  Load foreground when the background indicates it has loaded.
            loadingSpinnerView.remove();
            require(['foreground']);
        } else {
            player.once('change:ready', function () {
                loadingSpinnerView.remove();
                require(['foreground']);
            });
        }

    }
});