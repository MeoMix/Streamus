//  When the foreground is loaded it will load all the ui elements. Grouped like this so I can wait for the
//  background YouTube player to load entirely before allowing foreground to open.
define(['backgroundManager',
        'volumeSlider',
        'playPauseButton',
        'skipButton',
        'previousButton',
        'shuffleButton',
        'radioModeButton',
        'contentButtons',
        'progressBar',
        'settings',
        'videoDisplay',
        'header',
        'playlistItemInput',
        'playlistItemsDisplay',
        'playlistInput',
        'playlistsDisplay',
], function (backgroundManager) {
    'use strict';

    //  If the user has browser around to a different stream or playlist (but didn't make a playlistItem selection)
    //  it is unintuitive to stay on that stream/playlist upon re-opening the UI. As such, set the state back to the 
    //  active playlistItem during unload of the foreground.
    addEventListener("unload", function (event) {
        var activePlaylistItem = backgroundManager.get('activePlaylistItem');

        if (activePlaylistItem !== null) {
            var playlistId = activePlaylistItem.get('playlistId');
            var playlist = backgroundManager.getPlaylistById(playlistId);

            if (playlist !== null) {
                backgroundManager.set('activePlaylist', playlist);

                var streamId = playlist.get('streamId');
                var stream = backgroundManager.getStreamById(streamId);

                if (stream !== null) {
                    backgroundManager.set('activeStream', stream);
                }
            }
        }
    }, true);
});