//  TODO: Exposed globally for the foreground. Is there a better way?
var BackgroundManager = null;

//  Denormalization point for the Background's selected models.
define(['user'], function (user) {
    'use strict';

    var BackgroundManagerModel = Backbone.Model.extend({
        defaults: {
            activePlaylistItem: null,
            activePlaylist: null,
            activeStream: null
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
                    console.log("Loading default active stream");
                    self.set('activeStream', user.get('streams').at(0));
                    console.log("Active stream:", self.get('activeStream'));
                } else {
                    console.log("Loading activeStream with ID:", activeStreamId);
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
            });

        }
    });
    
    //  Takes all streams, retrieves all playlists from streams and then all items from playlists.
    function getAllPlaylistItems() {
        var allPlaylists = getAllPlaylists();

        var allPlaylistItems = _.flatten(_.map(allPlaylists, function (playlist) {
            return playlist.get('items');
        }));

        return allPlaylistItems;
    }

    //  Takes all streams and retrieves all playlists from the streams.
    function getAllPlaylists() {
        var allPlaylists = _.flatten(user.get('streams').map(function (stream) {
            return stream.get('playlists');
        }));

        return allPlaylists;
    }

    BackgroundManager = new BackgroundManagerModel();

    return BackgroundManager;
});