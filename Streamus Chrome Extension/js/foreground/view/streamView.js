define(['streamItems', 'streamItemView', 'contextMenuView', 'overscroll'], function (StreamItems, StreamItemView, ContextMenuView) {
    'use strict';

    var StreamView = Backbone.View.extend({
        el: $('#StreamView'),
        
        events: {
            'contextmenu': 'showContextMenu',
        },

        initialize: function () {
            var self = this;
            StreamItems.each(function (streamItem) {
                self.addItem(streamItem);
            });

            //  Whenever an item is added to the collection, visually add an item, too.
            this.listenTo(StreamItems, 'add', this.addItem);
            this.listenTo(StreamItems, 'all', this.render);

            //  His instructions say I should be able to achieve direction:horizontal via just css, but I'm unable to get it while drunk.
            this.$el.overscroll({
                direction: 'horizontal'
            });
        },
        
        addItem: function (streamItem) {
            var streamItemView = new StreamItemView({
                model: streamItem
            });
            
            this.$el.append(streamItemView.render().el);
        },
        
        clear: function () {
            //  Convert to array to avoid error of destroying while iterating over collection.
            _.invoke(StreamItems.toArray(), 'destroy');
        },
        
        addPlaylistItem: function(playlistItem) {
            var videoId = playlistItem.get('video').get('id');

            StreamItems.create({
                title: playlistItem.get('title'),
                videoImageUrl: 'http://img.youtube.com/vi/' + videoId + '/default.jpg'
            });
        },
        
        showContextMenu: function (event) {
            var self = this;

            ContextMenuView.addGroup({
                position: 0,
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
                        // TODO: Implement saving stream as a playlist.
                        console.error("not implemented");
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