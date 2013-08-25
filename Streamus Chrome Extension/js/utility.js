define({
    
    scrollElementInsideParent: function (element) {
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

    //  If there are a ton of elements which need to scroll all under a given root element, allow for event delegation
    scrollChildElements: function (parent, childElementSelector) {

        $(parent).on('mouseover', childElementSelector, function () {

            var distanceToMove = $(this).width() - $(this).parent().width();

            $(this).animate({
                marginLeft: "-" + distanceToMove + "px"
            }, {
                //  Just a feel good value; scales as the text gets longer
                duration: 15 * distanceToMove,
                easing: 'linear'
            });

        });

        $(parent).on('mouseout', childElementSelector, function () {
            $(this).stop(true).animate({ marginLeft: 0 });
        });

    },

    //  http://stackoverflow.com/questions/16247825/fetch-z-random-items-from-array-of-size-n-in-z-time
    getRandomNonOverlappingNumbers: function (numbersDesired, maxNumberToUse) {
        var i,
        array = [],
        store = {},
        result = [],
        undef,
        length;

        for (i = 0; i < maxNumberToUse; i += 1) {
            array.push(i);
        }

        length = array.length;

        if (numbersDesired > length) {
            numbersDesired = length;
        }

        i = 0;
        while (i < numbersDesired) {
            var rnd = Math.floor(Math.random() * length);

            if (store[rnd] === undef) {
                result[i] = store[rnd] = array[rnd];
                i += 1;
            }
        }

        return result;
    },
    
    //  Takes a time in seconds and converts it to a displayable format of H:mm:ss or mm:ss.
    prettyPrintTime: function (timeInSeconds) {
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
    },
    
    //  Takes a URL and returns parsed URL information such as schema and video id if found inside of the URL.
    parseVideoIdFromUrl: function (url) {
        var videoId = null;

        var match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.*?\&v=)([^#\&\?]*).*/);
        if (match && match[2].length === 11) {
            videoId = match[2];
        }

        return videoId;
    },
    
    htmlEscape: function (unsafeString) {
        var safeString = unsafeString
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");

        return safeString;
    }

});