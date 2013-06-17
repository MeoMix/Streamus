define(['backgroundManager', 'radioModeItems', 'radioModeItemView'], function (backgroundManager, RadioModeItems, RadioModeItemView) {
    'use strict';

    var RadioModeView = Backbone.View.extend({
        el: $('#RadioMode'),

        initialize: function () {
            //  Initialize the collection we'll use to store items in.
            this.items = new RadioModeItems;
            //  Whenever an item is added to the collection, visually add an item, too.
            this.listenTo(this.items, 'add', this.addItem);
            
            var activeItem = backgroundManager.get('activePlaylistItem');

            if (activeItem !== null) {

                this.items.create({
                    title: activeItem.get('title')
                });

            }

            //this.listenTo(backgroundManager, 'change:activePlaylistItem', function (model, activePlaylistItem) {
            //});
        },
        
        addItem: function (radioModeItem) {
            var radioModeItemView = new RadioModeItemView({ model: radioModeItem });

            this.$el.append(radioModeItemView.render().el);
        }

    });

    var radioModeView = new RadioModeView;
});