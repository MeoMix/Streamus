//  TODO: Exposed globally for the foreground. Is there a better way?
var LoginManager = null;

define(['user'], function(User) {
    'use strict';

    var loginManagerModel = Backbone.Model.extend({
        defaults: {
            user: null
        },
        onLoggedIn: function(event) {
            if (this.get('user') === null) {
                this.once('change:user', event);
            } else {
                event();
            }
        },
        initialize: function() {
            var user = new User();
            var self = this;

            user.on('loaded', function () {
                self.set('user', this);
            });
        }
    });

    LoginManager = new loginManagerModel();

    return LoginManager;
});