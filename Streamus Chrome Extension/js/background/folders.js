define(['folder'], function (Folder) {
    'use strict';

    var folderCollection = Backbone.Collection.extend({
        model: Folder
    });

    return function (config) {
        var folders = new folderCollection(config);

        return folders;
    };
});