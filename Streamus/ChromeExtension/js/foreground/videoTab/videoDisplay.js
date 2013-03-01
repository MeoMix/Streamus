define(['ytPlayerApiHelper', 'playlistManager', 'player'], function (ytPlayerApiHelper, playlistManager, player) {
    'use strict';

    //var selectedItem = playlistManager.activePlaylist.getSelectedItem();
    //var videoId = 'undefined';
    
    //if (selectedItem !== null) {
    //    videoId = selectedItem.get('video').get('id');
    //}
    
    ////  Build iframe AFTER onBeforeSendHeaders listener.
    //$('<iframe>', {
    //    id: 'ForegroundPlayer',
    //    width: 475,
    //    height: 286,
    //    src: 'http://www.youtube.com/embed/' + videoId + '?enablejsapi=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3'
    //}).appendTo('#VideoContent');

    //var videoDisplay;
    
    ////  Initialize the player by creating YT player iframe.
    //ytPlayerApiHelper.onApiReady(function () {

    //    //  https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
    //    //  After the API's JavaScript code loads, the API will call the onYouTubeIframeAPIReady function.
    //    //  At which point you can construct a YT.Player object to insert a video player on your page. 
    //    videoDisplay = new YT.Player('ForegroundPlayer', {
    //        events: {
    //            'onReady': function () {
    //                videoDisplay.mute();
    //                videoDisplay.seekTo(player.currentTime, true);
                    
    //                if (player.playerState === PlayerStates.PLAYING) {
    //                    videoDisplay.play();
    //                }


    //            },
    //            'onStateChange': function (playerState) {
    //                if (playerState.data === PlayerStates.PLAYING) {
    //                    player.play();
    //                }
    //                else if (playerState.data === PlayerStates.PAUSED) {
    //                    player.pause();
    //                }
    //            },
    //            'onError': function (error) {
    //                window && console.error("An error was encountered.", error);

    //                switch (error.data) {
    //                    case 100:
    //                        alert("Video requested is not found. This occurs when a video has been removed or it has been marked as private.");
    //                        break;
    //                    case 101:
    //                    case 150:
    //                        alert("Video requested does not allow playback in the embedded players.");
    //                        break;
    //                }
    //            }
    //        }
    //    });
    //});

});