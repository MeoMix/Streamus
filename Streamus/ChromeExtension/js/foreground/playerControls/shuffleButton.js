//  Enables the 'shuffling' state of
define(['localStorageManager'], function(localStorageManager){
	'use strict';
	var shuffleButton = $('#ShuffleButton').click(shuffleVideo);

    var isShuffleEnabled = localStorageManager.getIsShuffleEnabled();
    if (isShuffleEnabled) {
		shuffleButton.addClass('pressed');
	}

	function shuffleVideo() {
		if(shuffleButton.hasClass('pressed')){
			shuffleButton.removeClass('pressed');
		}
		else{
			shuffleButton.addClass('pressed');
		}

	    localStorageManager.setIsShuffleEnabled(shuffleButton.hasClass('pressed'));
	}
});