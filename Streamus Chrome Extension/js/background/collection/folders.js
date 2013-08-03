define([
    'folder'
], function (Folder) {
    'use strict';

    var Folders = Backbone.Collection.extend({
        model: Folder
    });

    return Folders;
});