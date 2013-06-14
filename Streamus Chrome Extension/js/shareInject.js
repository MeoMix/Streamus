$(function () {

    var currentUrl = document.URL;
    var urlSections = currentUrl.split('/');
    
    //  The last section of the URL should be the sharecode and the second to last section should be the indicator of playlist or stream.

    var indicator = urlSections[urlSections.length - 3];
    var shareCodeShortId = urlSections[urlSections.length - 2];
    var urlFriendlyEntityTitle = urlSections[urlSections.length - 1];

    if (indicator === 'playlist' && shareCodeShortId.length === 12 && urlFriendlyEntityTitle.length > 0) {
        chrome.runtime.sendMessage({
            method: "addPlaylistByShareData",
            shareCodeShortId: shareCodeShortId,
            urlFriendlyEntityTitle: urlFriendlyEntityTitle
        }, function (response) {
            
            var resultText;

            if (response.result === 'success') {
                resultText = 'Playlist ' + response.playlistTitle + ' added successfully.';
            } else {
                resultText = 'There was an issue adding your playlist. Check the URL?';
            }
            
            $('<div>', {
                text: resultText
            }).appendTo('body');

        });
    }

});



