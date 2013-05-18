define(['backgroundManager', 'player'], function (backgroundManager, player) {
    'use strict';

    var videoDisplay = $('#VideoDisplay');
    var videoDisplayCanvasContext = videoDisplay[0].getContext('2d');

    var videoDisplayWidth = videoDisplay[0].width;
    var videoDisplayHeight = videoDisplay[0].height;
    
    function fillCanvasWithBlack() {
        videoDisplayCanvasContext.rect(0, 0, videoDisplayWidth, videoDisplayHeight);
        videoDisplayCanvasContext.fillStyle = 'black';
        videoDisplayCanvasContext.fill();
    }
    
    var youTubeVideo = $(chrome.extension.getBackgroundPage().document).find('#YouTubeVideo')[0];
    var initialImage = new Image();
    
    initialImage.onload = function () {
        console.log("Drawing an initial image");
        videoDisplayCanvasContext.drawImage(this, 0, 0, videoDisplayWidth, videoDisplayHeight);
    };
    
    if (backgroundManager.get('activePlaylistItem') == null) {
        fillCanvasWithBlack();

    } else {

        var playerState = player.get('state');
        if (playerState == PlayerStates.PLAYING || playerState == PlayerStates.PAUSED) {
            videoDisplayCanvasContext.drawImage(youTubeVideo, 0, 0, videoDisplayWidth, videoDisplayHeight);
        } else {

            var loadedVideoId = player.get('loadedVideoId');

            if (loadedVideoId != '') {
                initialImage.src = 'http://i2.ytimg.com/vi/' + loadedVideoId + '/mqdefault.jpg ';
            }
        }

    }

    backgroundManager.on('change:activePlaylistItem', function(model, activePlaylistItem) {

        if (activePlaylistItem === null) {
            fillCanvasWithBlack();
        } else {
            var videoId = activePlaylistItem.get('video').get('id');
            initialImage.src = 'http://i2.ytimg.com/vi/' + videoId + '/hqdefault.jpg ';
        }
    });

    //  Start drawing again when the player is playing.
    player.on('change:state', function (model, playerState) {

        console.log("playerStateChange:", playerState);

        if (playerState === PlayerStates.PLAYING) {
            draw();
        }
    });
    
    function draw() {
        //  Stop drawing entirely when the player stops.
        if (window != null && player.isPlaying()) {
            window.requestAnimationFrame(draw);
            videoDisplayCanvasContext.drawImage(youTubeVideo, 0, 0, videoDisplayWidth, videoDisplayHeight);
        }
    }

    draw();
});