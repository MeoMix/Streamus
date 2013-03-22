//  TODO: Exposed globally for the foreground. Is there a better way?
var BackgroundManager = null;

//  Denormalization point for the Background's selected models.
define(['user', 'player', 'localStorageManager', 'playlistItems', 'playlists', 'streams'], function (user, player, localStorageManager, PlaylistItems, Playlists, Streams) {
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

                if (player.get('ready')) {
                    initialize.call(self);
                } else {
                    player.on('change:ready', function() {
                        initialize.call(self);
                    });
                }
            });

        },
        
        getPlaylistById: function(playlistId) {
            return this.get('allPlaylists').find(function(playlist) {
                return playlist.get('id') === playlistId;
            });
        },
        
        getPlaylistItemById: function(playlistItemId) {
            return this.get('allPlaylistItems').find(function(playlistItem) {
                return playlistItem.get('id') === playlistItemId;
            });
        },
        
        getStreamById: function(streamId) {
            return this.get('allStreams').find(function(stream) {
                return stream.get('id') === streamId;
            });
        }
    });
    
    function initialize() {
        this.set('allStreams', user.get('streams'));
        this.get('allPlaylists').add(getAllPlaylists());
        this.get('allPlaylistItems').add(getAllPlaylistItems());

        loadActiveStream.call(this);
        loadActivePlaylist.call(this);
        loadActivePlaylistItem.call(this);

        var self = this;

        this.get('allPlaylists').on('change:active', function(playlist, isActive) {

            if (self.get('activePlaylist') === playlist && !isActive) {
                self.set('activePlaylist', null);
            } else if (isActive) {
                self.set('activePlaylist', playlist);
            }

        });

        this.get('allPlaylists').each(function(playlist) {
            bindEventsToPlaylist.call(self, playlist);
        });

        this.get('allStreams').on('change:active', function(stream, isActive) {

            if (self.get('activeStream') === stream && !isActive) {
                self.set('activeStream', null);
            } else if (isActive) {
                self.set('activeStream', stream);
            }

        });

        this.get('allStreams').each(function(stream) {

            stream.get('playlists').on('add', function (playlist) {
                self.get('allPlaylists').add(playlist);
                bindEventsToPlaylist.call(self, playlist);
            });

            stream.get('playlists').on('remove', function (playlist) {

                self.get('allPlaylists').remove(playlist);

                if (self.get('activePlaylist') === playlist) {
                    self.set('activePlaylist', null);
                }
            });

        });

        //  TODO: Support adding Stream here.
        //  TODO: Support removing Stream here.
    }
    
    function bindEventsToPlaylist(playlist) {
        var self = this;
        playlist.get('items').on('add', function (playlistItem) {
            
            self.get('allPlaylistItems').add(playlistItem);

            if (self.get('activePlaylistItem') === null) {
                self.set('activePlaylistItem', playlistItem);
                playlist.selectItem(playlistItem);
            }

        });

        playlist.get('items').on('remove', function (playlistItem) {

            self.get('allPlaylistItems').remove(playlistItem);

            if (self.get('activePlaylistItem') === playlistItem) {
                self.set('activePlaylistItem', null);
            }
        });
    }
    
    function loadActiveStream() {
        //  Load the active stream:
        this.on('change:activeStream', function (model, activeStream) {

            if (activeStream === null) {
                localStorageManager.setActiveStreamId(null);
            } else {
                localStorageManager.setActiveStreamId(activeStream.get('id'));
            }
        });
        var activeStreamId = localStorageManager.getActiveStreamId();

        if (activeStreamId === null) {
            this.set('activeStream', this.get('allStreams').at(0));
        } else {
            this.set('activeStream', this.get('allStreams').get(activeStreamId));
        }
    }

    function loadActivePlaylist() {
        //  Load the active playlist:
        this.on('change:activePlaylist', function (model, activePlaylist) {

            if (activePlaylist === null) {
                localStorageManager.setActivePlaylistId(null);
            } else {
                localStorageManager.setActivePlaylistId(activePlaylist.get('id'));
            }

        });
        var activePlaylistId = localStorageManager.getActivePlaylistId();

        if (activePlaylistId === null) {
            this.set('activePlaylist', this.get('activeStream').get('playlists').at(0));
        } else {

            //  There is no guarantee that the active playlist will be in the active stream because a user could be looking through
            //  different streams without selecting a new playlist.
            var activePlaylist = _.find(getAllPlaylists(), function (playlist) {
                return playlist.get('id') === activePlaylistId;
            });

            this.set('activePlaylist', activePlaylist);
        }
    }
    
    function loadActivePlaylistItem() {
        //  Load the active playlistItem:
        this.on('change:activePlaylistItem', function (model, activePlaylistItem) {

            if (activePlaylistItem == null) {
                localStorageManager.setActivePlaylistItemId(null);
            } else {
                localStorageManager.setActivePlaylistItemId(activePlaylistItem.get('id'));
            }
        });

        var activePlaylistItemId = localStorageManager.getActivePlaylistItemId();

        if (activePlaylistItemId === null) {
            var activePlaylistItems = this.get('activePlaylist').get('items');

            if (activePlaylistItems.length > 0) {
                this.set('activePlaylistItem', activePlaylistItems.at(0));
            }

        } else {

            //  There is no guarantee that the active playlistItem will be in the active playlist because a user could be looking through
            //  different playlists without selecting a new item.

            var activePlaylistItem = _.find(getAllPlaylistItems(), function (playlistItem) {
                return playlistItem.get('id') === activePlaylistItemId;
            });

            this.set('activePlaylistItem', activePlaylistItem);
        }

        var activePlaylistItem = this.get('activePlaylistItem');
        if (activePlaylistItem != null) {
            var playlist = this.getPlaylistById(activePlaylistItem.get('playlistId'));
            playlist.selectItem(activePlaylistItem);
        }
    }

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
        var allPlaylists = _.flatten(BackgroundManager.get('allStreams').map(function (stream) {
            return stream.get('playlists').models;
        }));

        return allPlaylists;
    }

    BackgroundManager = new BackgroundManagerModel();

    return BackgroundManager;
});