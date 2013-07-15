var QueueItems;

define(['queueItem'], function (QueueItem) {
    'use strict';

    var queueItemsCollection = Backbone.Collection.extend({
        model: QueueItem
    });

    QueueItems = new queueItemsCollection;

    return QueueItems;
});