//  The videos tab header. Users may add videos by clicking on Add Videos.
//  Clicking Add Videos will allow the user to either search w/ auto-complete suggestions, or to paste youtube URLs into the input.
define(['contentHeader', 'ytHelper', 'dialogs', 'helpers', 'backgroundManager'],
    function (ContentHeader, ytHelper, dialogs, helpers, backgroundManager) {
    'use strict';

    var contentHeader = new ContentHeader({
        selector: '#CurrentPlaylistItemDisplay',
        addText: 'Add Videos',
        addInputPlaceholder: 'Search or Enter YouTube video URL',
        expanded: true
    });

    var addInput = $(contentHeader.addInputElement);
        
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
            backgroundManager.get('activePlaylist').addItemByInformation(ui.item.value);
        }
    });

    //  Validate URL input on enter key.
    //  Otherwise show suggestions. Use keyup event because input's val is updated at that point.

    addInput.keydown(function (event) {

        //  User can navigate suggestions with up/down, don't re-run search when they use corresponding keys
        if (event.which !== $.ui.keyCode.UP && event.which !== $.ui.keyCode.DOWN) {
            showVideoSuggestions(addInput.val());
        }

    }).on('paste drop', function () {
        parseUrlInput();
    });
        
    function handleValidInput(videoId) {
        contentHeader.flashMessage('Thanks!', 2000);

        ytHelper.getVideoInformationFromId(videoId, function (videoInformation) {
            if (videoInformation == null) {
                dialogs.showBannedVideoDialog();
            } else {
                backgroundManager.get('activePlaylist').addItemByInformation(videoInformation);
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
    function showVideoSuggestions(searchText) {
        var trimmedSearchText = $.trim(searchText);

        //  Clear results if there is no text.
        if (trimmedSearchText === '') {
            addInput.autocomplete({ source: [] });
        } else {
            ytHelper.search(trimmedSearchText, function (videoInformationList) {

                //  Do not display results if searchText was modified while searching.
                if (trimmedSearchText === $.trim(addInput.val())) {
                    
                    var videoSourceList = _.map(videoInformationList, function(videoInformation) {

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
                    addInput.autocomplete({
                        source: videoSourceList
                    });

                    addInput.autocomplete('search', '');

                }
            });
        }

    };
});