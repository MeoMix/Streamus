var InstallButtonView = Backbone.View.extend({
    el: $('#installButton'),

    events: {
        'click': 'install'
    },

    initialize: function () {

        var browserIsNotChrome = navigator.userAgent.toLowerCase().indexOf('chrome') === -1;

        if (browserIsNotChrome) {
            this.$el
                .attr('disabled', true)
                .text('Google Chrome required');
        }

        //  http://stackoverflow.com/questions/17129261/detect-mobile-browser-with-javascript-detectmobilebrowsers-returns-false-for-m
        if (window.mobileCheck || screen.width < 768) {

            this.$el
                .attr('disabled', true)
                .text('PC required');

        }
    },

    install: function () {

        if (!this.$el.attr('disabled')) {

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

    }
});