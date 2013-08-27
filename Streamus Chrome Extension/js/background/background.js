//  Background.js is a bit of a dumping ground for code which needs a permanent housing spot.
define([
    'player',
    'user',
    'youTubeDataAPI',
    'playerState',
    'streamItems',
    'error',
    'iconManager',
    'omnibox'
], function (Player, User, YouTubeDataAPI, PlayerState, StreamItems, Error, IconManager, Omnibox) {
    'use strict';

   Player.on('change:state', function (model, state) {

        if (state === PlayerState.PLAYING) {
            //  Check if the foreground UI is open.
            var foreground = chrome.extension.getViews({ type: "popup" });
  
            if (foreground.length === 0) {

                //  If the foreground UI is not open, show a notification to indicate active video.
                var selectedStreamItem = StreamItems.findWhere({ selected: true });
                var activeVideoId = selectedStreamItem.get('video').get('id');

                //  TODO: Create HTML notification in the future. Doesn't have all the support we need currently.
                var notification = window.webkitNotifications.createNotification(
                  'http://img.youtube.com/vi/' + activeVideoId + '/default.jpg',
                  'Now Playing',
                  selectedStreamItem.get('title')
                );

                notification.show();

                setTimeout(function () {
                    notification.close();
                }, 3000);
            }
        }

        else if (state === PlayerState.ENDED) {
            StreamItems.selectNext();
        }

    });

    //  Receive keyboard shortcuts from users.
    chrome.commands.onCommand.addListener(function (command) {
        
        if (command === 'nextVideo' || command === 'previousVideo' && StreamItems.length > 0) {
            
            if (command == 'nextVideo') {
                StreamItems.selectNext();
            } else {
                StreamItems.selectPrevious();
            }
            
        }
        else if (command === 'toggleVideo') {
            
            if (Player.isPlaying()) {
                Player.pause();
            } else {
                Player.play();
            }
            
        } else {
            console.error("Unhandled command:", command);
        }

    });

    //  Listen for messages from YouTube video pages.
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

        switch (request.method) {
            //  http://stackoverflow.com/questions/5235719/how-to-copy-text-to-clipboard-from-a-google-chrome-extension
            //  Copies text to the clipboard. Has to happen on background page due to elevated privs.
            case 'copy':

                var hiddenClipboard = document.getElementById("HiddenClipboard");
                hiddenClipboard.value = request.text;
                
                //  Copy text from hidden field to clipboard.
                hiddenClipboard.select();
                document.execCommand("copy", false, null);
                
                //  Cleanup
                sendResponse({});
                break;

            case 'getFolders':
                var allFolders = User.get('folders');
                sendResponse({ folders: allFolders });
                break;
            case 'getPlaylists':                
                var folder = User.get('folders').findWhere({ id: request.folderId });
                var playlists = folder.get('playlists');

                sendResponse({ playlists: playlists });
                break;
            case 'videoStreamSrcChange':
                Player.set('videoStreamSrc', request.videoStreamSrc);
                break;
            case 'needSeekTo':
                Player.triggerInitialLoadDataSeekTo();
                break;
            case 'addVideoByIdToPlaylist':
                //  TODO: Maybe not active folder.
                var playlist = User.get('folders').findWhere({ active: true }).get('playlists').get(request.playlistId);
                
                YouTubeDataAPI.getVideoInformation({
                    videoId: request.videoId,
                    success: function(videoInformation) {
                        playlist.addItemByInformation(videoInformation);

                        sendResponse({
                            result: 'success'
                        });
                    },
                    error: function() {
                        sendResponse({
                            result: 'error'
                        });
                    }
                });

                break;
            case 'addPlaylistByShareData':
                var activeFolder = User.get('folders').findWhere({ active: true });
                
                activeFolder.addPlaylistByShareData(request.shareCodeShortId, request.urlFriendlyEntityTitle, function (playlist) {

                    if (playlist) {
                        
                        sendResponse({
                            result: 'success',
                            playlistTitle: playlist.get('title')
                        });
                        
                    } else {
                        
                        sendResponse({
                            result: 'error'
                        });
                        
                    }
                });
                
                break;
			case 'getYouTubeInjectClicked':
				var clickStatus = Settings.get("youTubeInjectClicked");

				sendResponse({
					result: clickStatus
				});

				break;
			case 'setYouTubeInjectClicked':
				var clickStatus = Settings.get("youTubeInjectClicked");
				if (!clickStatus) Settings.set("youTubeInjectClicked", true);
				break;
        }
        
        //  Return true to allow sending a response back.
        return true;
    });
        

    //  TODO: This isn't called early enough. Sometimes still shows error in dev console, bleh.
    //  Modify the iFrame headers to force HTML5 player and to look like we're actually a YouTube page.
    //  The HTML5 player seems more reliable (doesn't crash when Flash goes down) and looking like YouTube
    //  means we can bypass a lot of the embed restrictions.
    chrome.webRequest.onBeforeSendHeaders.addListener(function (info) {
        
        var cookieRequestHeader = _.find(info.requestHeaders, function(requestHeader) {
            return requestHeader.name === 'Cookie';
        });

        if (cookieRequestHeader) {

            //  I've seen both of these Flash cookies before and I'm not sure if there are more.
            var flashCookieValue = 'f3=40008';
            var alternateFlashCookieValue = 'f3=40000';
            //var html5CookieValue = 'f2=40001000';
            var html5CookieValue = 'f2=40000000';

            //  Swap out the flash cookie variable with the HTML5 counterpart.
            if (cookieRequestHeader.value.indexOf(flashCookieValue) !== -1) {
                
                cookieRequestHeader.value = cookieRequestHeader.value.replace(flashCookieValue, html5CookieValue);
                
            }
            else if (cookieRequestHeader.value.indexOf(alternateFlashCookieValue) !== -1) {
                
                cookieRequestHeader.value = cookieRequestHeader.value.replace(alternateFlashCookieValue, html5CookieValue);

            } else {
                cookieRequestHeader.value += '&' + html5CookieValue;
            }

        }
        
        var refererRequestHeader = _.find(info.requestHeaders, function(requestHeader) {
            return requestHeader.name === 'Referer';
        });

        if (refererRequestHeader == null) {
            //  Bypass YouTube's embedded player content restrictions by looking like YouTube
            //  Any referer will do, maybe change to Streamus.com in the future? Or maybe leave as YouTube
            //  to stay under the radar. Not sure which is less suspicious.
            info.requestHeaders.push({
                name: "Referer",
                value: "https://youtube.com/embed/undefined?enablejsapi=1"
            });
        }

        //  Make Streamus look like an iPhone to guarantee the html5 player shows up even if the video has an ad.
        var userAgentRequestHeader = _.find(info.requestHeaders, function(requestHeader) {
            return requestHeader.name === 'User-Agent';
        });

        if (userAgentRequestHeader !== null) {
            userAgentRequestHeader.value = 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5';
        }

        return { requestHeaders: info.requestHeaders };
    }, {
        urls: ["https://www.youtube.com/embed/undefined?enablejsapi=1"]
    },
        ["blocking", "requestHeaders"]
    );

    //  Build iframe after onBeforeSendHeaders listener to prevent errors and generate correct type of player.
    $('<iframe>', {
        id: 'MusicHolder',
        //  Width and Height should have a ratio of 4 to 3
        width: 480,
        height: 360,
        src: 'https://www.youtube.com/embed/undefined?enablejsapi=1'
    }).appendTo('body');
});