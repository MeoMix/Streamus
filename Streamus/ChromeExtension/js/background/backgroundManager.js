//  TODO: Exposed globally for the foreground. Is there a better way?
var BackgroundManager = null;

//  Denormalization point for the Background's selected models.
define(['user', 'playlistItems', 'playlists', 'streams'], function (user, PlaylistItems, Playlists, Streams) {
    'use strict';

    var BackgroundManagerModel = Backbone.Model.extend({
        defaults: {
            activePlaylistItem: null,
            activePlaylist: null,
            activeStream: null,
            allPlaylistItems: new PlaylistItems(),
            allPlaylists: new Playlists(),
            allStreams: new Streams()
        },
        initialize: function () {

            var self = this;
            user.once('change:loaded', function() {
                if (user.get('streams').length === 0) {
                    throw "User should be initialized and have at least 1 stream before loading backgroundManager.";
                }

                //  Load the active stream:
                var activeStreamId = localStorage.getItem('activeStreamId');

                if (activeStreamId === null) {
                    self.set('activeStream', user.get('streams').at(0));
                } else {
                    self.set('activeStream', user.get('streams').get(activeStreamId));
                }

                //  Load the active playlist:
                var activePlaylistId = localStorage.getItem('activePlaylistId');

                if (activePlaylistId === null) {
                    self.set('activePlaylist', self.get('activeStream').get('playlists').at(0));
                } else {

                    //  There is no guarantee that the active playlist will be in the active stream because a user could be looking through
                    //  different streams without selecting a new playlist.
                    self.set('activePlaylist', _.find(getAllPlaylists(), function (playlist) {
                        return playlist.get('id') == activePlaylistId;
                    }));
                }

                //  Load the active playlistItem:
                var activePlaylistItemId = localStorage.getItem('activePlaylistItemId');

                if (activePlaylistItemId === null) {
                    self.set('activePlaylistItem', self.get('activePlaylist').get('items').at(0));
                } else {

                    //  There is no guarantee that the active playlistItem will be in the active playlist because a user could be looking through
                    //  different playlists without selecting a new item.
                    self.set('activePlaylistItem', _.find(getAllPlaylistItems(), function (playlistItem) {
                        return playlistItem.get('id') == activePlaylistItemId;
                    }));

                }

                self.get('allPlaylistItems').add(getAllPlaylistItems());
                self.get('allPlaylists').add(getAllPlaylists());
                self.get('allStreams').add(user.get('streams'));

                self.get('allPlaylistItems').on('change:active', function (playlistItem, isActive) {
                    
                    if (activePlaylistItem === playlistItem && !isActive) {
                        activePlaylistItem = null;
                    } else if (isActive) {
                        activePlaylistItem = playlistItem;
                    }

                });

                self.get('allPlaylists').on('change:active', function (playlist, isActive) {
                    
                    if (activePlaylist === playlist && !isActive) {
                        activePlaylist = null;
                    }
                    else if (isActive) {
                        activePlaylist = playlist;
                    }
                    
                });


                self.get('allPlaylists').each(function (playlist) {

                    playlist.get('items').on('add', function (playlistItem) {

                        self.get('allPlaylistItems').add(playlistItem);

                        if (self.get('activePlaylistItem') == null) {
                            self.set('activePlaylistItem', playlistItem);
                            playlist.selectItemById(playlistItem.get('id'));
                        }

                    });

                    playlist.get('items').on('remove', function (playlistItem) {
                        if (activePlaylistItem === playlistItem) {
                            activePlaylistItem = null;
                        }
                    });
                    
                });

                self.get('allStreams').on('change:active', function (stream, isActive) {

                    if (activeStream === stream && !isActive) {
                        activeStream = null;
                    } else if (isActive) {
                        activeStream = stream;
                    }
                    
                });

                self.get('allStreams').each(function (stream) {
                    
                    stream.get('playlists').on('add', function (playlist) {
                        self.get('allPlaylists').add(playlist);
                        
                        playlist.on('add', function (playlistItem) {
                            self.get('allPlaylistItems').add(playlistItem);
                        });
                    });
                    
                    stream.get('playlists').on('remove', function (playlist) {
                        if (activePlaylist === playlist) {
                            activePlaylist = null;
                        }
                    });
                    
                });
                
                //  TODO: Support adding Stream here.
                //  TODO: Support removing Stream here.
            });

        }
    });
    
    
    //  Takes all streams, retrieves all playlists from streams and then all items from playlists.
    function getAllPlaylistItems() {
        var allPlaylists = getAllPlaylists();

        var allPlaylistItems = _.flatten(_.map(allPlaylists, function (playlist) {
            return playlist.get('items').models;
        }));

        return allPlaylistItems;
    }

    //  Takes all streams and retrieves all playlists from the streams.
    function getAllPlaylists() {
        var allPlaylists = _.flatten(user.get('streams').map(function (stream) {
            return stream.get('playlists').models;
        }));

        return allPlaylists;
    }

    BackgroundManager = new BackgroundManagerModel();

    return BackgroundManager;
});