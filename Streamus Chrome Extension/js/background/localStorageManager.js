//  TODO: Exposed globally for the foreground. Is there a better way?
var LocalStorageManager = null;

//  Denormalization point for the Background's selected models.
define(['repeatButtonStates'], function (repeatButtonStates) {
    'use strict';

    var localStorageManagerModel = Backbone.Model.extend({
        
        defaults: {
            suggestedQuality: 'default'
        },

        getActiveStreamId: function() {
            var activeStreamId = getItem('activeStreamId');
            return activeStreamId;
        },
        
        setActiveStreamId: function (activeStreamId) {
            localStorage.setItem('activeStreamId', JSON.stringify(activeStreamId));
        },
        
        getActivePlaylistId: function() {
            var activePlaylistId = getItem('activePlaylistId');
            return activePlaylistId;
        },
        
        setActivePlaylistId: function(activePlaylistId) {
            localStorage.setItem('activePlaylistId', JSON.stringify(activePlaylistId));
        },
        
        getActivePlaylistItemId: function() {
            var activePlaylistItemId = getItem('activePlaylistItemId');
            return activePlaylistItemId;
        },
        
        setActivePlaylistItemId: function(activePlaylistItemId) {
            localStorage.setItem('activePlaylistItemId', JSON.stringify(activePlaylistItemId));
        },
        
        getIsMuted: function () {
            var isMuted = getItem('isMuted');
            return isMuted;
        },
        
        setIsMuted: function (isMuted) {
            localStorage.setItem('isMuted', JSON.stringify(isMuted));
        },
        
        getIsRadioModeEnabled: function () {
            var isRadioModeEnabled = getItem('isRadioModeEnabled') || false;
            return isRadioModeEnabled;
        },
        
        setIsRadioModeEnabled: function(isRadioModeEnabled) {
            localStorage.setItem('isRadioModeEnabled', JSON.stringify(isRadioModeEnabled));
        },
        
        getIsShuffleEnabled: function() {
            var isShuffleEnabled = getItem('isShuffleEnabled') || false;
            return isShuffleEnabled;
        },
        
        setIsShuffleEnabled: function (isShuffleEnabled) {
            localStorage.setItem('isShuffleEnabled', JSON.stringify(isShuffleEnabled));
        },
        
        getRepeatButtonState: function() {
            var repeatButtonState = getItem('repeatButtonState') || repeatButtonStates.DISABLED;
            return repeatButtonState;
        },
        
        setRepeatButtonState: function (repeatButtonState) {
            localStorage.setItem('repeatButtonState', JSON.stringify(repeatButtonState));
        },
        
        getUserId: function() {
            return localStorage.getItem('UserId') || null;
        },
        
        setActiveContentButtonId: function(activeContentButtonId) {
            localStorage.setItem('activeContentButtonId', activeContentButtonId);
        },
        
        getActiveContentButtonId: function() {
            return localStorage.getItem('activeContentButtonId') || 'HomeMenuButton';
        },
        
        getSuggestedQuality: function() {
            return localStorage.getItem('suggestedQuality') || this.get('suggestedQuality');
        },
        
        setSuggestedQuality: function (suggestedQuality) {
            //  Whenever the suggestedQuality is changed -- player needs to know about it so it'll subscribe to this property changing.
            localStorage.setItem('suggestedQuality', suggestedQuality);

            console.log('Set suggested quality');
            this.set('suggestedQuality', suggestedQuality);
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
    
    LocalStorageManager = new localStorageManagerModel();
    return LocalStorageManager;
});