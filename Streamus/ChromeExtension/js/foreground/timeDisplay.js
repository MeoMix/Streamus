//Holds onto the currentTime and totalTime video labels as well as the elapsed time progress bar.
define(['helpers'], function(helpers) {
    'use strict';
    var currentTimeLabel = $('#CurrentTimeLabel');
    var totalTimeLabel = $('#TotalTimeLabel');

    var youtubePlayer = chrome.extension.getBackgroundPage().YoutubePlayer;
    var timeInSeconds = youtubePlayer.currentTime;
    currentTimeLabel.text(helpers.prettyPrintTime(timeInSeconds));

    //  Only need to update totalTime whenever the playlistItem changes.
    var items = chrome.extension.getBackgroundPage().PlaylistManager.activePlaylist.get('items');
    items.on('change:selected', function(item, isSelected) {
        if (isSelected) {
            setTotalTime(item);
        }
    });
    
    var selectedItem = items.find(function (item) {
        return item.get('selected');
    });

    if (selectedItem) {
        setTotalTime(selectedItem);
    }
   
    function setTotalTime(playlistItem) {
        var videoId = playlistItem.get('videoId');
        var currentVideo = chrome.extension.getBackgroundPage().VideoManager.getLoadedVideoById(videoId);
        var totalTime = currentVideo.get('duration');

        totalTimeLabel.text(helpers.prettyPrintTime(totalTime));
    }
    
    //  Update the current time every half a second.
    setInterval(function () {
        
        //  Do not update if the progress bar is being dragged.
        if (!youtubePlayer.isSeeking) {
            update(youtubePlayer.currentTime);
        }
        
    }, 500);

    //  In charge of updating the currentTime label
    var update = function (timeInSeconds) {
        currentTimeLabel.text(helpers.prettyPrintTime(timeInSeconds));
    };

    return {
        update: update
    };
});