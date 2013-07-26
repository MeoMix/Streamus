//  Handles setting and managing the Streamus icon state.
<<<<<<< HEAD
define(['player'], function (player) {
=======
define(['player', 'playerState'], function (player, PlayerState) {
>>>>>>> origin/Development
    'use strict';

    var iconManagerModel = Backbone.Model.extend({
        //  Begin listening to interesting player events and adjust UI as events happen
        initialize: function () {

            //  Initialize the visual state of the icon once the player is ready and able to provide information.
            var initializeIcon = function () {
                var playerState = player.get('state');
                var isMuted = player.get('muted');
                var volume = player.get('volume');

                setIcon(playerState, isMuted, volume);
            };
            
            if (player.get('ready')) {
                initializeIcon();
            } else {
                player.once('change:ready', initializeIcon);
            }

            player.on('change:muted', function (model, isMuted) {

                var playerState = player.get('state');
                var volume = player.get('volume');

                setIcon(playerState, isMuted, volume);
            });

            player.on('change:state', function (model, playerState) {

                var isMuted = player.get('muted');
                var volume = player.get('volume');

                setIcon(playerState, isMuted, volume);
            });

            player.on('change:volume', function(model, volume) {

                var playerState = player.get('state');
                var isMuted = player.get('muted');
                
                setIcon(playerState, isMuted, volume);
            });
            
        }
        
    });
    
    //  Set the Streamus icon color and bar count based on the volume level, mutedness and player state.
    //  RED: Player is muted.
    //  GREEN: Player is playing (buffering counts as playing)
    //  Yellow: Player is paused/unstarted
    function setIcon(playerState, isMuted, volume) {
        var iconColor;

        if (isMuted) {
            iconColor = 'Red';
        }
<<<<<<< HEAD
        else if (playerState === PlayerStates.PLAYING || playerState === PlayerStates.BUFFERING) {
=======
        else if (playerState === PlayerState.PLAYING || playerState === PlayerState.BUFFERING) {
>>>>>>> origin/Development
            iconColor = 'Green';
        } else {
            iconColor = 'Yellow';
        }

        //  TODO: It would probably be better to implement this using a canvas rather than swapping images.
        var barCount = Math.ceil((volume / 25));

        chrome.browserAction.setIcon({
<<<<<<< HEAD
            path: '../../images/' + iconColor + ' ' + barCount + '.png'
=======
            path: '../../img/' + iconColor + ' ' + barCount + '.png'
>>>>>>> origin/Development
        });
    }

    return new iconManagerModel();
});