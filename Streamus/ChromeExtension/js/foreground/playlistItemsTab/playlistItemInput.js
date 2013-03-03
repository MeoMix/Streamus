//  The videos tab header. Users may add videos by clicking on Add Videos.
//  Clicking Add Videos will allow the user to either search w/ auto-complete suggestions, or to paste youtube URLs into the input.
define(['contentHeader', 'ytHelper', 'dialogs', 'helpers', 'playlistManager'],
    function (ContentHeader, ytHelper, dialogs, helpers, playlistManager) {
    'use strict';

    var contentHeader = new ContentHeader('#CurrentPlaylistItemDisplay', 'Add Videos', 'Search for artists or videos');
    contentHeader.expand();

    var addInput = $('#CurrentPlaylistItemDisplay .addInput').attr('placeholder', 'Search or Enter YouTube URL');
    var userIsTyping = false;
    var typingTimeout = null;
        
    //  Provides the drop-down suggestions and video suggestions.
    addInput.autocomplete({
        autoFocus: true,
        source: [],
        position: {
            my: "left top",
            at: "left bottom"
        },
        //  minLength: 0 allows empty search triggers for updating source display.
        minLength: 0, 
        focus: function () {
            //  Don't change the input as the user changes selections.
            return false;
        },
        select: function (event, ui) {
            //  Don't change the text when user clicks their video selection.
            event.preventDefault();
            contentHeader.flashMessage('Thanks!', 2000);
            playlistManager.getStream().getSelectedPlaylist().addItemByInformation(ui.item.value);
        }
    });

    //  Validate URL input on enter key.
    //  Otherwise show suggestions. Use keyup event because input's val is updated at that point.
    addInput.keyup(function (e) {
        userIsTyping = true;
        var code = e.which;
        clearTimeout(typingTimeout);
        var usersText = $(this).val();

        typingTimeout = setTimeout(function () {
            userIsTyping = false;
            //  User can navigate suggestions with up/down. 
            if (code !== $.ui.keyCode.UP && code !== $.ui.keyCode.DOWN) {
                if (usersText === '') {
                    addInput.autocomplete("option", "source", []);
                }
                else {
                    showVideoSuggestions(usersText);
                }
            }
        }, 200);

    }).keydown(function () {
        userIsTyping = true;
        clearTimeout(typingTimeout);
    }).bind('paste drop', function () {
        parseUrlInput();
    });
        
    function handleValidInput(videoId) {
        contentHeader.flashMessage('Thanks!', 2000);

        ytHelper.getVideoInformationFromId(videoId, function (videoInformation) {
            if (videoInformation == null) {
                dialogs.showBannedVideoDialog();
            } else {
                playlistManager.getStream().getSelectedPlaylist().addItemByInformation(videoInformation);
            }
        });
    }

    function parseUrlInput() {
        //  Wrapped in a timeout to support 'rightclick->paste' 
        setTimeout(function () {
            var url = addInput.val();
            var parsedVideoId = ytHelper.parseVideoIdFromUrl(url);

            //  If found a valid YouTube link then just add the video.
            if (parsedVideoId) {
                handleValidInput(parsedVideoId);
            }
        });
    };
        
    //  Searches youtube for video results based on the given text.
    function showVideoSuggestions(text) {
        ytHelper.search(text, function (videoInformationList) {

            if (!userIsTyping) {
                var videoDisplayObjects = _.map(videoInformationList, function (videoInformation) {

                    //  I wanted the label to be duration | title to help delinate between typing suggestions and actual videos.
                    var videoDuration = parseInt(videoInformation.media$group.yt$duration.seconds, 10);
                    var videoTitle = videoInformation.title.$t;
                    var label = helpers.prettyPrintTime(videoDuration) + " | " + videoTitle;

                    return {
                        label: label,
                        value: videoInformation
                    };
                });

                //  Show videos found instead of suggestions.
                addInput.autocomplete("option", "source", videoDisplayObjects);
                addInput.autocomplete("search", '');
            }
        });
    };
});