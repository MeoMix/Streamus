$(function () {
    'use strict';

    var BodyView = Backbone.View.extend({
        el: $('body'),
        
        navigationItems: $('ul.nav li'),

        events: {
            'click .logoWrapper a': 'goHome',
            'click *[data-contentid]': 'clicked'
        },
       
        installButton: new InstallButtonView,
        
        initialize: function () {

            var activeLink = this.$el.find('ul.nav li a[href="' + window.location.hash + '"]');

            if (activeLink.length > 0) {
                this.showViewBasedOnListItem(activeLink.parent());
            }

            var self = this;
            window.onhashchange = function() {

                var hash = $.trim(window.location.hash);

                if (hash !== '') {
                    self.showContentBasedOnHash(hash);
                } else {
                    // assume home if nothing.
                    self.showContentBasedOnHash('#home');
                }

            };

            //  Set the initial page if the hash is set on load.
            var initialHash = $.trim(window.location.hash);
            
            if (initialHash !== '') {
                this.showContentBasedOnHash(initialHash);
            }

        },
        
        showContentBasedOnHash: function(hash){

            var listItem = null;

            switch (hash) {
                case '#home':
                    listItem = this.$el.find('[data-contentid="' + 'homeContent' + '"]');
                    break;
                case '#getting-started':
                    listItem = this.$el.find('[data-contentid="' + 'gettingStartedContent' + '"]');
                    break;
                case '#about':
                    listItem = this.$el.find('[data-contentid="' + 'aboutContent' + '"]');
                    break;
                case '#contact':
                    listItem = this.$el.find('[data-contentid="' + 'contactContent' + '"]');
                    break;
                case '#terms-of-use':
                    listItem = this.$el.find('[data-contentid="' + 'touContent' + '"]');
                    break;
                case '#privacy':
                    listItem = this.$el.find('[data-contentid="' + 'privacyContent' + '"]');
                    break;
                default:
                    console.error("Unhandled hash:", window.location.hash);
                    break;
            }

            this.showViewBasedOnListItem(listItem);

        },
        
        //  Enable keeping track of the current content shown without affecting history and without actually changing the page.
        clicked: function (event) {

            var contentSelector = $(event.currentTarget);
            var contentId = contentSelector.data('contentid');
            
            switch(contentId) {
                case 'homeContent':
                    location.replace("#home");
                    break;
                case 'gettingStartedContent':
                    location.replace("#getting-started");
                    break;
                case 'aboutContent':
                    location.replace("#about");
                    break;
                case 'contactContent':
                    location.replace("#contact");
                    break;
                case 'touContent':
                    location.replace("#terms-of-use");
                    break;
                case 'privacyContent':
                    location.replace("#privacy");
                    break;
                default:
                    console.error("Unhandled contentId:", contentId);
            }

        },
        
        showViewBasedOnListItem: function (listItem) {
            this.$el.find('.active').removeClass('active');

            var contentId = listItem.data('contentid');

            listItem.addClass('active');

            $('.content').hide();

            $('#' + contentId).show();
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