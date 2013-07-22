define(['contextMenuView', 'player'], function(ContextMenuView, player) {
    'use strict';

    var StreamItemView = Backbone.View.extend({
        tagName: 'li',

        className: 'streamItem',

        template: _.template($('#streamItemTemplate').html()),

        events: {
            'contextmenu': 'showContextMenu',
            'click': 'select',
            'dblclick': 'togglePlayingState'
        },

        render: function () {

            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },

        initialize: function () {

            this.toggleSelectedClass();
            
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'change:selected', this.toggleSelectedClass);
        },

        select: function () {
            this.model.set('selected', true);
        },
        
        toggleSelectedClass: function() {
            this.$el.toggleClass('active', this.model.get('selected'));
        },
        
        togglePlayingState: function () {

            if (player.isPlaying()) {
                console.log("Pausing");
                player.pause();
            } else {
                console.log("Playing");
                player.play();
            }
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
                        text: 'Copy Video URL',
                        onClick: function() {
                            chrome.extension.sendMessage({
                                method: 'copy',
                                text: 'http://youtu.be/' + self.model.get('video').get('id')
                            });
                        }
                    }]
            });

        }
    });

    return StreamItemView;
});