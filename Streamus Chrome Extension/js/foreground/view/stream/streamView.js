define([
    'streamItems',
    'streamItemView',
    'contextMenuView',
    'backgroundManager',
    'utility',
    'sly'
], function (StreamItems, StreamItemView, ContextMenuView, BackgroundManager, Utility) {
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
            var self = this;

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
            }, {
                //  This is a pretty costly function because it fires so often. Use native javascript.
                move: _.throttle(function() {
 
                    var unloadedImgElements = self.$el.find('img.lazy[src=""]');
                    
                    //  Find images which haven't been lazily loaded, but are in the viewport and trigger an event to get them to load.
                    for (var i = 0; i < unloadedImgElements.length; i++) {
                        var unloadedImgElement = unloadedImgElements[i];

                        var rectangle = unloadedImgElement.getBoundingClientRect();
                        var isInViewport = rectangle.left >= 0 && rectangle.right <= self.$el.width();

                        if (isInViewport) {
                            $(unloadedImgElement).trigger('visible');
                        }

                    }

                }, 500)
            }).init();
            
            if (StreamItems.length > 0) {
                if (StreamItems.length === 1) {
                    self.addItem(StreamItems.at(0), true);
                } else {
                    self.addItems(StreamItems.models, true);
                }
            }

            //  Whenever an item is added to the collection, visually add an item, too.
            this.listenTo(StreamItems, 'add', this.addItem);
            this.listenTo(StreamItems, 'addMultiple', this.addItems);
            this.listenTo(StreamItems, 'change:selected', this.selectItem);

            this.sly.reload();
            this.listenTo(StreamItems, 'empty', function() {
                this.overlay.show();
            });

            this.listenTo(StreamItems, 'remove empty', this.sly.reload);
            
            Utility.scrollChildElements(this.el, '.videoTitle');
        },
        
        addItem: function (streamItem, activateImmediate) {

            var streamItemView = new StreamItemView({
                model: streamItem,
                parent: this
            });

            var element = streamItemView.render().el;
            this.sly.add(element);
            
            $(element).find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: this.$el,
                event: 'visible'
            });

            if (streamItem.get('selected')) {
                //  activateImmediate will go directly to element without animation.
                this.sly.activate(element, activateImmediate);
            }

            //  TODO: This fixes some odd padding issue with slyjs on the first item being added. Not sure why add doesn't fix it? 
            //  Re-opening the player and calling this same method works fine..
            this.sly.reload();
            this.overlay.hide();
        },
        
        addItems: function (streamItems, activateImmediate) {

            var self = this;
            var streamItemViews = _.map(streamItems, function(streamItem) {

                return new StreamItemView({
                    model: streamItem,
                    parent: self
                });

            });

            var elements = _.map(streamItemViews, function (streamItemView) {
                return streamItemView.render().el;
            });
            
            this.sly.add(elements);

            $(elements).find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: self.$el,
                event: 'visible'
            });
            
            //  Ensure proper item is selected.
            var selectedStreamItem = StreamItems.getSelectedItem();
            //  TODO: ActivateImmediate doesn't seem to be doing anything.
            this.sly.activate(StreamItems.indexOf(selectedStreamItem), activateImmediate);
            this.overlay.hide();
        },
        
        selectItem: function (streamItem) {
            this.sly.activate(StreamItems.indexOf(streamItem));
        },
        
        clear: function () {
            StreamItems.clear();
            this.slidee.empty();
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

                        console.log("Pluck and before", StreamItems.length, StreamItems.pluck('video').length);

                        BackgroundManager.get('activeFolder').addPlaylistWithVideos('Playlist', StreamItems.pluck('video'));
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