//  When clicked -- goes to the next video. Can potentially go from the end of the list to the front if repeat playlist is toggled on
define(['streamItems', 'settingsManager', 'repeatButtonState'], function (StreamItems, settingsManager, RepeatButtonState) {
    'use strict';

    var nextButtonView = Backbone.View.extend({
        el: $('#NextButton'),

        events: {
            'click': 'gotoNextVideo'
        },

        render: function () {

<<<<<<< HEAD
            if (backgroundManager.get('activePlaylistItem') === null) {
                this.disable();
            } else {
                this.enable();
            }

            return this;
        },

        initialize: function () {
            this.listenTo(backgroundManager, 'change:activePlaylistItem', this.render);
            this.render();
        },

        //  Prevent spamming by only allowing a next click once every 100ms.
        gotoNextVideo: _.debounce(function () {

            if (!this.$el.hasClass('disabled')) {

                var activePlaylistItem = backgroundManager.get('activePlaylistItem');
                var playlistId = activePlaylistItem.get('playlistId');
                var playlist = backgroundManager.getPlaylistById(playlistId);

                var nextItem = playlist.gotoNextItem();

                backgroundManager.set('activePlaylistItem', nextItem);

                //  Manually triggering the change so that player can realize it needs to set its time back to 0:00.
                if (activePlaylistItem === nextItem) {
                    backgroundManager.trigger('change:activePlaylistItem', backgroundManager, nextItem);
                }
            }

        }, 100, true),

        //  Paint the button's path black and bind its click event.
        enable: function () {
            this.$el.prop('src', 'images/skip.png').removeClass('disabled');
        },

=======
            if (StreamItems.length === 0) {
                this.disable();
            } else {

                var radioModeEnabled = settingsManager.get('radioModeEnabled');
                var shuffleEnabled = settingsManager.get('shuffleEnabled');
                var repeatButtonState = settingsManager.get('repeatButtonState');
                
                if (shuffleEnabled && StreamItems.length > 1) {
                    this.enable();
                }
                else if (radioModeEnabled || repeatButtonState !== RepeatButtonState.DISABLED) {
                    this.enable();
                } else {
                    //  Disable only if on the last item in stream with no options enabled.
                    var selectedItemIndex = StreamItems.indexOf(StreamItems.findWhere({ selected: true }));
                    
                    if (selectedItemIndex + 1 === StreamItems.length) {
                        this.disable();
                    } else {
                        this.enable();
                    }

                }

            }

            return this;
        },

        initialize: function () {
            this.listenTo(StreamItems, 'add addMultiple remove empty change:selected', this.render);
            this.listenTo(settingsManager, 'change:radioModeEnabled change:shuffleEnabled change:repeatButtonState', this.render);

            this.render();
        },

        //  Prevent spamming by only allowing a next click once every 100ms.
        gotoNextVideo: _.debounce(function () {

            if (!this.$el.hasClass('disabled')) {
                StreamItems.selectNext();
            }

        }, 100, true),

        //  Paint the button's path black and bind its click event.
        enable: function () {
            this.$el.prop('src', 'images/skip.png').removeClass('disabled');
        },

>>>>>>> origin/Development
        //  Paint the button's path gray and unbind its click event.
        disable: function () {
            this.$el.prop('src', 'images/skip-disabled.png').addClass('disabled');
        }

    });

    //  TODO: Maybe should be returned to be part of a bigger picture, but for now it is self-enclosing.
    var nextButton = new nextButtonView;
});