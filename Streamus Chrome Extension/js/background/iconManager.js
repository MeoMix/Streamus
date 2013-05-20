//  Handles setting and managing the Streamus icon state.
define(function () {
    'use strict';

    var iconManagerModel = Backbone.Model.extend({
        setIcon: function (playerState, isMuted, volume) {
            var iconColor;

            if (isMuted) {
                iconColor = 'Red';
            }
            else if (playerState === PlayerStates.PLAYING || playerState === PlayerStates.BUFFERING) {
                iconColor = 'Green';
            } else {
                iconColor = 'Yellow';
            }

            var barCount = Math.ceil((volume / 25));

            chrome.browserAction.setIcon({
                path: '../../images/' + iconColor + ' ' + barCount + '.png'
            });

        }
    });

    return new iconManagerModel();
});