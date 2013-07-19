define(['contextMenuView'], function(ContextMenuView) {
    'use strict';

    var StreamItemView = Backbone.View.extend({
        className: 'streamItem',

        template: _.template($('#streamItemTemplate').html()),

        events: {
            'contextmenu': 'showContextMenu',
            'click': 'toggleSelected'
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },

        initialize: function() {
            this.listenTo(this.model, 'destroy', this.remove);
        },

        toggleSelected: function() {
            this.$el.toggleClass('selected');
        },

        showContextMenu: function() {
            var self = this;

            //  TODO: Maybe position should be inferred if not provided? Or maybe I say 'first', 'last' instead of 0, 1, 2.. etc
            ContextMenuView.addGroup({
                position: 1,
                items: [{
                        position: 0,
                        text: 'Remove ' + this.model.get('title'),
                        onClick: function() {
                            self.model.destroy();
                        }
                    }, {
                        position: 1,
                        text: 'Copy video URL',
                        onClick: function() {
                            chrome.extension.sendMessage({
                                method: 'copy',
                                text: 'http://youtu.be/' + self.model.get('videoId')
                            });
                        }
                    }]
            });

        }
    });

    return StreamItemView;
});