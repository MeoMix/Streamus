//  The foreground can be destroyed, but with a log message still attempting to execute. This wrapper ensures logging doesn't throw errors.
console = window && console;

require([
    'jquery',
    'underscore',
    'backbone',
    //  TODO: These can/should probably be nuked
    'jqueryUi',
    'scrollIntoView'
], function ($, _, Backbone) {
    'use strict';

    var player = chrome.extension.getBackgroundPage().YouTubePlayer;
    var user = chrome.extension.getBackgroundPage().User;

    if (user == null) throw "WOW I thought this could never be null";

    //  If the foreground is opened before the background has had a chance to load, wait for the background.
    //  This is easier than having every control on the foreground guard against the background not existing.
    if (user.get('loaded')) {
        loadForeground();
    } else {
        user.on('change:loaded', function (model, loaded) {
            if (loaded) {
                loadForeground();
            } else {
                //  Show refreshing message?
            }
        });
    }

    function loadForeground() {

        if (player.get('ready')) {
            console.log("Player is ready, requiring foreground");
            //  Load foreground when the background indicates it has loaded.
            require(['foreground']);
        } else {

            console.log("WAITING FOR PLAYER TO BECOME READY");

            player.once('change:ready', function () {

                console.log("PLAYER IS NOW READY!!");
                require(['foreground']);

            });
        }

    }
});