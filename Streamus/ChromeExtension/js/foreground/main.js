require(['jquery',
        'jqueryUi',
        'backbone',
        'jqueryMousewheel',
        'playerStates',
        'helpers',
        'underscore',
        'oauth2'
    ], function () {
    'use strict';
    $(function () {

        //  TODO: Would like to access through define module, but not sure how..
        var loginManager = chrome.extension.getBackgroundPage().LoginManager;
        //  If the foreground is opened before the background has had a chance to load, wait for the background.
        //  This is easier than having every control on the foreground guard against the background not existing.
        if (loginManager.get('user') !== null) {
            //  Load foreground when the background indicates it has loaded.
            require(['foreground']);
        } else {
            loginManager.once('change:user', function () {
                //  Load foreground when the background indicates it has loaded.
                require(['foreground']);
            });
        }

    });
});