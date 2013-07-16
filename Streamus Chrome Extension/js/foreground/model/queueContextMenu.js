
define(function () {
    'use strict';

    var QueueContextMenu = Backbone.Model.extend({
        defaults: function () {
            return {
                queueItem: null
            };
        }
    });

    return QueueContextMenu;
});