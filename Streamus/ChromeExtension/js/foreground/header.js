//  Displays the currently playing playlistItem's title or a default welcome message.
define(['backgroundManager'], function (backgroundManager) {
    'use strict';
    var header = $('#Header');
    var headerTitle = $('#HeaderTitle');
    var defaultTitle = 'Welcome to Streamus';

    //  Scroll the playlistItem title if its too long to read.
    headerTitle.mouseover(function () {
        var distanceToMove = $(this).width() - header.width();
        
        $(this).animate({
            marginLeft: "-" + distanceToMove + "px"
        }, {
            //  Just a feel good value; scales as the text gets longer
            duration:  15 * distanceToMove,
            easing: 'linear'
        });

    }).mouseout(function () {
        $(this).stop(true).animate({ marginLeft: 0 });
    });

    backgroundManager.on('change:activePlaylistItem', function (model, activePlaylistItem) {
        console.log("activePlaylistItem has changed");
        setTitle(activePlaylistItem);
    });

    //  Initialize the title because might be re-opening with a playlistItem already loaded.
    setTitle(backgroundManager.get('activePlaylistItem'));
    
    function setTitle(item) {
        var titleText = item == null ? defaultTitle : item.get('title');
        headerTitle.text(titleText);
    }
});