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

   var notification;

   Player.on('change:state', function (model, state) {

       if (state === PlayerState.PLAYING) {

            //  Check if the foreground UI is open.
            var foreground = chrome.extension.getViews({ type: "popup" });
  
            if (foreground.length === 0) {

                //  If the foreground UI is not open, show a notification to indicate active video.
                var selectedStreamItem = StreamItems.findWhere({ selected: true });
                var activeVideoId = selectedStreamItem.get('video').get('id');
                
                if (notification) {
                    notification.close();
                }

                //  TODO: Create HTML notification in the future. Doesn't have all the support we need currently.
                notification = window.webkitNotifications.createNotification(
                  'http://img.youtube.com/vi/' + activeVideoId + '/default.jpg',
                  'Now Playing',
                  selectedStreamItem.get('title')
                );

                notification.show();

                setTimeout(function () {
                    notification.close();
                    notification = null;
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

    //  Build iframe after onBeforeSendHeaders listener to prevent errors and generate correct type of player.
    $('<iframe>', {
        id: 'MusicHolder',
        //  Width and Height should have a ratio of 4 to 3
        width: 480,
        height: 360,
        src: 'https://www.youtube.com/embed/undefined?enablejsapi=1'
    }).appendTo('body');
});