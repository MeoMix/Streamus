define(['localStorageManager'], function(localStorageManager){
    'use strict';

    var shuffleButton = $('#ShuffleButton').click(toggleShuffleVideo);
    var shuffleEnabledTitle = 'Playlist shuffling is enabled. Click to disable.';
    var shuffleDisabledTitle = 'Playlist shuffling is disabled. Click to enable.';

    //  Remember the shuffled state across pop-up sessions by writing to/from localStorage.
    var isShuffleEnabled = localStorageManager.getIsShuffleEnabled();
    if (isShuffleEnabled) {
        shuffleButton
            .addClass('pressed')
            .attr('title', shuffleEnabledTitle);
    }

    function toggleShuffleVideo() {
		if(shuffleButton.hasClass('pressed')){
		    shuffleButton
		        .removeClass('pressed')
		        .attr('title', shuffleDisabledTitle);
		}
		else{
		    shuffleButton
		        .addClass('pressed')
		        .attr('title', shuffleEnabledTitle);
		}

	    localStorageManager.setIsShuffleEnabled(shuffleButton.hasClass('pressed'));
    }
});