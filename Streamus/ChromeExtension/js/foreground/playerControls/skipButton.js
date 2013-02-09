//  When clicked -- skips to the next video. Skips from the end of the list to the front again.
define(function(){
    'use strict';
    var skipButton = $('#SkipButton');

    //  Initialize
    refresh();

    skipButton.one('click', skipVideo);

    function skipVideo() {
        console.log("Skipping video");
        chrome.extension.getBackgroundPage().YoutubePlayer.skipVideo('next');
        //  Prevent spamming by only allowing a next click once a second.
        setTimeout(function () { 
            skipButton.off('click').one('click', skipVideo);
        }, 500);
    }
    
    function refresh() {
        var playlistManager = chrome.extension.getBackgroundPage().PlaylistManager;
        
        if (playlistManager.activePlaylist.get('items').length > 0) {
            //  Paint the skipButton's path black and bind its click event.
            //  TODO: Use underscore's throttle here to prevent spam clicking.
            
            skipButton.prop('src', 'images/skip.png').removeClass('disabled');
            skipButton.find('.path').css('fill', 'black');
        } else {
            //  Paint the skipButton's path gray and unbind its click event.
            skipButton.prop('src', 'images/skip-disabled.png').addClass('disabled');
            $(skipButton).find('.path').css('fill', 'gray');
        }
    }

    return {
        refresh: refresh
    };
});