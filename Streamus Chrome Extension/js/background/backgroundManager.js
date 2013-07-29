//  Exposed globally so that foreground.js is able to access via chrome.getBackgroundPage
var BackgroundManager = null;

//  BackgroundManager is a denormalization point for the Background's selected models.
//  NOTE: It is important to understand that the activePlaylist is NOT guaranteed to be in the activeFolder. The user can click around, but this shouldn't affect state
//  until they make a decision.
define(['user', 'player', 'settingsManager', 'playlistItems', 'playlists', 'folders', 'repeatButtonState', 'streamItems', 'playerState'],
    function (user, player, settingsManager, PlaylistItems, Playlists, Folders, RepeatButtonState, StreamItems, PlayerState) {
    'use strict';

    var backgroundManagerModel = Backbone.Model.extend({
        defaults: {
            activePlaylist: null,
            activeFolder: null,
            allPlaylistItems: new PlaylistItems(),
            allPlaylists: new Playlists(),
            allFolders: new Folders()
        },
        initialize: function () {

            var self = this;
            //  TODO:  What if user's loaded state gets set before backgroundManager initializes? Not really possible unless instant response, but still.
            user.on('change:loaded', function (model, loaded) {
                console.log("Change:loaded has fired", loaded);
                
                if (loaded) {

                    if (user.get('folders').length === 0) {
                        throw "User should be initialized and have at least 1 folder before loading backgroundManager.";
                    }

                    //  TODO: I hate this whole concept of having to check if its ready else wait for it to be ready.
                    //  Do not initialize the backgroundManager until player is ready to go.
                    if (player.get('ready')) {
                        initialize.call(self);
                    } else {
                        player.once('change:ready', function() {
                            initialize.call(self);
                        });
                    }

                } else {
                    
                    //  Unload streamus when refreshing ??
                    self.set('activePlaylist', null);
                    self.set('activeFolder', null);
                    self.set('allPlaylistItems', new PlaylistItems());
                    self.set('allPlaylists', new Playlists());
                    self.set('allFolders', new Folders());
                }

            });

        },
        
        getPlaylistById: function(playlistId) {
            return this.get('allPlaylists').find(function(playlist) {
                return playlist.get('id') === playlistId;
            });
        },
        
        getPlaylistItemById: function(playlistItemId) {
            return this.get('allPlaylistItems').find(function(playlistItem) {
                return playlistItem.get('id') === playlistItemId;
            });
        },
        
        getFolderById: function(folderId) {
            return this.get('allFolders').find(function(folder) {
                return folder.get('id') === folderId;
            });
        }
    });
    
    function initialize() {
        console.log("Initializing backgroundManager with user:", user);
        this.get('allFolders').add(user.get('folders').models);
        this.get('allPlaylists').add(getAllPlaylists());
        this.get('allPlaylistItems').add(getAllPlaylistItems());

        loadActiveFolder.call(this);
        loadActivePlaylist.call(this);
        
        this.listenTo(StreamItems, 'change:selected', function (changedStreamItem, selected) {

            //  TODO: Remember selected state in local storage.
            if (selected) {

                var videoId = changedStreamItem.get('video').get('id');

                //  Maintain the state of the player by playing or cueuing based on current player state.
                var playerState = player.get('state');

                if (playerState === PlayerState.PLAYING || playerState === PlayerState.ENDED) {
                    player.loadVideoById(videoId);
                } else {
                    console.log("Cueuing video by ID:", videoId);
                    player.cueVideoById(videoId);
                }
            }

        });

        this.listenTo(StreamItems, 'empty', function () {
            //  TODO: Clear localStorage once I write to local storage.
            player.stop();
        });

        var self = this;

        this.get('allPlaylists').on('change:active', function(playlist, isActive) {

            if (self.get('activePlaylist') === playlist && !isActive) {
                self.set('activePlaylist', null);
            } else if (isActive) {
                self.set('activePlaylist', playlist);
            }

        });

        this.get('allPlaylists').each(function(playlist) {
            bindEventsToPlaylist.call(self, playlist);
        });

        this.get('allFolders').on('change:active', function(folder, isActive) {

            if (self.get('activeFolder') === folder && !isActive) {
                self.set('activeFolder', null);
            } else if (isActive) {
                self.set('activeFolder', folder);
            }

        });

        //  Message any YouTube pages to ensure that Streamus data loaded on the YouTube page stays up to date.
        this.get('allFolders').on('add', function (folder) {
            chrome.runtime.sendMessage({ method: "folderAdded", folder: folder });
        });

        this.get('allFolders').on('remove', function (folder) {
            chrome.runtime.sendMessage({ method: "folderRemoved", folder: folder });
        });

        this.get('allFolders').each(function (folder) {

            folder.get('playlists').on('add', function (playlist) {
                self.get('allPlaylists').add(playlist);
 
                var playlistItems = playlist.get('items');

                playlistItems.each(function (playlistItem) {
                    
                    self.get('allPlaylistItems').add(playlistItem, {
                        merge: true
                    });

                });

                bindEventsToPlaylist.call(self, playlist);
            });

            folder.get('playlists').on('remove', function (playlist) {

                self.get('allPlaylists').remove(playlist);

                if (self.get('activePlaylist') === playlist) {

                    var nextPlaylistId = playlist.get('nextPlaylistId');
                    var activePlaylist = folder.get('playlists').get(nextPlaylistId);

                    self.set('activePlaylist', activePlaylist);
                }

            });

        });

        //  TODO: Support adding Folder here.
        //  TODO: Support removing Folder here.
    }
    
    function bindEventsToPlaylist(playlist) {
        var self = this;
        playlist.get('items').on('add', function (playlistItem) {
            
            self.get('allPlaylistItems').add(playlistItem, {
                merge: true
            });

        });

        playlist.get('items').on('remove', function (playlistItem) {

            var playlistId = playlistItem.get('playlistId');
            var playlist = self.getPlaylistById(playlistId);
            var playlistItems = playlist.get('items');

            //  TODO: Re-evaluate this logic.
            //  TODO: I'd like to have this logic inside of playlist and not backgroundManager but the first bit of code
            //  needs to run first because playlist.gotoNextItem is dependent on the old firstItemId to know the next item.
            //  Update these before getting nextItem because we don't want to have something point to the removed item.
            if (playlistItems.length > 0) {
                //  Update linked list pointers
                var previousItem = playlistItems.get(playlistItem.get('previousItemId'));
                var nextItem = playlistItems.get(playlistItem.get('nextItemId'));

                //  Remove the item from linked list.
                previousItem.set('nextItemId', nextItem.get('id'));
                nextItem.set('previousItemId', previousItem.get('id'));
                
                //  Update firstItem if it was removed
                if (playlist.get('firstItemId') === playlistItem.get('id')) {
                    playlist.set('firstItemId', playlistItem.get('nextItemId'));
                }

            } else {
                playlist.set('firstItemId', '00000000-0000-0000-0000-000000000000');
            }
            
            self.get('allPlaylistItems').remove(playlistItem);
        });
    }
    
    function loadActiveFolder() {
 
        this.on('change:activeFolder', function (model, activeFolder) {

            if (activeFolder === null) {
                settingsManager.set('activeFolderId', null);
            } else {
                settingsManager.set('activeFolderId', activeFolder.get('id'));
            }
        });
        
        var activeFolderId = settingsManager.get('activeFolderId');
        var activeFolder = this.get('allFolders').get(activeFolderId);

        if (typeof (activeFolder) === 'undefined') {
            this.set('activeFolder', this.get('allFolders').at(0));
        } else {
            this.set('activeFolder', activeFolder);
        }
    }

    function loadActivePlaylist() {
 
        this.on('change:activePlaylist', function (model, activePlaylist) {

            if (activePlaylist === null) {
                settingsManager.set('activePlaylistId', null);
            } else {
                settingsManager.set('activePlaylistId', activePlaylist.get('id'));
            }

        });
        
        var activePlaylistId = settingsManager.get('activePlaylistId');

        //  There is no guarantee that activePlaylist is in activeFolder because a user could be looking
        //  at another folder without having selected a playlist in that folder.
        var activePlaylist = _.find(getAllPlaylists(), function (playlist) {
            return playlist.get('id') === activePlaylistId;
        }) || null;
        
        if (activePlaylist === null) {
            activePlaylist = this.get('activeFolder').get('playlists').at(0) || null;
        }

        this.set('activePlaylist', activePlaylist);
    }

    //  Takes all folders, retrieves all playlists from folders and then all items from playlists.
    function getAllPlaylistItems() {
        var allPlaylists = getAllPlaylists();

        var allPlaylistItems = _.flatten(_.map(allPlaylists, function (playlist) {
            return playlist.get('items').models;
        }));

        return allPlaylistItems;
    }

        //  Takes all folders and retrieves all playlists from the folders.
    function getAllPlaylists() {
        var allPlaylists = _.flatten(BackgroundManager.get('allFolders').map(function (folder) {
            return folder.get('playlists').models;
        }));

        return allPlaylists;
    }

    BackgroundManager = new backgroundManagerModel();

    return BackgroundManager;
});