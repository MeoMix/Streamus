$(function () {
    'use strict';

    $('#downloadButton').click(function () {

        console.log("Clicked. executing");

        chrome.webstore.install('https://chrome.google.com/webstore/detail/jbnkffmindojffecdhbbmekbmkkfpmjd', function() {
            console.log("Success");
        }, function (a) {
            console.log("error:", a);
        });


    });

})