define(['backgroundManager', 'queueItems', 'queueItemView', 'queueContextMenuView', 'overscroll'], function (backgroundManager, QueueItems, QueueItemView, QueueContextMenuView) {
    'use strict';

    var QueueView = Backbone.View.extend({
        el: $('#QueueView'),
        
        events: {
            'contextmenu .queueItem': 'showContextMenu'
        },

        initialize: function () {
            console.log("initializing overscroll");
            //  His instructions say I should be able to achieve direction:horizontal via just css, but I'm unable to get it while drunk.

            //  Initialize the collection we'll use to store items in.
            this.items = QueueItems;
            //  Whenever an item is added to the collection, visually add an item, too.
            this.listenTo(this.items, 'add', this.addItem);
            this.listenTo(this.items, 'remove', this.removeItem);

            //var activeItem = backgroundManager.get('activePlaylistItem');

            //if (activeItem !== null) {

            //    var videoId = activeItem.get('video').get('id');

            //    this.items.create({
            //        title: activeItem.get('title'),
            //        videoImageUrl: 'http://img.youtube.com/vi/' + videoId + '/default.jpg'
            //    });

            //    var nextItem = backgroundManager.getPlaylistItemById(activeItem.get('nextItemId'));
            //    var activePlaylist = backgroundManager.getPlaylistById(activeItem.get('playlistId'));
                
            //    while (nextItem.get('id') != activePlaylist.get('firstItemId')) {
                    
            //        this.items.create({
            //            title: nextItem.get('title'),
            //            videoImageUrl: 'http://img.youtube.com/vi/' + nextItem.get('video').get('id') + '/default.jpg'
            //        });
                    
            //        nextItem = backgroundManager.getPlaylistItemById(nextItem.get('nextItemId'));
            //    }

            //}

            var self = this;

            this.listenTo(QueueContextMenuView, 'removeItem', this.removeItem);
            
            this.$el.overscroll({
                //showThumbs: false,
                direction: 'horizontal'
            });
            
        },
        
        addItem: function (queueItem) {
            var queueItemView = new QueueItemView({ model: queueItem });
            this.$el.append(queueItemView.render().el);
        },
        
        removeItem: function (queueItem) {
            console.log("Remove:", queueItem);
            this.items.remove(queueItem);

            this.$el.find('#' + queueItem).remove();
        },

        showContextMenu: function (event) {
            console.log("Calling show", this);
            QueueContextMenuView.show(this, event);

            return false;
        },
        
        enqueuePlaylistItem: function(playlistItem) {
            var videoId = playlistItem.get('video').get('id');

            this.items.create({
                title: playlistItem.get('title'),
                videoImageUrl: 'http://img.youtube.com/vi/' + videoId + '/default.jpg'
            });
        }

    });

    return new QueueView;
});