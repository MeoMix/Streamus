//When clicked -- skips to the next video. Can't be clicked with only 1 video.
//Will skip from the end of the list to the front again.
define(function(){
    'use strict';
    var skipButton = $('#SkipButton');

    function skipVideo() {
        chrome.extension.getBackgroundPage().YoutubePlayer.skipVideo('next');
        //Prevent spamming by only allowing a next click once a second.
        setTimeout(function () { 
            skipButton.off('click').one('click', skipVideo);
        }, 1000);
    }
    
    function refresh() {
        var player = chrome.extension.getBackgroundPage().YoutubePlayer;
        
        //If radio mode is enabled they can always skip to another video as long as there is at least one playlistItem.
        //Otherwise, only allow skipping if there's more than 1 playlistItem.
        var oneItemAndRadioModeEnabled = JSON.parse(localStorage.getItem('isRadioModeEnabled') || false) && player.items.length > 0;
        if (oneItemAndRadioModeEnabled || player.items.length > 1) {

            //Paint the skipButton's path black and bind its click event.
            //TODO: Use underscore's throttle here to prevent spam clicking.
            skipButton.prop('src', "images/skip.png").removeClass('disabled').off('click').one('click', skipVideo);
            skipButton.find('.path').css('fill', 'black');
        } else {
            //Paint the skipButton's path gray and unbind its click event.
            skipButton.prop('src', "images/skip-disabled.png").addClass('disabled').off('click');
            $(skipButton).find('.path').css('fill', 'gray');
        }
    }

    //Initialize
    refresh();

    return {
        refresh: refresh
    };
});