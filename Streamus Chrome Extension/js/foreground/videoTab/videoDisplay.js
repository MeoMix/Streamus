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

    fillCanvasWithBlack();

    var initialImage = new Image();

    initialImage.onload = function () {
        videoDisplayCanvasContext.drawImage(this, 0, 0, videoDisplayWidth, videoDisplayHeight);
    };

    var loadedVideoId = player.get('loadedVideoId');
    
    if (loadedVideoId != '') {
        initialImage.src = 'http://i2.ytimg.com/vi/' + loadedVideoId + '/mqdefault.jpg ';
    }

    backgroundManager.on('change:activePlaylistItem', function(model, activePlaylistItem) {

        if (activePlaylistItem == null) {
            fillCanvasWithBlack();
        } else {
            initialImage.src = 'http://i2.ytimg.com/vi/' + activePlaylistItem.get('video').get('id') + '/hqdefault.jpg ';
        }
    });

    var youTubeVideo = $(chrome.extension.getBackgroundPage().document).find('#YouTubeVideo')[0];
    
    function draw() {
        window.requestAnimationFrame(draw);
        
        if (player.isPlaying()) {
            videoDisplayCanvasContext.drawImage(youTubeVideo, 0, 0, videoDisplayWidth, videoDisplayHeight);
        }
    }

    draw();
});