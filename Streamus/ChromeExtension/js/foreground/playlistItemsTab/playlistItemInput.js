//  The videos tab header. Users may add videos by clicking on Add Videos.
//  Clicking Add Videos will allow the user to either search w/ auto-complete suggestions, or to paste youtube URLs into the input.
define(['ytHelper', 'dialogs', 'helpers'],
    function (ytHelper, dialogs, helpers) {
    'use strict';

    var initialize = function () {
        var addInput = $('#CurrentPlaylistItemDisplay .addInput').attr('placeholder', 'Search or Enter YouTube URL');

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

                handleValidInput(ui.item.value.id);
            }
        });
        
        function handleValidInput(videoId) {
            $(document).trigger('validInputEvent');
            ytHelper.getVideoInformation(videoId, function (videoInformation) {
                if (typeof videoInformation === "undefined") {
                    dialogs.showBannedVideoDialog();
                }
                else {
                    chrome.extension.getBackgroundPage().YoutubePlayer.addNewItem(videoInformation);
                }
            });
        }

        var parseUrlInput = function () {
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

        function handleInputEvents() {
            var userIsTyping = false;
            var typingTimeout = null;

            //Validate URL input on enter key.
            //Otherwise show suggestions. Use keyup event because input's val is updated at that point.
            addInput.keyup(function (e) {
                userIsTyping = true;
                var code = e.which;
                clearTimeout(typingTimeout);
                var usersText = $(this).val();

                typingTimeout = setTimeout(function () {
                    userIsTyping = false;
                    //User can navigate suggestions with up/down. 
                    if (code !== $.ui.keyCode.UP && code !== $.ui.keyCode.DOWN) {
                        if (usersText === '') {
                            addInput.autocomplete("option", "source", []);
                        }
                        else {
                            showVideoSuggestions(usersText);
                        }
                    }
                }, 100);

            }).keydown(function () {
                userIsTyping = true;
                clearTimeout(typingTimeout);
            }).bind('paste drop', function () {
                parseUrlInput();
            });

            //  Searches youtube for video results based on the given text.
            var showVideoSuggestions = function (text) {
                ytHelper.search(text, null, function (videos) {

                    if (!userIsTyping) {
                        var videoDisplayObjects = videos.map(function(video) {
                            //  I wanted the label to be duration | title to help delinate between typing suggestions and actual videos.
                            var videoDuration = video.get('duration');
                            var videoTitle = video.get('title');
                            var label = helpers.prettyPrintTime(videoDuration) + " | " + videoTitle;

                            return {
                                label: label,
                                value: video
                            };
                        });

                        //  Show videos found instead of suggestions.
                        addInput.autocomplete("option", "source", videoDisplayObjects);
                        addInput.autocomplete("search", '');
                    }
                });
            };
        } 
        handleInputEvents();
    };

    return {
        initialize: initialize,
        onValidInputEvent: function(event) {
            $(document).on('validInputEvent', event);
        }
    };
});