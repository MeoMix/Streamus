define([
    'activePlaylistView',
    //  TODO: Convert playlistItemInput to a View
    'playlistItemInput'
], function (ActivePlaylistView) {
    'use strict';

    var ActivePlaylistTabView = Backbone.View.extend({

        activePlaylistView: null,

        initialize: function () {

            //  TODO: Do I have to set this in initialize or can I do it through the property?
            this.activePlaylistView = new ActivePlaylistView({
                model: this.model
            });
           
        },

        changeModel: function (newModel) {
            this.model = newModel;

            //  TODO: Destroy and re-create the view instead of calling changeModel.
            this.activePlaylistView.changeModel(newModel);
        }

    });

    return ActivePlaylistTabView;
});