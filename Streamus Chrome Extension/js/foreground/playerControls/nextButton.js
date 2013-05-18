//  When clicked -- goes to the next video. Can potentially go from the end of the list to the front if repeat playlist is toggled on
define(['backgroundManager'], function (backgroundManager) {
    'use strict';
    var nextButton = $('#NextButton');

    //  Prevent spamming by only allowing a next click once every 100ms.
    nextButton.click(_.debounce(function () {

        if (!$(this).hasClass('disabled')) {

            var activePlaylistItem = backgroundManager.get('activePlaylistItem');
            var playlistId = activePlaylistItem.get('playlistId');
            var playlist = backgroundManager.getPlaylistById(playlistId);

            var nextItem = playlist.gotoNextItem();

            backgroundManager.set('activePlaylistItem', nextItem);

            //  Manually triggering the change so that player can realize it needs to set its time back to 0:00.
            if (activePlaylistItem === nextItem) {
                backgroundManager.trigger('change:activePlaylistItem', backgroundManager, nextItem);
            }
        }

    }, 100, true));

    backgroundManager.on('change:activePlaylistItem', function (model, activePlaylistItem) {

        if (activePlaylistItem === null) {
            disableButton();
        } else {
            enableButton();
        }
    });

    if (backgroundManager.get('activePlaylistItem') != null) {
        enableButton();
    }

    //  Paint the button's path black and bind its click event.
    function enableButton() {
        nextButton.prop('src', 'images/skip.png').removeClass('disabled');
        nextButton.find('.path').css('fill', 'black');
    }
    
    //  Paint the button's path gray and unbind its click event.
    function disableButton() {
        nextButton.prop('src', 'images/skip-disabled.png').addClass('disabled');
        nextButton.find('.path').css('fill', 'gray');
    }
});