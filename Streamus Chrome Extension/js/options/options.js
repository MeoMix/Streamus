define([
    'settings',
    'player'
], function (Settings, Player) {
    'use strict';

    var suggestedQualitySelectView = Backbone.View.extend({
        el: $('#suggestedQualitySelect'),
        
        events: {
            'change': 'setSuggestedQuality'
        },
        
        initialize: function() {
            //  Initialize to whatever's stored in localStorage.
            this.$el.val(Settings.get('suggestedQuality'));
        },
        
        setSuggestedQuality: function () {
            
            //  Write user's choice to localStorage.
            var suggestedQuality = this.$el.val();

            Settings.set('suggestedQuality', suggestedQuality);
            Player.setSuggestedQuality(suggestedQuality);

        }
    });

    return new suggestedQualitySelectView;
});