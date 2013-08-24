require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            //These script dependencies should be loaded before loading backbone.js
            deps: ["underscore", "jquery"],
            //Once loaded, use the global 'Backbone' as the module value.
            exports: "Backbone"
        },
        googleApiClient: {
            exports: 'GoogleApiClient'
        }
    }
});

require([
    'jquery',
    'underscore',
    'backbone',
    'googleApiClient',
    'error',
    'iconManager'
], function ($, _, Backbone, GoogleApiClient, Error, IconManager, Settings) {
    'use strict';

    //  Send a log message whenever any client errors occur; for debugging purposes.
    window.onerror = function (message, url, lineNumber) {

        //  Only log client errors to the database in a deploy environment, not when debugging locally.
        if (!Settings.get('localDebug')) {
            var error = new Error({
                message: message,
                url: url,
                lineNumber: lineNumber
            });

            error.save();
        }
    };

    //  Only use main.js for loading external helper files before the background is ready. Then, load the background.
    require(['background'], function () { });
});