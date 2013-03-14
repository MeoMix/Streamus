//  Responsible for controlling the volume indicator of the UI.
define(['player', 'localStorageManager'], function (player, localStorageManager) {
    'use strict';
    
    var muteButton = $('#MuteButton');
    var isMuted = localStorageManager.getIsMuted();
    //TODO: Difficult to properly represent state when not already known -- can't get info from YouTube API until a video is playing.
    var volume = localStorageManager.getVolume();

	//  Whenever the mute button is clicked toggle the muted state.
    muteButton.click(function () {
        var playerVolume = isMuted ? 0 : volume;

        volumeSlider.val(playerVolume).trigger('change');
	});

	//  Whenever the volume slider is interacted with by the user, change the volume to reflect.
	var volumeSlider = $('#VolumeSlider').change(function () {
		updateWithVolume(this.value); 
	});

	$('.volumeControl').mousewheel(function(event, delta){
		//  Convert current value from string to int, then go a few volume points in a given direction.
		volumeSlider.val(parseInt(volumeSlider.val(), 10) + delta * 3).trigger('change');
	});

	//  Show the volume slider control by expanding its parent whenever any of the volume controls are hovered.
	$('.volumeControl').mouseover(function(){
		volumeSlider.parent().css("top","70px");
	}).mouseout(function(){
		volumeSlider.parent().css("top","-35px");
	});

	var updateSoundIcon = function(newVolume){
		//  Repaint the amount of white filled in the bar showing the distance the grabber has been dragged.
	    var backgroundImage = '-webkit-gradient(linear,left top, right top, from(#ccc), color-stop(' + newVolume / 100 + ',#ccc), color-stop(' + newVolume / 100 + ',rgba(0,0,0,0)), to(rgba(0,0,0,0)))';
		volumeSlider.css('background-image', backgroundImage);

		var activeBars = parseInt(newVolume / 25);
		muteButton.find('.MuteButtonBar:lt(' + activeBars +')').css('fill', '#fff');
		muteButton.find('.MuteButtonBar:gt(' + activeBars+')').css('fill', '#555');

		if(activeBars === 0){
			muteButton.find('.MuteButtonBar').css('fill', '#555');
		}
	};

	//  Initialize player's volume and muted state to last known information or 100 / unmuted.

	var volumeForPlayer = isMuted ? 0 : volume;
	volumeSlider.val(volumeForPlayer);
	updateSoundIcon(volumeForPlayer);

	var updateWithVolume = function(newVolume){
	    isMuted = volume === 0;

	    localStorageManager.setIsMuted(isMuted);
		
		if (volume) {
			//  Remember old music value if muting so that unmute is possible.
		    volume = newVolume;
		    localStorageManager.setVolume(volume);
		}

		updateSoundIcon(volume);
		player.set('volume', volume);
	};
    
	player.on('change:state', setVolumeIfPlayerReady);
	setVolumeIfPlayerReady();
    
	function setVolumeIfPlayerReady(model, playerState) {

	    if (playerState === PlayerStates.VIDCUED || playerState === PlayerStates.PLAYING) {
	        //  Volume only becomes available once a video has become cued or when popup reopens.
	        var playerVolume = player.get('volume');

	        volumeSlider.val(playerVolume).trigger('change');
	    }
    }
})