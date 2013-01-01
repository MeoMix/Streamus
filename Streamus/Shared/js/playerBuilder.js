define(['ytPlayerApiHelper'], function (ytPlayerApiHelper) {
    return {
        buildPlayer: function (frameId, onReady, onStateChange, onPlayerError, callback) {
            console.log("calling apiHelper");
            ytPlayerApiHelper.onApiReady(function () {
                console.log('onFrameId');
                if (frameId) {
                    //https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
                    //After the API's JavaScript code loads, the API will call the onYouTubeIframeAPIReady function.
                    //At which point you can construct a YT.Player object to insert a video player on your page. 
                    var ytplayer = new YT.Player(frameId, {
                        events: {
                            "onReady": onReady,
                            "onStateChange": onStateChange,
                            "onError": onPlayerError
                        }
                    });

                    callback(ytplayer);
                }
            });
        }
    };
});