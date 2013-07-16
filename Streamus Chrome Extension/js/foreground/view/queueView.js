define(['backgroundManager', 'queueItems', 'queueItemView', 'queueContextMenuView', 'queueContextMenu', 'overscroll'], function (backgroundManager, QueueItems, QueueItemView, QueueContextMenuView, QueueContextMenu) {
    'use strict';

    var QueueView = Backbone.View.extend({
        el: $('#QueueView'),
        
        events: {
            
            'contextMenu': 'showContextMenu'

        },

        initialize: function () {
            
            //  Initialize the collection we'll use to store items in.
            this.items = QueueItems;

            var self = this;
            this.items.each(function(queueItem) {
                self.addItem(queueItem);
            });

            //  Whenever an item is added to the collection, visually add an item, too.
            this.listenTo(this.items, 'add', this.addItem);

            //  His instructions say I should be able to achieve direction:horizontal via just css, but I'm unable to get it while drunk.
            this.$el.overscroll({
                //showThumbs: false,
                direction: 'horizontal'
            });
        },
        
        render: function() {
            
        },
        
        addItem: function (queueItem) {
            var queueItemView = new QueueItemView({ model: queueItem });
            this.$el.append(queueItemView.render().el);
        },
        
        enqueuePlaylistItem: function(playlistItem) {
            var videoId = playlistItem.get('video').get('id');

            this.items.create({
                title: playlistItem.get('title'),
                videoImageUrl: 'http://img.youtube.com/vi/' + videoId + '/default.jpg'
            });
        },
        
        showContextMenu: function (event) {

            var queueContextMenu = new QueueContextMenu();

            console.log("contextMenu:", queueContextMenu);

            var queueContextMenuView = new QueueContextMenuView({
                model: queueContextMenu
            });
            
            //queueContextMenuView.show(event.pageY, event.pageX + 1);

            return false;
        },

    });

    return new QueueView;
});