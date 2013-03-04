//  This is the list of playlists on the playlists tab.
define(['playlistsContextMenu', 'ytHelper', 'playlistManager', 'player'], function (contextMenu, ytHelper, playlistManager, player) {
    //  TODO: Make this sortable and should inherit from a common List object. 
    var playlistList = $('#PlaylistList ul');
    //  TODO: Need to be a lot more fine-grained then just spamming reload. Will come back around to it.
    // TODO: This will need to be reworked to support >1 streams.
    var stream = playlistManager.getStream();

    stream.get('playlists').on('remove', reload);
    stream.get('playlists').on('add', reload);
    stream.get('playlists').on('change:selected', reload);
    stream.get('playlists').on('change:title', reload);
    //TODO: on stream change.

    reload();

    //  Refreshes the playlist display with the current playlist information.
    function reload() {
        playlistList.empty();

        var activeStream = chrome.extension.getBackgroundPage().User.get('streams').at(0);

        var firstListId = activeStream.get('firstListId');
        var currentList = activeStream.get('playlists').get(firstListId);
        
        //  Build up each row.
        do {
            (function (list) {
                var listItem = $('<li/>').appendTo(playlistList);

                $('<a/>', {
                    id: list.get('id'),
                    href: '#' + list.get('id'),
                    text: list.get('title'),
                    contextmenu: function (e) {
                        contextMenu.initialize(list);
                        contextMenu.show(e.pageY, e.pageX);
                        //  Prevent default context menu display.
                        return false;
                    }
                }).appendTo(listItem);
                
                if (list.get('selected')) {
                    selectRow(list.get('id'));
                }

            })(currentList);
            
            currentList = activeStream.get('playlists').get(currentList.get('nextListId'));

        } while(currentList.get('id') !== firstListId)

        
        //  Removes the old 'current' marking and move it to the newly selected row.
        function selectRow(id) {
            playlistList.find('li').removeClass('current');
            $('#' + id).parent().addClass('current');
        };

        //  Clicking on a playlist will select that playlist.
        playlistList.children().click(function () {
            var clickedId = $(this).children()[0].id;
            selectRow(clickedId);
            
            playlistManager.getStream().selectPlaylist(clickedId);
            return false;
        });
    }
});