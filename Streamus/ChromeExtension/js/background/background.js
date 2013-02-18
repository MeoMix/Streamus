define(['playlistManager'], function (playlistManager) {
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
                playlistManager.skipItem("next");
                break;
            case 'previousVideo':
                playlistManager.skipItem("previous");
            break;
            case 'toggleVideo':
                if (YoutubePlayer.playerState === PlayerStates.PLAYING) {
                    YoutubePlayer.play();
                } else {
                    YoutubePlayer.pause();
                }
        }
    });

    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
        switch(request.method){
            case 'getPlaylists':
                sendResponse({ playlists: playlistManager.playlists });
            break;
            case 'addVideoByIdToPlaylist':
                playlistManager.addVideoByIdToPlaylist(request.id, request.playlistId);
            break;
            default:
                console.error("Unhandled request method:", request.method);
            break;
        }
    });
});