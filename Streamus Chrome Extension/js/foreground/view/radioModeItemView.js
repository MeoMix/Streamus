define(['backgroundManager'], function (backgroundManager) {
    'use strict';

    var RadioModeItemView = Backbone.View.extend({

        template: _.template($('#radioModeItemTemplate').html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },
        
        initialize: function () {

        }
    });

    return RadioModeItemView;
});