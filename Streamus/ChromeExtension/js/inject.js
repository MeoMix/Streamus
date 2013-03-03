$(function(){
	var wrapper = $('<div />', {
		id: 'ButtonWrapper',
		height: 21,
		css: {
			overflow: 'hidden',
		    '-webkit-transition': 'height 1s'
		}
	});

	var streamusLogo = $('<input />', {
		type: 'button',
		value: 'Add to Streamus',
		'id': 'StreamusLogo',
		click: function(){
			buttonMenu.toggle();
			return false;
		}
	});

	//Show the volume slider control by expanding its parent whenever any of the volume controls are hovered.
	wrapper.mouseover(function(){
		wrapper.height(50);
	}).mouseout(function(){
		wrapper.height(21);
	});

	wrapper.append(streamusLogo);

	var buttonMenu = $('<ul />', {
		id: 'AddToStreamusMenu',
		'class': 'ButtonMenu'
	});
	wrapper.append(buttonMenu);

	var target = $('#watch7-sentiment-actions');
	wrapper.appendTo(target);

	var match = document.URL.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/);
	var videoId = (match && match[2].length === 11) ? match[2] : null;

	chrome.extension.sendRequest({method: "getPlaylists"}, function(response) {
        _.each(response.playlists, function(playlist){
			var buttonMenuOption = $('<li />', {
				text: playlist.title,
				click: function(){
					chrome.extension.sendRequest({
						method: 'addVideoByIdToPlaylist', 
						videoId: videoId, 
						playlistId: playlist.id
					});
				}
			});
			buttonMenu.append(buttonMenuOption);
        });
    });
});