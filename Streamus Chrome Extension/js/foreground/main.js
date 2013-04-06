require(['jquery',
        'jqueryUi',
        'backbone',
        'jqueryMousewheel',
        'scrollIntoView',
        'playerStates',
        'helpers',
        'underscore',
        'oauth2'
    ], function () {
    'use strict';

    //  TODO: Would like to access through define module, but not sure how..
    var user = chrome.extension.getBackgroundPage().User;
    var player = chrome.extension.getBackgroundPage().YouTubePlayer;
        
    //  If the foreground is opened before the background has had a chance to load, wait for the background.
    //  This is easier than having every control on the foreground guard against the background not existing.
    if (user.get('loaded')) {
        loadForeground();
    } else {
        user.once('change:loaded', loadForeground);
    }
    
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