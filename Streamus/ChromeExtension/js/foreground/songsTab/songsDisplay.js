//Represents the songs in a given playlist.
define(['songsContextMenu'], function (contextMenu) {
    'use strict';
    var songList = $('#SongList ul');

    //Allows for drag-and-drop of songs.
    songList.sortable({
        axis: 'y',
        //Whenever a song row is moved inform the Player of the new songlist order.
        update: function () {
            var positions = [];
            songList.find('li a').each(function () {
                var position = parseInt($(this).data('position'));
                positions.push(position);
            });

            chrome.extension.getBackgroundPage().YoutubePlayer.sync(positions);
        }
    });

    //Removes the old 'current' marking and move it to the newly selected row.
    var selectRow = function (position) {
        songList.find('li').removeClass('current');
        songList.find('li a[data-position="' + position + '"]').parent().addClass('current');
    };

    return {
        //Refresh all the songs displayed to ensure they GUI matches background's data.
        reload: function () {
            var player = chrome.extension.getBackgroundPage().YoutubePlayer;
            var items = _.sortBy(player.items, function(item) {
                return item.get('position');
            });
            var selectedItem = player.selectedItem;
            console.log("reload being called", selectedItem);
            console.log("reloading with playlist:", player.playlistTitle);
            songList.empty();

            for (var i = 0; i < items.length; i++) {
                //Wrap in a closure to preserve song index for each iteration.
                //If you don't do this the contextmenu method will always have the last song.
                (function (i) {
                    var listItem = $('<li/>').appendTo(songList);

                    var item = items[i];
                    console.log("item:", item);

                    $('<a/>', {
                        'data-position': item.get('position'),
                        text: item.get('title'),
                        contextmenu: function (e) {
                            contextMenu.initialize(item);
                            contextMenu.show(e.pageY, e.pageX);

                            //Prevent default context menu display.
                            return false;
                        }
                    }).appendTo(listItem);
                } (i));
            }

            //Load and start playing a song if it is clicked.
            //TODO: double click
            songList.children().click(function () {
                var clickedItem = $(this).find('a:first-child');
                console.log("clicked item", clickedItem);
                var position = $(clickedItem).data('position');
                console.log("position:", position);
                chrome.extension.getBackgroundPage().YoutubePlayer.loadItemByPosition(position);
                return false;
            });

            //Since we emptied our list we lost the selection, reselect.
            if (selectedItem) {
                selectRow(selectedItem.get('position'));
            }
        }
    };
});