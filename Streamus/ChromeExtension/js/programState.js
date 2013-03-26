//  A singleton which is used for configuration/debugging purposes currently.
define(function () {
    'use strict';
    var ProgramState = Backbone.Model.extend({
        defaults: {
            isLocal: true
        },
        //  Make sure to update the URL in manifest.json, too.
        getBaseUrl: function() {
            var baseUrl;
            if (this.get('isLocal')) {
                baseUrl = 'http://localhost:61975/';
            } else {
                baseUrl = 'http://streamus.apphb.com/';
            }

            return baseUrl;
        }
    });
    
    return new ProgramState();
});