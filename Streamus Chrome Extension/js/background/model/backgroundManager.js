//  Exposed globally so that foreground.js is able to access via chrome.getBackgroundPage
var BackgroundManager = null;

//  BackgroundManager is a denormalization point for the Background's selected models.
define([
    'user',
    'player',
    'folders'
], function (User, Player, Folders) {
    'use strict';

    var backgroundManagerModel = Backbone.Model.extend({
        defaults: {
            activeFolder: null,
        },
        initialize: function () {

            var self = this;
            //  TODO:  What if user's loaded state gets set before backgroundManager initializes? Not really possible unless instant response, but still.
            User.on('change:loaded', function (model, loaded) {

                if (loaded) {

                    if (User.get('folders').length === 0) {
                        throw "User should be initialized and have at least 1 folder before loading backgroundManager.";
                    }

                    //  TODO: I hate this whole concept of having to check if its ready else wait for it to be ready.
                    //  Do not initialize the backgroundManager until player is ready to go.
                    if (Player.get('ready')) {
                        self.set('activeFolder', User.get('folders').at(0));
                    } else {
                        Player.once('change:ready', function () {
                            self.set('activeFolder', User.get('folders').at(0));
                        });
                    }

                } else {
                    
                    //  Unload streamus when refreshing ??
                    self.set('activeFolder', null);
                }

            });
            
        }
    });
        

    BackgroundManager = new backgroundManagerModel();

    return BackgroundManager;
});