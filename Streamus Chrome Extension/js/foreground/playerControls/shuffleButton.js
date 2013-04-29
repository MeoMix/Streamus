define(['localStorageManager'], function(localStorageManager){
    'use strict';

	var shuffleButton = $('#ShuffleButton').click(toggleShuffleVideo);

    var isShuffleEnabled = localStorageManager.getIsShuffleEnabled();
    if (isShuffleEnabled) {
		shuffleButton.addClass('pressed');
	}

    function toggleShuffleVideo() {
		if(shuffleButton.hasClass('pressed')){
			shuffleButton.removeClass('pressed');
		}
		else{
			shuffleButton.addClass('pressed');
		}

	    localStorageManager.setIsShuffleEnabled(shuffleButton.hasClass('pressed'));
    }

    shuffleButton.tooltip();
});