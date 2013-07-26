define(['video', 'programState'], function (Video) {

    var videoCollection = Backbone.Collection.extend({
        model: Video
    });

    return function(config) {
        var videos = new videoCollection(config);
        return videos;
    };
});