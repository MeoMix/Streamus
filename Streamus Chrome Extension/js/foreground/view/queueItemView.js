define(function () {
    'use strict';

    var QueueItemView = Backbone.View.extend({

        className: 'queueItem',

        template: _.template($('#queueItemTemplate').html()),
        
        events: {
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },
        
        initialize: function () {
            
        }
    });

    return QueueItemView;
});