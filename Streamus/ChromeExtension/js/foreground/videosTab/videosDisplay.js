//Represents the videos in a given playlist.
define(['videosContextMenu'], function (contextMenu) {
    'use strict';
    var videoList = $('#VideoList ul');

    //  Allows for drag-and-drop of videos.
    videoList.sortable({
        axis: 'y',
        delay: 100, //  Adding this helps prevent unwanted clicks to play.
        //  Whenever a video row is moved inform the Player of the new video list order.
        update: function (event, ui) {
            console.log("Index affected:", ui.item.index());

            console.log("ui item:", ui.item);

            var oldPosition = ui.item.find('a').data('position');
            var newPosition = ui.item.index();

            console.log("old position / new position:", oldPosition, newPosition);

            chrome.extension.getBackgroundPage().YoutubePlayer.updatePlaylistItemPosition(oldPosition, newPosition);

            //var positions = [];
            //videoList.find('li a').each(function () {
            //    var position = parseInt($(this).data('position'));
            //    positions.push(position);
            //});

            //chrome.extension.getBackgroundPage().YoutubePlayer.orderByPositions(positions);
        }
    });

    //Removes the old 'current' marking and move it to the newly selected row.
    var selectRow = function (position) {
        videoList.find('li').removeClass('current');
        videoList.find('li a[data-position="' + position + '"]').parent().addClass('current');
    };

    return {
        //Refresh all the videos displayed to ensure they GUI matches background's data.
        reload: function () {
            var player = chrome.extension.getBackgroundPage().YoutubePlayer;
            var items = _.sortBy(player.items, function(item) {
                return item.get('position');
            });
            var selectedItem = player.selectedItem;
            console.log("reload being called", selectedItem);
            console.log("reloading with playlist:", player.playlistTitle);
            videoList.empty();

            for (var i = 0; i < items.length; i++) {
                //Wrap in a closure to preserve video index for each iteration.
                //If you don't do this the contextmenu method will always have the last video.
                (function (i) {
                    var listItem = $('<li/>').appendTo(videoList);

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

            //Load and start playing a video if it is clicked.
            //TODO: double click
            videoList.children().click(function () {
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