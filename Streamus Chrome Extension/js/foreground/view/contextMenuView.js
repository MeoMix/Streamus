define(['contextMenu'], function (ContextMenu) {
    'use strict';

    var ContextMenuView = Backbone.View.extend({

        className: 'contextMenu',

        template: _.template($('#contextMenuTemplate').html()),
        
        parentSelector: 'body',
        
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

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

            //  Show the element before setting offset to ensure correct positioning.
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
                self.$el.hide();
            });
        },
        
        show: function (options) {
            if (options.top === undefined || options.left === undefined) throw "ContextMenu must be shown with top/left coordinates.";
            if (options.groups === undefined) throw "ContextMenu needs ContextMenuGroups to be shown.";

            this.top = options.top;
            this.left = options.left;

            this.model = new ContextMenu({
                groups: options.groups
            });

            this.render();
        }
    });

    return ContextMenuView;
});