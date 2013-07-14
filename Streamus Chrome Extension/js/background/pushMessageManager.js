define(['user', 'programState', 'pushMessage', 'backgroundManager', 'entityType', 'entityAction'], function(user, programState, PushMessage, backgroundManager, EntityType, EntityAction) {
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
                self.set('channelId', response.channelId);

                console.log("channelId set");
                
                if (user.get('loaded')) {
                    self.sendChannelIdToServer();
                } else {
                    user.once('change:loaded', function() {
                        self.sendChannelIdToServer();
                    });
                }
                
            });

            chrome.pushMessaging.onMessage.addListener(function (pushMessageDto) {

                var pushMessage = new PushMessage(JSON.parse(pushMessageDto.payload));

                console.log("pushMessage:", pushMessage);
                
                if (pushMessage.get('entityType') === EntityType.Playlist) {

                    var playlist = backgroundManager.getPlaylistById(pushMessage.get('entityId'));
                    
                    if (pushMessage.get('entityAction') == EntityAction.Refresh) {

                        console.log('Fetching');
                        playlist.fetch();
                        
                    }

                }

            });

        },
        
        sendChannelIdToServer: function () {

            $.ajax({
                url: programState.getBaseUrl() + 'User/AddChannelId',
                type: 'POST',
                dataType: 'json',
                data: {
                    userId: user.get('id'),
                    channelId: this.get('channelId')
                },
                error: function(error) {
                    console.error(error);
                }
            });
            
        }
    });

    var pushMessageManager = new pushMessageManagerModel();

    return pushMessageManager;
})