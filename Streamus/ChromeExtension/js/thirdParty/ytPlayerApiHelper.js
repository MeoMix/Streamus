//  Provides an interface to the YouTube iFrame.
//  Starts up Player object after receiving a ready response from the YouTube API.
define(['onYouTubePlayerApiReady', 'jquery'], function () {
    'use strict';
    var isReady = false;
    var events = {
        onApiReady: 'onApiReady'
    };

    //  This code will trigger onYouTubePlayerAPIReady
    $(window).load(function () {
        if (!window['YT']) {
            var YT = {};
        }
        if (!YT.Player) {

            (function () {
                var s = 'https:' + '//s.ytimg.com/yts/jsbin/www-widgetapi-vflmz-CfK.js';
                var a = document.createElement('script');
                a.src = s;
                a.async = true;
                var b = document.getElementsByTagName('script')[0];
                b.parentNode.insertBefore(a, b);
                YT.embed_template = "\u003ciframe width=\"475\" height=\"286\" src=\"\" frameborder=\"0\" allowfullscreen\u003e\u003c\/iframe\u003e";
            })();
        }
    });

    return {
        ready: function () {
            isReady = true;
            $(this).trigger(events.onApiReady);
        },
        onApiReady: function (event) {

            //If the API is already loaded a trigger will never occur, so just fire event now.
            if (event && isReady) {

                event();
            } else {
                $(this).on(events.onApiReady, event);
            }
        }
    };
});