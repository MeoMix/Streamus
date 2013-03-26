//  Holds all the relevant data for a client-side error
define(['programState'], function (programState) {
    'use strict';

    var Error = Backbone.Model.extend({
        defaults: {
            message: '',
            lineNumber: -1,
            url: '',
            clientVersion: chrome.app.getDetails().version,
            timeOccurred: new Date()
        },
        urlRoot: programState.getBaseUrl() + 'Error/'
    });

    return function (config) {
        var video = new Error(config);
        return video;
    };
});