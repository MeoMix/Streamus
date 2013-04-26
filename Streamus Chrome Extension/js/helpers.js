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