$(function () {

    $('#streamusNotInstalled').hide();

    var currentUrl = document.URL;
    var urlSections = currentUrl.split('/');
    
    //  The last section of the URL should be the sharecode and the second to last section should be the indicator of playlist or stream.

    var shareCode = urlSections[urlSections.length - 1];
    var indicator = urlSections[urlSections.length - 2];

    console.log("Length:", shareCode.length);

    if (indicator === 'playlist' && shareCode.length === 36) {
        chrome.runtime.sendMessage({
            method: "addPlaylistByShareCode",
            shareCode: shareCode
        }, function (response) {

            console.log("response:", response);

        });
    }



});



