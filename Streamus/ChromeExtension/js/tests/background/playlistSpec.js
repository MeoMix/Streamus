define(['playlist',
        'playlistManager',
        'loginManager',
        'videos',
        'ytHelper'],
    function (Playlist, playlistManager, loginManager, Videos, ytHelper) {
        'use strict';
        var savedPlaylist = null;
        
        //  Utility Methods:
        function addPlaylist(callback) {
            console.log("executing addPlaylist function");
            //  onReady will fire immediately if playlistManager is already ready.
            playlistManager.onReady(function () {
                console.log("playlistManager is ready, adding playlist!");
                playlistManager.addPlaylist('Test Title', null, callback);
            });
        }

        // A few preliminary tests which do not require a Playlist existing in the database.
        describe('The unsaved Playlist', function() {

            it("instantiates without paramaters", function() {
                var playlist = new Playlist();
                expect(playlist).not.toEqual(null);
                expect(playlist.isNew()).toEqual(true);
                expect(playlist.get('userId')).toEqual(null);
                expect(playlist.get('title')).toEqual('New Playlist');
                expect(playlist.get('position')).toEqual(-1);
                expect(playlist.get('history').length).toEqual(0);
                
                expect(playlist.get('shuffledItems').length).toEqual(0);
                expect(playlist.get('items').length).toEqual(0);
            });

            it("instantiates with paramaters", function() {
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

            xit("initializes with more than 0 items", function () {
            });

            //  Now create a Playlist object and write it to the global savedPlaylist.
            //  Future test cases will work upon this created Playlist object.
            it("creates", function() {
                runs(function () {
                    console.log("running addPlaylist");
                    addPlaylist(function (addedPlaylist) {
                        console.log("Added playlist:", addedPlaylist);
                        //  Here I set an outside-scope variable to use in my nested describe.
                        savedPlaylist = addedPlaylist;
                    });
                });

                waitsFor(function() {
                    return savedPlaylist !== null && !savedPlaylist.isNew();
                }, "The Playlist should have saved", 5000);

                runs(function () {
                    var userId = loginManager.get('user').get('id');

                    expect(savedPlaylist).not.toEqual(null);
                    expect(savedPlaylist.isNew()).toEqual(false);
                    expect(savedPlaylist.get('items') instanceof Backbone.Collection).toEqual(true);
                    expect(savedPlaylist.get('shuffledItems') instanceof Backbone.Collection).toEqual(true);
                    expect(savedPlaylist.get('history') instanceof Backbone.Collection).toEqual(true);
                    expect(savedPlaylist.get('id')).not.toEqual(null);
                    expect(savedPlaylist.get('userId')).toEqual(userId);
                    expect(savedPlaylist.get('position')).toBeGreaterThan(-1);
                    expect(savedPlaylist.get('position')).toBeLessThan(playlistManager.playlists.length + 1);
                });
            });
        });

        //  Methods which require a Playlist object to exist.
        //  Playlists have to be saved to the DB before being presented to the UI and, as such
        //  any method that does anything significant has to have a Playlist already saved.
        //  This is shown by the isNew() property of Backbone -- it'll be true until object is saved.
        describe('The saved Playlist', function() {

            // To stay DRY, I call a beforeEach that ensures the playlist has been saved.
            beforeEach(function() {
                waitsFor(function() {
                    return savedPlaylist !== null && !savedPlaylist.isNew();
                }, "Playlist needs to exist for describe to execute", 10000);
            });

            // Start by adding an item to the playlist through .addItem(video, selected) which will
            // trigger a save to the database.
            it("adds an item", function() {
                var videoId = 'lI9klhUAVTE';
                var addedItemSuccessfully = false;
                var item = null;
                var initialItemCount = savedPlaylist.get('items').length;
                console.log("playlist at start:", savedPlaylist);

                runs(function() {
                    ytHelper.getVideoFromId(videoId, function (video) {
                        console.log("video created, adding item");
                        item = savedPlaylist.addItem(video, true);
                        addedItemSuccessfully = true;
                    });
                });

                waitsFor(function() {
                    return addedItemSuccessfully;
                }, "The Playlist should've added an item", 10000);

                runs(function() {
                    expect(item).not.toEqual(null);
                    expect(item.get('selected')).toEqual(true);
                    expect(item.get('videoId')).toEqual(videoId);
                    expect(item.get('playlistId')).toEqual(savedPlaylist.id); //Playlist should have an ID when saving (for now at least)
                    expect(savedPlaylist.get('items').length).toEqual(initialItemCount + 1);
                });
            });

            //  Test an edge scenario where there's some lag on the database end and the user is impatient.
            //  Adding multiple videos through multiple AJAX requests shouldn't cause any issues.
            it("adds two items in a row", function() {
                var initialItemCount = savedPlaylist.get('items').length;

                runs(function() {
                    ytHelper.getVideoFromId('s91jgcmQoB0', function(video) {
                        savedPlaylist.addItem(video, false);
                    });

                    ytHelper.getVideoFromId('n_3mUnxCusM', function(video) {
                        savedPlaylist.addItem(video, false);
                    });
                });

                waitsFor(function() {
                    return savedPlaylist.get('items').length === initialItemCount + 2;
                }, "The Playlist should've added 2 items", 10000);
            });
            
            // A more common scenario is the user wanting to add a Playlist or some other sort of collection of music.
            // In this scenario, we would send one AJAX request, but the payload would have multiple videos inside of it.
            it("adds 2 items as a collection", function () {
                var initialItemCount = savedPlaylist.get('items').length;
                var videos = new Videos();

                runs(function () {
                    ytHelper.getVideoFromId('s91jgcmQoB0', function (video) {
                        videos.push(video);
                    });

                    ytHelper.getVideoFromId('n_3mUnxCusM', function (video) {
                        videos.push(video);
                    });
                });

                waitsFor(function () {
                    return videos.length === 2;
                });

                var successfullyAddedItems = false;
                runs(function () {
                    savedPlaylist.addItems(videos, function () {
                        successfullyAddedItems = true;
                    });
                });

                waitsFor(function () {
                    return successfullyAddedItems;
                }, "The Playlist should've added 2 items", 10000);

                runs(function() {
                    expect(savedPlaylist.get('items').length).toEqual(initialItemCount + 2);
                });
            });

            //  Renaming sends a PATCH to the server.
            it("renames itself", function () {
                var newPlaylistTitle = 'Aww Yeah';
                savedPlaylist.set('title', newPlaylistTitle);

                expect(savedPlaylist.get('title')).toEqual(newPlaylistTitle);
            });

            // The user can drag-and-drop PlaylistItems around in the Playlist. After
            // such an event, the Playlist needs to reorder itself to match the given positions.
            xit("updates an item position itself", function() {
                var firstItem = savedPlaylist.get('items').at(0);
                var secondItem = savedPlaylist.get('items').at(1);

                var syncSuccessful = false;
                //  Provide a collect of positions and playlist will make its playlistItem order match those positions.
                var newPosition = 1;
                //  Resync playlist to swap item positions.
                savedPlaylist.moveItem(firstItem.get('id'), newPosition, function() {
                    syncSuccessful = true;
                });

                waitsFor(function() {
                    return syncSuccessful;
                }, "The Playlist should've have sync'ed", 10000);

                runs(function () {
                    expect(firstItem.get('position')).toEqual(1);
                    expect(secondItem.get('position')).toEqual(0);
                });
            });

            // Sets a PlaylistItem as selected (and deselects the previously selected) based on id
            it("selects an item by id", function () {
                var originalShuffledItemCount = savedPlaylist.get('shuffledItems').length;
                var selectedItem = savedPlaylist.getSelectedItem();
                var itemToSelect = savedPlaylist.get('items').at(selectedItem.get('position') + 1);
                
                savedPlaylist.selectItemById(itemToSelect);

                var newlySelectedItem = savedPlaylist.getSelectedItem();
                expect(newlySelectedItem.get('selected')).toEqual(true);
                expect(newlySelectedItem).toEqual(itemToSelect);
                
                expect(selectedItem.get('selected')).toEqual(false);

                if (originalShuffledItemCount === 1) {
                    expect(savedPlaylist.get('shuffledItems').length).toEqual(savedPlaylist.get('items').length);
                } else {
                    expect(savedPlaylist.get('shuffledItems').length).toEqual(originalShuffledItemCount - 1);
                }
            });

            // Returns a PlaylistItem object at a given position.
            xit("gets an item by position", function () {
                var hasAddedItem = false;
                var videoId = '8qffkPaCttY';
                
                runs(function () {
                    ytHelper.getVideoFromId(videoId, function (video) {
                        savedPlaylist.addItem(video, false);
                        hasAddedItem = true;
                    });
                });

                waitsFor(function() {
                    return hasAddedItem;
                }, "Should've added an item", 5000);

                runs(function() {
                    var itemCount = savedPlaylist.get('items').length;
                    var item = savedPlaylist.getItemByPosition(itemCount - 1);

                    expect(item.get('videoId')).toEqual(videoId);
                });
            });

            // Returns the current selected item. Should pretty much always exist unless there's 
            // no items in the Playlist.
            xit("gets selected item", function() {
                var selectedItem = savedPlaylist.getSelectedItem();

                expect(savedPlaylist.get('items').length).toBeGreaterThan(0);
                expect(selectedItem).not.toEqual(null);
            });

            // TODO: Kind of a hard one to test.
            // Returns a related video of the Playlist derived from each PlaylistItem's 
            // related videos provided by YouTube
            xit("gets related video", function () {
                var relatedVideo = savedPlaylist.getRelatedVideo();
                expect(relatedVideo).not.toBeNull();
            });

            //  TODO: Shuffling enabled? Pandora mode enabled?
            // Goes to the next item -- selecting it and pushing it onto history.
            xit("goes to next item sequentially", function () {
                var selectedItem = savedPlaylist.getSelectedItem();
                var selectedItemPosition = selectedItem.get('position');

                var nextItem = savedPlaylist.gotoNextItem();
                expect(nextItem).not.toBeNull();

                var nextItemPosition = nextItem.get('position');
                //  Goes forward one or loops around to front of playlist.
                expect(nextItemPosition === selectedItemPosition + 1 || nextItemPosition === 0).toEqual(true);
            });

            xit("goes to the next item with shuffle enabled", function() {

            });

            xit("goes to the next item with radio mode enabled", function() {

            });

            //  TODO: Shuffling enabled? Pandora mode enabled?
            //  The previous item is based first off of history. If the current Playlist has
            //  skipped forward items -- each item gets logged into History and is played is popped off
            //  to play when fulfilling previous items. If there is no history, then the previous item is
            //  found sequentially and loops around to the back of the playlist when going from position 0
            xit("goes to previous item", function () {
                var history = savedPlaylist.get('history');
                //  History[0] is current item.
                var expectedPreviousPosition;
                if (history.length > 1) {
                    //  Go back through the history as long as there is history.
                    expectedPreviousPosition = history[1].get('position');
                } else {
                    //  If there's no history, go back logically by position.
                    var selectedItem = savedPlaylist.getSelectedItem();
                    var selectedItemPosition = selectedItem.get('position');
                    var itemCount = savedPlaylist.get('items').length;
                    
                    //  Previous position will loop back to the end of the playlist if going past front.
                    if (selectedItemPosition === 0) {
                        expectedPreviousPosition = itemCount - 1;
                    } else {
                        expectedPreviousPosition = selectedItemPosition - 1;
                    }
                }

                var previousItem = savedPlaylist.gotoPreviousItem();
                expect(previousItem).not.toBeNull();
                    
                var previousItemPosition = previousItem.get('position');
                expect(previousItemPosition).toEqual(expectedPreviousPosition);
            });
            
            //  Deletes an item and saves the Playlist, updating the Position of all the other items.
            xit("removes an item", function () {
                console.log("initial shuffledItems:", savedPlaylist.get('shuffledItems').length);
                var initialItemCount = savedPlaylist.get('items').length;
                console.log("initial item count:", initialItemCount);
                var deleteResult = false;
                runs(function () {
                    var item = savedPlaylist.get('items').at(0);
                    savedPlaylist.removeItem(item, function (wasDeleteSuccessful) {
                        deleteResult = wasDeleteSuccessful;
                    });
                });

                waitsFor(function () {
                    return deleteResult;
                });

                runs(function () {
                    console.log("post shuffledItems:", savedPlaylist.get('shuffledItems').length);
                    expect(savedPlaylist.get('items').length).toEqual(initialItemCount - 1);

                    var shuffledItemsLength = savedPlaylist.get('shuffledItems').length;
                    if (initialItemCount === 1) {
                        expect(shuffledItemsLength).toEqual(savedPlaylist.get('items').length);
                    } else {
                        expect(shuffledItemsLength).toEqual(initialItemCount - 1);
                    }
                });
            });

            //  TODO: I'm not sure if a Playlist should be able to remove itself, or if a PlaylistCollection 
            //  should be able to remove it... probably both, but if additional work is needed for the cleanup then the Playlist would do it?
            xit("removes itself", function () {
                var wasRemoveSuccessfull = false;

                runs(function() {
                    savedPlaylist.destroy({
                        success: function() {
                            wasRemoveSuccessfull = true;
                        },
                        error: function () {
                            console.error("There was an error removing the playlist.");
                        }
                    });
                });

                waits(5000);

                runs(function() {
                    expect(wasRemoveSuccessfull).toEqual(true);
                });
            });
        });
        
    });