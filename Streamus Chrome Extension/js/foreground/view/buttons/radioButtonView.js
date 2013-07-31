define(['settingsManager'], function (settingsManager) {
    'use strict';

    var RadioButtonView = Backbone.View.extend({
        el: $('#RadioButton'),
        
        events: {
            'click': 'toggleRadio'
        },

        enabledTitle: 'Radio is enabled. Click to disable.',
        disabledTitle: 'Radio is disabled. Click to enable.',
        
        initialize: function () {
            //  Remember the initial state across pop-up sessions by writing to/from localStorage.

            if (settingsManager.get('radioEnabled')) {
                this.$el
                    .addClass('pressed')
                    .attr('title', this.enabledTitle);
            }
            
        },
        
        toggleRadio: function () {

            this.$el.toggleClass('pressed');
            
            var isPressed = this.$el.hasClass('pressed');
            
            if (isPressed) {
                this.$el.attr('title', this.enabledTitle);
            } else {
                this.$el.attr('title', this.disabledTitle);
            }

            settingsManager.set('radioEnabled', isPressed);
        }

    });

    return new RadioButtonView;
});