define(['contextMenuView', 'player', 'backgroundManager', 'helpers'], function (ContextMenuView, player, backgroundManager, helpers) {
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
            this.$el.find('.videoTime').text(helpers.prettyPrintTime(this.model.get('video').get('duration')));
            helpers.scrollElementInsideParent(this.$el.find('.videoTitle'));

            return this;
        },

        initialize: function () {
            this.listenTo(this.model, 'destroy', this.remove);
        },

        select: function () {
            this.model.set('selected', true);
        },

        togglePlayingState: function () {

            if (player.isPlaying()) {
                player.pause();
            } else {
                player.play();
            }
        },

        showContextMenu: function() {
            var self = this;

            //  TODO: Maybe position should be inferred if not provided? Or maybe I say 'first', 'last' instead of 0, 1, 2.. etc
            ContextMenuView.addGroup({
                position: 0,
                items: [{
                        position: 0,
                        text: 'Add to Playlist',
                        onClick: function () {
                            backgroundManager.get('activePlaylist').addItem(self.model.get('video'));
                        }
                    }, {
                        position: 1,
                        text: 'Copy URL',
                        onClick: function () {

                            chrome.extension.sendMessage({
                                method: 'copy',
                                text: 'http://youtu.be/' + self.model.get('video').get('id')
                            });

                        }
                    }, {
                        position: 2,
                        text: 'Copy Title - URL',
                        onClick: function() {

                            chrome.extension.sendMessage({
                                method: 'copy',
                                text: '"' + self.model.get('title') + '" - http://youtu.be/' + self.model.get('video').get('id')
                            });

                        }
                    }, {
                        position: 3,
                        text: 'Remove ' + this.model.get('title'),
                        onClick: function () {
                            self.model.destroy();
                        }
                    }]
            });

        }
    });

    return StreamItemView;
});