//Holds onto the currentTime and totalTime video labels as well as the elapsed time progress bar.
define(['helpers', 'progressBar', 'playlistManager', 'player'], function (helpers, progressBar, playlistManager, player) {
    'use strict';
    
    var currentTimeLabel = $('#CurrentTimeLabel');
    var totalTimeLabel = $('#TotalTimeLabel');

    currentTimeLabel.text(helpers.prettyPrintTime(player.currentTime));
    
    var selectedItem = playlistManager.activePlaylist.getSelectedItem();
    if (selectedItem != null) {
        setTotalTime(selectedItem.get('video').get('duration'));
    }
    
    //  Update the current time every half a second.
    setInterval(function () {

        //  Do not update if the progress bar is being dragged.
        if (!player.isSeeking) {
            setCurrentTime(player.currentTime);
        }

    }, 500);

    //  Only need to update totalTime whenever the playlistItem changes.
    playlistManager.onActivePlaylistSelectedItemChanged(function (event, item) {
        if (item.get('selected')) {
            setTotalTime(item.get('video').get('duration'));
        }
    });

    playlistManager.onActivePlaylistEmptied(function () {
        setCurrentTime(0);
        setTotalTime(0);
    });
    
    playlistManager.onActivePlaylistChange(function (event, playlist) {
        setTotalTime(playlist.getSelectedItem());
    });
    
    //  Keep the current time display in sync with progressBar (i.e. when user is dragging progressBar)
    progressBar.onManualTimeChange(function(event, time) {
        if (!player.isStopped) {
            setCurrentTime(time);
        }
    });
    
    progressBar.onChange(function () {
        setCurrentTime(this.value);
    });
    
    //  In charge of updating the currentTime label
    function setCurrentTime(currentTime) {
        currentTimeLabel.text(helpers.prettyPrintTime(currentTime));
    };
    
    function setTotalTime(totalTime) {
        totalTimeLabel.text(helpers.prettyPrintTime(totalTime));
    }
});