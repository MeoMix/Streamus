//Displays the currently playing song or a default welcome message.
define(function(){
    'use strict';
    var header = $('#Header');
    var headerTitle = $('#HeaderTitle');
    var defaultCaption = 'Welcome to Streamus';

    //Scroll the song in the title if its too long to read.
    headerTitle.mouseover(function () {
        var distanceToMove = $(this).width() - header.width();
        var duration = 15 * distanceToMove; //Just a feel good value; scales as the text gets longer.
        $(this).animate({ 
            marginLeft: "-" + distanceToMove + "px" }, {
            duration: duration,
            easing: 'linear'} );
    }).mouseout(function () {
        $(this).stop(true).animate({ marginLeft: "0px" });
    });
    
    function updateTitle() {
        var selectedItem = chrome.extension.getBackgroundPage().YoutubePlayer.selectedItem;
        var text = selectedItem ? selectedItem.title : defaultCaption;
        headerTitle.text(text);
    }

    updateTitle(); //Initialize the title because might be re-opening with a song already loaded.

    return {
        updateTitle: updateTitle
    };
});