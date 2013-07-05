define(function() {
    'use strict';

    //  A list of supported data sources when parsing YouTube URLs
    var DataSource = Object.freeze({
        YOUTUBE_PLAYLIST: 0,
        YOUTUBE_CHANNEL: 1,
        SHARED_PLAYLIST: 2
    });

    return DataSource;
});