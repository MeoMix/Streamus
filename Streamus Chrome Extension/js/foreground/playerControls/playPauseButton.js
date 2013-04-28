//  The play/pause icon.
define(['backgroundManager', 'player', 'spin'], function (backgroundManager, player, Spin) {
	'use strict';
	var playPauseButton = $('#PlayPauseButton');
	var pauseIcon = $('#PauseIcon');
	var playIcon = $('#PlayIcon');

	var spinner = new Spin({
	    lines: 13, // The number of lines to draw
	    length: 6, // The length of each line
	    width: 2, // The line thickness
	    radius: 10, // The radius of the inner circle
	    corners: 1, // Corner roundness (0..1)
	    rotate: 0, // The rotation offset
	    direction: 1, // 1: clockwise, -1: counterclockwise
	    color: '#000', // #rgb or #rrggbb
	    speed: 2, // Rounds per second
	    trail: 25, // Afterglow percentage
	    shadow: false, // Whether to render a shadow
	    hwaccel: true, // Whether to use hardware acceleration
	    className: 'spinner', // The CSS class to assign to the spinner
	    zIndex: 2e9 // The z-index (defaults to 2000000000)
	});

    //  Only allow changing once every 100ms to preent spamming.
	playPauseButton.click(_.debounce(function () {
	    
        if (!$(this).hasClass('disabled')) {
            if (player.isPlaying()) {
                player.pause();
                pauseIcon.hide();
                playIcon.show();
            } else {

                playIcon.hide();
                pauseIcon.hide();
                player.play();
            }
        }

	}, 100, true));

	player.on('change:buffering', function (model, isBuffering) {
	    if (isBuffering) {
	        playIcon.hide();
	        pauseIcon.hide();
	        spinner.spin($('#LoadingSpinner')[0]);
	    } else {
	        spinner.stop();
	    }
    });
   
	player.on('change:state', makeIconReflectPlayerState);
	makeIconReflectPlayerState();

    backgroundManager.on('change:activePlaylistItem', function(model, activePlaylistItem) {
        if (activePlaylistItem === null) {
            disableButton();
        } else {
            enableButton();
        }

    });

    if (backgroundManager.get('activePlaylistItem') != null) {
        enableButton();
    }

    //  Whenever the YouTube player changes playing state -- update whether icon shows play or pause.
    function makeIconReflectPlayerState() {
        if (player.isPlaying()) {
            pauseIcon.show();
            setToPause();
        }
        else if (!player.get('buffering')) {
            setToPlay();
        }
    }
    
    //  Paint button's path black and allow it to be clicked
    function enableButton() {
        playPauseButton.removeClass('disabled');
        playPauseButton.find('.path').css('fill', 'black');
    }
    
    //  Paint the button's path gray and disallow it to be clicked
    function disableButton() {
        playPauseButton.addClass('disabled');
        playPauseButton.find('.path').css('fill', 'gray');
    }

    //  Change the music button to the 'Play' image
    function setToPlay() {
        pauseIcon.hide();
        playIcon.show();
    }

    //  Change the music button to the 'Pause' image
    function setToPause() {
        pauseIcon.show();
        playIcon.hide();
    }
 
});