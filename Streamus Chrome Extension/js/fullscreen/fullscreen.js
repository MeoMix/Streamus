define([
    'videoDisplayView'
], function (VideoDisplayView) {
    'use strict';

    //  TODO: There should probably be a ContentButtonView and Model which keep track of these properties and not just done on the ForegroundView.
    var FullscreenView = Backbone.View.extend({

        events: {
        },

        render: function(){

        },

        initialize: function () {
            //var self = this;
            
            //var videoDisplayView = new VideoDisplayView;
            //var element = videoDisplayView.render().el;

            //window.addEventListener('resize', function() {
            //    element.width = window.innerWidth;
            //    element.height = window.innerHeight;
            //}, false);

            //element.width = window.innerWidth;
            //element.height = window.innerHeight;

            //$('body').append(element);
        }


    });

    return new FullscreenView;
});