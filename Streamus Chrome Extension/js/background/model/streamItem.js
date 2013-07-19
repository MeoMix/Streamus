//  When clicked -- goes to the next video. Can potentially go from the end of the list to the front if repeat playlist is toggled on
define(function () {
    'use strict';
   
    var StreamItem = Backbone.Model.extend({
        defaults: function () {
            return {
                // TODO: Figure out all the properties this model needs.
                videoId: '',
                title: 'Empty Stream Item',
                videoImageUrl: ''
            };
        },

        // New instances of this model will have a 'dud' sync function
        sync: function () { return false; }
    });

    return StreamItem;
});