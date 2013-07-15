define(['contextMenu'], function (contextMenu) {
    'use strict';

    var QueueContextMenuView = Backbone.View.extend({

        className: 'queueContextMenu',

        template: _.template($('#queueContextMenuTemplate').html()),

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },

        initialize: function () {
        },
        
        show: function (queueItem, event) {
            this.set('queueItem', queueItem);

            var self = this;
            var queueContextMenu = $.extend({}, contextMenu, {
                initialize: function () {
                    
                    this.addContextMenuItem({
                        text: 'Remove',
                        click: function () {

                            console.log("Removing");
                            self.trigger('removeItem', self.get('queueItem'));
                        }
                    });
                    
                }
            });

            //  TODO: Shouldn't have to say initialize...
            queueContextMenu.initialize();

            console.log("Event:", event);

            queueContextMenu.show(event.pageY, event.pageX + 1);
        }
    });

    return new QueueContextMenuView;
});