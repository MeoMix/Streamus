define(function() {
    'use strict';
    


    var pushMessageManagerModel = Backbone.Model.extend({
        defaults: {
            channelId: null
            
        },

        initialize: function () {
            var self = this;
            //  When the interactive flag is set to true, the user is asked to log in if they haven't already done so with a warning dialog that looks
            //  something like this: "You must log into Chrome for the Calendar extension to receive push messages. Log in now?"

            //To provide your users with a better experience, the interactive flag should be set to false the first time your app or extension calls getChannelId. 
            //Otherwise users will see the sign-in dialog with no context, even before they start your app or extension. If the first call fails because the user is not logged in, 
            //then getChannelId can be called again with the flag set to true. You should provide a context dialog before the second call is made.
            chrome.pushMessaging.getChannelId(true, function (response) {
                self.channelId = response.channelId;
                console.log("getChannelId:", response);
            });

            chrome.pushMessaging.onMessage.addListener(function (message) {
                
                if (message.event == null) {
                    throw "Expected message to contain an event.";
                }
                
                switch (message.event) {
                    case '':
                        break;
                        
                    default:
                        console.error("Unhandled message event:", message.event);
                        
                }

                console.log("Message received", message);
            });

        }
    });

    var pushMessageManager = new pushMessageManagerModel();

    return pushMessageManager;
})