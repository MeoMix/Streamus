//  Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var SettingsManager = null;

//  Denormalization point for the Background's selected models.
define(['repeatButtonState'], function (RepeatButtonState) {
    'use strict';

    var settingsManagerModel = Backbone.Model.extend({
        
        defaults: function() {
            return {
                activeContentButtonId: getItem('activeContentButtonId') || 'HomeMenuButton',
                activeFolderId: getItem('activeFolderId') || null,
                activePlaylistId: getItem('activePlaylistId') || null,
                radioModeEnabled: getItem('radioModeEnabled') || false,
                repeatButtonState: getItem('repeatButtonState') || RepeatButtonState.DISABLED,
                shuffleEnabled: getItem('shuffleEnabled') || false,
                suggestedQuality: getItem('suggestedQuality') || 'default',
                userId: getItem('userId') || null,
            };
        },
        
        initialize: function () {
            
            this.on('change:activeContentButtonId', function (model, activeContentButtonId) {
                localStorage.setItem('activeContentButtonId', activeContentButtonId);
            });

            this.on('change:activeFolderId', function (model, activeFolderId) {
                localStorage.setItem('activeFolderId', JSON.stringify(activeFolderId));
            });

            this.on('change:activePlaylistId', function (model, activePlaylistId) {
                localStorage.setItem('activePlaylistId', JSON.stringify(activePlaylistId));
            });

            this.on('change:radioModeEnabled', function(model, radioModeEnabled) {
                localStorage.setItem('radioModeEnabled', JSON.stringify(radioModeEnabled));
            });
            
            this.on('change:repeatButtonState', function (model, repeatButtonState) {
                localStorage.setItem('repeatButtonState', JSON.stringify(repeatButtonState));
            });

            this.on('change:shuffleEnabled', function (model, shuffleEnabled) {
                localStorage.setItem('shuffleEnabled', JSON.stringify(shuffleEnabled));
            });
            
            this.on('change:suggestedQuality', function(model, suggestedQuality) {
                localStorage.setItem('suggestedQuality', suggestedQuality);
            });
            
            this.on('change:userId', function (model, userId) {
                localStorage.setItem('userId', JSON.stringify(userId));
            });
        }
  
    });
    
    //  Fetch an item from localStorage, try and turn it from a string to an object literal if possible.
    //  If not, just allow the string type because its assumed to be correct.
    function getItem(key) {
        var item = localStorage.getItem(key);
        
        if (item !== null) {
            
            try {
                //  Make sure I don't send back 'null' or 'undefined' as string types.
                item = JSON.parse(item);
            } catch(exception) {
                //  Consume any exceptions because might try and parse a GUID which isn't valid JSON.
            }
        }

        return item;
    }
    
    SettingsManager = new settingsManagerModel();
    return SettingsManager;
});