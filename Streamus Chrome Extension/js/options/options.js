define(['settingsManager', 'player'], function(settingsManager, player){
    'use strict';

    var suggestedQualitySelectView = Backbone.View.extend({
        el: $('#suggestedQualitySelect'),
        
        events: {
            'change': 'setSuggestedQuality'
        },
        
        initialize: function() {
            //  Initialize to whatever's stored in localStorage.
            this.$el.val(settingsManager.get('suggestedQuality'));
        },
        
        setSuggestedQuality: function () {
            
            //  Write user's choice to localStorage.
            var suggestedQuality = this.$el.val();

            settingsManager.set('suggestedQuality', suggestedQuality);
            player.setSuggestedQuality(suggestedQuality);

        }
    });

    return new suggestedQualitySelectView;
});