define(['localStorageManager'], function (localStorageManager) {
    'use strict';

    var radioModeButton = $('#RadioModeButton').click(toggleRadioMode);

    var isRadioModeEnabled = localStorageManager.getIsRadioModeEnabled();
    if (isRadioModeEnabled) {
        radioModeButton.addClass('pressed');
    }

    function toggleRadioMode() {
        if (radioModeButton.hasClass('pressed')) {
            radioModeButton.removeClass('pressed');
        }
        else {
            radioModeButton.addClass('pressed');
        }

        localStorageManager.setIsRadioModeEnabled(radioModeButton.hasClass('pressed'));
    }
    
    radioModeButton.tooltip({
        position: {
            my: "center bottom-20",
            at: "center top",
            using: function (position) {
                $(this).css(position);

                $('<div>', {
                    'class': 'arrow bottom left'
                }).appendTo(this);
            }
        }
        
    });
});