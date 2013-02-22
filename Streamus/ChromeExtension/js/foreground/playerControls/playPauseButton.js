//The play/pause icon.
define(['playlistManager', 'player'], function (playlistManager, player) {
	'use strict';
	var playPauseButton = $('#PlayPauseButton');
	var pauseIcon = $('#PauseIcon');
	var playIcon = $('#PlayIcon');

    //  Only allow changing once every 100ms to preent spamming.
	playPauseButton.click(_.debounce(function () {
	    
        if (!$(this).hasClass('disabled')) {
            if (player.playerState == PlayerStates.PLAYING) {
                player.pause();
            } else {
                player.play();
            }

            pauseIcon.toggle();
            playIcon.toggle();
        }

	}, 100, true));
   
	player.onStateChange(function (event, playerState) {
	    makeIconReflectPlayerState(playerState);
	});
	makeIconReflectPlayerState(player.playerState);

    playlistManager.onActivePlaylistEmptied(disableButton);
    playlistManager.onActivePlaylistItemAdd(enableButton);
    
    var itemCount = playlistManager.activePlaylist.get('items').length;

    if (itemCount > 0) {
        enableButton();
    }

    //  Whenever the YouTube player changes playing state -- update whether icon shows play or pause.
    function makeIconReflectPlayerState(playerState) {
        if (playerState === PlayerStates.PLAYING) {
            setToPause();
        }
        else if (!player.playerIsSeeking) {
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