//  The videos tab header. Users may add videos by clicking on Add Videos.
//  Clicking Add Videos will allow the user to either search w/ auto-complete suggestions, or to paste youtube URLs into the input.
define([
    'contentHeader',
    'youTubeDataAPI',
    'utility',
    'backgroundManager',
    'dialog',
    'dialogView'
], function (ContentHeader, YouTubeDataAPI, Utility, BackgroundManager, Dialog, DialogView) {
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
            contentHeader.addInputElement.val('');
            BackgroundManager.get('activePlaylist').addItemByInformation(ui.item.value);
        }
    //  http://stackoverflow.com/questions/3488016/using-html-in-jquery-ui-autocomplete
    }).data("ui-autocomplete")._renderItem = function (ul, item) {
        return $("<li></li>")
            .data("item.autocomplete", item)
            .append("<a>" + item.label + "</a>")
            .appendTo(ul);
    };

    addInput.on('input', function() {
        showVideoSuggestions($(this).val());
    }).on('paste drop', function() {
        parseUrlInput();
    }).on('focus', function () {
        
        if ($(this).val().trim() != '') {
            $(this).autocomplete('search', '');
        }
    });
        
    function handleValidInput(videoId) {
        contentHeader.addInputElement.val('');

        YouTubeDataAPI.getVideoInformation({
            videoId: videoId,
            success: function (videoInformation) {
                BackgroundManager.get('activePlaylist').addItemByInformation(videoInformation);
            },
            error: function () {

                var bannedDialog = new Dialog({
                    text: 'Unable to use video because it was banned on copyright grounds.',
                    type: 'error'
                });

                var bannedDialogView = new DialogView({
                    model: bannedDialog
                });

                $('#contentWrapper').append(bannedDialogView.render().el);

            }
        });
    }

    function parseUrlInput() {
        //  Wrapped in a timeout to support 'rightclick->paste' 
        setTimeout(function () {
            var url = addInput.val();
            var parsedVideoId = YouTubeDataAPI.parseVideoIdFromUrl(url);

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
            YouTubeDataAPI.search(trimmedSearchText, function (videoInformationList) {

                //  Do not display results if searchText was modified while searching.
                if (trimmedSearchText === $.trim(addInput.val())) {
                    
                    var videoSourceList = _.map(videoInformationList, function(videoInformation) {

                        //  I wanted the label to be duration | title to help delinate between typing suggestions and actual videos.
                        var videoDuration = parseInt(videoInformation.media$group.yt$duration.seconds, 10);
                        var videoTitle = videoInformation.title.$t;
                        var label = '<b>' + Utility.prettyPrintTime(videoDuration) + "</b>  " + videoTitle;

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