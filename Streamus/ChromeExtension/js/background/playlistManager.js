//  TODO: Exposed globally for the foreground. Is there a better way?
var PlaylistManager = null;

// TODO: KILL THIS FILE! IT IS BAD!
//Manages an array of Playlist objects.
define(['playlist',
        'playlists',
        'playlistItem',
        'playlistItems',
        'user',
        'player'
    ], function(Playlist, Playlists, PlaylistItem, PlaylistItems, user, player) {
        'use strict';
        
        user.once('change:loaded', function () {
            //  PlaylistManager will remember the selected playlist via localStorage.
            var savedId = localStorage.getItem('selectedPlaylistId');
            var stream = user.get('streams').at(0);
            stream.selectPlaylist(savedId);
        });
        
        player.on('change:state', function (model, playerState) {
            
            //  If the video stopped playing and there's another playlistItem to skip to, do so.
            if (playerState === PlayerStates.ENDED) {
                //  Don't pass message to UI if it is closed. Handle sock change in the background.
                //  The player can be playing in the background and UI changes may try and be posted to the UI, need to prevent.
                var isRadioModeEnabled = JSON.parse(localStorage.getItem('isRadioModeEnabled')) || false;

                var selectedPlaylist = user.get('streams').at(0).getSelectedPlaylist();
                var nextItem;
                if (isRadioModeEnabled) {
                    var nextVideo = selectedPlaylist.getRelatedVideo();
                    nextItem = selectedPlaylist.addItem(nextVideo);

                } else {
                    nextItem = selectedPlaylist.gotoNextItem();
                }

                var selectedItem = selectedPlaylist.selectItemById(nextItem.get('id'));
                player.loadVideoById(selectedItem.get('video').get('id'));
            }

        });

        PlaylistManager = {
            //  TODO: How can I remove this dependency?
            getStream: function () {
                return user.get('streams').at(0);
            }
        };

        return PlaylistManager;
    });