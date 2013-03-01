//  Provides an interface to the YouTube iFrame.
//  Starts up Player object after receiving a ready response from the YouTube API.
define(['onYouTubePlayerApiReady', 'jquery'], function () {
    'use strict';

    //var YTPlayerApiHelper = Backbone.Model.extend({
    //    defaults: {
    //        ready: false
    //    },
    //    initialize: function() {
    //        this.on('change:ready')
    //    }
    //});

    var isReady = false;
    var events = {
        onApiReady: 'onApiReady'
    };

    //  This code will trigger onYouTubePlayerAPIReady
    $(function () {
        
        if (!window['YT']) {
            var YT = {};
        }
        
        if (!YT.Player) {
            $('<script>', {
                src: 'https://s.ytimg.com/yts/jsbin/www-widgetapi-vflmz-CfK.js',
                async: true
            }).insertBefore($('script:first'));
        }
    });

    return {
        ready: function () {
            isReady = true;
            $(this).trigger(events.onApiReady);
        },
        onApiReady: function (event) {
            console.log("isReady:", isReady);
            //  If the API is already loaded a trigger will never occur, so just fire event now.
            if (event && isReady) {

                event();
            } else {
                $(this).on(events.onApiReady, event);
            }
        }
    };
});