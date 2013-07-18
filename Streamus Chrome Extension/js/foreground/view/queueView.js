define(['queueItems', 'queueItemView', 'contextMenuView', 'overscroll'], function (QueueItems, QueueItemView, ContextMenuView) {
    'use strict';

    var QueueView = Backbone.View.extend({
        el: $('#QueueView'),
        
        events: {
            'contextmenu': 'showContextMenu',
        },

        initialize: function () {
            var self = this;
            QueueItems.each(function (queueItem) {
                self.addItem(queueItem);
            });

            //  Whenever an item is added to the collection, visually add an item, too.
            this.listenTo(QueueItems, 'add', this.addItem);
            this.listenTo(QueueItems, 'all', this.render);

            //  His instructions say I should be able to achieve direction:horizontal via just css, but I'm unable to get it while drunk.
            this.$el.overscroll({
                direction: 'horizontal'
            });
        },
        
        addItem: function (queueItem) {
            var queueItemView = new QueueItemView({
                model: queueItem
            });
            
            this.$el.append(queueItemView.render().el);
        },
        
        clear: function () {
            //  Convert to array to avoid error of destroying while iterating over collection.
            _.invoke(QueueItems.toArray(), 'destroy');
        },
        
        enqueuePlaylistItem: function(playlistItem) {
            var videoId = playlistItem.get('video').get('id');

            QueueItems.create({
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
                    text: 'Clear Queue',
                    onClick: function () {
                        self.clear();
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

    return new QueueView;
});