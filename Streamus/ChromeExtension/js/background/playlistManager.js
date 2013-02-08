//Manages an array of Playlist objects.
define(['playlist',
        'playlists',
        'playlistItem',
        'playlistItems',
        'loginManager',
        'programState'
       ], function (Playlist, Playlists, PlaylistItem, PlaylistItems, loginManager, programState) {
        'use strict';
        var playlists = new Playlists();
        var isReady = false;

        var events = {
            onReady: 'playlistManager.onReady'
        };
           
        loginManager.once('loggedIn', function () {
            var userId = loginManager.get('user').get('id');

            $.ajax({
                type: 'GET',
                url: programState.getBaseUrl() + 'Playlist/GetPlaylistsByUserId',
                dataType: 'json',
                data: {
                    userId: userId
                },
                success: function (data) {
                    playlists.reset(data);

                    //PlaylistManager will remember the selected playlist via localStorage.
                    var savedId = localStorage.getItem('selectedPlaylistId');
                    
                    if (savedId === null) {
                        var playlist = playlists.at(0);
                        selectPlaylistById(playlist.get('id'));
                    } else {
                        selectPlaylistById(savedId);
                    }

                    $(document).trigger(events.onReady);
                    isReady = true;
                },
                error: function(error) {
                    console.error(error);
                }
            });
        });

        loginManager.login();

        function selectPlaylistById(id) {
            var playlist = playlists.get(id);
            if (playlist != null) {
                setSelectedPlaylist(playlist);
            }
        }

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
        }

        return {
            onReady: function (event) {
                console.log("onReady called. isReady:", isReady);
                if (isReady) {
                    event();
                } else {
                    $(document).on(events.onReady, event);
                }
            },
            get playlists() {
                return playlists;
            },
            get activePlaylist() {
                return getSelectedPlaylist();
            },
            set activePlaylist(value) {
                console.log("calling setActivePlaylist with value", value);
                setSelectedPlaylist(value);
            },
            setActivePlaylistById: function(id) {
                var playlist = playlists.get(id);
                setSelectedPlaylist(playlist);
            },
            addPlaylist: function (playlistTitle, callback) {
                var userId = loginManager.get('user').get('id');

                console.log("Playlist's length: ", playlists.length);
                console.trace();

                var playlist = new Playlist({
                    title: playlistTitle,
                    position: playlists.length,
                    userId: userId
                });

                console.log("Calling save with playlist", playlist);
                
                //  Save the playlist, but push after version from server because the ID will have changed.
                playlist.save(new Array(), {
                    success: function () {
                        console.log("Save successful");
                        playlists.push(playlist);

                        if (callback) {
                            callback(playlist);
                        }
                    },
                    error: function (error) {
                        console.error(error);
                    }
                });
            },
            removePlaylistById: function(playlistId) {
                console.log("playlist id:", playlistId);
                var playlist = playlists.get(playlistId);
               
                playlist.destroy({
                    success: function() {
                        //  Remove from playlists clientside only after server responds with successful delete.
                        playlists.remove(playlist);
                    },
                    error: function(error) {
                        console.error(error);
                    }
                });
            }
        };
    });