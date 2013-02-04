//  Displays the currently playing playlistItem's title or a default welcome message.
define(function(){
    'use strict';
    var header = $('#Header');
    var headerTitle = $('#HeaderTitle');
    var defaultCaption = 'Welcome to Streamus';

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
        $(this).stop(true).animate({ marginLeft: "0px" });
    });
    
    function updateTitle() {
        var selectedItem = chrome.extension.getBackgroundPage().YoutubePlayer.selectedItem;
        var text = selectedItem ? selectedItem.get('title') : defaultCaption;
        headerTitle.text(text);
    }

    //  Initialize the title because might be re-opening with a playlistItem already loaded.
    updateTitle(); 

    return {
        updateTitle: updateTitle
    };
});