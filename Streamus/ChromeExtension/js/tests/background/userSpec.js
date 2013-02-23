//  Test cases for the background's user model. Hopes to ensure that the user
//  loads successfully from the server from a client-side id or, alternatively,
//  that it is created successfully by the server.
define(['loginManager'], function (loginManager) {
    'use strict';
    var userIdKey = 'UserId';
    
    describe('The User', function () {
        //  TODO: The way user is currently written isn't very testable.
        //  I would like to be able to test more specific actions such as the tests left blank here.

        xit('creates when no id found in storage locations', function () {
            localStorage.setItem(userIdKey, null);
        });

        xit('loads from chrome.sync if no id found in localStorage', function () {
            
        });

        xit('loads from localStorage', function() {
            
        });

        //  Makes sure a user loads. A bad test case because the user's loadability is dependent on code
        //  that isn't modifiable by this method, so I can only infer current state.
        xit('loads', function () {

            runs(function() {
                loginManager.login();
            });

            waitsFor(function() {
                return loginManager.get('loggedIn') === true;
            }, "The user should have loaded.", 5000);

            runs(function () {
                var user = loginManager.get('user');
                expect(user.isNew()).toBe(false);
            });
        });

    });
});