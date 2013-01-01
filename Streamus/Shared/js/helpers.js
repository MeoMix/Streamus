/*jshint bitwise:false*/
//Provides helper methods for non-specific functionality.
define(function () {
    'use strict';

    return {
        //Based off of: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
        generateGuid: function() {
            var startStringFormat = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

            var guid = startStringFormat.replace(/[xy]/g, function(c) {
                var r = Math.floor(Math.random() * 16);

                var v = c === 'x' ? r : (r & 0x3 | 0x8);

                return v.toString(16);
            });

            return guid;
        },

        //Takes a time in seconds and converts it to a displayable format of H:mm:ss or mm:ss.
        prettyPrintTime: function(timeInSeconds) {
            if (isNaN(timeInSeconds)) {
                console.log("Time in seconds:", timeInSeconds);
                timeInSeconds = 0;
            }

            var date = new Date(timeInSeconds * 1000);

            //Need to remove 16 hours from hours to represent properly.
            var hours = date.getHours() - 16;
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();

            //These lines ensure two-digits
            if (minutes < 10) {
                minutes = "0" + minutes;
            }

            if (seconds < 10) {
                seconds = "0" + seconds;
            }

            var timeString = minutes + ':' + seconds;

            if (timeInSeconds >= 3600) {
                timeString = hours + ':' + timeString;
            }

            return timeString;
        },
        //http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values/
        getUrlParamaterValueByName: function(url, paramaterName) {
            paramaterName = paramaterName.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            //Meo [Nov '12]: I added the '#' character to this regexp to match facebook query string urls. Hopefully doesn't break anything.
            var regex = new RegExp("[\\#?&]" + paramaterName + "=([^&#]*)");
            var results = regex.exec(url);

            var returnValue = "";
            if (results != null) {
                returnValue = results[1];
            }

            return returnValue;
        }
    };
});