//  A singleton representing the sole logged on user for the program.
//  Tries to load itself by ID stored in localStorage and then by chrome.storage.sync.
//  If still unloaded, tells the server to create a new user and assumes that identiy.
define(['streams', 'programState'], function (Streams, programState) {
    'use strict';
    var userIdKey = 'UserId';

    //  User data will be loaded either from cache or server.
    var User = Backbone.Model.extend({
        defaults: {
            id: '49713F20-2ED0-4E01-A06A-CAA9A3A02408', //localStorage.getItem(userIdKey),
            name: '',
            streams: new Streams()
        },
        
        urlRoot: programState.getBaseUrl() + 'User/',
        
        //  TODO: I am doing too much work in this initialize constructor. 
        initialize: function () {
            //  If user's ID wasn't found in local storage, check sync because its a pc-shareable location, but doesn't work synchronously.
            if (this.isNew()) {
                var self = this;
                //  chrome.Storage.sync is cross-computer syncing with restricted read/write amounts.
                
                chrome.storage.sync.get(userIdKey, function (data) {
                    //  Look for a user id in sync, it might be undefined though.
                    var foundUserId = data[userIdKey];

                    if (typeof foundUserId === 'undefined') {
                        
                        //  No stored ID found at any client storage spot. Create a new user and use the returned user object.
                        self.save({}, {
                            
                            //  TODO: I might need to pull properties out of returned server data and manually push into model.
                            //  Currently only care about userId, name can't be updated.
                            success: function (model) {
                                //  Announce that user has loaded so managers can use it to fetch data.
                                self.trigger('loaded');
                            },
                            error: function(error) {
                                window && console.error(error);
                            }
                        });

                    } else {
                        //  Update the model's id to proper value and call fetch to retrieve all data from server.
                        self.set('id', foundUserId);
                        fetchUser.call(self, false);
                    }
                });

            } else {
                //  User's ID was found in localStorage. Load immediately.
                fetchUser.call(this, true);
            }
        }
    });
    

    //  Loads user data by ID from the server, writes the ID
    //  to client-side storage locations for future loading and then announces
    //  that the user has been loaded fully.

    function fetchUser(shouldSetSyncStorage) {
        var self = this;
        this.fetch({
            success: function (model) {
                //  Have to manually convert the JSON array into a Backbone.Collection

                var streams = new Streams(model.get('streams'));

                self.set('streams', streams, {
                    //  Silent operation because streams isn't technically changing - just being made correct.
                    silent: true
                });

                //  TODO: Error handling for writing to sync too much.
                //  Write to sync as little as possible because it has restricted read/write limits per hour.
                if (shouldSetSyncStorage) {
                    chrome.storage.sync.set({ userIdKey: model.get('id') });
                }

                localStorage.setItem(userIdKey, model.get('id'));

                //  Announce that user has loaded so managers can use it to fetch data.
                model.trigger('loaded');
            },
            error: function (error) {
                window && console.error(error);
            }
        });
    }

    //  Only ever instantiate one User.
    return _.once(function(config) {
        var user = new User(config);
        return user;
    });
});