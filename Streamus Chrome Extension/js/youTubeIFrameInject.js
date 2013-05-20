$(function () {
    
    //  Monitor the video for change of src so that background can mimic player.
    var videoStream = $('.video-stream');

    //  HTML5 player loaded
    if (videoStream.length > 0) {

        var observer = new window.WebKitMutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                var attributeName = mutation.attributeName;

                if (attributeName === 'src') {

                    var videoStreamSrc = mutation.target.getAttribute(attributeName);

                    //  Don't send a blank src across, I think?
                    if (videoStreamSrc != null && $.trim(videoStreamSrc) != '') {
                        chrome.runtime.sendMessage({
                            method: "videoStreamSrcChange", videoStreamSrc: videoStreamSrc
                        });

                        videoStream.removeAttr('src');
                    }

                }
            });
        });

        observer.observe(videoStream[0], {
            attributes: true,
            subtree: false
        });
    }

});