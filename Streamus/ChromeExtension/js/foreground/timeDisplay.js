//Holds onto the currentTime and totalTime video labels as well as the elapsed time progress bar.
define(['helpers', 'progressBar', 'playlistManager', 'videoManager', 'player'], function (helpers, progressBar, playlistManager, videoManager, player) {
    'use strict';
    
    var currentTimeLabel = $('#CurrentTimeLabel');
    var totalTimeLabel = $('#TotalTimeLabel');

    currentTimeLabel.text(helpers.prettyPrintTime(player.currentTime));

    //  Only need to update totalTime whenever the playlistItem changes.
    playlistManager.onActivePlaylistSelectedItemChanged(function (event, item) {
        if (item.get('selected')) {
            setTotalTime(item);
        }
    });

    playlistManager.onActivePlaylistEmptied(function() {
        totalTimeLabel.text(helpers.prettyPrintTime(0));
    });
    
    playlistManager.onActivePlaylistChange(function (event, playlist) {
        setTotalTime(playlist.getSelectedItem());
    });

    var selectedItem = playlistManager.activePlaylist.getSelectedItem();
    setTotalTime(selectedItem);

    function setTotalTime(playlistItem) {

        var totalTime = 0;
        if (playlistItem != null) {
            var videoId = playlistItem.get('videoId');
            var currentVideo = videoManager.getLoadedVideoById(videoId);
            totalTime = currentVideo.get('duration');
        }

        totalTimeLabel.text(helpers.prettyPrintTime(totalTime));
    }
    
    //  Update the current time every half a second.
    setInterval(function () {
        
        //  Do not update if the progress bar is being dragged.
        if (!player.isSeeking) {
            updateTimeInSeconds(player.currentTime);
        }
        
    }, 500);
    
    //  Keep the current time display in sync with progressBar (i.e. when user is dragging progressBar)
    progressBar.onManualTimeChange(updateTimeInSeconds);
    progressBar.onChange(function () {
        updateTimeInSeconds(this.value);
    });
    
    //  In charge of updating the currentTime label
    function updateTimeInSeconds(time) {
        currentTimeLabel.text(helpers.prettyPrintTime(time));
    };
});