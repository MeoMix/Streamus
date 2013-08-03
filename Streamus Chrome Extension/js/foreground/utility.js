//  Provides helper methods for non-specific functionality.
define({

    scrollElementInsideParent: function(element) {
        //  Scroll the element if its too long to read.
        $(element).mouseover(function () {
            var distanceToMove = $(this).width() - $(this).parent().width();

            $(this).animate({
                marginLeft: "-" + distanceToMove + "px"
            }, {
                //  Just a feel good value; scales as the text gets longer
                duration: 15 * distanceToMove,
                easing: 'linear'
            });

        }).mouseout(function () {
            $(this).stop(true).animate({ marginLeft: 0 });
        });
    },       

    //  Takes a time in seconds and converts it to a displayable format of H:mm:ss or mm:ss.
    prettyPrintTime: function(timeInSeconds) {
        if (isNaN(timeInSeconds)) {
            timeInSeconds = 0;
        }

        var hours = Math.floor(timeInSeconds / 3600);
        var remainingSeconds = timeInSeconds % 3600;

        var minutes = Math.floor(remainingSeconds / 60);
        remainingSeconds = remainingSeconds % 60;

        //  These lines ensure two-digits
        if (minutes < 10) {
            minutes = "0" + minutes;
        }

        if (remainingSeconds < 10) {
            remainingSeconds = "0" + remainingSeconds;
        }

        var timeString = minutes + ':' + remainingSeconds;

        if (hours > 0) {
            timeString = hours + ':' + timeString;
        }

        return timeString;
    }

});