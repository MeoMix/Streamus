//  Displays the currently playing playlistItem's title or a default welcome message.
define(['backgroundManager', 'helpers'], function (backgroundManager, helpers) {
    'use strict';
    var header = $('#Header');
    var headerTitle = $('#HeaderTitle');
    var defaultTitle = 'Welcome to Streamus';
    
    helpers.scrollElementInsideParent(headerTitle, header);
    
    backgroundManager.on('change:activePlaylistItem', function (model, activePlaylistItem) {
        setTitle(activePlaylistItem);
    });

    //  Initialize the title because might be re-opening with a playlistItem already loaded.
    setTitle(backgroundManager.get('activePlaylistItem'));
    
    function setTitle(item) {
        var titleText = item == null ? defaultTitle : item.get('title');
        headerTitle.text(titleText);
    }
});