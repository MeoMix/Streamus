//  Displays the currently playing playlistItem's title or a default welcome message.
define(function(){
    'use strict';
    var header = $('#Header');
    var headerTitle = $('#HeaderTitle');
    var defaultTitle = 'Welcome to Streamus';

    //  Scroll the playlistItem title if its too long to read.
    headerTitle.mouseover(function () {
        var distanceToMove = $(this).width() - header.width();

        //  Just a feel good value; scales as the text gets longer.
        var duration = 15 * distanceToMove; 
        $(this).animate({
            marginLeft: "-" + distanceToMove + "px"
        }, {
            duration: duration,
            easing: 'linear'
        });

    }).mouseout(function () {
        $(this).stop(true).animate({ marginLeft: 0 });
    });
    
    var playlistManager = chrome.extension.getBackgroundPage().PlaylistManager;
    
    playlistManager.onActivePlaylistTitleChange(function(activePlaylist) {
        headerTitle.text(activePlaylist.getSelectedItem().get('title'));
    });
    
    //  Initialize the title because might be re-opening with a playlistItem already loaded.
    //  TODO: This is a lot of data for foreground to know of
    var selectedItem = playlistManager.activePlaylist.getSelectedItem();
    
    if (selectedItem) {
        headerTitle.text(selectedItem.get('title'));
    }
});