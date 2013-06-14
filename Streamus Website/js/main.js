requirejs.config({
    baseUrl: '/js',
    shim: {
        'bootstrap': {
            deps: ['jquery']
        }
    }
});

require(['jquery', 'backbone', 'bootstrap'], function () {
    'use strict';

    //  I tend to prefer this way of loading my index. It's probably bad practice, but meh.
    require(['index']);
});