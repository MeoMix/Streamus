define(function() {
    'use strict';
    var ProgramState = Backbone.Model.extend({
        defaults: {
            isLocal: true
        },
        //  Make sure to update the URL in manifest.json, too -- it can't read from here.
        getBaseUrl: function() {
            var baseUrl;
            if (this.get('isLocal')) {
                baseUrl = 'http://localhost:61975/';
            } else {
                baseUrl = 'http://ec2-54-234-89-248.compute-1.amazonaws.com/Streamus/';
            }

            return baseUrl;
        }
    });
    
    return new ProgramState();
});