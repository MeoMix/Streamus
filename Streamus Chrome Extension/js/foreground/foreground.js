//  When the foreground is loaded it will load all the ui elements. Grouped like this so I can wait for the
//  background YouTube player to load entirely before allowing foreground to open.
define([
    'settings',
    'backgroundManager',

    'activeFolderView',
    'activePlaylistView',

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
    
    'playlistInput',
    'streamView'
], function (Settings, BackgroundManager, ActiveFolderView, ActivePlaylistView) {
    'use strict';

    //  TODO: There should probably be a ContentButtonView and Model which keep track of these properties and not just done on the ForegroundView.
    var ForegroundView = Backbone.View.extend({

        el: $('#contentWrapper'),

        activeFolderView: new ActiveFolderView({
            model: BackgroundManager.get('activeFolder')
        }),

        activePlaylistView: new ActivePlaylistView({
            model: BackgroundManager.get('activeFolder').getActivePlaylist()
        }),

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
            this.activePlaylistView.$el.trigger('manualShow');
        },

        initialize: function () {
            var self = this;

            this.listenTo(BackgroundManager, 'change:activeFolder', function (folder, isActive) {

                if (isActive) {
                    self.activeFolderView.model.set(folder);
                }

            });

            //  TODO: if activeFolder changes I think I'll need to unbind and rebind
            var activeFolder = BackgroundManager.get('activeFolder');
            this.listenTo(activeFolder.get('playlists'), 'change:active', function (playlist, isActive) {

                if (isActive) {
                    console.log("Setting activePlaylistView's model to:", playlist, self.activePlaylistView.model, self.activePlaylistView.model == playlist);
                    self.activePlaylistView.model.set(playlist);
                }

            });
        
            //  Set the initially loaded content to whatever was clicked last or the home page as a default
            var activeContentButtonId = Settings.get('activeContentButtonId');
            var activeButton = $('#' + activeContentButtonId);

            this.setMenuButtonActive(activeButton);
        },

        showContent: function (event) {

            var clickedMenuButton = $(event.currentTarget);

            this.setMenuButtonActive(clickedMenuButton);
        },
        
        setMenuButtonActive: function(menuButton) {

            //  Clear content and show new content based on button clicked.
            $('.menubutton').removeClass('active');
            menuButton.addClass('active');

            Settings.set('activeContentButtonId', menuButton[0].id);

            this.render();
        }

    });

    return new ForegroundView;
});