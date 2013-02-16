//  TODO: Exposed globally for the foreground. Is there a better way?
var PlaylistManager = null;

//Manages an array of Playlist objects.
define(['playlist',
        'playlists',
        'playlistItem',
        'playlistItems',
        'loginManager'
    ], function(Playlist, Playlists, PlaylistItem, PlaylistItems, loginManager) {
        'use strict';

        var playlists = new Playlists();
        var isReady = false;

        var events = {
            onReady: 'playlistManager.onReady',
            onActivePlaylistTitleChange: 'playlistManager.onActivePlaylistTitleChange',
            onPlaylistRemoved: 'playlistManager.onPlaylistRemoved',
            onActivePlaylistChange: 'playlistManager.onActivePlaylistChange'
        };

        loginManager.once('loggedIn', function () {
            playlists = loginManager.get('user').get('playlistCollections').at(0).get('playlists');

            //  PlaylistManager will remember the selected playlist via localStorage.
            var savedId = localStorage.getItem('selectedPlaylistId');
            var playlistToSelect = playlists.get(savedId) || playlists.at(0);
            
            setSelectedPlaylist(playlistToSelect);

            $(document).trigger(events.onReady);
            isReady = true;
        });

        loginManager.login();

        function getSelectedPlaylist() {
            var selectedPlaylist = playlists.find(function(playlist) {
                return playlist.get('selected');
            });

            return selectedPlaylist;
        }

        function setSelectedPlaylist(playlistToSelect) {
            var selectedPlaylist = getSelectedPlaylist();

            if (selectedPlaylist != null && selectedPlaylist.get('id') != playlistToSelect.get('id')) {
                selectedPlaylist.set('selected', false);
            }

            //First time loading up there won't be a playlist selected yet, so just go ahead and set.
            playlistToSelect.set('selected', true);
            localStorage.setItem('selectedPlaylistId', playlistToSelect.get('id'));
            $(document).trigger(events.onActivePlaylistChange, playlistToSelect);
        }

        PlaylistManager = {
            onReady: function(event) {

                if (isReady) {
                    event();
                } else {
                    $(document).on(events.onReady, event);
                }
            },
            onActivePlaylistChange: function() {
                $(document).on(events.onActivePlaylistChange, event);
            },
            //  TODO: Replace when more backboney
            onActivePlaylistTitleChange: function(event) {
                $(document).on(events.onActivePlaylistTitleChange, event);
            },
            onPlaylistRemoved: function (event) {
                $(document).on(events.onPlaylistRemoved, event);
            },
            get playlists() {
                return playlists;
            },
            get activePlaylist() {
                return getSelectedPlaylist();
            },
            get playlistTitle() {
                return this.activePlaylist.get('title');
            },
            set playlistTitle(value) {
                this.activePlaylist.set('title', value);
                $(document).trigger(events.onActivePlaylistTitleChange);
            },
            set activePlaylist(value) {
                console.log("calling setActivePlaylist with value", value);
                setSelectedPlaylist(value);
            },
            setActivePlaylistById: function(id) {
                var playlist = playlists.get(id);
                setSelectedPlaylist(playlist);
            },
            
            addVideoByIdToPlaylist: function (id, playlistId) {
                var playlist = this.getPlaylistById(playlistId);
                playlist.addVideoById(id);
            },
            
            addPlaylist: function(playlistTitle, callback) {
                var userId = loginManager.get('user').get('id');

                var playlist = new Playlist({
                    title: playlistTitle,
                    position: playlists.length,
                    userId: userId
                });

                //  Save the playlist, but push after version from server because the ID will have changed.
                playlist.save(new Array(), {
                    success: function() {
                        playlists.push(playlist);

                        if (callback) {
                            callback(playlist);
                        }
                    },
                    error: function(error) {
                        console.error(error);
                    }
                });
            },
            
            removePlaylistById: function (playlistId) {
                //Don't allow removing of active playlist.
                //TODO: Perhaps just don't allow deleting the last playlist? More difficult.
                if (activePlaylist.get('id') !== playlistId) {
                    console.log("playlist id:", playlistId);
                    var playlist = playlists.get(playlistId);

                    playlist.destroy({
                        success: function () {
                            //  Remove from playlists clientside only after server responds with successful delete.
                            playlists.remove(playlist);
                            $(document).trigger(events.onPlaylistRemoved);
                        },
                        error: function (error) {
                            console.error(error);
                        }
                    });
                }
            }
        };

        return PlaylistManager;
    });