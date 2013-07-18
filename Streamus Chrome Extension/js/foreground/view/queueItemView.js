define(['contextMenuView'], function (ContextMenuView) {
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
            var self = this;

            //  TODO: Maybe position should be inferred if not provided?
            ContextMenuView.addGroup({
                position: 1,
                items: [{
                    position: 0,
                    text: 'Remove ' + this.model.get('title'),
                    onClick: function () {
                        self.model.destroy();
                    }
                }]
            });

        }
    });

    return QueueItemView;
});