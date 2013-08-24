//  Holds all the relevant data for a client-side error
define([
    'settings'
], function (Settings) {
    'use strict';

    var Error = Backbone.Model.extend({
        
        defaults: {
            message: '',
            lineNumber: -1,
            url: '',
            clientVersion: chrome.app.getDetails().version,
            timeOccurred: new Date()
        },
        
        urlRoot: Settings.get('serverURL') + 'Error/'
       
    });

    return Error;
});