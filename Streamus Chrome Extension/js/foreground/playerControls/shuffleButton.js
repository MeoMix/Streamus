define(['localStorageManager'], function(localStorageManager){
    'use strict';

    var shuffleButtonView = Backbone.View.extend({
        el: $('#ShuffleButton'),
        
        events: {
            'click': 'toggleShuffleVideo'
        },
        
        enabledTitle: 'Playlist shuffling is enabled. Click to disable.',
        disabledTitle: 'Playlist shuffling is disabled. Click to enable.',
        
        initialize: function() {
            //  Remember the initial state across pop-up sessions by writing to/from localStorage.
            var isShuffleEnabled = localStorageManager.getIsShuffleEnabled();
            
            if (isShuffleEnabled) {
                this.$el
                    .addClass('pressed')
                    .attr('title', this.enabledTitle);
            }
            
        },
        
        toggleShuffleVideo: function () {

            this.$el.toggleClass('pressed');
            
            var isPressed = this.$el.hasClass('pressed');
            
            if (isPressed) {
                this.$el.attr('title', this.enabledTitle);
            } else {
                this.$el.attr('title', this.disabledTitle);
            }

            localStorageManager.setIsShuffleEnabled(isPressed);
        }
        
    });
    
    var shuffleButton = new shuffleButtonView;
});