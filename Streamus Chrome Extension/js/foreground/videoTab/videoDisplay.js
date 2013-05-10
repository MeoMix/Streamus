define(['youTubePlayerAPI', 'backgroundManager', 'player'], function (youTubePlayerAPI, backgroundManager, player) {
    'use strict';
    
    var c2 = document.getElementById("c2");
    var ctx2 = c2.getContext("2d");

    var testVideo = $(chrome.extension.getBackgroundPage().document).find('#YouTubeVideo')[0];
    
    function draw() {
        window.requestAnimationFrame(draw);
        ctx2.drawImage(testVideo, 0, 0, 475, 286);
    }

    draw();

    //player.on('change:videoFrame', function (model, videoFrame) {


    //    //injectedCanvasContext.drawImage($('#TestVideo')[0], 0, 0, 475, 286);
    //    //var videoFrame = injectedCanvasContext.getImageData(0, 0, 475, 286);



    //    window.requestAnimationFrame(function () {
    //        ctx2.drawImage(testVideo[0], 0, 0, 475, 286);
    //    });
    //});




    //var activeItem = backgroundManager.get('activePlaylistItem');
    //var videoId = 'undefined';
    
    //if (activeItem !== null) {
    //    videoId = activeItem.get('video').get('id');
    //}
    //var autoplay = player.get('state') === PlayerStates.PLAYING ? 1 : 0;
    
    //var videoDisplay;
    ////var initialPause = true;
    
    //var videoStreamSrc = player.get('videoStreamSrc');
    ////  Fetch before getting currentTime because exact time is of the essence.
    //var musicHolder = chrome.extension.getBackgroundPage().$('#MusicHolder');
    //var visualVideo = $('#VisualVideo');
    //var currentTime = player.get('youTubePlayer').getCurrentTime();

    //if (videoStreamSrc != '') {

    //    visualVideo[0].addEventListener('canplay', function() {
    //        console.log("can play", new Date().getMilliseconds());
    //    });

    //    console.log("background page:", chrome.extension.getBackgroundPage());

    //    $(chrome.extension.getBackgroundPage().document).on('DOMNodeRemoved', function (e) {
    //        console.log("OHI", e.target.nodeName, new Date().getMilliseconds());
    //        if (e.target.nodeName === "IFRAME") {
    //            visualVideo[0].play();
    //        }
            
    //    });

    //    console.log("setting src", new Date().getMilliseconds());
    //    visualVideo.attr('src', videoStreamSrc + '#t=' + currentTime);
    //    //musicHolder.remove();
    //}

    var isPauseAfterSeekTo = false;
    var isPlayAfterSeekToPause = false;
    var initialPause = false;
    //  Initialize the player by creating YT player iframe.
    //youTubePlayerAPI.on('change:ready', function () {

    //    //  https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
    //    //  After the API's JavaScript code loads, the API will call the onYouTubeIframeAPIReady function.
    //    //  At which point you can construct a YT.Player object to insert a video player on your page. 
    //    videoDisplay = new YT.Player('ForegroundPlayer', {
    //        events: {
    //            'onReady': function () {
    //                videoDisplay.mute();

    //                var waitForMutedInterval = setInterval(function () {
                        
    //                    if (videoDisplay.isMuted()) {
    //                        clearInterval(waitForMutedInterval);

    //                        //  Messing with the volume sets YouTube in a bad state -- want to preserve that.
    //                        var playerIsMuted = player.get('muted');
    //                        if (!playerIsMuted) {
    //                            player.unMute();
    //                        }
    //                    }

    //                }, 100);
                    
    //                if (player.isPlaying()) {

    //                    var youTubePlayer = player.get('youTubePlayer');
    //                    var youTubePlayerCurrentTime = youTubePlayer.getCurrentTime();

    //                    console.log("Seeking to with current state:", videoDisplay.getPlayerState());
    
    //                    var watchLoadedFraction = setInterval(function() {
    //                        console.log("video loaded fraction:", videoDisplay.getVideoLoadedFraction());


    //                    }, 1000);


    //                    //videoDisplay.playVideo();

    //                    //videoDisplay.seekTo(youTubePlayerCurrentTime, true);
    //                }
                    
    //                //  Keep the player out of UNSTARTED state because seekTo will start playing if in UNSTARTED and not PAUSED
    //                //initialPause = true;
    //                //videoDisplay.pauseVideo();
                    
                        
    //                    //var youTubePlayer = player.get('youTubePlayer');
    //                    //var youTubePlayerCurrentTime = youTubePlayer.getCurrentTime();
                        
                        

    //                    //videoDisplay.seekTo(youTubePlayerCurrentTime + 4, true);
    //                    //console.log("seeking to in videoDisplay");
                        
    //                    //var waitForSyncedTimeInterval = setInterval(function () {
    //                    //isPauseAfterSeekTo = true;
    //                    //videoDisplay.pauseVideo();

    //                    //youTubePlayerCurrentTime = youTubePlayer.getCurrentTime();
    //                    //var videoDisplayCurrentTime = videoDisplay.getCurrentTime();
    //                    //var difference = youTubePlayerCurrentTime - videoDisplayCurrentTime;

    //                    //console.log("Difference:", difference);
                            
    //                    //setTimeout(function() {
    //                    //    videoDisplay.playVideo();
    //                    //}, difference + 4000);


    //                    //console.log("youTubePlayerCurrentTime:", youTubePlayerCurrentTime);
    //                    //console.log("videoDisplayCurrentTime:", videoDisplayCurrentTime);

    //                    //if (youTubePlayerCurrentTime >= videoDisplayCurrentTime) {
    //                    //    console.log("Clearing interval at:", youTubePlayerCurrentTime, videoDisplayCurrentTime);
    //                    //    clearInterval(waitForSyncedTimeInterval);
    //                    //    videoDisplay.playVideo();
    //                    //}


    //                    //}, 20);


    //                    //initialPause = false;
    //                    //videoDisplay.playVideo();
    //            },
    //            'onStateChange': function (playerState) {
                    
    //                if (playerState.data === PlayerStates.PLAYING) {



    //                }
    //                else if (playerState.data === PlayerStates.PAUSED) {
                        

    //                    if (initialPause) {
    //                        initialPause = false;




    //                    }

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

    return {
        onLoad: function(event) {
            
        },
        pause: function() {
            //videoDisplay.pauseVideo();
        },
        
        play: function() {
            //videoDisplay.playVideo();
        }
    };

});