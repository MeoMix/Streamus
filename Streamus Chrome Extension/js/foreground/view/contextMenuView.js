define(['contextMenu'], function (ContextMenu) {
    'use strict';

    var ContextMenuView = Backbone.View.extend({

        className: 'contextMenu',

        template: _.template($('#contextMenuTemplate').html()),

        events: {
            'click li': 'groupItemClicked',
        },

        model: new ContextMenu,
        
        parentSelector: 'body',
        
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            //  TODO: Should this logic be part of 'show' or 'render' ?
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

            //  Every rendering will cause new groups to be added based on the location clicked.
            //  So, once rendered, remove the groups to be ready to re-render with new groups.
            this.model.get('groups').reset();

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

        addGroup: function(group){
            this.model.get('groups').add(group);
        },
        
        show: function (options) {
            if (options.top === undefined || options.left === undefined) throw "ContextMenu must be shown with top/left coordinates.";

            this.top = options.top;
            this.left = options.left;

            this.render();
        },

        groupItemClicked: function (event) {

            //  TODO: I don't think this is necessary if I create additional views? ContextMenuGroupView and ContextMenuItemView
            var groupCid = $(event.target).closest('ul').attr('id');
            var groupItemCid = event.target.id;

            var group = this.model.get('groups').find(function (group) {
                return group.cid == groupCid;
            });

            var groupItem = group.get('items').find(function (item) {
                return item.cid == groupItemCid;
            });

            // TODO: I don't really like how I'm invoking this event. I don't think the onClick should even be on the model.
            groupItem.get('onClick')();

        }
    });

    return new ContextMenuView;
});