$(function () {

    //  Monitor the video for change of src so that background can mimic player.
    var videoStream = $('.video-stream');
    var observer = new window.WebKitMutationObserver(function (mutations) {
        mutations.forEach(function(mutation) {
            var attributeName = mutation.attributeName;

            if (attributeName === 'src') {

                var videoStreamSrc = mutation.target.getAttribute(attributeName);

                console.log("videoStreamSrc:", videoStreamSrc);
                
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

    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = chrome.extension.getURL('css/inject.css');
    document.head.appendChild(style);

    var addButtonWrapper = $('<span >');
    var youtubeButtonInsertLocation = $('#watch7-secondary-actions');
    addButtonWrapper.insertBefore(youtubeButtonInsertLocation.children(':first'));
    
	var addButton = $('<button>', {
	    'class': 'action-panel-trigger yt-uix-button yt-uix-button-text yt-uix-tooltip',
	    title: 'Add video to Streamus',
	    type: 'button',
	    role: 'button',
	    'data-button-toggle': true,
	    'data-trigger-for': 'action-panel-streamus',
	    click: function () {
	        //return false;
	    }
	});
	addButton.appendTo(addButtonWrapper);
    var addButtonContent = $('<span>', {
        'class': 'yt-uix-button-content',
        text: 'Add to Streamus'
    });
    addButtonContent.appendTo(addButton);

    var streamusActionPanel = $('<div>', {
        id: 'action-panel-streamus',
        'class': 'action-panel-content',
        'data-panel-loaded': true,
        css: {
            display: 'none',
            padding: '18px 20px',
            width: '600px'
        }
    });
    
    var youtubePanelInsertLocation = $('#watch7-action-panels');
    streamusActionPanel.insertBefore(youtubePanelInsertLocation.children(':first'));
    
    var watchActionsSharePanel = $('<div>', {

    });
    watchActionsSharePanel.appendTo(streamusActionPanel);

    var sharePanel = $('<div>', {
        'class': 'share-panel'
    });
    sharePanel.appendTo(watchActionsSharePanel);
    
    var sharePanelButtons = $('<div>', {
        id: 'streamus-panel-buttons',
        'class': 'share-panel-buttons'
    });
    sharePanelButtons.appendTo(sharePanel);
    
    var sharePanelMainButtons = $('<span>', {
        'class': 'share-panel-main-buttons yt-uix-button-group',
        'data-button-toggle-group': 'share-panels'
    });
    sharePanelMainButtons.appendTo(sharePanelButtons);
    
    var selectStreamButton = $('<button>', {
        type: 'button',
        'class': 'share-panel-services yt-uix-button-toggled yt-uix-button yt-uix-button-text',
        'data-button-toggle': true,
        role: 'button',
        onclick: function() {
            return false;
        }
    });
    selectStreamButton.appendTo(sharePanelMainButtons);
    
    var selectSteamContent = $('<span>', {
        'class': 'yt-uix-button-content',
        text: 'Select Stream'
    });
    
    selectSteamContent.appendTo(selectStreamButton);
    
    var sharePanelStreamSelect = $('<div>', {
        'class': 'share-panel-streams-container'
    });
    sharePanelStreamSelect.appendTo(sharePanel);

    var streamSelect = $('<select>', {
        id: 'streamSelect',
        'class': 'yt-uix-form-input-text share-panel-url'
    });
    streamSelect.appendTo(sharePanelStreamSelect);
    
    var sharePanelPlaylistSelect = $('<div>', {
        'class': 'share-panel-playlists-container'
    });
    sharePanelPlaylistSelect.appendTo(sharePanel);
    
    var selectPlaylistButton = $('<button>', {
        type: 'button',
        'class': 'share-panel-services yt-uix-button yt-uix-button yt-uix-button-text',
        'data-button-toggle': true,
        role: 'button',
        onclick: function () {
            return false;
        }
    });

    selectPlaylistButton.appendTo(sharePanelMainButtons);
    var selectPlaylistContent = $('<span>', {
        'class': 'yt-uix-button-content',
        text: 'Select Playlist'
    });

    selectPlaylistContent.appendTo(selectPlaylistButton);
    
    var playlistSelect = $('<select>', {
        id: 'playlistSelect',
        'class': 'yt-uix-form-input-text share-panel-url',
        change: function() {
            console.log("onChange");
            var match = document.URL.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/);
            var videoId = (match && match[2].length === 11) ? match[2] : null;
            

        }
    });

    playlistSelect.appendTo(sharePanelPlaylistSelect);

    var videoAddButton = $('<input>', {
        type: 'button',
        value: 'Add Video',
        title: 'Add Video',
        id: 'streamusVideoAddButton',
        'class': 'yt-uix-button',
        click: function () {
            console.log("clicked.. sending message");
            var match = document.URL.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/);
            var videoId = (match && match[2].length === 11) ? match[2] : null;

            var playlistId = playlistSelect.val();

            chrome.runtime.sendMessage({
                method: "addVideoByIdToPlaylist",
                playlistId: playlistId,
                videoId: videoId
            });
        }
    });
    videoAddButton.appendTo(sharePanelPlaylistSelect);

    selectStreamButton.click(function () {
        sharePanelStreamSelect.removeClass('hid');

        selectPlaylistButton.removeClass('yt-uix-button-toggled');
        selectPlaylistButton.addClass('yt-uix-button');
        sharePanelPlaylistSelect.addClass('hid');
    });
    
    selectPlaylistButton.click(function () {
        sharePanelPlaylistSelect.removeClass('hid');

        selectStreamButton.addClass('yt-uix-button');
        selectStreamButton.removeClass('yt-uix-button-toggled');
        sharePanelStreamSelect.addClass('hid');
    });

    chrome.runtime.sendMessage({ method: "getStreams" }, function (getStreamsResponse) {

        var streams = getStreamsResponse.streams;

        if (streams.length === 1) {
   
            selectStreamButton.removeClass('yt-uix-button-toggled');
            sharePanelStreamSelect.addClass('hid');
            
            selectPlaylistButton.addClass('yt-uix-button-toggled');
            sharePanelPlaylistSelect.removeClass('hid');

            if (streams[0].playlists.length === 0) {

                //  TODO: Render input element and create playlist.

            } else {
                var firstPlaylist = _.find(streams[0].playlists, function (playlist) {
                    return playlist.id == streams[0].firstListId;
                });
                
                $('<option>', {
                    value: firstPlaylist.id,
                    text: firstPlaylist.title
                }).appendTo(playlistSelect);

                var nextPlaylist = _.find(streams[0].playlists, function (playlist) {
                    return playlist.id == firstPlaylist.nextListId;
                });
                
                while (nextPlaylist.id != firstPlaylist.id) {
                    
                    $('<option>', {
                        value: nextPlaylist.id,
                        text: nextPlaylist.title
                    }).appendTo(playlistSelect);

                    nextPlaylist = _.find(streams[0].playlists, function (playlist) {
                        return playlist.id == nextPlaylist.nextListId;
                    });
                }
            }
            

        }

        _.each(streams, function (stream) {

            var streamOption = $('<option>', {
                value: stream.id,
                text: stream.title
            });

            streamOption.appendTo(streamSelect);
        });
    });

    //  TODO: Connect to YouTube pages and live-update the injected selects instead of the user needing to refresh the page.
    //chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //    console.log("MESSAGE RECEIVED:", request);
    //    switch (request.method) {

    //        case 'streamAdded':
                
    //            //  TODO: Sort alphabetically
    //            var streamOption = $('<option>', {
    //                value: request.stream.id,
    //                text: request.stream.title
    //            });

    //            streamOption.appendTo(streamSelect);
                
    //            break;
    //        case 'streamRemoved':
                
    //            streamSelect.find('option[value="' + request.stream.id + '"]');
                
    //            break;
    //        case 'playlistAdded':

    //            //  TODO: Sort alphabetically
    //            var playlistOption = $('<option>', {
    //                value: request.playlist.id,
    //                text: request.playlist.title
    //            });

    //            playlistOption.appendTo(playlistSelect);
                
    //            break;
    //        case 'playlistRemoved':
                
    //            playlistSelect.find('option[value="' + request.playlist.id + '"]');
                
    //            break;
    //        default:
    //            break;

    //    }

    //});

});



