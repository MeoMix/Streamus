define(function() {
    'use strict';
    return {
        showBannedVideoDialog: function () {

            var bannedVideoDialog = $('<div>', {
                id: 'BannedVideoDialog',
                text: 'Unable to use video because it was banned on copyright grounds.'
            });

            bannedVideoDialog.appendTo('body');

            bannedVideoDialog.dialog({
                autoOpen: true,
                modal: true,
                buttons: {
                    "Ok": function() {
                        $(this).dialog("close");
                    }
                },
                close: function() {
                    $(this).remove();
                }
            });
        }
    };
});