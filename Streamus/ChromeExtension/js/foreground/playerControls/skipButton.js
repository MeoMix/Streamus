//When clicked -- skips to the next song. Can't be clicked with only 1 song.
//Will skip from the end of the list to the front again.
define(function(){
    'use strict';
    var skipButton = $('#SkipButton');

    function skipSong() {
        chrome.extension.getBackgroundPage().YoutubePlayer.skipSong('next');
        //Prevent spamming by only allowing a next click once a second.
        setTimeout(function () { 
            skipButton.off('click').one('click', skipSong);
        }, 1000);
    }
    
    function refresh() {
        var player = chrome.extension.getBackgroundPage().YoutubePlayer;
        
        //If radio mode is enabled they can always skip to another song as long as there is at least one song.
        //Otherwise, only allow skipping if there's more than 1 song.
        var oneSongAndRadioModeEnabled = JSON.parse(localStorage.getItem('isRadioModeEnabled') || false) && player.items.length > 0;
        if (oneSongAndRadioModeEnabled || player.items.length > 1) {
            console.log("enabling");
            //Paint the skipButton's path black and bind its click event.
            //TODO: Use underscore's throttle here to prevent spam clicking.
            skipButton.prop('src', "images/skip.png").removeClass('disabled').off('click').one('click', skipSong);
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