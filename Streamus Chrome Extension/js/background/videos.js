define(['video', 'programState'], function (Video, programState) {

    var videoCollection = Backbone.Collection.extend({
        model: Video,
        //  Provide the ability for a VideoCollection to save.
        save: function (callback) {
            var self = this;
            $.ajax({
                type: 'POST',
                url: programState.getBaseUrl() + 'Video/SaveVideos',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(self),
                success: callback,
                error: function (error) {
                    window && console.error(error);
                }
            });
        }
    });

    return function(config) {
        var videos = new videoCollection(config);
        return videos;
    };
});