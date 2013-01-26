//Responsible for controlling the volume indicator of the UI.
define(function(){
	var muteButton = $('#MuteButton');
	'use strict';
	var MUTED_KEY = 'musicMuted', VOLUME_KEY = 'musicVolume';  

	//Whenever the mute button is clicked toggle the muted state.
	muteButton.click(function(){
		if(isMuted){
			setVolume(musicVolume);
		}
		else{
			setVolume(0);
		}
	});

	//Whenever the volume slider is interacted with by the user, change the volume to reflect.
	var volumeSlider = $('#VolumeSlider').change(function(){ 
		updateWithVolume(this.value); 
	});

	$('.volumeControl').mousewheel(function(event, delta){
		//Convert current value from string to int, then go a few volume points in a given direction.
		volumeSlider.val(parseInt(volumeSlider.val(), 10) + delta * 3).trigger('change');
	});

	//Show the volume slider control by expanding its parent whenever any of the volume controls are hovered.
	$('.volumeControl').mouseover(function(){
		volumeSlider.parent().css("top","70px");
	}).mouseout(function(){
		volumeSlider.parent().css("top","-35px");
	});

	var updateSoundIcon = function(volume){
		//Repaint the amount of white filled in the bar showing the distance the grabber has been dragged.
		var backgroundImage = '-webkit-gradient(linear,left top, right top, from(#ccc), color-stop('+ volume/100 +',#ccc), color-stop('+ volume/100+',rgba(0,0,0,0)), to(rgba(0,0,0,0)))';
		volumeSlider.css('background-image', backgroundImage);

		var activeBars = parseInt(volume/25);					 
		muteButton.find('.MuteButtonBar:lt(' + activeBars +')').css('fill', '#fff');
		muteButton.find('.MuteButtonBar:gt(' + activeBars+')').css('fill', '#555');

		if(activeBars === 0){
			muteButton.find('.MuteButtonBar').css('fill', '#555');
		}

	};

	//Initialize the muted state;
	var isMuted = (function(){
		var muted = false;

		var storedIsMuted = localStorage.getItem(MUTED_KEY);
		if(storedIsMuted){
			muted = JSON.parse(storedIsMuted);
		}

		return muted;
	})();

	//Initialize player's volume and muted state to last known information or 100 / unmuted.
	var musicVolume = (function(){
		var volume = 100;

		//TODO: Difficult to properly represent state when not already known -- can't get info from YouTube API until a video is playing.
		var storedMusicVolume = localStorage.getItem(VOLUME_KEY);
		if(storedMusicVolume){
			volume = JSON.parse(storedMusicVolume);
		}

		var volumeForPlayer = isMuted ? 0 : volume;
		volumeSlider.val(volumeForPlayer);
		updateSoundIcon(volumeForPlayer);

		return volume;
	})();

	var updateWithVolume = function(volume){
		isMuted = volume === 0;
		
		localStorage.setItem(MUTED_KEY, JSON.stringify(isMuted));
		if (volume) {
			//Remember old music value if muting so that unmute is possible.
			musicVolume = volume;
			localStorage.setItem(VOLUME_KEY, JSON.stringify(musicVolume));
		}

		updateSoundIcon(volume);
		chrome.extension.getBackgroundPage().YoutubePlayer.volume = volume;
	};
	
	var setVolume = function(volume){
		volumeSlider.val(volume);
		updateWithVolume(volume);
	};
    
    function refresh() {
        var player = chrome.extension.getBackgroundPage().YoutubePlayer;
        if (player.playerState === PlayerStates.PLAYING) {
            //Volume only becomes available once a video has become cued or when popup reopens.
            setVolume(player.volume);
        }
    }
    
    //Initialize
    refresh();

	return {
	    refresh: refresh
	};
})