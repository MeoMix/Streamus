define([
    'contextMenuView',
    'player',
    'backgroundManager',
    'utility',
    'streamItems'
], function (ContextMenuView, Player, BackgroundManager, Utility, StreamItems) {
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
            
            //  TODO: Set this property on the model before rendering instead.
            this.$el.find('.videoTime').text(Utility.prettyPrintTime(this.model.get('video').get('duration')));
            
            //  TODO: Invert this dependency so I don't have to call every time
            Utility.scrollElementInsideParent(this.$el.find('.videoTitle'));

            return this;
        },

        initialize: function (options) {
            if (options.parent === undefined) {
                console.trace();
                throw "StreamItemView should have a parent.";
            }

            this.parent = options.parent;

            var self = this;
            this.listenTo(this.model, 'destroy', function () {
                self.parent.sly.remove(this.render().el);
            });
        },

        select: function () {
            this.model.set('selected', true);
        },

        togglePlayingState: function () {

            if (Player.isPlaying()) {
                Player.pause();
            } else {
                Player.play();
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
                            BackgroundManager.get('activePlaylist').addItem(self.model.get('video'));
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
                    }, {
                        position: 4,
                        text: 'Ban until Stream Clear',
                        disabled: StreamItems.getRelatedVideos().length < 5,
                        title: StreamItems.getRelatedVideos().length < 5 ? 'Your Stream is low on unbanned videos. Try adding more videos before banning again.' : '',
                        onClick: function () {
                            StreamItems.ban(self.model);
                            self.model.destroy();
                        }
                    }]
            });

        }
    });

    return StreamItemView;
});