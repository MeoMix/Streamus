define(['localStorageManager'], function (localStorageManager) {
    'use strict';

    var radioModeButtonView = Backbone.View.extend({
        el: $('#RadioModeButton'),
        
        events: {
            'click': 'toggleRadioMode'
        },

        enabledTitle: 'Radio Mode is enabled. Click to disable.',
        disabledTitle: 'Radio Mode is disabled. Click to enable.',
        
        initialize: function () {
            
            var isRadioModeEnabled = localStorageManager.getIsRadioModeEnabled();
            
            if (isRadioModeEnabled) {
                this.$el
                    .addClass('pressed')
                    .attr('title', this.enabledTitle);
            }
            
        },
        
        toggleRadioMode: function () {

            this.$el.toggleClass('pressed');
            
            var isPressed = this.$el.hasClass('pressed');
            
            if (isPressed) {
                this.$el.attr('title', this.enabledTitle);
            } else {
                this.$el.attr('title', this.disabledTitle);
            }

            localStorageManager.setIsRadioModeEnabled(isPressed);
        }

    });

    var radioModeButton = new radioModeButtonView;
});