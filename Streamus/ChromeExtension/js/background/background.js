define(['playlistManager',
        'programState'
       ], function (playlistManager, programState) {
    'use strict';
    //  Bypass YouTube's content restrictions by looking like I'm a website.
    chrome.webRequest.onBeforeSendHeaders.addListener(function (info) {
        info.requestHeaders.push({
            name: "Referer",
            //  hehehe
            value: "http://stackoverflow.com/questions/12829590/how-does-facebook-play-a-youtube-video-which-has-been-banned-from-embedding"
        });
        return { requestHeaders: info.requestHeaders };
    }, {
        urls: ["<all_urls>"]
    },
        ["blocking", "requestHeaders"]
    );

    //  Build iframe AFTER onBeforeSendHeaders listener.
    $('<iframe id="MusicHolder" width="640" height="390" src="http://www.youtube.com/embed/dummy?enablejsapi=1"></iframe>').appendTo('body');

    playlistManager.onReady(function () {
        require(['player'], function() {});
    });
    

    //function onFacebookLogin() {
    //	var successURL = 'https://www.facebook.com/connect/login_success.html';

    //	// if (!localStorage.params) {
    //		chrome.tabs.getAllInWindow(null, function(tabs) {
    //			for (var i = 0; i < tabs.length; i++) {
    //				if (tabs[i].url.indexOf(successURL) == 0) {
    //					chrome.tabs.onUpdated.removeListener(onFacebookLogin);

    //                    var accessToken = Helpers.getUrlParamaterValueByName(tabs[i].url, "access_token");
    //                    $.ajax({
    //                        url: programState.getBaseUrl() + 'backend/fb/setAccessToken.php',
    //                        data: {
    //                            accessToken: accessToken
    //                        },
    //                        error: function(error) {
    //                            console.error(error);
    //                        },
    //                        success: function (json) {
    //                            var authKey = JSON.parse(json);
    //                        }
    //                    });

    //					return;
    //				}
    //			}
    //		});
    //	// }
    // //    else{
    // //        $.ajax({
    // //            type: 'GET',
    // //            url: 'https://graph.facebook.com/me',
    // //            data: {
    // //                access_token: localStorage.params['access_token']
    // //            },
    // //            success: function(a, e){
    // //            }
    // //        });
    // //    }
    //}

    //chrome.tabs.onUpdated.addListener(onFacebookLogin);



    //  http://stackoverflow.com/questions/5235719/how-to-copy-text-to-clipboard-from-a-google-chrome-extension
    //  Copies text to the clipboard. Has to happen on background page due to elevated privs.
    chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
        var textarea = document.getElementById("HiddenClipboard");
        //  Put message in hidden field.
        textarea.value = msg.text;
        //  Copy text from hidden field to clipboard.
        textarea.select();
        document.execCommand("copy", false, null);
        //  Cleanup
        sendResponse({});
    });

    chrome.commands.onCommand.addListener(function(command) {
        switch(command){
            case 'nextVideo':
                YoutubePlayer.skipVideo("next");
                break;
            case 'previousVideo':
                YoutubePlayer.skipVideo("previous");
            break;
            case 'toggleVideo':
                YoutubePlayer.toggleVideo();
        }
    });

    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
        switch(request.method){
            case 'getPlaylists':
                sendResponse({playlists: YoutubePlayer.playlists});
            break;
            case 'addVideoByIdToPlaylist':
                YoutubePlayer.addVideoByIdToPlaylist(request.id, request.playlistId);
            break;
            default:
                console.error("Unhandled request method:", request.method);
            break;
        }
    });
});