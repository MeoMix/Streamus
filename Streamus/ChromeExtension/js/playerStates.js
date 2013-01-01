//A list of states the YouTube player may broadcast.
//https://developers.google.com/youtube/js_api_reference#Playback_status
var PlayerStates = Object.freeze({
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    VIDCUED: 5
});