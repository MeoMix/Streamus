$(function () {
    
    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = chrome.extension.getURL('ChromeExtension/css/inject.css');
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
        id: 'streamSelect'
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
        id: 'playlistSelect'
    });
    playlistSelect.appendTo(sharePanelPlaylistSelect);

    var videoAddButton = $('<input>', {
        type: 'button',
        value: 'Add Video',
        title: 'Add Video',
        onclick: function () {
            //  TODO: use helpers
            var match = document.URL.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/);
            var videoId = (match && match[2].length === 11) ? match[2] : null;

            var playlistId = playlistSelect.val();
            var selectedPlaylist = _.find(playlists, function(playlist) {
                return playlist.id === playlistId;
            });

            //ytHelper.getVideoInformationFromId(videoId, function (videoInformation) {
            //    if (videoInformation == null) {
            //        dialogs.showBannedVideoDialog();
            //    } else {
            //        backgroundManager.get('activePlaylist').addItemByInformation(videoInformation);
            //    }
            //});
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

    var playlists = [];
    chrome.runtime.sendMessage({ method: "getStreams" }, function (getStreamsResponse) {

        if (getStreamsResponse.streams.length === 1) {
   
            selectStreamButton.removeClass('yt-uix-button-toggled');
            sharePanelStreamSelect.addClass('hid');
            
            selectPlaylistButton.addClass('yt-uix-button-toggled');
            sharePanelPlaylistSelect.removeClass('hid');

            chrome.runtime.sendMessage({ method: "getPlaylists" }, function(getPlaylistsResponse) {

                playlists = getPlaylistsResponse.playlists;

                if (playlists.length === 0) {

                    //  TODO: Render input element and create playlist.

                } else {
                    _.each(playlists, function (playlist) {

                        var playlistOption = $('<option>', {
                            value: playlist.id,
                            text: playlist.title
                        });

                        playlistOption.appendTo(playlistSelect);
                    });
                }

            });
        }

        _.each(getStreamsResponse.streams, function (stream) {

            var streamOption = $('<option>', {
                value: stream.id,
                text: stream.title
            });

            streamOption.appendTo(streamSelect);
        });
    });
    

    
});



