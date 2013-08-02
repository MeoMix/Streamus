//  This is the list of playlists on the playlists tab.
define(['contextMenuView', 'backgroundManager', 'helpers', 'spinnerBuilder', 'dataSource', 'streamItems', 'playlistView'], function (ContextMenuView, backgroundManager, helpers, SpinnerBuilder, DataSource, StreamItems, PlaylistView) {
    'use strict';

    var PlaylistsView = Backbone.View.extend({
        
        el: $('#PlaylistsView'),
        
        ul: $('#PlaylistsView ul'),
        
        emptyNotification: $('#PlaylistsView .emptyListNotification'),
        
        spinner: SpinnerBuilder.buildPlaylistSpinner(),
        
        events: {
            'contextmenu': 'showContextMenu',
            'contextmenu li': 'showItemContextMenu',
            'click ul li': 'selectPlaylist'
        },
        
        //  Refreshes the playlist display with the current playlist information.
        render: function() {
            this.ul.empty();

            var activeFolder = backgroundManager.get('activeFolder');

            // TODO: Why am I calling render on playlistsView if activeFolder is null?
            if (activeFolder === null || activeFolder.get('playlists').length === 0) {
                this.emptyNotification.show();
            } else {
                this.emptyNotification.hide();
                
                var firstPlaylistId = activeFolder.get('firstPlaylistId');
                var playlist = activeFolder.get('playlists').get(firstPlaylistId);

                //  Build up the ul of li's representing each playlist.
                var listItems = [];
                do {

                    var playlistView = new PlaylistView({
                        model: playlist
                    });

                    var element = playlistView.render().el;
                    listItems.push(element);

                    var nextPlaylistId = playlist.get('nextPlaylistId');
                    playlist = activeFolder.get('playlists').get(nextPlaylistId);

                } while (playlist.get('id') !== firstPlaylistId)
                
                //  Do this all in one DOM insertion to prevent lag in large folders.
                this.ul.append(listItems);

                //  TODO: This is probably partially handled by the PlaylistView not PlaylistsView
                //  TODO: I presume this is still useful, but playlistItemsView doesn't have it so I need to double check.
                var activePlaylist = backgroundManager.get('activePlaylist');
                if (activePlaylist !== null) {
                    this.visuallySelectPlaylist(activePlaylist);
                }
            }

            return this;
        },
        
        initialize: function () {
            var self = this;
            
            //  TODO: Sortable.

            this.listenTo(backgroundManager, 'change:activeFolder', this.render);
            this.listenTo(backgroundManager, 'change:activePlaylist', function(collection, playlist) {
                console.log("Active playlist:", playlist);
                if (playlist === null) {
                    self.ul.find('li').removeClass('loaded');
                } else {
                    self.visuallySelectPlaylist(playlist);
                }

            });
            
            this.listenTo(backgroundManager.get('allPlaylistItems'), 'add remove', this.updatePlaylistDescription);
            this.listenTo(backgroundManager.get('allPlaylists'), 'reset', this.render);
            this.listenTo(backgroundManager.get('allPlaylists'), 'add', this.addItem);
            
            //  TODO: THIS IS INCORRECT. Instead of allPlaylists it should be when the activeFolder is empty, but I need to be able to change the activeFolder listener.
            this.listenTo(backgroundManager.get('allPlaylists'), 'empty', function () {
                self.emptyNotification.show();
            });

            this.render();
            
            //  todo: find a place for this
            this.scrollIntoView(backgroundManager.get('activePlaylist'), false);
        },
        
        //  TODO: This should be implemented non-naively.
        addItem: function (playlist) {
            //  TODO: Don't just render here. 
            this.render();

            if (playlist.has('dataSource')) {

                var dataSourceType = playlist.get('dataSource').type;

                if (dataSourceType === DataSource.YOUTUBE_PLAYLIST || dataSourceType === DataSource.YOUTUBE_CHANNEL) {

                    var playlistLink = self.ul.find('li[data-playlistid="' + playlist.get('id') + '"]');
                    self.spinner.spin(playlistLink[0]);

                    playlist.once('change:dataSourceLoaded', function () {
                        self.spinner.stop();
                    });

                }
            }

            this.scrollIntoView(playlist, true);
        },
        
        //  TODO: Folder otpions.
        showContextMenu: function(event) {
            
        },
        
        showItemContextMenu: function (event) {
            
            var activeFolder = backgroundManager.get('activeFolder');

            var clickedPlaylistId = $(event.currentTarget).data('playlistid');
            var clickedPlaylist = activeFolder.get('playlists').get(clickedPlaylistId);

            //  Don't allow deleting of the last playlist in a folder ( at least for now )
            var isDeleteDisabled = clickedPlaylist.get('nextPlaylistId') === clickedPlaylist.get('id');
            var isAddPlaylistDisabled = clickedPlaylist.get('items').length === 0;

            ContextMenuView.addGroup({
                position: 0,
                items: [{
                    position: 0,
                    text: 'Copy URL',
                    onClick: function () {

                        clickedPlaylist.getShareCode(function (shareCode) {

                            var shareCodeShortId = shareCode.get('shortId');
                            var urlFriendlyEntityTitle = shareCode.get('urlFriendlyEntityTitle');

                            var playlistShareUrl = 'http://share.streamus.com/playlist/' + shareCodeShortId + '/' + urlFriendlyEntityTitle;

                            chrome.extension.sendMessage({
                                method: 'copy',
                                text: playlistShareUrl
                            });

                        });

                    }
                }, {
                    position: 1,
                    text: 'Delete',
                    disabled: isDeleteDisabled,
                    title: isDeleteDisabled ? 'This is your last Playlist, so you can\'t delete it' : '',
                    onClick: function () {

                        if (!isDeleteDisabled) {
                            clickedPlaylist.destroy();
                        }
                    }
                }, {
                    position: 2,
                    text: 'Add Playlist to Stream',
                    disabled: isAddPlaylistDisabled,
                    title: isAddPlaylistDisabled ? 'You need to add items to your Playlist first' : '',
                    onClick: function () {

                        if (!isAddPlaylistDisabled) {

                            var streamItems = clickedPlaylist.get('items').map(function (playlistItem) {
                                return {
                                    id: _.uniqueId('streamItem_'),
                                    video: playlistItem.get('video'),
                                    title: playlistItem.get('title'),
                                    videoImageUrl: 'http://img.youtube.com/vi/' + playlistItem.get('video').get('id') + '/default.jpg'
                                };
                            });

                            StreamItems.addMultiple(streamItems);
                        }

                    }
                }]
            });

            ContextMenuView.show({
                top: event.pageY,
                left: event.pageX + 1
            });

            return false;
        },
        
        selectPlaylist: function(event) {
            var playlistId = $(event.currentTarget).data('playlistid');
            var playlist = backgroundManager.getPlaylistById(playlistId);

            this.visuallySelectPlaylist(playlist);
            backgroundManager.set('activePlaylist', playlist);
        },
        
        //  TODO: Needs to be dry with playlistItemsView
        scrollIntoView: function (activePlaylist, useAnimation) {

            //  Since we emptied our list we lost the selection, reselect.
            if (activePlaylist) {
                
                var loadedPlaylistId = activePlaylist.get('id');
                var activeListItem = this.ul.find('li[data-playlistid="' + loadedPlaylistId + '"]');

                if (activeListItem.length > 0) {
                    activeListItem.scrollIntoView(useAnimation);
                }
            }
            
        },
        
        //  TODO: Just call render instead?
        //  TODO: Check if this is still needed. Probably is though.
        //  Playlists keep track of how many videos they have. When adding a lot of items -- throttle.
        updatePlaylistDescription: _.throttle(function(playlistItem) {

            var playlistId = playlistItem.get('playlistId');
            var playlistLink = this.ul.find('li[data-playlistid="' + playlistId + '"]');

            var playlist = backgroundManager.getPlaylistById(playlistId);

            var currentItems = playlist.get('items');
            var currentVideos = currentItems.map(function (currentItem) {
                return currentItem.get('video');
            });

            var currentVideosDurations = currentVideos.map(function (currentVideo) {
                return currentVideo.get('duration');
            });

            var sumVideosDurations = _.reduce(currentVideosDurations, function (memo, duration) {
                return memo + duration;
            }, 0);

            var playlistInfo = 'Videos: ' + currentVideos.length + ', Duration: ' + helpers.prettyPrintTime(sumVideosDurations);
            playlistLink.find('.playlistInfo').text(playlistInfo);
            
        }, 100),
        
        //  Removes the old 'current' marking and move it to the newly selected row.
        visuallySelectPlaylist: function(playlist) {
            this.scrollIntoView(playlist, false);

            this.ul.find('li').removeClass('loaded');
            this.ul.find('li[data-playlistid="' + playlist.get('id') + '"]').addClass('loaded');
        }

    });

    return new PlaylistsView;
});