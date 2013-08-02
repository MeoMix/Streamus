//  A progress bar which shows the elapsed time as compared to the total time of the current video.
//  Changes colors based on player state -- yellow when paused, green when playing.
define(['streamItems', 'player', 'helpers'], function (StreamItems, player, helpers) {
    'use strict';

    var ProgressBarView = Backbone.View.extend({

        el: $('#ProgressBarView'),
        
        currentTimeLabel: $('#CurrentTimeLabel'),
        
        totalTimeLabel: $('#TotalTimeLabel'),
        //  TODO: Perhaps seeking should be on a model and not on this view.
        seeking: false,
        
        events: {
            
            change: 'updateProgress',
            mousewheel: 'mousewheelUpdateProgress',
            mousedown: 'startSeeking',
            mouseup: 'seekToTime',
            
        },
        
        render: function () {
            
            if (!this.seeking) {

                //  If a video is currently playing when the GUI opens then initialize with those values.
                //  Set total time before current time because it affects the range's max.
                this.setTotalTime(this.getCurrentVideoDuration());
                this.setCurrentTime(player.get('currentTime'));
                
            }

            return this;
        },
        
        initialize: function () {
            
            this.listenTo(StreamItems, 'empty', this.clear);
            this.listenTo(StreamItems, 'change:selected', this.restart);
            this.listenTo(player, 'change:currentTime', this.render);

            this.render();
        },
        
        //  TODO: should updateProgress actually be render?
        //  Repaints the progress bar's filled-in amount based on the % of time elapsed for current video.
        updateProgress: function () {
            
            var currentTime = parseInt(this.$el.val(), 10);
            var totalTime = parseInt(this.$el.prop('max'), 10);

            //  Don't divide by 0.
            var fill = totalTime === 0 ? 0 : currentTime / totalTime;

            if (fill < 0 || fill > 1) throw "Wow this really should not have been " + fill;

            var backgroundImage = '-webkit-gradient(linear,left top, right top, from(#ccc), color-stop(' + fill + ',#ccc), color-stop(' + fill + ',rgba(0,0,0,0)), to(rgba(0,0,0,0)))';
            this.$el.css('background-image', backgroundImage);

            this.currentTimeLabel.text(helpers.prettyPrintTime(currentTime));
            this.totalTimeLabel.text(helpers.prettyPrintTime(totalTime));
 
        },
        
        //  TODO: I think I was using jQuery mousewheel for this before and now it might not work!
        //  Allow the user to manual time change by click or scroll.
        mousewheelUpdateProgress: function (event, delta) {

            var currentTime = parseInt(this.$el.val(), 10);
            
            this.setCurrentTime(currentTime + delta);
            player.seekTo(currentTime);
            
        },
        
        startSeeking: function (event) {

            //  1 is primary mouse button, usually left
            if (event.which === 1) {
                this.seeking = true;
            }
            
        },
        
        seekToTime: function (event) {

            //  1 is primary mouse button, usually left
            if (event.which === 1) {
                //  Bind to progressBar mouse-up to support dragging as well as clicking.
                //  I don't want to send a message until drag ends, so mouseup works nicely. 
                var currentTime = parseInt(this.$el.val(), 10);
                player.seekTo(currentTime);
                this.seeking = false;
            }
            
        },
       
        clear: function() {
            this.setCurrentTime(0);
            this.setTotalTime(0);
        },
        
        restart: function() {
            this.setCurrentTime(0);
            this.setTotalTime(this.getCurrentVideoDuration());
        },
        
        setCurrentTime: function (currentTime) {
            
            if (currentTime > this.$el.prop('max')) {
                console.trace();
                console.error("CurrentTime: " + currentTime + " . TotalTime: " + this.$el.prop('max'));
            }

            this.$el.val(currentTime).trigger('change');
        },
        
        setTotalTime: function(totalTime) {
            this.$el.prop('max', totalTime).trigger('change');
        },
        
        //  Return 0 or currently selected video's duration.
        getCurrentVideoDuration: function() {
            var duration = 0;

            if (StreamItems.length > 0) {
                var selectedStreamItem = StreamItems.findWhere({ selected: true });
                duration = selectedStreamItem.get('video').get('duration');
            }

            return duration;
        }
    });

    return new ProgressBarView;
    
});