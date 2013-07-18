/*jshint bitwise:false*/
//Provides helper methods for non-specific functionality.
define(function () {
    'use strict';

    return {
        //  Based off of: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
        generateGuid: function() {
            var startStringFormat = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

            var guid = startStringFormat.replace(/[xy]/g, function(c) {
                var r = Math.floor(Math.random() * 16);

                var v = c === 'x' ? r : (r & 0x3 | 0x8);

                return v.toString(16);
            });

            return guid;
        },
        
        scrollElementInsideParent: function(element, parent) {
            //  Scroll the element if its too long to read.
            $(element).mouseover(function () {
                var distanceToMove = $(this).width() - $(parent).width();

                console.log("distance to move", $(this).width(), $(parent).width());

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
        
        //  http://stackoverflow.com/questions/16247825/fetch-z-random-items-from-array-of-size-n-in-z-time
        getRandomNonOverlappingNumbers: function(numbersDesired, maxNumberToUse) {
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
    };
});