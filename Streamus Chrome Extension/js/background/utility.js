define({

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
    
    //  TODO: DRY with other utility
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

});