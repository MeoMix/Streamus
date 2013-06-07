//  The foreground can be destroyed, but with a log message still attempting to execute. This wrapper ensures logging doesn't throw errors.
console = window && console;

require(['jquery',
        'jqueryUi',
        'backbone',
        'jqueryMousewheel',
        'scrollIntoView',
        'playerStates',
        'dataSources',
        'helpers',
        'underscore'
    ], function () {
    'use strict';

    //  TODO: Would like to access through define module, but not sure how..
    var player = chrome.extension.getBackgroundPage().YouTubePlayer;
        
    var waitForUserInterval = setInterval(function () {

        var user = chrome.extension.getBackgroundPage().User;
        
        if (user != null) {
            clearInterval(waitForUserInterval);

            //  If the foreground is opened before the background has had a chance to load, wait for the background.
            //  This is easier than having every control on the foreground guard against the background not existing.
            if (user.get('loaded')) {
                loadForeground();
            } else {
                user.once('change:loaded', loadForeground);
            }
        }

    }, 100);
        

    function loadForeground() {

        if (player.get('ready')) {
            //  Load foreground when the background indicates it has loaded.
            require(['foreground']);
        } else {
            player.once('change:ready', function () {
                //  Load foreground when the background indicates it has loaded.
                require(['foreground']);
            });
        }

    }
});