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
    'googleApiClient'
], function ($, _, Backbone, GoogleApiClient) {
    'use strict';

    //  Only use main.js for loading external helper files before the background is ready. Then, load the background.
    require(['background'], function () { });
});