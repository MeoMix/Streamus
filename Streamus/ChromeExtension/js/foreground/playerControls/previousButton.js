//  When clicked -- skips to the last video. Skips from the begining of the list to the end.
define(['playlistManager'], function(playlistManager){
    'use strict';
    var previousButton = $('#PreviousButton');
    
    //  Prevent spamming by only allowing a previous click once every 100ms.
    previousButton.click(_.debounce(function () {
        
        if (!$(this).hasClass('disabled')) {
            playlistManager.skipItem('previous');
        }
        
    }, 100, true));

    playlistManager.onActivePlaylistEmptied(disableButton);
    playlistManager.onActivePlaylistItemAdd(enableButton);

    playlistManager.onActivePlaylistChange(function (event, playlist) {
        enableIfItemsInPlaylist(playlist);
    });

    enableIfItemsInPlaylist(playlistManager.activePlaylist);
    
    function enableIfItemsInPlaylist(playlist) {
        var itemCount = playlist.get('items').length;

        if (itemCount > 0) {
            enableButton();
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