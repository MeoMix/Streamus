//  Displays the currently playing playlistItem's title or a default welcome message.
define(['playlistManager'], function (playlistManager) {
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

    var stream = playlistManager.getStream();

    stream.get('activePlaylist').on('change:title', function(event, activePlaylist) {
        headerTitle.text(activePlaylist.getSelectedItem().get('title'));
    });

    stream.get('activePlaylist').get('items').on('change:selected', function(event, item) {
        setTitle(item);
    });

    stream.get('activePlaylist').on('empty:items', function() {
        headerTitle.text(defaultTitle);
    });

    stream.on('change:activePlaylist', function(event, playlist) {
        setTitle(playlist.getSelectedItem());
    });

    //  Initialize the title because might be re-opening with a playlistItem already loaded.

    var selectedItem = stream.get('activePlaylist').getSelectedItem();
    setTitle(selectedItem);
    
    function setTitle(item) {
        var titleText = item == null ? defaultTitle : item.get('title');
        headerTitle.text(titleText);
    }
});