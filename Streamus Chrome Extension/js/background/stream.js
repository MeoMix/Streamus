//  A stream is a collection of playlists
define(['playlists', 'playlist', 'videos', 'video', 'player', 'programState', 'helpers', 'shareCode', 'playlistItems'], function (Playlists, Playlist, Videos, Video, player, programState, helpers, ShareCode, PlaylistItems) {
    'use strict';
    
    var streamModel = Backbone.Model.extend({
        defaults: function () {
            return {
                id: null,
                userId: null,
                title: '',
                playlists: new Playlists(),
                firstListId: null,
            };
        },
        urlRoot: programState.getBaseUrl() + 'Video/',
        initialize: function () {
            var playlists = this.get('playlists');

            //  Data was fetched from the server. Need to convert to Backbone.
            if (!(playlists instanceof Backbone.Collection)) {
                playlists = new Playlists(playlists);

                this.set('playlists', playlists, {
                    //  Silent operation because it isn't technically changing - just being made correct.
                    silent: true
                });
            }

            var self = this;
            playlists.on('change:selected', function (playlist, isSelected) {
                if (isSelected) {
                    //  TODO: Can this be abstracted down to the playlist level?
                    playlist.get('items').on('change:selected', function (item, selected) {

                        if (selected) {
                            var videoId = item.get('video').get('id');

                            //  Maintain the playing state by loading if playing. 
                            if (player.isPlaying()) {
                                player.loadVideoById(videoId);
                            } else {
                                player.cueVideoById(videoId);
                            }
                        }
                    });

                } else {
                    if (self.getSelectedPlaylist() === playlist) {
                        playlist.get('items').off('change:selected add remove');
                    }
                }
                
            });

            this.get('playlists').on('remove', function (removedPlaylist) {
                
                var playlists = self.get('playlists');

                if (playlists.length > 0) {

                    //  Update firstList if it was removed
                    if (self.get('firstListId') === removedPlaylist.get('id')) {
                        self.set('firstListId', removedPlaylist.get('nextListId'));
                    }

                    //  Update linked list pointers
                    var previousList = playlists.get(removedPlaylist.get('previousListId'));
                    var nextList = playlists.get(removedPlaylist.get('nextListId'));

                    //  Remove the playlist from linked list.
                    previousList.set('nextListId', nextList.get('id'));
                    nextList.set('previousListId', previousList.get('id'));

                } else {
                    self.set('firstListId', '00000000-0000-0000-0000-000000000000');
                }

            });

        },
        
        addVideoByIdToPlaylist: function (id, playlistId) {
            this.get('playlists').get(playlistId).addVideoByIdToPlaylist(id);
        },

        addPlaylistByDataSource: function(playlistTitle, dataSource, callback) {
            var playlist = new Playlist({
                title: playlistTitle,
                streamId: this.get('id'),
                dataSource: dataSource
            });

            var currentPlaylists = this.get('playlists');

            var self = this;
            
            function onAddPlaylistSuccess() {
                var playlistId = playlist.get('id');

                if (currentPlaylists.length === 0) {
                    self.set('firstListId', playlistId);
                    playlist.set('nextListId', playlistId);
                    playlist.set('previousListId', playlistId);
                } else {
                    var firstList = currentPlaylists.get(self.get('firstListId'));
                    var lastList = currentPlaylists.get(firstList.get('previousListId'));

                    lastList.set('nextListId', playlistId);
                    playlist.set('previousListId', lastList.get('id'));

                    firstList.set('previousListId', playlistId);
                    playlist.set('nextListId', firstList.get('id'));
                }

                currentPlaylists.push(playlist);

                if (callback) {
                    callback(playlist);
                }
            }
            
            if (dataSource && dataSource.type === DataSources.SHARED_PLAYLIST) {

                var shareCode = new ShareCode({
                    id: dataSource.id
                });

                shareCode.fetch({
                    success: function() {
                        console.log("shareCode:", shareCode);

                        var sharedPlaylist = new Playlist({
                            id: shareCode.get('entityId')
                        });

                        console.log("Fetching a shared playlist");
                        sharedPlaylist.fetch({
                            success: function () {

                                console.log("Shared playlist:", sharedPlaylist);
                                
                                playlist.set('title', sharedPlaylist.get('title'), {silent: true});

                                var items = new PlaylistItems(sharedPlaylist.get('items').map(function(item) {

                                    var newItem = item.clone();
                                    newItem.set('id', helpers.generateGuid());

                                    return newItem;
                                }));

                                //  Deep copy the sharedPlaylist's items but change their id so each shared copy affects new items.
                                playlist.set('items', items, { silent: true });

                                //  Save the playlist, but push after version from server because the ID will have changed.
                                playlist.save(new Array(), {
                                    success: onAddPlaylistSuccess,
                                    error: function (error) {
                                        window && console.error(error);
                                    }
                                });
                                
                            },
                            error: function(error) {
                                window && console.error(error);
                            }
                        });

                    },
                    error: function(error) {
                        window && console.error(error);
                    }
                });

            } else {

                //  Save the playlist, but push after version from server because the ID will have changed.
                playlist.save(new Array(), {
                    success: onAddPlaylistSuccess,
                    error: function (error) {
                        window && console.error(error);
                    }
                });
                
            }

        },
        
        removePlaylistById: function(playlistId) {
            //  TODO: When deleting the active playlist - set active playlist to the next playlist.
            var playlists = this.get('playlists');

            var playlist = playlists.get(playlistId);
                    
            if (this.get('firstListId') === playlistId) {
                var newFirstListId = playlist.get('nextListId');
                this.set('firstListId', newFirstListId);
            }

            var previousList = playlists.get(playlist.get('previousListId'));
            var nextList = playlists.get(playlist.get('nextListId'));

            //  Remove the list from our linked list.
            previousList.set('nextListId', nextList.get('id'));
            nextList.set('previousListId', previousList.get('id'));

            playlist.destroy({
                success: function () {
                    //  Remove from playlists clientside only after server responds with successful delete.
                    playlists.remove(playlist);
                },
                error: function (error) {
                    window && console.error(error);
                }
            });
        },
        
        getPlaylistById: function(playlistId) {
            var playlist = this.get('playlists').get(playlistId) || null;
           
            return playlist;
        }
    });
    
    return function (config) {
        var stream = new streamModel(config);

        return stream;
    };
});