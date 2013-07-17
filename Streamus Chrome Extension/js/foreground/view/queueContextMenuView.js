define(['queueContextMenu'], function (QueueContextMenu) {
    'use strict';

    var QueueContextMenuView = Backbone.View.extend({

        className: 'queueContextMenu',

        template: _.template($('#queueContextMenuTemplate').html()),
        
        parentSelector: 'body',

        //  Defined if a queueItem is loaded
        model: null,
        
        render: function () {
            //  Can be built with or without a specific queueItem.
            this.$el.html(this.template(this.model ? this.model.toJSON() : ''));

            //  Prevent display outside viewport.
            var offsetTop = this.top;
            var needsVerticalFlip = offsetTop + this.$el.height() > $(this.parentSelector).height();
            if (needsVerticalFlip) {
                offsetTop = offsetTop - this.$el.height();
            }

            var offsetLeft = this.left;
            var needsHorizontalFlip = offsetLeft + this.$el.width() > $(this.parentSelector).width();
            if (needsHorizontalFlip) {
                offsetLeft = offsetLeft - this.$el.width();
            }

            this.$el.show().offset({
                top: offsetTop,
                left: offsetLeft
            });

            return this;
        },

        initialize: function () {
            //  TODO: If I implement Backbone View's more properly, then 'body' should be responsible for this, but for now this is fine.
            this.$el.appendTo(this.parentSelector);

            var self = this;
            //  Hide the context menu whenever any click occurs not just when selecting an item.
            $(this.parentSelector).on('click contextmenu', function () {
                console.log("Hiding");
                self.$el.hide();
            });
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