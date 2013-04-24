//  Holds all the relevant data for a video.
define(['programState'], function(programState){
    'use strict';

    var videoModel = Backbone.Model.extend({
        defaults: {
            //  Provided by YouTube's API.
            id: '',
            title: '',
            author: '',
            duration: -1
        },
        urlRoot: programState.getBaseUrl() + 'Video/'
    });

    return function (config) {
        var video = new videoModel(config);
        return video;
    };
});