define(['ytHelper', 'songManager', 'playlistItem'], function (ytHelper, songManager, PlaylistItem) {
    'use strict';
    var Playlist = Backbone.Model.extend({
        defaults: {
            id: null,
            userId: null,
            title: 'New Playlist',
            selected: false,
            position: 0,
            shuffledItems: [],
            history: [],
            items: []
        },
        initialize: function() {
            //Our playlistItem data was fetched from the server with the playlist. Need to convert the collection to Backbone Model entities.
            if (this.get('items').length > 0) {
                console.log("Initializing a Playlist object with an item count of:", this.get('items').length);
                console.log("items[0]", this.get('items')[0]);
                this.set('items', _.map(this.get('items'), function (playlistItemData) {
                    var returnValue;
                    //This is a bit more robust. If any items in our playlist weren't Backbone.Models (could be loaded from server data), auto-convert during init.
                    if (playlistItemData instanceof Backbone.Model) {
                        returnValue = playlistItemData;
                    } else {
                        returnValue = new PlaylistItem(playlistItemData);
                    }
                    return returnValue;
                }));

                //Fetch all the related videos for songs on load. I don't want to save these to the DB because they're bulky and constantly change.
                //Data won't appear immediately as it is an async request, I just want to get the process started now.
                _.each(this.get('items'), function (item) {
                    ytHelper.getRelatedVideos(item.get('videoId'), function (relatedVideos) {
                        item.set('relatedVideos', relatedVideos);
                    });
                });

                console.log("this:", this);

                //Playlists will remember their length via localStorage w/ their ID.
                var savedItemPosition = JSON.parse(localStorage.getItem(this.get('id') + '_selectedItemPosition'));
                this.selectItemByPosition(savedItemPosition != null ? parseInt(savedItemPosition) : 0);

                var songIds = _.map(this.get('items'), function(item) {
                    return item.get('songId');
                });
                
                songManager.loadSongs(songIds);
                
                this.set('shuffledItems', _.shuffle(this.get('items')));
            }
        },
        validate: function() {
            //TODO: Validation.
        },
        //TODO: Reimplemnt using Backbone.sync w/ CRUD operations on backend.
        save: function(callback) {
            if (this.get('items').length > 0) {
                var selectedItem = this.getSelectedItem();
                localStorage.setItem(this.get('id') + '_selectedItemPosition', selectedItem.get('position'));
            }

            var self = this;
            console.log("Calling save with:", self);
            console.log("my position is:", self.get('position'));
            $.ajax({
                url: 'http://localhost:61975/Playlist/SavePlaylist',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(self),
                success: function (data) {
                    console.log('Saving playlist was successful.', data);
                    self.set('id', data.id);
                    if (callback) {
                        callback();
                    }
                },
                error: function (error) {
                    console.error("Saving playlist was unsuccessful", error);
                }
            });
        },
        remove: function () {
            var self = this;
            $.ajax({
                type: 'POST',
                url: 'http://localhost:61975/Playlist/DeletePlaylistById',
                dataType: 'json',
                data: {
                    id: self.get('id'),
                    userId: self.get('userId')
                },
                success: function () {
                    console.log("Delete playlist successful!");
                },
                error: function (error) {
                    console.error(error);
                }
            });
        },
        //Call this whenever player cue's or loads a song, pops front off of shuffledItems.
        syncShuffledItems: function (position) {
            this.set('shuffledItems', _.reject(this.shuffledItems, function(s) {
                 return s.position === position;
            }));
            
            if (this.get('shuffledItems').length == 0) {
                this.set('shuffledItems', _.shuffle(this.items));
            }
        },
        selectItemByPosition: function(position) {
            //Deselect the currently selected item, then select the new item to have selected.
            var currentlySelected = this.getSelectedItem();
            //currentlySelected is not defined for a brand new playlist since we have no items yet selected.
            if (currentlySelected != null && currentlySelected.position != position) {
                currentlySelected.set('selected', false);
            }

            var item = this.getItemByPosition(position);
            if (item != null && item.position != position) {
                item.set('selected', true);
                localStorage.setItem(this.get('id') + '_selectedItemPosition', item.get('position'));
            }

            return item;
        },
        getItemByPosition: function (position) {
            return _.find(this.get('items'), function(item) {
                return item.get('position') == position;
            });
        },
        addItemToHistory: function (item) {
            this.get('history').unshift(item);
        },
        getRelatedVideo: function () {
            //Take each playlist item's array of related videos, pluck them all out into a collection of arrays
            //then flatten the arrays into a collection of songs.
            var relatedVideos = _.flatten(_.map(this.get('items'), function(item) {
                return item.get('relatedVideos');
            }));

            var randomIndex = Math.floor(Math.random() * relatedVideos.length);
            var randomRelatedVideo = relatedVideos[randomIndex];
            console.log("related video:", randomRelatedVideo);
            return randomRelatedVideo;
        },
        getNextItem: function () {
            var nextItem = null;
            var isShuffleEnabled = JSON.parse(localStorage.getItem('isShuffleEnabled')) || false;

            if (isShuffleEnabled === true) {
                nextItem = this.get('shuffledItems')[0];
                console.log("got next shuffled item");
            } else {
                var selectedItem = this.get('history')[0];
                console.log("selectedItem decided by history:", selectedItem);
                if (selectedItem) {
                    var nextItemPosition = selectedItem.get('position') + 1;
                    //2 items in a playlist, positions 0 and 1. Position 1 is the last item, 1 + 1 = playlist length, loop back to front.
                    if (this.get('items').length == nextItemPosition) {
                        nextItemPosition = 0;
                    }
                    console.log("next position:", nextItemPosition);
                    nextItem = this.getItemByPosition(nextItemPosition);
                }
            }
            console.log("next item:", nextItem);
            return nextItem;
        },
        getPreviousItem: function () {
            //Move the currently playing item out of history and into the front of shuffledItems so that if
            //a user clicks 'next' or plays forward the item that was ahead will still be ahead instead of random item.
            var selectedItem = this.get('history').shift();
            this.get('shuffledItems').unshift(selectedItem);

            //Get the previous item by history if possible.
            var previousItem = this.get('history').shift();
            //If no previous item was found in the history, then just go back one item by index.
            if (!previousItem) {
                // Goes to the end of the current playlist.
                var previousItemPosition = selectedItem.get('position') - 1;
                console.log("previousItemPosition", previousItemPosition);
                if (previousItemPosition < 0) {
                    previousItemPosition = this.get('items').length - 1;
                }
                previousItem = this.getItemByPosition(previousItemPosition);
            }

            console.log("previous item:", previousItem);
            return previousItem;
        },
        addItems: function (songs) {
            var createdPlaylistItems = [];
            var self = this;
            _.each(songs, function (song) {
                var playlistItem = new PlaylistItem({
                    playlistId: self.get('id'),
                    position: self.get('items').length,
                    videoId: song.videoId,
                    title: song.title,
                    relatedVideos: [],
                    songId: -1,
                    selected: false
                });
                createdPlaylistItems.push(playlistItem);

                ytHelper.getRelatedVideos(playlistItem.get('videoId'), function (relatedVideos) {
                    playlistItem.set('relatedVideos', relatedVideos);
                });

                self.get('items').push(playlistItem);
                //Ensure the first playlistItem is selected if adding a bunch of new ones.
                if (self.get('items').length === 1) {
                    self.get('items')[0].set('selected', true);
                }

                self.get('shuffledItems').push(playlistItem);
                self.set('shuffledItems', _.shuffle(self.get('shuffledItems')));
            });

            //TODO: I don't have a good way of linking my savedSongs back to their playlist item.
            //I'm using the videoId for now because all the songs that get added, if they have same video id,
            //must be identical during creation, so its fine to mix up the two.
            songManager.saveSongs(songs, function (savedSongs) {
                _.each(savedSongs, function (song) {
                    var foundItem = _.find(createdPlaylistItems, function (playlistItem) {
                        return playlistItem.get('videoId') == song.videoId && playlistItem.get('songId') == -1;
                    });

                    foundItem.set('songId', song.id);
                });

                self.save();
            });
        },
        addItem: function (song, selected) {
            console.log("this:", this.get('title'));
            var playlistId = this.get('id');
            var itemCount = this.get('items').length;

            var playlistItem = new PlaylistItem({
                playlistId: playlistId,
                position: itemCount,
                videoId: song.videoId,
                title: song.title,
                relatedVideos: [],
                selected: selected || false
            });

            ytHelper.getRelatedVideos(playlistItem.get('videoId'), function (relatedVideos) {
                playlistItem.set('relatedVideos', relatedVideos);
            });

            console.log("THIS in addItem:", this);
            this.get('items').push(playlistItem);
            this.get('shuffledItems').push(playlistItem);
            this.set('shuffledItems', _.shuffle(this.get('shuffledItems')));
            console.log("this has finished calling");

            //Call save to give it an ID from the server before adding to playlist.
            songManager.saveSong(song, function (savedSong) {
                song.id = savedSong.id;
                playlistItem.set('songId', song.id);
                console.log("first set done");

                $.ajax({
                    type: 'POST',
                    url: 'http://localhost:61975/Playlist/SaveItem',
                    dataType: 'json',
                    data: {
                        id: playlistItem.get('id'),
                        playlistId: playlistItem.get('playlistId'),
                        position: playlistItem.get('position'),
                        songId: playlistItem.get('songId'),
                        title: playlistItem.get('title'),
                        videoId: playlistItem.get('videoId')
                    },
                    success: function (data) {
                        playlistItem.set('id', data.id);
                    },
                    error: function (error) {
                        console.error(error);
                    }
                });
            });

            return playlistItem;
        },
        addItemByVideoId: function (videoId, callback) {
            var self = this;
            ytHelper.getVideoInformation(videoId, function (videoInformation) {
                var song = songManager.createSong(videoInformation, self.get('id'));
                var addedItem = self.addItem(song);
                
                if (callback) {
                    callback(addedItem);
                }
            });
        },
        removeItemByPosition: function (position) {
            //If localStorage is saving the currently selected item as the one being deleted, clean that up so restarting the program doesn't try and 
            //select a playlistItem which does not exist.
            if (localStorage.getItem(this.get('id') + '_selectedItemPosition') == position) {
                localStorage.setItem(this.get('id') + '_selectedItemPosition', null);
            }

            //I'm removing the item client-side before issuing a command to the server for usability sake.
            //It is counter-intuitive to the user to click 'Delete' and have lag while the server responds.
            //TODO: How do I handle a scenario where the server fails to delete by ID?
            this.set('items', _.reject(this.items, function (s) { return s.position === position; }));
            this.syncShuffledItems(position);
            var self = this;
            $.ajax({
                url: 'http://localhost:61975/Playlist/DeleteItemByPosition',
                type: 'POST',
                dataType: 'json',
                data: {
                    playlistId: self.get('id'),
                    position: position,
                    userId: self.get('userId')
                },
                success: function () {
                    console.log("Delete item successful!");
                },
                error: function (error) {
                    //TODO: Rollback client-side transaction somehow?
                    console.error("Delete item unsuccessful", error);
                }
            });
        },
        //Sync is used to ensure proper item order after the user drag-and-drops a item on the playlist.
        sync: function (positions, callback) {
            var self = this;
            _.each(positions, function (position, index) {
                var item = self.getItemByPosition(position);
                item.set('position', index);
            });
            //Need to update positions server-side with a save after updating client-side list.
            this.save(callback);
        },
        //Returns the currently selected playlistItem or null if no item was found.
        getSelectedItem: function() {
            var selectedItem = _.find(this.get('items'), function (item) {
                return item.get('selected');
            });

            return selectedItem;
        }
    });

    return function (config) {
        var playlist = new Playlist(config);
        playlist.on('change:title', function () {
            this.save();
        });
        return playlist;
    };
});