require(['jquery', 'backbone', 'playerState', 'dataSource', 'helpers', 'underscore', 'error', 'iconManager'], function () {
    'use strict';

    //var testString = "Häzel - This Girl Is Watching Me";

    //$.ajax({
    //    url: 'http://localhost:61975/PlaylistItem/Test',
    //    type: 'POST',
    //    contentType: 'application/text',
    //    dataType: 'text',
    //    data: JSON.stringify({
    //        testString: testString
    //    }),
    //    success: function(response) {

    //        console.log("How about this?", encodeURIComponent(response));
    //        console.log("And this:", encodeURIComponent(testString));
    //        console.log("Response:", response, response === testString);
    //    }
    //});


    //  Only use main.js for loading external helper files before the background is ready. Then, load the background.
    require(['background'], function () { });
});