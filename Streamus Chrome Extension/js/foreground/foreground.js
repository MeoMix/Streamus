//  When the foreground is loaded it will load all the ui elements. Grouped like this so I can wait for the
//  background YouTube player to load entirely before allowing foreground to open.
define(['backgroundManager',
        'volumeControlView',
        'playPauseButtonView',
        'nextButtonView',
        'previousButtonView',
        'shuffleButtonView',
        'radioButtonView',
        'repeatButtonView',
        'contentButtons',
        'progressBarView',
        'videoDisplayView',
        'headerTitleView',
        'playlistItemInput',
        'playlistItemsView',
        'playlistInput',
        'playlistsView',
        'streamView'
], function () {
    'use strict';

    //  Close the foreground whenever the PC goes idle.
    chrome.idle.onStateChanged.addListener(function (newState) {

        if (window && newState === 'idle') {
            window.close();
        }

    });

});