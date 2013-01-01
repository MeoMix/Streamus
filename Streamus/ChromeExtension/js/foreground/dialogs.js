define(function() {
    'use strict';
    return {
        showBannedSongDialog: function() {
            var bannedSongDialog = $('#BannedSongDialog');

            bannedSongDialog.dialog({
                autoOpen: true,
                modal: true,
                buttons: {
                    "Ok": function() {
                        $(this).dialog("close");
                    }
                }
            });
        }
    };
});