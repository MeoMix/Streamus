//  The play/pause icon.
define(['backgroundManager', 'player'], function (backgroundManager, player) {
	'use strict';
	var playPauseButton = $('#PlayPauseButton');
	var pauseIcon = $('#PauseIcon');
	var playIcon = $('#PlayIcon');
	var loadingSpinner = $('#LoadingSpinner');
    
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
	        loadingSpinner.show();
	    } else {
	        loadingSpinner.hide();
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