//  Displays the currently playing playlistItem's title or a default welcome message.
define(['streamItems', 'helpers'], function (StreamItems, helpers) {
    'use strict';

    var HeaderTitleView = Backbone.View.extend({
        
        el: $('#HeaderTitle'),
        
        render: function() {
          
            if (StreamItems.length == 0) {
                this.$el.text('Welcome to Streamus');
            } else {
                var selectedStreamItem = StreamItems.findWhere({ selected: true });
                this.$el.text(selectedStreamItem.get('title'));
            }

        },
        
        initialize: function () {
            helpers.scrollElementInsideParent(this.$el);
            this.listenTo(StreamItems, 'change:selected empty', this.render);
            this.render();
        }

    });

    return new HeaderTitleView;
});