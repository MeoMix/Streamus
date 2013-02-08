//  When clicked -- skips to the last video. Skips from the begining of the list to the end.
define(function(){
    'use strict';
    var previousButton = $('#PreviousButton');
    
    //  Initialize
    refresh();

    previousButton.one('click', skipVideo);

    function skipVideo() {
        chrome.extension.getBackgroundPage().YoutubePlayer.skipVideo('previous');
        //  Prevent spamming by only allowing a next click once a second.
        setTimeout(function () { 
            previousButton.off('click').one('click', skipVideo);
        }, 1000);
    }
    
    function refresh() {
        var player = chrome.extension.getBackgroundPage().YoutubePlayer;

        if (player.items.length > 0) {
            //  Paint the skipButton's path black and bind its click event.
            previousButton.prop('src', 'images/skip.png').removeClass('disabled');
            previousButton.find('.path').css('fill', 'black');
        }
        else {
            //  Paint the skipButton's path gray and unbind its click event.
            previousButton.prop('src', 'images/skip-disabled.png').addClass('disabled');
            $(previousButton).find('.path').css('fill', 'gray');
        }
    }

    return {
        refresh: refresh
    };
});