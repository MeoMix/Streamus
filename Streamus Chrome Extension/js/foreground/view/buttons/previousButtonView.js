//  When clicked -- skips to the last video. Skips from the begining of the list to the end.
define([
    'streamItems',
    'settings',
    'repeatButtonState'
], function (StreamItems, Settings, RepeatButtonState) {
    'use strict';

    var PreviousButtonView = Backbone.View.extend({
        el: $('#PreviousButton'),
        
        events: {
            'click': 'gotoPreviousVideo'
        },
        
        render: function () {
 
            if (StreamItems.length === 0) {
                this.disable();
            } else {

                var shuffleEnabled = Settings.get('shuffleEnabled');
                var repeatButtonState = Settings.get('repeatButtonState');
                
                if (shuffleEnabled && StreamItems.length > 1) {
                    this.enable();
                }
                else if(repeatButtonState !== RepeatButtonState.DISABLED) {
                    this.enable();
                } else {
                    //  Disable only if on the first item in stream with no options enabled.
                    var selectedItemIndex = StreamItems.indexOf(StreamItems.findWhere({ selected: true }));

                    if (selectedItemIndex === 0) {
                        this.disable();
                    } else {
                        this.enable();
                    }

                }

            }

            return this;
        },
        
        initialize: function () {
            this.$el.attr('title', chrome.i18n.getMessage("backPreviousVideo"));

            this.listenTo(StreamItems, 'add addMultiple empty remove change:selected', this.render);
            this.listenTo(Settings, 'change:radioEnabled change:shuffleEnabled change:repeatButtonState', this.render);

            this.render();
        },
        
        //  Prevent spamming by only allowing a previous click once every 100ms.
        gotoPreviousVideo: _.debounce(function () {

            if (!this.$el.hasClass('disabled')) {
                StreamItems.selectPrevious();
            }

        }, 100, true),
        
        //  Paint the button's path black and bind its click event.
        enable: function() {
            this.$el.prop('src', 'images/skip.png').removeClass('disabled');
        },
        
        //  Paint the button's path gray and unbind its click event.
        disable: function() {
            this.$el.prop('src', 'images/skip-disabled.png').addClass('disabled');
        }
    });

    return new PreviousButtonView;
});