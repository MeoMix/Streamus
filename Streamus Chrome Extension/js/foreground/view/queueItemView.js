define(function () {
    'use strict';

    var QueueItemView = Backbone.View.extend({

        className: 'queueItem',

        template: _.template($('#queueItemTemplate').html()),
        
        events: {
            'contextmenu': 'showContextMenu',
            'click': 'toggleSelected'
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },
        
        initialize: function (options) {
            this.parent = options.parent;
            
            this.listenTo(this.model, 'destroy', this.remove);
        },
        
        toggleSelected: function() {
            this.$el.toggleClass('selected');
        },
        
        showContextMenu: function (event) {
            //  TODO: I don't feel great about telling the parent to show context menu
            this.parent.showContextMenu(event, this.model);
            
            return false;
        }
    });

    return QueueItemView;
});