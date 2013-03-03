//  TODO: Exposed globally for the foreground. Is there a better way?
var PlaylistManager = null;

// TODO: KILL THIS FILE! IT IS BAD!
//Manages an array of Playlist objects.
define(['playlist',
        'playlists',
        'playlistItem',
        'playlistItems',
        'loginManager',
        'player'
    ], function(Playlist, Playlists, PlaylistItem, PlaylistItems, loginManager, player) {
        'use strict';

        loginManager.onLoggedIn(function () {
            //  PlaylistManager will remember the selected playlist via localStorage.
            var savedId = localStorage.getItem('selectedPlaylistId');
            var stream = loginManager.get('user').get('streams').at(0);
            
            if (player.get('ready')) {
                stream.selectPlaylist(savedId);
            } else {
                player.once('change:ready', function() {
                    stream.selectPlaylist(savedId);
                });
            } 
        });
        
        player.on('change:state', function (model, playerState) {
            
            //  If the video stopped playing and there's another playlistItem to skip to, do so.
            if (playerState === PlayerStates.ENDED) {
                //  Don't pass message to UI if it is closed. Handle sock change in the background.
                //  The player can be playing in the background and UI changes may try and be posted to the UI, need to prevent.
                var isRadioModeEnabled = JSON.parse(localStorage.getItem('isRadioModeEnabled')) || false;

                var nextItem;
                if (isRadioModeEnabled) {
                    var nextVideo = activePlaylist.getRelatedVideo();
                    nextItem = activePlaylist.addItem(nextVideo);

                } else {
                    nextItem = activePlaylist.gotoNextItem();
                }
                
                console.log("going to next item:", nextItem);
                var selectedItem = activePlaylist.selectItemById(nextItem.get('id'));

                console.log("selectedItem:", selectedItem);
                player.loadVideoById(selectedItem.get('video').get('id'));
            }

        });

        PlaylistManager = {
            //  TODO: How can I remove this dependency?
            getStream: function () {
                return loginManager.get('user').get('streams').at(0);
            },
            
            addVideoByIdToPlaylist: function (id, playlistId) {
                var user = loginManager.get('user');
                var stream = user.get('streams').at(0);

                stream.addVideoByIdToPlaylist(id, playlistId);
            },
                        
            //  Skips to the next playlistItem. Will start playing the video if the player was already playing.
            //  if where == "next" it'll skip to the next item otherwise it will skip to the previous.
            skipItem: function (where) {
                var user = loginManager.get('user');
                var stream = user.get('streams').at(0);

                stream.skipItem(where);
            },
            
            removeItem: function (item) {
                var user = loginManager.get('user');
                var stream = user.get('streams').at(0);

                stream.removeItem(item);
            },
            
            selectPlaylist: function (playlistId) {
                var user = loginManager.get('user');
                var stream = user.get('streams').at(0);

                stream.selectPlaylist(playlistId);
            },
            
            addPlaylist: function (playlistTitle, optionalPlaylistId, callback) {
                var user = loginManager.get('user');
                var stream = user.get('streams').at(0);

                stream.addPlaylist(playlistTitle, optionalPlaylistId, callback);
            },
            
            removePlaylistById: function (playlistId) {
                var user = loginManager.get('user');
                var stream = user.get('streams').at(0);

                stream.removePlaylistById(playlistId);
            }
        };

        return PlaylistManager;
    });