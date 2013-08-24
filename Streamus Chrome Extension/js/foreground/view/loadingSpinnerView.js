//  TODO: It sucks that I have to declare these here, but loading spinner is needed for waiting for the foreground so I can't rely on them being loaded.
define([
    'jquery',
    'underscore',
    'backbone',
], function () {
    'use strict';

    var LoadingSpinnerView = Backbone.View.extend({

        className: 'loading',

        template: _.template($('#loadingSpinnerTemplate').html()),

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });

    return LoadingSpinnerView;
});