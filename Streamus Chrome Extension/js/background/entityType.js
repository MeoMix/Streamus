define(function() {
    'use strict';
    
    var EntityType = Object.freeze({
        None: -1,
        Video: 0,
        PlaylistItem: 1,
        Playlist: 2,
        Stream: 3,
        User: 4
    });

    return EntityType;
});