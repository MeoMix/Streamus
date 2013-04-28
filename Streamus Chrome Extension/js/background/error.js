//  Holds all the relevant data for a client-side error
define(['programState'], function (programState) {
    'use strict';

    var errorModel = Backbone.Model.extend({
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
        var error = new errorModel(config);
        return error;
    };
});