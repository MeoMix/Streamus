//Provides an interface to the YouTube iFrame.
//Starts up Player object after receiving a ready response from the YouTube API.
define(['onYouTubePlayerApiReady', 'jquery'], function () {
    'use strict';
    var isReady = false;
    var events = {
        onApiReady: 'onApiReady'
    };

    //This code will trigger onYouTubePlayerAPIReady
    $(window).load(function () {
        console.log("Injecting script during window load");
        $('script:first').before($('<script/>', {
            src: 'https://www.youtube.com/iframe_api'
        }));
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