define([
    'utility'
], function (Utility) {
    'use strict';

    var PlaylistItemView = Backbone.View.extend({
        tagName: 'li',
        
        className: 'playlistItem',
        
        template: _.template($('#playlistItemTemplate').html()),
        
        attributes: function() {
            return {
                //  TODO: Probably renamed this to playlistitemid to avoid confusion with listitem's id.
                'data-itemid': this.model.get('id')
            };
        },
        
        render: function () {

            this.$el.html(this.template(this.model.toJSON()));
            
            var videoDuration = this.model.get('video').get('duration');
            var author = this.model.get('video').get('author');

            //  Set this as a property of the model before rendering.
            var playlistItemInfo = Utility.prettyPrintTime(videoDuration) + ' by ' + author;
            this.$el.find('span.playlistItemInfo').text(playlistItemInfo);

            //  TODO: Invert so parent is watching children.
            Utility.scrollElementInsideParent(this.$el.find('span.playlitItemTitle'));

            return this;
        },
        
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.remove);
        }

    });

    return PlaylistItemView;
});