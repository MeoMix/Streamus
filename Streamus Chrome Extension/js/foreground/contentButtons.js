define(['localStorageManager'], function(localStorageManager){
    'use strict';
    
    var menuButtons = $('.menubutton');
    
    //  User clicks on a different button on the LHS, possible change of content display.
    menuButtons.click(function () {

        //  If the user clicked a button that isn't the current button.
        if (!$(this).hasClass('active')) {
            //  Clear content and show new content based on button clicked.
            menuButtons.removeClass('active');
            
            $(this).addClass('active');
            $('.content:visible').hide();
            $('#' + $(this).data('content')).show();

            localStorageManager.setActiveContentButtonId($(this).attr('id'));
        }
    });

    //  Set the initially loaded content to whatever was clicked last or the home page as a default
    var activeContentButtonId = localStorageManager.getActiveContentButtonId();
    $('#' + activeContentButtonId).click();
});