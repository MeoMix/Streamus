//  A stream is a collection of playlists
define(['playlists', 'playlist', 'videos', 'video', 'player', 'programState', 'dataSource', 'ytHelper'], function (Playlists, Playlist, Videos, Video, player, programState, DataSource, ytHelper) {
    'use strict';
    
    var streamModel = Backbone.Model.extend({
        defaults: function () {
            return {
                id: null,
                title: '',
                playlists: new Playlists(),
                firstPlaylistId: null,
            };
        },
        urlRoot: programState.getBaseUrl() + 'Video/',
        
        parse: function (streamDto) {
            
            //  Convert C# Guid.Empty into BackboneJS null
            for (var key in streamDto) {
                if (streamDto.hasOwnProperty(key) && streamDto[key] == '00000000-0000-0000-0000-000000000000') {
                    streamDto[key] = null;
                }
            }

            return streamDto;
        },

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

                    //  Update firstPlaylistId if it was removed
                    if (self.get('firstPlaylistId') === removedPlaylist.get('id')) {
                        self.set('firstPlaylistId', removedPlaylist.get('nextPlaylistId'));
                    }

                    //  Update linked list pointers
                    var previousPlaylist = playlists.get(removedPlaylist.get('previousPlaylistId'));
                    var nextPlaylist = playlists.get(removedPlaylist.get('nextPlaylistId'));

                    //  Remove the playlist from linked list.
                    previousPlaylist.set('nextPlaylistId', nextPlaylist.get('id'));
                    nextPlaylist.set('previousPlaylistId', previousPlaylist.get('id'));

                } else {
                    self.set('firstPlaylistId', '00000000-0000-0000-0000-000000000000');
                }

            });

        },
        
        addVideoByIdToPlaylist: function (id, playlistId) {
            this.get('playlists').get(playlistId).addVideoByIdToPlaylist(id);
        },
        
        addPlaylistByShareData: function (shareCodeShortId, urlFriendlyEntityTitle, callback) {
            var self = this;

            $.ajax({
                url: programState.getBaseUrl() + 'Playlist/CreateAndGetCopyByShareCode',
                type: 'GET',
                dataType: 'json',
                data: {
                    shareCodeShortId: shareCodeShortId,
                    urlFriendlyEntityTitle: urlFriendlyEntityTitle,
                    streamId: self.get('id')
                },
                success: function (playlistCopy) {
                    //  Convert back from JSON to a backbone object.
                    playlistCopy = new Playlist(playlistCopy);

                    var playlistId = playlistCopy.get('id');
                    
                    var currentPlaylists = self.get('playlists');
                    if (currentPlaylists.length === 0) {
                        self.set('firstPlaylistId', playlistId);;
                    } else {
                        var firstPlaylist = currentPlaylists.get(self.get('firstPlaylistId'));
                        var lastPlaylist = currentPlaylists.get(firstPlaylist.get('previousPlaylistId'));

                        lastPlaylist.set('nextPlaylistId', playlistId);
                        firstPlaylist.set('previousPlaylistId', playlistId);
                    }

                    currentPlaylists.push(playlistCopy);

                    callback(playlistCopy);
                },
                error: function (error) {
                    console.error("Error adding playlist by share data", error);
                    callback();
                }
            });

        },

        addPlaylistByDataSource: function (playlistTitle, dataSource, callback) {
            var self = this;

            var playlist = new Playlist({
                title: playlistTitle,
                streamId: this.get('id'),
                dataSource: dataSource
            });

            //  Save the playlist, but push after version from server because the ID will have changed.
            playlist.save({}, {
                success: function () {

                    //  Update other affected Playlist pointers. DB is already correct, but backbone doesn't update automatically.
                    var currentPlaylists = self.get('playlists');

                    console.log("Playlist saved. Length:", currentPlaylists.length);

                    if (currentPlaylists.length === 0) {
                        self.set('firstPlaylistId', playlist.get('id'));
                    } else {
                        var firstPlaylist = currentPlaylists.get(self.get('firstPlaylistId'));
                        var lastPlaylist = currentPlaylists.get(firstPlaylist.get('previousPlaylistId'));

                        lastPlaylist.set('nextPlaylistId', playlist.get('id'));
                        firstPlaylist.set('previousPlaylistId', playlist.get('id'));
                    }

                    currentPlaylists.push(playlist);
                    
                    //  Recursively load any potential bulk data from YouTube after the Playlist has saved successfully.
                    ytHelper.getDataSourceResults(dataSource, 0, function onGetDataSourceData(response) {

                        if (response.results.length === 0) {
                            playlist.set('dataSourceLoaded', true);
                        } else {
                    
                            //  Turn videoInformation responses into a Video collection.
                            var videos = new Videos(_.map(response.results, function(videoInformation) {

                                return new Video({
                                    videoInformation: videoInformation
                                });

                            }));

                            //  Periodicially send bursts of packets to the server and trigger visual update.
                            playlist.addItems(videos, function () {

                                //  Request next batch of data by iteration once addItems has succeeded.
                                ytHelper.getDataSourceResults(dataSource, ++response.iteration, onGetDataSourceData);

                            });
                    
                        }
                    });
                    
                    //  Data might still be loading, but feel free to callback now as it could take a while.
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

            var playlists = this.get('playlists');

            var playlist = playlists.get(playlistId);
                    
            if (this.get('firstPlaylistId') === playlistId) {
                var newFirstPlaylistId = playlist.get('nextPlaylistId');
                this.set('firstPlaylistId', newFirstPlaylistId);
            }

            var previousPlaylist = playlists.get(playlist.get('previousPlaylistId'));
            var nextPlaylist = playlists.get(playlist.get('nextPlaylistId'));

            //  Remove the list from our linked list.
            previousPlaylist.set('nextPlaylistId', nextPlaylist.get('id'));
            nextPlaylist.set('previousPlaylistId', previousPlaylist.get('id'));

            playlist.destroy({
                success: function () {
                    //  Remove from playlists clientside only after server responds with successful delete.
                    playlists.remove(playlist);
                },
                error: function (error) {
                    console.error(error);
                }
            });
        }
    });
    
    return function (config) {
        var stream = new streamModel(config);

        return stream;
    };
});