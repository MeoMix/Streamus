define(['playlist', 'user', 'playlistManager'], function (Playlist, user, playlistManager) {
    describe('The Playlist', function () {
        it("should be able to be instantiated without paramaters and have the correct default values", function () {
            var playlist = new Playlist();
            expect(playlist).not.toEqual(null);
            expect(playlist.isNew()).toEqual(true);
            expect(playlist.get('userId')).toEqual(null);
            expect(playlist.get('title')).toEqual('New Playlist');
            expect(playlist.get('position')).toEqual(0);
            expect(playlist.get('shuffledItems').length).toEqual(0);
            expect(playlist.get('history').length).toEqual(0);
            expect(playlist.get('items').length).toEqual(0);
        });

        it("should be able to be instantiated with paramaters", function () {
            var title = 'Test Title';
            var userId = 'e11d8d4e-09ef-463f-b8bd-3bde287893b5';
            var playlist = new Playlist({
                title: title,
                position: 0,
                userId: userId
            });
            expect(playlist).not.toEqual(null);
            expect(playlist.isNew()).toEqual(true);
            expect(playlist.get('userId')).toEqual(userId);
            expect(playlist.get('title')).toEqual(title);
        });

        it("should be able to save", function () {
            var addPlaylistReturnedSuccessfully = false;
            var playlist = null;
            runs(function () {
                addPlaylist(function (addedPlaylist) {
                    addPlaylistReturnedSuccessfully = true;
                    playlist = addedPlaylist;
                });
            });

            waitsFor(function () {
                return addPlaylistReturnedSuccessfully;
            }, "The Playlist should be saved", 10000);

            runs(function() {
                expect(playlist).not.toEqual(null);
                expect(playlist.isNew()).toEqual(false);
                expect(playlist.get('id')).not.toEqual(null);
                expect(playlist.get('userId')).toEqual(user.id);
                expect(playlist.get('position')).toBeGreaterThan(-1);
                expect(playlist.get('position')).toBeLessThan(playlistManager.playlists.length + 1);
            });
        });
        
        it("can add an item by videoId", function () {
            var videoId = 'lI9klhUAVTE';
            var addedItemSuccessfully = false;
            var playlist = null;
            var item = null;

            runs(function () {
                //TODO: Currently, a Playlist has to be saved to the DB before an item can be successfully saved to it. Is this a viable decision?
                console.log("calling addPlaylist");
                addPlaylist(function (addedPlaylist) {
                    playlist = addedPlaylist;
                    console.log("playlist added, calling add item");
                    addedPlaylist.addItemByVideoId(videoId, function (addedItem) {
                        item = addedItem;
                        addedItemSuccessfully = true;
                    });
                });
            });
            
            waitsFor(function () {
                return addedItemSuccessfully;
            }, "The Playlist should've added an item", 10000);

            runs(function() {
                expect(item).not.toEqual(null);
                expect(item.get('videoId')).toEqual(videoId);
                expect(item.get('playlistId')).toEqual(playlist.id); //Playlist should have an ID when saving (for now at least)
                expect(playlist.get('items').length).toEqual(1);
            });
        });

        it("should be able to sync", function () {
            var videoId = 'lI9klhUAVTE';
            var addItemSuccessful = false;
            var playlist = null;
            var item = null;

            runs(function () {
                //TODO: Currently, a Playlist has to be saved to the DB before an item can be successfully saved to it. Is this a viable decision?
                console.log("calling addPlaylist");
                addPlaylist(function (addedPlaylist) {
                    playlist = addedPlaylist;
                    console.log("playlist added, calling add item");
                    playlist.addItemByVideoId(videoId, function (addedItem) {
                        item = addedItem;
                        addItemSuccessful = true;
                    });
                });
            });

            waitsFor(function () {
                return addItemSuccessful;
            }, "The Playlist should've added an item", 10000);

            var syncSuccessful = false;
            //Get two items in the playlist so can shuffle positions.
            playlist.addItemByVideoId(videoId, function () {
                //Provide a collect of positions and playlist will make its playlistItem order match those positions.
                var positions = [1, 0];
                //Resync playlist to swap song positions.
                playlist.sync(positions, function () {
                    syncSuccessful = true;
                });
            });
            
            waitsFor(function () {
                return syncSuccessful;
            }, "The Playlist should've have sync'ed", 10000);

            runs(function() {

            });
        });

        //TODO: Dependent on Player being testable b/c need to be able to queue videoId.
        //it("should be able to return a selected item", function () {
        //    var addedPlaylistSuccessfully = false;
        //    var playlist = null;
            
        //    runs(function() {
        //        addPlaylist(function(addedPlaylist) {
        //            playlist = addedPlaylist;
        //            addedPlaylistSuccessfully = true;
        //        });
        //    });
            
        //    waitsFor(function () {
        //        return addedPlaylistSuccessfully;
        //    }, "The Playlist should've added successfully", 10000);

        //    var addedItemSuccessfully = false;
        //    var item = null;
        //    runs(function() {
        //        var selectedItem = playlist.getSelectedItem();
        //        expect(selectedItem).toEqual(null);
        //        playlist.addItemByVideoId('Lxdog1B1H-Y', function (addedItem) {
        //            item = addedItem;
        //            addedItemSuccessfully = true;
        //        });
        //    });

        //    waitsFor(function() {
        //        return addedItemSuccessfully;
        //    }, "The PlaylistItem should've added successfully", 10000);

        //    runs(function() {
        //        expect(item).not.toEqual(null);
        //        expect(item.isNew()).toBe(true);
        //        var selectedItem = playlist.getSelectedItem();
        //        expect(selectedItem).toEqual(null); //Item should not be selected until it is queued or loaded into video player, imo! Maybe in the future can select.
        //    });
        //});
        
        //Utility Methods:
        function addPlaylist(callback) {
            playlistManager.onReady(function () {
                console.log("Calling addPlaylist. I currently have x playlists:", playlistManager.playlists.length);
                playlistManager.addPlaylist('Test Title', function (addedPlaylist) {
                    if (callback) {
                        callback(addedPlaylist);
                    }
                });
            });
        }
    });
});