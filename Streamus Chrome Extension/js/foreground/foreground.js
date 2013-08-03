//  When the foreground is loaded it will load all the ui elements. Grouped like this so I can wait for the
//  background YouTube player to load entirely before allowing foreground to open.
define([
    'settings',
    'backgroundManager',
    'volumeControlView',
    'playPauseButtonView',
    'nextButtonView',
    'previousButtonView',
    'shuffleButtonView',
    'radioButtonView',
    'repeatButtonView',
    'progressBarView',
    'videoDisplayView',
    'headerTitleView',
    'playlistItemInput',
    'playlistItemsView',
    'playlistInput',
    'playlistsView',
    'streamView'
], function (Settings) {
    'use strict';

    //  TODO: There should probably be a ContentButtonView and Model which keep track of these properties and not just done on the ForegroundView.
    var ForegroundView = Backbone.View.extend({

        el: $('#contentWrapper'),

        events: {
            //  TODO: Naming of menubutton vs content
            'click .menubutton': 'showContent'
        },

        render: function(){
            $('.content').hide();

            //  TODO: Pull active from a MenuButton collection instead of analyzing the View.
            var activeMenuButton = $('.menubutton.active');
            var activeContentId = activeMenuButton.data('content');
            
            $('#' + activeContentId).show();
        },

        initialize: function(){
        
            //  Set the initially loaded content to whatever was clicked last or the home page as a default
            var activeContentButtonId = Settings.get('activeContentButtonId');
            $('#' + activeContentButtonId).click();

            //  Close the foreground whenever the PC goes idle.
            chrome.idle.onStateChanged.addListener(function (newState) {

                if (window && newState === 'idle') {
                    window.close();
                }

            });

        },

        showContent: function (event) {

            var clickedMenuButton = $(event.currentTarget);

            //  Clear content and show new content based on button clicked.
            $('.menubutton').removeClass('active');
            clickedMenuButton.addClass('active');

            Settings.set('activeContentButtonId', clickedMenuButton[0].id);

            this.render();
        }

    });

    return new ForegroundView;
});