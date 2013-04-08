//  Background.js is a bit of a dumping ground for code which needs a permanent housing spot.
define(['player', 'backgroundManager', 'localStorageManager', 'ytHelper', 'error', 'programState'],
    function (player, backgroundManager, localStorageManager, ytHelper, Error, programState) {
    'use strict';

    //  TODO: This is the only place I really plan on referencing the error module,
    //  maybe I should move this window.onerror into the Error module?
    //  Send a log message whenever any client errors occur; for debugging purposes.
    window.onerror = function (message, url, lineNumber) {
        
        //  Only log client errors to the database in a deploy environment, not when debugging locally.
        if (!programState.get('isLocal')) {
            var error = new Error({
                message: message,
                url: url,
                lineNumber: lineNumber
            });

            error.save();
        }
    };

    player.on('change:state', function (model, state) {
        
        if (state === PlayerStates.PLAYING) {

            //  Check if the foreground UI is open.
            var foreground = chrome.extension.getViews({ type: "popup" });
  
            if (foreground.length == 0) {

                //  If the foreground UI is not open, show a notification to indicate active video.
                var activeVideoId = backgroundManager.get('activePlaylistItem').get('video').get('id');

                var notification = window.webkitNotifications.createNotification(
                  'http://img.youtube.com/vi/' + activeVideoId + '/default.jpg',
                  'Now Playing',
                  backgroundManager.get('activePlaylistItem').get('title')
                );

                notification.show();

                setTimeout(function () {
                    notification.close();
                }, 5000);
            }
        }
        //  If the video stopped playing and there is another video to play (not the same one), do so.
        else if (state === PlayerStates.ENDED) {
            //  Radio mode being enabled will mean we always skip to a new song.
            var isRadioModeEnabled = localStorageManager.getIsRadioModeEnabled();

            var activePlaylistItem = backgroundManager.get('activePlaylistItem');
            //  NOTE: No guarantee that the activePlaylistItem's playlistId will be activePlaylist's ID.
            var playlistId = activePlaylistItem.get('playlistId');
            var playlist = backgroundManager.getPlaylistById(playlistId);
            
            //  TODO: Add repeat logic.
            //  Don't keep playing the same video over and over if there's only 1 in the playlist.
            if (playlist.get('items').length > 1 || isRadioModeEnabled) {
                var nextItem;
                if (isRadioModeEnabled) {
                    var nextVideo = playlist.getRelatedVideo();
                    nextItem = playlist.addItem(nextVideo);
                } else {
                    nextItem = playlist.gotoNextItem();
                }

                playlist.selectItem(nextItem);
                backgroundManager.set('activePlaylistItem', nextItem);

                player.loadVideoById(nextItem.get('video').get('id'));
            }
        }

    });
    
    //  Receive keyboard shortcuts from users.
    //  TODO: Doesn't seem to be working in production, but does work in dev? Double check.
    chrome.commands.onCommand.addListener(function (command) {
        switch (command) {
            //  TODO: Make this code DRY
            case 'nextVideo':
                var activePlaylistItem = backgroundManager.get('activePlaylistItem');
                
                if (activePlaylistItem !== null) {
                    var playlistId = activePlaylistItem.get('playlistId');
                    var playlist = backgroundManager.getPlaylistById(playlistId);

                    var nextItem = playlist.skipItem('next');
                    backgroundManager.set('activePlaylistItem', nextItem);
                }

                break;
            case 'previousVideo':
                var activePlaylistItem = backgroundManager.get('activePlaylistItem');

                if (activePlaylistItem !== null) {
                    var playlistId = activePlaylistItem.get('playlistId');
                    var playlist = backgroundManager.getPlaylistById(playlistId);

                    var previousItem = playlist.skipItem('previous');
                    backgroundManager.set('activePlaylistItem', previousItem);
                }
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

    //  Listen for messages from YouTube video pages.
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

        switch (request.method) {
            //  http://stackoverflow.com/questions/5235719/how-to-copy-text-to-clipboard-from-a-google-chrome-extension
            //  Copies text to the clipboard. Has to happen on background page due to elevated privs.
            case 'copy':
                console.log("copying");
                var hiddenClipboard = document.getElementById("HiddenClipboard");
                hiddenClipboard.value = request.text;
                //  Copy text from hidden field to clipboard.
                hiddenClipboard.select();
                document.execCommand("copy", false, null);
                //  Cleanup
                sendResponse({});

                break;

            case 'getStreams':
                var allStreams = backgroundManager.get('allStreams');
                sendResponse({ streams: allStreams });
                break;
            case 'getPlaylists':                
                var stream = backgroundManager.getStreamById(request.streamId);
                var playlists = stream.get('playlists');

                sendResponse({ playlists: playlists });
                break;
            case 'addVideoByIdToPlaylist':
                var playlist = backgroundManager.getPlaylistById(request.playlistId);
                
                ytHelper.getVideoInformationFromId(request.videoId, function (videoInformation) {
                    var addedItem = playlist.addItemByInformation(videoInformation);
                    //  TODO: Send response and update YouTube visually to indicate that item has been successfully added
                });
                
                break;
        }
    });
    
    //  Modify the iFrame headers to force HTML5 player and to look like we're actually a YouTube page.
    //  The HTML5 player seems more reliable (doesn't crash when Flash goes down) and looking like YouTube
    //  means we can bypass a lot of the embed restrictions.
    chrome.webRequest.onBeforeSendHeaders.addListener(function (info) {
        
        var cookieRequestHeader = _.find(info.requestHeaders, function(requestHeader) {
            return requestHeader.name === 'Cookie';
        });
        
        if (cookieRequestHeader) {

            var flashCookieValue = 'f3=40000';
            var html5CookieValue = 'f2=40000000';
            
            //  Swap out the flash cookie variable with the HTML5 counterpart.
            if (cookieRequestHeader.value.indexOf(flashCookieValue) !== -1) {
                cookieRequestHeader.value = cookieRequestHeader.value.replace(flashCookieValue, html5CookieValue);
            } else {
                cookieRequestHeader.value += '&' + html5CookieValue;
			}

        }

        //  Bypass YouTube's embedded player content restrictions by looking like YouTube
        //  Any referer will do, maybe change to Streamus.com in the future? Or maybe leave as YouTube
        //  to stay under the radar. Not sure which is less suspicious.
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
        //  Width and height don't really matter as long as they stay about 200px each, per documentation.
        width: 475,
        height: 286,
        src: 'http://www.youtube.com/embed/undefined?enablejsapi=1'
    }).appendTo('body');
});