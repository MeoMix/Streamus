define(['queueContextMenu', 'queueContextMenuView'], function (QueueContextMenu, QueueContextMenuView) {
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
        
        initialize: function () {

            this.listenTo(this.model, 'destroy', this.remove);
        },
        
        showContextMenu: function (event) {

            var queueContextMenu = new QueueContextMenu({
                queueItem: this.model
            });
            
            var queueContextMenuView = new QueueContextMenuView({
                model: queueContextMenu
            });

            queueContextMenuView.show({
                top: event.pageY,
                left: event.pageX + 1
            });

            return false;
        },
        
        toggleSelected: function() {
            this.$el.toggleClass('selected');
        }
    });

    return QueueItemView;
});