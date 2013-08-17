define([
    'activeFolderView',
    //  TODO: Convert playlistInput to a View
    'playlistInput'
], function (ActiveFolderView) {
    'use strict';

    var ActiveFolderTabView = Backbone.View.extend({
            
        activeFolderView: null,
        
        initialize: function() {

            //  TODO: Do I have to set this in initialize or can I do it through the property?
            this.activeFolderView = new ActiveFolderView({
                model: this.model
            });

        },
        
        changeModel: function(newModel) {
            this.model = newModel;
            
            //  TODO: Destroy and re-create the view instead of calling changeModel.
            this.activeFolderView.changeModel(newModel);
        }


    });

    return ActiveFolderTabView;
});