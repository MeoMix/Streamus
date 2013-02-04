define(['video'], function (Video) {

    var Videos = Backbone.Collection.extend({
       model: Video 
    });

    return function(config) {
        var videos = new Videos(config);
        return videos;
    };
});