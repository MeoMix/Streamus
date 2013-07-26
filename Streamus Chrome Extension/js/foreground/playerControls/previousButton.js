//  When clicked -- skips to the last video. Skips from the begining of the list to the end.
define(['streamItems', 'settingsManager', 'repeatButtonState'], function (StreamItems, settingsManager, RepeatButtonState) {
    'use strict';

    var previousButtonView = Backbone.View.extend({
        el: $('#PreviousButton'),
<<<<<<< HEAD
        
        events: {
            'click': 'gotoPreviousVideo'
        },
        
        render: function () {
            
            if (backgroundManager.get('activePlaylistItem') === null) {
                this.disable();
            } else {
                this.enable();
            }

            return this;
        },
        
        initialize: function() {
            this.listenTo(backgroundManager, 'change:activePlaylistItem', this.render);
            this.render();
        },
        
        //  Prevent spamming by only allowing a previous click once every 100ms.
        gotoPreviousVideo: _.debounce(function () {

            if (!this.$el.hasClass('disabled')) {
                
                var activePlaylistItem = backgroundManager.get('activePlaylistItem');
                var playlistId = activePlaylistItem.get('playlistId');
                var playlist = backgroundManager.getPlaylistById(playlistId);

                var previousItem = playlist.gotoPreviousItem();
                backgroundManager.set('activePlaylistItem', previousItem);
                
            }

=======
        
        events: {
            'click': 'gotoPreviousVideo'
        },
        
        render: function () {
 
            if (StreamItems.length === 0) {
                this.disable();
            } else {

                var shuffleEnabled = settingsManager.get('shuffleEnabled');
                var repeatButtonState = settingsManager.get('repeatButtonState');
                
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
        
        initialize: function() {
            this.listenTo(StreamItems, 'add addMultiple empty remove change:selected', this.render);
            this.listenTo(settingsManager, 'change:radioModeEnabled change:shuffleEnabled change:repeatButtonState', this.render);

            this.render();
        },
        
        //  Prevent spamming by only allowing a previous click once every 100ms.
        gotoPreviousVideo: _.debounce(function () {

            if (!this.$el.hasClass('disabled')) {
                StreamItems.selectPrevious();
            }

>>>>>>> origin/Development
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

    //  TODO: Maybe should be returned to be part of a bigger picture, but for now it is self-enclosing.
    var previousButton = new previousButtonView;
});