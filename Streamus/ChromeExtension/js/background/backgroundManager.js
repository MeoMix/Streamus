//  TODO: Exposed globally for the foreground. Is there a better way?
var BackgroundManager = null;

//  Denormalization point for the Background's selected models.
define(['user'], function (user) {
    'use strict';

    var BackgroundManagerModel = Backbone.Model.extend({
        defaults: {
            selectedItem: null,
            selectedPlaylist: null,
            selectedStream: null
        },
        initialize: function() {
            var selectedStream = user.get('streams').at(0);
            this.set('selectedStream', selectedStream);


        }
    });

    BackgroundManager = new BackgroundManagerModel();

    return BackgroundManager;
});