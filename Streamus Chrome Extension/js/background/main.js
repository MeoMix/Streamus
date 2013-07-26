require(['jquery', 'backbone', 'playerState', 'dataSource', 'helpers', 'underscore', 'error', 'iconManager'], function () {
    'use strict';

    //  Only use main.js for loading external helper files before the background is ready. Then, load the background.
    require(['background'], function () { });
});