define(['playlistItems'], function(PlaylistItems) {
    'use strict';

    var PlaylistItemsHistory = Backbone.Collection.extend(PlaylistItems, {
        comparator: null
    });

    return function(config) {
        var playlistItemsHistory = new PlaylistItemsHistory(config);

        return playlistItemsHistory;
    };
})