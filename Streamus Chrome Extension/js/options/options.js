define(['localStorageManager', 'player'], function(localStorageManager, player){
    'use strict';

    var suggestedQualitySelectView = Backbone.View.extend({
        el: $('#suggestedQualitySelect'),
        
        events: {
            'change': 'setSuggestedQuality'
        },
        
        initialize: function() {
            
            //  Initialize to whatever's stored in localStorage.
            var suggestedQuality = localStorageManager.getSuggestedQuality();
            this.$el.val(suggestedQuality);
            
        },
        
        setSuggestedQuality: function () {
            
            //  Write user's choice to localStorage.
            var suggestedQuality = this.$el.val();

            localStorageManager.setSuggestedQuality(suggestedQuality);
            player.setSuggestedQuality(suggestedQuality);

        }
    });

    return new suggestedQualitySelectView;
});