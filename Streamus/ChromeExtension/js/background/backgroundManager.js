//  TODO: Exposed globally for the foreground. Is there a better way?
var BackgroundManager = null;

//  Denormalization point for the Background's selected models.
define(['user', 'player', 'playlistItems', 'playlists', 'streams'], function (user, player, PlaylistItems, Playlists, Streams) {
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

        }
    });
    
    function initialize() {
        //  Load the active stream:
        var activeStreamId = localStorage.getItem('activeStreamId');

        if (activeStreamId === null) {
            this.set('activeStream', user.get('streams').at(0));
        } else {
            this.set('activeStream', user.get('streams').get(activeStreamId));
        }

        //  Load the active playlist:
        var activePlaylistId = localStorage.getItem('activePlaylistId');

        if (activePlaylistId === null) {
            this.set('activePlaylist', this.get('activeStream').get('playlists').at(0));
        } else {

            //  There is no guarantee that the active playlist will be in the active stream because a user could be looking through
            //  different streams without selecting a new playlist.
            this.set('activePlaylist', _.find(getAllPlaylists(), function (playlist) {
                return playlist.get('id') == activePlaylistId;
            }));
        }

        //  Load the active playlistItem:
        var activePlaylistItemId = localStorage.getItem('activePlaylistItemId');

        if (activePlaylistItemId === null) {
            this.set('activePlaylistItem', this.get('activePlaylist').get('items').at(0));
        } else {

            //  There is no guarantee that the active playlistItem will be in the active playlist because a user could be looking through
            //  different playlists without selecting a new item.
            this.set('activePlaylistItem', _.find(getAllPlaylistItems(), function (playlistItem) {
                return playlistItem.get('id') == activePlaylistItemId;
            }));

        }

        this.get('allPlaylistItems').add(getAllPlaylistItems());
        this.get('allPlaylists').add(getAllPlaylists());
        this.get('allStreams').add(user.get('streams'));

        var self = this;
        this.get('allPlaylistItems').on('change:active', function (playlistItem, isActive) {

            if (self.get('activePlaylistItem') === playlistItem && !isActive) {
                self.set('activePlaylistItem', null);
            } else if (isActive) {
                self.set('activePlaylistItem', playlistItem);
            }

        });

        this.get('allPlaylists').on('change:active', function(playlist, isActive) {

            if (self.get('activePlaylist') === playlist && !isActive) {
                self.set('activePlaylist', null);
            } else if (isActive) {
                self.set('activePlaylist', playlist);
            }

        });


        this.get('allPlaylists').each(function(playlist) {

            playlist.get('items').on('add', function(playlistItem) {

                self.get('allPlaylistItems').add(playlistItem);

                if (self.get('activePlaylistItem') == null) {
                    self.set('activePlaylistItem', playlistItem);
                    playlist.selectItemById(playlistItem.get('id'));
                }

            });

            playlist.get('items').on('remove', function(playlistItem) {
                if (self.get('activePlaylistItem') === playlistItem) {
                    self.set('activePlaylistItem', null);
                }
            });

            playlist.get('items').on('change:selected', function(playlistItem) {

                self.set('activePlaylistItem', playlistItem);
            });

        });

        this.get('allStreams').on('change:active', function(stream, isActive) {

            if (self.get('activeStream') === stream && !isActive) {
                self.set('activeStream', null);
            } else if (isActive) {
                self.set('activeStream', stream);
            }

        });

        this.get('allStreams').each(function(stream) {

            stream.get('playlists').on('add', function(playlist) {
                self.get('allPlaylists').add(playlist);

                playlist.on('add', function(playlistItem) {
                    self.get('allPlaylistItems').add(playlistItem);
                });
            });

            stream.get('playlists').on('remove', function(playlist) {
                if (self.get('activePlaylist') === playlist) {
                    self.set('activePlaylist', null);
                }
            });

        });

        //  TODO: Support adding Stream here.
        //  TODO: Support removing Stream here.
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
        var allPlaylists = _.flatten(user.get('streams').map(function (stream) {
            return stream.get('playlists').models;
        }));

        return allPlaylists;
    }

    BackgroundManager = new BackgroundManagerModel();

    return BackgroundManager;
});