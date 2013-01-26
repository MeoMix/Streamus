//When clicked -- skips to the last video. Can't be clicked with only 1 video.
//Will skip from the begining of the list to the end.
define(function(){
    'use strict';
    var previousButton = $('#PreviousButton');

    function skipVideo() {
        chrome.extension.getBackgroundPage().YoutubePlayer.skipVideo('previous');
        //Prevent spamming by only allowing a next click once a second.
        setTimeout(function () { 
            previousButton.off('click').one('click', skipVideo);
        }, 1000);
    }
    
    function refresh() {
        var player = chrome.extension.getBackgroundPage().YoutubePlayer;

        if (player.selectedItem) {
            if (player.items.length > 1) {
                //Paint the skipButton's path black and bind its click event.
                previousButton.prop('src', "images/skip.png").removeClass('disabled').off('click').one('click', skipVideo);
                previousButton.find('.path').css('fill', 'black');
            }
        }
        else {
            //Paint the skipButton's path gray and unbind its click event.
            previousButton.prop('src', "images/skip-disabled.png").addClass('disabled').off('click');
            $(previousButton).find('.path').css('fill', 'gray');
        }
    }

    //Initialize
    refresh();

    return {
        refresh: refresh
    };
});