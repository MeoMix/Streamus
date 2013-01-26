//Load mousewheel here because it isn't needed in foreground and is not wrapped in a require block (so it might get loaded before jQuery if put in foreground)
define(['playerControls', 'header', 'settings', 'videosTab', 'playlistsTab', 'timeDisplay', 'progressBar', 'contentButtons'],
 function (playerControls, header, settings, videosTab, playlistsTab, timeDisplay, progressBar) {
     'use strict';
     
     //Keep the current time display in sync with progressBar (i.e. when user is dragging progressBar)
     progressBar.onManualTimeChange(timeDisplay.update);
     progressBar.onChange(function () {
         timeDisplay.update(this.value);
     });

    return {
        //Refereshes the visual state of the UI to keep foreground synced with background.
        refresh: function () {
            console.log("refreshing");
            playerControls.refreshControls();
            header.updateTitle();
            videosTab.reload();
            playlistsTab.reload();
        }
    };
});