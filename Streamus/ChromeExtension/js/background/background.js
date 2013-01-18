define(['playlistManager'], function (playlistManager) {
    'use strict';
    //Bypass YouTube's content restrictions by looking like I'm a website.
    chrome.webRequest.onBeforeSendHeaders.addListener(function (info) {
        info.requestHeaders.push({
            name: "Referer",
            value: "http://stackoverflow.com/questions/12829590/how-does-facebook-play-a-youtube-video-which-has-been-banned-from-embedding"
        });
        return { requestHeaders: info.requestHeaders };
    }, {
        urls: ["<all_urls>"]
    },
        ["blocking", "requestHeaders"]
    );

    //Build iframe AFTER onBeforeSendHeaders listener. You can't put this shit in the HTML.
    $('<iframe id="MusicHolder" width="640" height="390" src="http://www.youtube.com/embed/dummy?enablejsapi=1"></iframe>').appendTo('body');

    console.log("binding to playlistManager onReady");
    playlistManager.onReady(function () {
        console.log('playlistManager is Ready!');
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
    //                    console.log("accessToken:", accessToken);
    //                    $.ajax({
    //                        url: 'http://ec2-54-234-89-248.compute-1.amazonaws.com/Streamus/backend/fb/setAccessToken.php',
    //                        data: {
    //                            accessToken: accessToken
    //                        },
    //                        error: function(a, e) {
    //                            console.log("error:", a, e);
    //                        },
    //                        success: function (json) {
    //                            var authKey = JSON.parse(json);

    //                            //Make the AJAX request!
    //                            var url = "http://ec2-54-234-89-248.compute-1.amazonaws.com/Streamus/backend/fb/loadSongs.php";
    //                            $.ajax({
    //                                url: url,
    //                                data: {
    //                                    authkey: authKey
    //                                },
    //                                //Leave this line in for FF support!
    //                                dataType: "json",
    //                                success: function (otherJson) {
    //                                    //Loop through received songs and add them to the library
    //                                    console.log("JSON BIG SUCCESS:", otherJson);
    //                                }
    //                            });
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
    // //                console.log("success:", a, e);
    // //            }
    // //        });
    // //    }
    //}

    //chrome.tabs.onUpdated.addListener(onFacebookLogin);



    //http://stackoverflow.com/questions/5235719/how-to-copy-text-to-clipboard-from-a-google-chrome-extension
    //Copies text to the clipboard. Has to happen on background page due to elevated privs.
    chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
        var textarea = document.getElementById("HiddenClipboard");
        //Put message in hidden field.
        textarea.value = msg.text;
        //Copy text from hidden field to clipboard.
        textarea.select();
        document.execCommand("copy", false, null);
        //Cleanup
        sendResponse({});
    });

    chrome.commands.onCommand.addListener(function(command) {
        console.log("command:", command);
        switch(command){
            case 'nextSong':
                YoutubePlayer.skipSong("next");
                break;
            case 'previousSong':
                YoutubePlayer.skipSong("previous");
            break;
            case 'toggleSong':
                YoutubePlayer.toggleSong();
        }
    });

    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
        switch(request.method){
            case 'getPlaylists':
                sendResponse({playlists: YoutubePlayer.playlists});
            break;
            case 'addVideoByIdToPlaylist':
                YoutubePlayer.addSongToPlaylist(request.videoId, request.playlistId);
            break;
            default:
                console.error("Unhandled request method:", request.method);
            break;
        }
    });
});