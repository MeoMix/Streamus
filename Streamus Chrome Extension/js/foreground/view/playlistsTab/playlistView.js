define([
    'utility'
], function (Utility) {
    'use strict';
    
    var PlaylistView = Backbone.View.extend({
        tagName: 'li',
        
        className: 'playlist',
        
        template: _.template($('#playlistTemplate').html()),
        
        //  TODO: Delegate events to child from parent?
        events: {
            
        },
        
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));

            this.$el.attr('data-playlistid', this.model.get('id'));

            var currentVideos = this.model.get('items').pluck('video');
            var currentVideosDurations = _.pluck(currentVideos, 'duration');

            var sumVideosDurations = _.reduce(currentVideosDurations, function (memo, duration) {
                return memo + duration;
            }, 0);

            var playlistInfo = 'Videos: ' + currentVideos.length + ', Duration: ' + Utility.prettyPrintTime(sumVideosDurations);
            this.$el.find('span.playlistInfo').text(playlistInfo);

            Utility.scrollElementInsideParent(this.$el.find('span.playlitTitle'));

            return this;
        },
        
        initialize: function () {
            this.listenTo(this.model, 'change:title', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        }

    });

    return PlaylistView;
});