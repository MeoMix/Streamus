$(function () {
    'use strict';

    var BodyView = Backbone.View.extend({
        el: $('body'),
        
        navigationItems: $('ul.nav li'),

        events: {
            'click .logoWrapper a': 'goHome',
            'click ul.nav li': 'selectAndShowView',
            'click .footer a': 'selectAndShowView'
        },
        
        installButton: new InstallButtonView,
        
        //  Toggle between Home/Contact/About etc. 
        selectAndShowView: function(event) {

            var clickedItem = $(event.currentTarget);

            if (!clickedItem.hasClass('active')) {
                this.$el.find('.active').removeClass('active');
                
                var contentId = clickedItem.data('contentid');

                clickedItem.addClass('active');
                
                $('.content').hide();
                
                $('#' + contentId).show();
                
            }

        },
        
        goHome: function() {
            this.navigationItems.first().click();
        }

    });

    var bodyView = new BodyView;
    
    blueimp.Gallery( $('#links a') , {
        container: '#blueimp-gallery-carousel',
        carousel: true
    });

});