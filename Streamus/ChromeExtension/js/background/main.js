require(['jquery', 'backbone', 'playerStates', 'ytPlayerApiHelper', 'helpers', 'underscore', 'oauth2'], function() {
    'use strict';
    //  Only use main.js for loading external helper files before the background is ready. Then, load the background. That's all.
    require(['background'], function () { });
});