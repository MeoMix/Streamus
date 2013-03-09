define(['player', 'backgroundManager'], function (player, backgroundManager) {
    'use strict';
    
    //player.once('change:ready', function () {
    //    console.log("background Manager:", backgroundManager);
    //    backgroundManager.get('activePlaylist').get('items').on('remove', function (model, collection) {
    //        if (collection.length === 0) {
    //            player.pause();
    //        }
    //    });
    //});

    player.on('change:state', function (model, state) {
        
        if (state === PlayerStates.PLAYING) {

            var foreground = chrome.extension.getViews({ type: "popup" });
  
            if (foreground.length == 0){
                var notification = window.webkitNotifications.createNotification(
                  'http://img.youtube.com/vi/' + backgroundManager.get('activePlaylistItem').get('video').get('id') + '/default.jpg',
                  'Now Playing',
                  backgroundManager.get('activePlaylistItem').get('title')
                );

                notification.show();

                setTimeout(function () {
                    notification.close();
                }, 5000);
            }
        }
        //  If the video stopped playing and there's another playlistItem to skip to, do so.
        else if (state === PlayerStates.ENDED) {
            //  Don't pass message to UI if it is closed. Handle sock change in the background.
            //  The player can be playing in the background and UI changes may try and be posted to the UI, need to prevent.
            var isRadioModeEnabled = JSON.parse(localStorage.getItem('isRadioModeEnabled')) || false;

            var activePlaylist = backgroundManager.get('activePlaylist');
            var nextItem;
            if (isRadioModeEnabled) {
                var nextVideo = activePlaylist.getRelatedVideo();
                nextItem = activePlaylist.addItem(nextVideo);

            } else {
                nextItem = activePlaylist.gotoNextItem();
            }

            var selectedItem = activePlaylist.selectItemById(nextItem.get('id'));
            player.loadVideoById(selectedItem.get('video').get('id'));
        }

    });
    
    //  Receive keyboard shortcuts from users.
    chrome.commands.onCommand.addListener(function (command) {
        console.log("Command received:", command);
        switch (command) {
            case 'nextVideo':
                backgroundManager.get('activePlaylist').skipItem("next");
                break;
            case 'previousVideo':
                backgroundManager.get('activePlaylist').skipItem("previous");
                break;
            case 'toggleVideo':
                if (player.isPlaying()) {
                    player.pause();
                } else {
                    player.play();
                }

                break;

        }
    });

    chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
        switch (request.method) {
            case 'getPlaylists':
                sendResponse({ playlists: backgroundManager.get('activeStream').get('playlists') });
                break;
            case 'addVideoByIdToPlaylist':
                backgroundManager.get('activeStream').addVideoByIdToPlaylist(request.id, request.playlistId);
                break;
            default:
                window && console.error("Unhandled request method:", request.method);
                break;
        }
    });

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
    
    chrome.webRequest.onBeforeSendHeaders.addListener(function (info) {
        
        var cookieRequestHeader = _.find(info.requestHeaders, function(requestHeader) {
            return requestHeader.name === 'Cookie';
        });
        
        if (cookieRequestHeader) {
            //  force youtube to gimmie the sexy html5 loader. muahaha!
            var flashCookieValue = 'f3=40000';
            var html5CookieValue = 'f2=40000000';
            
            if (cookieRequestHeader.value.indexOf(flashCookieValue) !== -1) {
                cookieRequestHeader.value = cookieRequestHeader.value.replace(flashCookieValue, html5CookieValue);
            } else {
                cookieRequestHeader.value += '&' + html5CookieValue;
			}

        }

        //  Bypass YouTube's embedded player content restrictions by looking like I'm ... youtube! 
        info.requestHeaders.push({  
            name: "Referer",
            value: "http://youtube.com"
        });
        return { requestHeaders: info.requestHeaders };
    }, {
        urls: ["<all_urls>"]
    },
        ["blocking", "requestHeaders"]
    );
    
    //  Build iframe after onBeforeSendHeaders listener to prevent errors and generate correct type of player.
    $('<iframe>', {
        id: 'MusicHolder',
        width: 475,
        height: 286,
        src: 'http://www.youtube.com/embed/undefined?enablejsapi=1'
    }).appendTo('body');
});