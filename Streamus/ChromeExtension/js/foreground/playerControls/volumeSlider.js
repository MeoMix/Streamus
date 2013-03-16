//  Responsible for controlling the volume indicator of the UI.
define(['player'], function (player) {
    'use strict';
    
    //  Whenever the volume slider is interacted with by the user, change the volume to reflect.
    var volumeSlider = $('#VolumeSlider');
    var muteButton = $('#MuteButton');
    var volumeControl = $('.volumeControl');
    
    volumeSlider.change(function () {
        var newVolume = parseInt(this.value, 10);

        updateSoundIcon(newVolume);
        player.set('volume', newVolume);
    });
    
    //  Initialize player's volume and muted state to last known information or 100 / unmuted.
    volumeSlider.val(player.get('volume')).trigger('change');
    toggleMutedClass(player.get('muted'));
    
    muteButton.click(function () {
        var isMuted = player.get('muted');
        player.set('muted', !isMuted);
    });

    player.on('change:muted', function (model, isMuted) {
        toggleMutedClass(isMuted);
    });
    
    volumeControl.mousewheel(function (event, delta) {
        //  Convert current value from string to int, then go a few volume points in a given direction.
        var newVolume = parseInt(volumeSlider.val(), 10) + delta * 3;
        volumeSlider.val(newVolume).trigger('change');
	});

	//  Show the volume slider control by expanding its parent whenever any of the volume controls are hovered.
    volumeControl.mouseover(function () {
		volumeSlider.parent().css("top","70px");
	}).mouseout(function(){
		volumeSlider.parent().css("top","-35px");
	});
    
    function toggleMutedClass(isMuted) {
        if (isMuted) {
            muteButton.addClass('muted');
        } else {
            muteButton.removeClass('muted');
        }
    }
    
    function updateSoundIcon(newVolume) {
        //  Repaint the amount of white filled in the bar showing the distance the grabber has been dragged.
        var backgroundImage = '-webkit-gradient(linear,left top, right top, from(#ccc), color-stop(' + newVolume / 100 + ',#ccc), color-stop(' + newVolume / 100 + ',rgba(0,0,0,0)), to(rgba(0,0,0,0)))';
        volumeSlider.css('background-image', backgroundImage);

        var activeBars = parseInt(newVolume / 25);
        muteButton.find('.MuteButtonBar:lt(' + activeBars + ')').css('fill', '#fff');
        muteButton.find('.MuteButtonBar:gt(' + activeBars + ')').css('fill', '#555');

        if (activeBars === 0) {
            muteButton.find('.MuteButtonBar').css('fill', '#555');
        }
    }

	//player.on('change:state', setVolumeIfPlayerReady);
	//setVolumeIfPlayerReady();
    
	//function setVolumeIfPlayerReady(model, playerState) {

	//    if (playerState === PlayerStates.VIDCUED || playerState === PlayerStates.PLAYING) {
	//        //  Volume only becomes available once a video has become cued or when popup reopens.
	//        var playerVolume = player.get('volume');

	//        volumeSlider.val(playerVolume).trigger('change');
	//    }
    //}
})