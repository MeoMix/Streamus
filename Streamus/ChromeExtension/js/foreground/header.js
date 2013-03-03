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

    stream.getSelectedPlaylist().on('change:title', function (playlist, title) {
        headerTitle.text(title);
    });

    stream.getSelectedPlaylist().get('items').on('change:selected', function (item, isSelected) {
        
        if (isSelected) {
            setTitle(item);
        }
    });

    stream.getSelectedPlaylist().get('items').on('remove', function (model, collection) {
        if (collection.length === 0) {
            headerTitle.text(defaultTitle);
        }
    });
    
    stream.getSelectedPlaylist().on('change:selected', function (playlist, isSelected) {

        if (isSelected) {
            setTitle(playlist.getSelectedItem());
        }

    });

    //  Initialize the title because might be re-opening with a playlistItem already loaded.

    var selectedItem = stream.getSelectedPlaylist().getSelectedItem();
    setTitle(selectedItem);
    
    function setTitle(item) {
        var titleText = item == null ? defaultTitle : item.get('title');
        headerTitle.text(titleText);
    }
});