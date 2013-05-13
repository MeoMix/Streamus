$(function () {
    
    //  Monitor the video for change of src so that background can mimic player.
    var videoStream = $('.video-stream');
    var videoPlayer = $('#video-player');

    //  HTML5 player loaded
    if (videoStream.length > 0) {

        var observer = new window.WebKitMutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                var attributeName = mutation.attributeName;

                if (attributeName === 'data-youtube-id') {

                    var backgroundImage = videoStream.siblings('.video-thumbnail').children('.video-thumbnail').css('backgroundImage');
                    var backgroundImageUrl = backgroundImage.substring(4, backgroundImage.length - 1);

                    chrome.runtime.sendMessage({
                        method: "videoStreamBackgroundImage", videoStreamBackgroundImage: backgroundImageUrl
                    });

                }
                else if (attributeName === 'src') {

                    var videoStreamSrc = mutation.target.getAttribute(attributeName);

                    //  Don't send a blank src across, I think?
                    if (videoStreamSrc != null && $.trim(videoStreamSrc) != '') {
                        chrome.runtime.sendMessage({
                            method: "videoStreamSrcChange", videoStreamSrc: videoStreamSrc
                        });

                        videoStream.attr('src', '');
                    }

                }
            });
        });

        observer.observe(videoStream[0], {
            attributes: true,
            subtree: false
        });
    }
    else if (videoPlayer.length > 0) {
        //  SWF player loaded

        console.log("src moo:", videoPlayer.attr('src'));

        var src = videoPlayer.attr('src');
        
        if (src != '') {
            chrome.runtime.sendMessage({
                method: "videoStreamSrcChange", videoStreamSrc: src
            });
        }
        
        var observer = new window.WebKitMutationObserver(function (mutations) {

            console.log("attribute change");

            mutations.forEach(function (mutation) {
                var attributeName = mutation.attributeName;

                if (attributeName === 'data-youtube-id') {

                    var backgroundImage = videoStream.siblings('.video-thumbnail').children('.video-thumbnail').css('backgroundImage');
                    var backgroundImageUrl = backgroundImage.substring(4, backgroundImage.length - 1);

                    chrome.runtime.sendMessage({
                        method: "videoStreamBackgroundImage", videoStreamBackgroundImage: backgroundImageUrl
                    });

                }
                else if (attributeName === 'src') {

                    var videoStreamSrc = mutation.target.getAttribute(attributeName);

                    console.log("src:", videoStreamSrc);

                    //  Don't send a blank src across, I think?
                    if (videoStreamSrc != null && $.trim(videoStreamSrc) != '') {
                        chrome.runtime.sendMessage({
                            method: "videoStreamSrcChange", videoStreamSrc: videoStreamSrc
                        });

                        videoStream.attr('src', '');
                    }

                }
            });
        });

        observer.observe(videoPlayer[0], {
            attributes: true,
            subtree: false
        });
    }




});