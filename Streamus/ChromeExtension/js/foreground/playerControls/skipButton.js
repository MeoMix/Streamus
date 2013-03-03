//  When clicked -- skips to the next video. Skips from the end of the list to the front again.
define(['playlistManager'], function (playlistManager) {
    'use strict';
    var skipButton = $('#SkipButton');

    //  Prevent spamming by only allowing a next click once every 100ms.
    skipButton.click(_.debounce(function () {

        if (!$(this).hasClass('disabled')) {
            playlistManager.skipItem('next');
        }

    }, 100, true));

    var stream = playlistManager.getStream();
    stream.on('empty:activePlaylist', disableButton);
    stream.get('activePlaylist').on('add:items', enableButton);
    stream.on('change:activePlaylist', function(event, playlist) {
        enableIfItemsInPlaylist(playlist);
    });

    enableIfItemsInPlaylist(stream.get('activePlaylist'));
    
    function enableIfItemsInPlaylist(playlist) {
        var itemCount = playlist.get('items').length;

        if (itemCount > 0) {
            enableButton();
        }
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