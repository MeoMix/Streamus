//When clicked -- shuffles the playlist. Doesn't affect curently playing video at all.
//Can't be clicked with 2 or fewer videos.
define(function(){
	'use strict';
	var shuffleButton = $('#ShuffleButton').click(shuffleVideo);

	//  localStorage serializes bools to strings.
	if(JSON.parse(localStorage.getItem('isShuffleEnabled') || false)){
		shuffleButton.addClass('pressed');
	}

	function shuffleVideo() {
		if(shuffleButton.hasClass('pressed')){
			shuffleButton.removeClass('pressed');
		}
		else{
			shuffleButton.addClass('pressed');
		}

		localStorage.setItem('isShuffleEnabled', shuffleButton.hasClass('pressed'));
	}
});