define(['contentHeader', 'playlistsDisplay'], function(contentHeaderFunc, playlistsDisplay){
	'use strict';
	var contentHeader = new contentHeaderFunc('#PlaylistDisplay', 'Add Playlist', 'Enter a playlist name');
    contentHeader.contract();

	//TODO: Clearly need to split playlistsDisplay off into another object.
    playlistsDisplay.initialize(function(){
		contentHeader.flashMessage('Thanks!', 2000);
    });
    
    function reload() {
        var playlistTitle = chrome.extension.getBackgroundPage().PlaylistManager.playlistTitle;
        contentHeader.title = playlistTitle;
        playlistsDisplay.reload();
    }

    reload();

	return {
		set contentHeaderTitle(value){
			contentHeader.title = value;
		},
		reload: reload
	};
});