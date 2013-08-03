//  Holds all the relevant data for a video.
define(['settings'], function(Settings){
    'use strict';

    var videoModel = Backbone.Model.extend({
        defaults: {
            //  Provided by YouTube's API.
            id: '',
            title: '',
            author: '',
            duration: -1
        },
        urlRoot: Settings.get('serverURL') + 'Video/'
    });

    return function (config) {

        //  Support passing raw YouTube videoInformation instead of a precise config object.
        if (config.videoInformation !== undefined) {
            
            config.id = config.videoInformation.media$group.yt$videoid.$t;
            config.title = config.videoInformation.title.$t;
            config.duration = parseInt(config.videoInformation.media$group.yt$duration.seconds, 10);
            config.author = config.videoInformation.author[0].name.$t;

        }

        var video = new videoModel(config);
        return video;
    };
});