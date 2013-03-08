//  TODO: Exposed globally for the foreground. Is there a better way?
var LocalStorageManager = null;

//  Denormalization point for the Background's selected models.
define(function () {
    'use strict';

    //  Playlists store selected item client-side because it can change so often.
    var localStorageKey = this.get('id') + '_selectedItemId';
    var savedItemId = localStorage.getItem(localStorageKey);


    var LocalStorageManagerModel = Backbone.Model.extend({
        defaults: {
        },
        initialize: function () {
        },
        getSelectedItemId: function(){
            var selectedIof temId = localStorage.getItem('selectedItemId');
            
        }
        
    });

    LocalStorageManager = new LocalStorageManagerModel();

    return LocalStorageManager;
});