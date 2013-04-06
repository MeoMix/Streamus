define(function() {
    'use strict';
    return {
        showBannedVideoDialog: function() {
            var bannedVideoDialog = $('#BannedVideoDialog');

            bannedVideoDialog.dialog({
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