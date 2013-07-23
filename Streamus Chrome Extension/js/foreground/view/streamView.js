define(['streamItems', 'streamItemView', 'contextMenuView', 'backgroundManager', 'sly'], function (StreamItems, StreamItemView, ContextMenuView, backgroundManager) {
    'use strict';

    var StreamView = Backbone.View.extend({
        el: $('#StreamView'),
        
        slidee: $('#StreamView ul.slidee'),
        
        events: {
            'contextmenu': 'showContextMenu',
        },
        
        sly: null,
        overlay: $('#StreamViewOverlay'),

        initialize: function () {
            
            // Call Sly on frame
            this.sly = new window.Sly(this.$el, {
                horizontal: 1,
                itemNav: 'centered',
                smart: 1,
                activateOn: 'click',
                mouseDragging: 1,
                touchDragging: 1,
                releaseSwing: 1,
                startAt: 3,
                speed: 300,
                elasticBounds: 1,
                easing: 'easeOutExpo',
                clickBar: 1
            }).init();

            var self = this;
            StreamItems.each(function (streamItem) {
                self.addItem(streamItem, true);
            });
            
            //  Whenever an item is added to the collection, visually add an item, too.
            this.listenTo(StreamItems, 'add', this.addItem);

            this.sly.reload();
            this.listenTo(StreamItems, 'empty', function() {
                this.overlay.show();
            });

            this.listenTo(StreamItems, 'remove', this.sly.reload);
        },
        
        addItem: function (streamItem, activateImmediate) {
            var streamItemView = new StreamItemView({
                model: streamItem
            });

            var element = streamItemView.render().el;
            this.sly.add(element);
            this.overlay.hide();
            
            if (streamItem.get('selected')) {
                //  activateImmediate will go directly to element without animation.
                this.sly.activate(element, activateImmediate);
            }
        },
        
        clear: function () {
            //  Convert to array to avoid error of destroying while iterating over collection.
            _.invoke(StreamItems.toArray(), 'destroy');
            this.sly.reload();
        },

        showContextMenu: function (event) {
            var self = this;

            ContextMenuView.addGroup({
                position: 1,
                items: [{
                    position: 0,
                    text: 'Clear Stream',
                    onClick: function () {
                        self.clear();
                    }
                }, {
                    position: 1,
                    text: 'Save Stream as Playlist',
                    onClick: function () {
                        backgroundManager.get('activeFolder').addPlaylistWithVideos('Playlist', StreamItems.pluck('video'));
                    }
                }]
            });

            ContextMenuView.show({
                top: event.pageY,
                left: event.pageX + 1
            });

            return false;
        },

    });

    return new StreamView;
});