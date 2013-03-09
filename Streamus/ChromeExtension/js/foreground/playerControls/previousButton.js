//  When clicked -- skips to the last video. Skips from the begining of the list to the end.
define(['backgroundManager'], function (backgroundManager) {
    'use strict';
    var previousButton = $('#PreviousButton');
    
    //  Prevent spamming by only allowing a previous click once every 100ms.
    previousButton.click(_.debounce(function () {
        
        if (!$(this).hasClass('disabled')) {
            backgroundManager.get('activePlaylist').skipItem('previous');
        }
        
    }, 100, true));

    var activeStream = backgroundManager.get('activeStream');
    activeStream.get('playlists').on('change:selected', function (playlist, isSelected) {

        if (isSelected) {
            enableIfItemsInPlaylist(playlist);

            playlist.get('items').on('remove', function (model, collection) {
                if (collection.length === 0) {
                    disableButton();
                }
            });

            playlist.get('items').on('add', enableButton);

        } else {
            playlist.get('items').off('remove add');
        }

    });

    var activePlaylist = backgroundManager.get('activePlaylist');
    activePlaylist.get('items').on('remove', function (model, collection) {
        if (collection.length === 0) {
            disableButton();
        }
    });
    
    activePlaylist.get('items').on('add', enableButton);

    enableIfItemsInPlaylist(activePlaylist);
    
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