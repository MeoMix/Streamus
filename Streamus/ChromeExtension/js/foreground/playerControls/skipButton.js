//  When clicked -- skips to the next video. Skips from the end of the list to the front again.
define(['backgroundManager'], function (backgroundManager) {
    'use strict';
    var skipButton = $('#SkipButton');

    //  Prevent spamming by only allowing a next click once every 100ms.
    skipButton.click(_.debounce(function () {

        if (!$(this).hasClass('disabled')) {

            var activePlaylistItem = backgroundManager.get('activePlaylistItem');
            var playlistId = activePlaylistItem.get('playlistId');
            var playlist = backgroundManager.getPlaylistById(playlistId);

            var nextItem = playlist.skipItem('next');
            backgroundManager.set('activePlaylistItem', nextItem);
        }

    }, 100, true));

    backgroundManager.on('change:activePlaylistItem', function (activePlaylistItem) {
        if (activePlaylistItem === null) {
            disableButton();
        } else {
            enableButton();
        }
    });

    if (backgroundManager.get('activePlaylistItem') !== null) {
        enableButton();
    }

    //  Paint the button's path black and bind its click event.
    function enableButton() {
        skipButton.prop('src', 'images/skip.png').removeClass('disabled');
        skipButton.find('.path').css('fill', 'black');
    }
    
    //  Paint the button's path gray and unbind its click event.
    function disableButton() {
        skipButton.prop('src', 'images/skip-disabled.png').addClass('disabled');
        $(skipButton).find('.path').css('fill', 'gray');
    }
});