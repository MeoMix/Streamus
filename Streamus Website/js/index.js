$(function() {
    'use strict';

    var installButtonView = Backbone.View.extend({
        el: $('#installButton'),

        events: {
            'click': 'install'
        },

        initialize: function () {

            if (chrome.app.isInstalled) {
                this.$el
                    .attr('disabled', true)
                    .text('Already installed');
            }
            
            if (typeof window.orientation !== 'undefined') {
                
                this.$el
                    .attr('disabled', true)
                    .text('PC required!');
            }
            
        },

        install: function () {

            this.$el
                .attr('disabled', true)
                .text('Installing...');

            var self = this;
            chrome.webstore.install('https://chrome.google.com/webstore/detail/jbnkffmindojffecdhbbmekbmkkfpmjd', function () {

                self.$el.text('Installed!');

            }, function (error) {
                
                if (error == 'User cancelled install') {
                    self.$el
                        .attr('disabled', false)
                        .text('Install extension now');
                } else {

                    self.$el.text('An error was encountered.');
                    window && console.error(error);
                    
                }
                
            });
        }
    });

    return new installButtonView;
});