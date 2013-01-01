//This is the list of playlists on the playlists tab.
define(['playlistsContextMenu', 'ytHelper'], function(contextMenu, ytHelper){
    //TODO: Make this sortable and should inherit from a common List object. 
    var playlistList;

    var initialize = function(onValidInputEvent){
        playlistList = $('#PlaylistList ul');
        var addInput = $('#PlaylistDisplay .addInput').attr('placeholder', 'Enter a playlist name or YouTube playlist URL');

        //Whenever the user submits a name for a new playlist create a new playlist with that name.
        addInput.keyup(function (e) {
            var code = e.which;
            //ENTER: 13
            if (code === 13){
                processInput();
            }
        }).bind('paste drop', function () {
            processInput(); 
        });

        var processInput = function(){
            setTimeout(function () {
                var userInput = addInput.val();
                var youtubePlaylistId = ytHelper.parseUrlForPlaylistId(userInput);
                
                if (youtubePlaylistId !== null) {
                    if(onValidInputEvent){
                        onValidInputEvent();
                    }
                    console.log("building playlist from id");
                    ytHelper.getPlaylistTitle(youtubePlaylistId, function (playlistTitle) {
                        if(playlistTitle){
                            chrome.extension.getBackgroundPage().YoutubePlayer.addPlaylist(playlistTitle, youtubePlaylistId);
                        }
                    });
                }
                else{
                    //Only add the playlist if a name was provided.
                    if(userInput.trim() !== ''){
                        chrome.extension.getBackgroundPage().YoutubePlayer.addPlaylist(userInput);
                        if(onValidInputEvent){
                            onValidInputEvent();
                        }
                    }
                }
            });
        };
    };

    return {
        initialize: initialize,
        //Refreshes the playlist display with the current playlist information.
        reload: function(){
            playlistList.empty();

            //Removes the old 'current' marking and move it to the newly selected row.
            var selectRow = function(id){
                playlistList.find('li').removeClass('current');
                $('#' + id).parent().addClass('current');
            };

            //Build up each row.
            console.log(" reload playlists:", chrome.extension.getBackgroundPage().YoutubePlayer.playlists);
            _.each(chrome.extension.getBackgroundPage().YoutubePlayer.playlists, function(playlist){
                var listItem = $('<li/>').appendTo(playlistList);
         
                $('<a/>', {
                    id: playlist.get('id'),
                    href: '#' + playlist.get('id'),
                    text: playlist.get('title'),
                    contextmenu: function(e){
                        contextMenu.initialize(playlist);
                        contextMenu.show(e.pageY, e.pageX);
                        //Prevent default context menu display.
                        return false;
                    }
                }).appendTo(listItem);

                if (playlist.get('selected')) {
                    console.log("reload select row", playlist.get('id'));
                    selectRow(playlist.get('id')); 
                }
            });

            //Clicking on a playlist will select that playlist.
            playlistList.children().click(function(){
                var clickedId = $(this).children()[0].id;
                selectRow(clickedId);
                console.log("clicked selectPlaylist", clickedId);
                chrome.extension.getBackgroundPage().YoutubePlayer.selectPlaylist(clickedId);
                return false;
            });
        }
    };
});