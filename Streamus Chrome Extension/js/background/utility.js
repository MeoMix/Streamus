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
    }

});