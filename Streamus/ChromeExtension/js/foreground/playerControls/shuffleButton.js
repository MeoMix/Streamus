//When clicked -- shuffles the playlist. Doesn't affect curently playing song at all.
//Can't be clicked with 2 or fewer songs.
define(function(){
	'use strict';
	var shuffleButton = $('#ShuffleButton').click(shuffleSong);
	//localStorage serializes bools to strings.
	if(JSON.parse(localStorage.getItem('isShuffleEnabled') || false)){
		shuffleButton.addClass('pressed');
	}

	function shuffleSong(){
		if(shuffleButton.hasClass('pressed')){
			shuffleButton.removeClass('pressed');
		}
		else{
			shuffleButton.addClass('pressed');
		}

		localStorage.setItem('isShuffleEnabled', shuffleButton.hasClass('pressed'));
	}
});