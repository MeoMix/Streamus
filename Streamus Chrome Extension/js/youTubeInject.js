$(function () {

    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = chrome.extension.getURL('css/youTubeInject.css');
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
    
    //var selectStreamButton = $('<button>', {
    //    type: 'button',
    //    'class': 'share-panel-services yt-uix-button-toggled yt-uix-button yt-uix-button-text',
    //    'data-button-toggle': true,
    //    role: 'button',
    //    onclick: function() {
    //        return false;
    //    }
    //});
    //selectStreamButton.appendTo(sharePanelMainButtons);
    
    //var selectSteamContent = $('<span>', {
    //    'class': 'yt-uix-button-content',
    //    text: 'Select Stream'
    //});
    
    //selectSteamContent.appendTo(selectStreamButton);
    
    //var sharePanelStreamSelect = $('<div>', {
    //    'class': 'share-panel-streams-container'
    //});
    //sharePanelStreamSelect.appendTo(sharePanel);

    //var streamSelect = $('<select>', {
    //    id: 'streamSelect',
    //    'class': 'yt-uix-form-input-text share-panel-url'
    //});
    //streamSelect.appendTo(sharePanelStreamSelect);
    
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

    var successEventNotification = $('<div>', {
        id: 'successEventNotification',
        text: 'Video successfully added to Streamus.',
        'class': 'eventNotification'
    });
    successEventNotification.appendTo(sharePanelMainButtons);
    
    var errorEventNotification = $('<div>', {
        id: 'errorEventNotification',
        text: 'An error was encountered.',
        'class': 'eventNotification'
    });
    errorEventNotification.appendTo(sharePanelMainButtons);

    var playlistSelect = $('<select>', {
        id: 'playlistSelect',
        'class': 'yt-uix-form-input-text share-panel-url'
    });

    playlistSelect.appendTo(sharePanelPlaylistSelect);

    var videoAddButton = $('<input>', {
        type: 'button',
        value: 'Add Video',
        title: 'Add Video',
        id: 'streamusVideoAddButton',
        'class': 'yt-uix-button yt-uix-tooltip',
        click: function () {

            $(this).val('Working...');
            $(this).attr('disabled', true);

            var match = document.URL.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/);
            var videoId = (match && match[2].length === 11) ? match[2] : null;

            var playlistId = playlistSelect.val();

            var self = this;
            chrome.runtime.sendMessage({
                method: "addVideoByIdToPlaylist",
                playlistId: playlistId,
                videoId: videoId
            }, function (response) {
                
                if (response.result === 'success') {
                    $(self).removeAttr('disabled');
                    $(self).val('Add Video');
                    successEventNotification.fadeIn().css("display", "inline-block");

                    setTimeout(function() {
                        successEventNotification.fadeOut();
                    }, 3000);
                } else {
                    $(self).removeAttr('disabled');
                    $(self).val('Add Video');
                    errorEventNotification.fadeIn().css("display", "inline-block");
                    setTimeout(function () {
                        errorEventNotification.fadeOut();
                    }, 3000);
                }


            });
        }
    });
    videoAddButton.appendTo(sharePanelPlaylistSelect);

    //selectStreamButton.click(function () {
    //    sharePanelStreamSelect.removeClass('hid');

    //    selectPlaylistButton.removeClass('yt-uix-button-toggled');
    //    selectPlaylistButton.addClass('yt-uix-button');
    //    sharePanelPlaylistSelect.addClass('hid');
    //});
    
    selectPlaylistButton.click(function () {
        sharePanelPlaylistSelect.removeClass('hid');

        //selectStreamButton.addClass('yt-uix-button');
        //selectStreamButton.removeClass('yt-uix-button-toggled');
        //sharePanelStreamSelect.addClass('hid');
    });

    chrome.runtime.sendMessage({ method: "getStreams" }, function (getStreamsResponse) {

        var streams = getStreamsResponse.streams;

        if (streams.length === 1) {
   
            //selectStreamButton.removeClass('yt-uix-button-toggled');
            //sharePanelStreamSelect.addClass('hid');
            
            selectPlaylistButton.addClass('yt-uix-button-toggled');
            sharePanelPlaylistSelect.removeClass('hid');

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

        //_.each(streams, function (stream) {

        //    var streamOption = $('<option>', {
        //        value: stream.id,
        //        text: stream.title
        //    });

        //    streamOption.appendTo(streamSelect);
        //});
    });
    
    chrome.runtime.onMessage.addListener(function (request) {
        switch(request.event) {
            case 'add':
                var playlistOption = $('<option>', {
                    value: request.data.id,
                    text: request.data.title
                });

                playlistOption.appendTo(playlistSelect);
                break;
            case 'remove':
                playlistSelect.find('option[value="' + request.data.id + '"]').remove();
                break;
            case 'rename':                
                playlistSelect.find('option[value="' + request.data.id + '"]').text(request.data.title);
                break;
            default:
                console.error("Unhandled request", request);
                break;
        }
  });

});



