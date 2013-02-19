//  A progress bar which shows the elapsed time as compared to the total time of the current video.
//  Changes colors based on player state -- yellow when paused, green when playing.
define(['playlistManager', 'player'], function (playlistManager, player) {
    'use strict';
    var selector = $('#VideoTimeProgressBar');
    var mousewheelTimeout = null, mousewheelValue = -1;

    var events = {
        onManualTimeChange: 'onManualTimeChange'
    };
    
    selector.mousewheel(function(event, delta){
        clearTimeout(mousewheelTimeout);
        player.seekStart();

        if(mousewheelValue === -1){
            mousewheelValue = parseInt(selector.val(), 10);
        }

        mousewheelValue += delta;

        selector.val(mousewheelValue);
        repaint();

        mousewheelTimeout = setTimeout(function(){
            player.seekTo(mousewheelValue);
            mousewheelValue = -1;
        }, 250);

        selector.trigger(events.onManualTimeChange, mousewheelValue);
    });

    selector.mousedown(function (event) {
        //  1 is primary mouse button, usually left
        if (event.which === 1) {
            player.seekStart();
        }
        
    }).mouseup(function (event) {
        if (event.which === 1) {
            //Bind to selector mouse-up to support dragging as well as clicking.
            //I don't want to send a message until drag ends, so mouseup works nicely. 
            player.seekTo(selector.val());
        }
    }).change(function(){
        repaint();
    });

    //  Repaints the progress bar's filled-in amount based on the % of time elapsed for current video.
    function repaint(){
        var elapsedTime = selector.val();
        var totalTime = selector.prop('max');

        //  Don't divide by 0.
        var fill = totalTime !== '0' ? elapsedTime / totalTime : 0;

        var backgroundImage = '-webkit-gradient(linear,left top, right top, from(#ccc), color-stop('+ fill +',#ccc), color-stop('+ fill+',rgba(0,0,0,0)), to(rgba(0,0,0,0)))';
        selector.css('background-image', backgroundImage);
    };

    playlistManager.onActivePlaylistSelectedItemChanged(function (event, item) {
        if (item == null || item.get('selected')) {
            setTotalTime(item);
        }
    });

    playlistManager.onActivePlaylistEmptied(function() {
        setTotalTime(0);
    });
    
    //  Only need to update totalTime whenever the playlistItem changes.
    //  TODO: This might have a bug in it. What happens if my activePlaylist changes? Probably not bound?
    setTotalTime(playlistManager.activePlaylist.getSelectedItem());

    function setTotalTime(playlistItem) {
        var totalTime = 0;
        
        if (playlistItem) {
            totalTime = playlistItem.get('video').get('duration');
        }
        
        selector.prop('max', totalTime);
        repaint();
    }
    
    //  If a video is currently playing when the GUI opens then initialize with those values.
    if(player.currentTime){
        selector.val(player.currentTime);
        repaint();
    }

    //  Pause the GUI's refreshes for updating the timers while the user is dragging the video time slider around.
    function update () {
        var playerIsSeeking = player.isSeeking;

        if (!playerIsSeeking && player.playerState !== PlayerStates.PAUSED) {
            selector.val(player.currentTime);
            repaint();
        }
    };
    
    //  A nieve way of keeping the progress bar up to date. 
    setInterval(update, 500);

    return {
        onManualTimeChange: function (event) {
            selector.on(events.onManualTimeChange, event);
        },
        onChange: function (event) {
            selector.change(event);
        }
    };
});