define(['user'], function(User) {
    'use strict';

    var LoginManager = Backbone.Model.extend({
        defaults: {
            loggedIn: false,
            user: null
        },
        login: function() {
            if (!this.get('loggedIn')) {
                var user = new User();
                var self = this;

                user.on('loaded', function() {
                    console.log("User has loaded, triggering loggedIn");
                    self.set('loggedIn', true);
                    self.set('user', this);
                    self.trigger('loggedIn');
                });
            } else {
                //   TODO: I am not sure if it is smart to trigger an event when already logged in.
                this.trigger('loggedIn');
            }
        }
    });

    return new LoginManager();
});