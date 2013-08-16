//  Exposed globally so that foreground.js is able to access via chrome.getBackgroundPage
var BackgroundManager = null;

//  BackgroundManager is a denormalization point for the Background's selected models.
define([
    'user',
    'player',
    'settings',
    'playlistItems',
    'playlists',
    'folders',
    'repeatButtonState',
    'streamItems',
    'playerState'
], function (User, Player, Settings, PlaylistItems, Playlists, Folders, RepeatButtonState, StreamItems, PlayerState) {
    'use strict';

    var backgroundManagerModel = Backbone.Model.extend({
        defaults: {
            activeFolder: null,
            allFolders: new Folders()
        },
        initialize: function () {

            var self = this;
            //  TODO:  What if user's loaded state gets set before backgroundManager initializes? Not really possible unless instant response, but still.
            User.on('change:loaded', function (model, loaded) {

                if (loaded) {

                    if (User.get('folders').length === 0) {
                        throw "User should be initialized and have at least 1 folder before loading backgroundManager.";
                    }

                    //  TODO: I hate this whole concept of having to check if its ready else wait for it to be ready.
                    //  Do not initialize the backgroundManager until player is ready to go.
                    if (Player.get('ready')) {
                        initialize.call(self);
                    } else {
                        Player.once('change:ready', function () {
                            initialize.call(self);
                        });
                    }

                } else {
                    
                    //  Unload streamus when refreshing ??
                    self.set('activeFolder', null);
                    self.set('allFolders', new Folders());
                }

            });
            
        },
        
        getFolderById: function(folderId) {
            return this.get('allFolders').find(function(folder) {
                return folder.get('id') === folderId;
            });
        }
    });
    
    function initialize() {
        this.get('allFolders').add(User.get('folders').models);

        loadActiveFolder.call(this);

        this.listenTo(StreamItems, 'change:selected', function (changedStreamItem, selected) {

            //  TODO: Remember selected state in local storage.
            if (selected) {

                var videoId = changedStreamItem.get('video').get('id');

                //  Maintain the state of the player by playing or cueuing based on current player state.
                var playerState = Player.get('state');

                if (playerState === PlayerState.PLAYING || playerState === PlayerState.ENDED) {
                    Player.loadVideoById(videoId);
                } else {
                    Player.cueVideoById(videoId);
                }
            }

        });

        var self = this;

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

    }
        
    function loadActiveFolder() {
 
        this.on('change:activeFolder', function (model, activeFolder) {

            if (activeFolder === null) {
                Settings.set('activeFolderId', null);
            } else {
                Settings.set('activeFolderId', activeFolder.get('id'));
            }
        });
        
        var activeFolderId = Settings.get('activeFolderId');
        var activeFolder = this.get('allFolders').get(activeFolderId);

        if (typeof (activeFolder) === 'undefined') {
            this.set('activeFolder', this.get('allFolders').at(0));
        } else {
            this.set('activeFolder', activeFolder);
        }
    }

    BackgroundManager = new backgroundManagerModel();

    return BackgroundManager;
});