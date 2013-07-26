define(['video', 'programState'], function (Video) {

    var videoCollection = Backbone.Collection.extend({
<<<<<<< HEAD
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
                    console.error(error);
                }
            });
        },
        withIds: function() {
            var videosWithIds = this.filter(function(video) {
                return video.get('id') != '';
            });

            return new videoCollection(videosWithIds);
        }
=======
        model: Video
>>>>>>> origin/Development
    });

    return function(config) {
        var videos = new videoCollection(config);
        return videos;
    };
});