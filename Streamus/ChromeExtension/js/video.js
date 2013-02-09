//  Holds all the relevant data for a video.
define(['programState'], function(programState){
    'use strict';

    var Video = Backbone.Model.extend({
        defaults: {
            //  Provided by YouTube's API.
            id: '',
            title: '',
            duration: -1
        },
        urlRoot: programState.getBaseUrl() + 'Video/',
        save: function (attributes, options) {
            chrome.extension.getBackgroundPage().VideoManager.cache(this);
            return Backbone.Model.prototype.save.call(this, attributes, options);
        }
    });

    return function (config) {
        var video = new Video(config);
        return video;
    };
});