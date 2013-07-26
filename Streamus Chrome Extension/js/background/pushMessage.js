define(['entityType', 'entityAction'], function(EntityType, EntityAction) {
    'use strict';

    var pushMessageModel = Backbone.Model.extend({
        defaults: function() {
            return {
                entityId: null,
                entityAction: EntityAction.None,
                entityType: EntityType.None
            };
        }
    });

    return function(config) {

        var pushMessage = new pushMessageModel(config);

        return pushMessage;
    };
});