define(['queueContextMenu'], function (QueueContextMenu) {
    'use strict';

    var QueueContextMenuView = Backbone.View.extend({

        className: 'queueContextMenu',

        template: _.template($('#queueContextMenuTemplate').html()),
        //  Defined if a queueItem is loaded
        model: null,
        
        render: function () {
            //  Can be built with or without a specific queueItem.
            this.$el.html(this.template(this.model ? this.model.toJSON() : ''));

            this.$el.offset({
                top: this.top,
                left: this.left
            });

            return this;
        },

        initialize: function () {
            //  TODO: If I implement Backbone View's more properly, then 'body' should be responsible for this, but for now this is fine.
            this.$el.appendTo('body');
        },
        
        show: function (options) {
            
            if (options.top === undefined || options.left === undefined) throw "ContextMenu must be shown with top/left coordinates.";

            this.top = options.top;
            this.left = options.left;
            
            if (options.queueItem) {
                this.model = new QueueContextMenu({
                    queueItem: options.queueItem
                });
            } else {
                this.model = null;
            }

            this.render();
        }
    });

    return QueueContextMenuView;
});