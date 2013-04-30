//  When clicked -- skips to the last video. Skips from the begining of the list to the end.
define(['backgroundManager'], function (backgroundManager) {
    'use strict';
    var previousButton = $('#PreviousButton');
    
    //  Prevent spamming by only allowing a previous click once every 100ms.
    previousButton.click(_.debounce(function () {
        
        if (!$(this).hasClass('disabled')) {
            var activePlaylistItem = backgroundManager.get('activePlaylistItem');
            var playlistId = activePlaylistItem.get('playlistId');
            var playlist = backgroundManager.getPlaylistById(playlistId);

            var previousItem = playlist.gotoPreviousItem();
            backgroundManager.set('activePlaylistItem', previousItem);
        }
        
    }, 100, true));

    backgroundManager.on('change:activePlaylistItem', function(activePlaylistItem) {
        if (activePlaylistItem === null) {
            disableButton();
        }
        else {
            enableButton();
        }
    });

    enableIfItemsInPlaylist(backgroundManager.get('activePlaylist'));
    
    function enableIfItemsInPlaylist(playlist) {
        if (playlist !== null) {

            var itemCount = playlist.get('items').length;

            if (itemCount > 0) {
                enableButton();
            }
            
        }
    }

    //  Paint the button's path black and bind its click event.
    function enableButton() {
        previousButton.prop('src', 'images/skip.png').removeClass('disabled');
        previousButton.find('.path').css('fill', 'black');
    }

    //  Paint the button's path gray and unbind its click event.
    function disableButton() {
        previousButton.prop('src', 'images/skip-disabled.png').addClass('disabled');
        $(previousButton).find('.path').css('fill', 'gray');
    }
});