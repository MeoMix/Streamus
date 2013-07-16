define(['contextMenu'], function (contextMenu) {
    'use strict';

    var QueueContextMenuView = Backbone.View.extend({

        className: 'queueContextMenu',

        template: _.template($('#queueContextMenuTemplate').html()),

        render: function (top, left) {
            this.$el.html(this.template(this.model.toJSON()));

            this.$el.offset({
                top: top,
                left: left
            });

            return this;
        },

        initialize: function () {
            //  TODO: This seems incorrect?
            this.$el.appendTo('body');
        },
        
        show: function (options) {
            if (options.top === undefined || options.left === undefined) throw "ContextMenu must be shown with top/left coordinates.";

            this.render(options.top, options.left);

            console.log("Appending to body:", this.$el);
            
            

            //var self = this;
            //var queueContextMenu = $.extend({}, contextMenu, {
            //    initialize: function () {

            //        this.addContextMenuItem({
            //            text: 'Remove',
            //            click: function () {
            //                self.queueItem.destroy();
            //            }
            //        });

            //    }
            //});

            ////  TODO: Shouldn't have to say initialize...
            //queueContextMenu.initialize();
            //queueContextMenu.show(top, left);
        }
    });

    return QueueContextMenuView;
});