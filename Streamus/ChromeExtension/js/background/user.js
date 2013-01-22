define(['programState'], function (programState) {
    'use strict';
    var userIdKey = 'UserId';

    //  User data will be loaded either from cache or server.
    var User = Backbone.Model.extend({
        defaults: {
            //  TODO: Allow multiple users at some point. This is just for debugging for now.
            id: '3137f79d-9604-4e2f-aa57-9b12cc65ba45' //localStorage.getItem(userIdKey)
        },
        urlRoot: programState.getBaseUrl() + 'User/',
        initialize: function () {
            //  If user's ID wasn't found in local storage, check sync.
            if (this.isNew()) {
                //  chrome.Storage.sync is cross-computer syncing with restricted read/write amounts.
                chrome.storage.sync.get(userIdKey, function(data) {
                    var foundUserId = data[userIdKey];
                    if (foundUserId) {
                        this.set('id', foundUserId);
                        this.fetch({
                            success: function(model) {
                                localStorage.setItem(userIdKey, model.get('id'));
                                model.trigger('onLoaded');
                            },
                            error: function (error) {
                                console.error(error);
                            }
                        });
                    }
                    else{				
                        //  No stored ID found -- create a new user and save the returned identity.
                        //  TODO: Not 100% on fetching here.

                        this.fetch({
                            success: function(model) {
                                localStorage.setItem(userIdKey, model.get('id'));
                                chrome.storage.sync.set({ userIdKey: model.get('id') });
                                model.trigger('onLoaded');
                            },
                            error: function(error) {
                                console.error(error);
                            }
                        });
                    }
                });

            } else {
                this.fetch({
                    success: function (model) {
                        chrome.storage.sync.set({ userIdKey: model.get('id') });
                        localStorage.setItem(userIdKey, model.get('id'));
                        model.trigger('onLoaded');
                    },
                    error: function (error) {
                        console.error(error);
                    }
                });
            }
        }
    });


   
	//if (userId) {
	//    getUserById(userId, function (foundUser) {
	//        user = foundUser;
	//        chrome.storage.sync.set({ userIdKey: user.id });
	//        localStorage.setItem(userIdKey, user.id);
	//        $(document).trigger(events.userLoaded);
	//    });
	//} else {
	//    //Sync storage returns found items through a callback, it is async.
	//    chrome.storage.sync.get(userIdKey, function (data) {
	//        var foundUserId = data[userIdKey];
	//        if (foundUserId) {
	//		    getUserById(foundUserId, function(foundUser) {
	//		        user = foundUser;
	//		        localStorage.setItem(userIdKey, user.id);
	//		        $(document).trigger(events.userLoaded);
	//		    });
	//		}
	//		else{				
	//		    //No stored ID found -- create a new user and save the returned identity.
	//            $.ajax({
	//                url: programState.getBaseUrl() + 'User/Create',
	//                type: 'GET',
	//                success: function(createdUser) {
	//                    user = createdUser;
	//                    localStorage.setItem(userIdKey, user.id);
	//                    chrome.storage.sync.set({ userIdKey: user.id });
	//                    $(document).trigger(events.userLoaded);
	//                },
	//                error: function(error) {
	//                    console.error(error);
	//                }
	//            });
	//        }
	//	});
	//}
    
	//function getUserById(id, callback) {
	//    $.ajax({
	//        url: programState.getBaseUrl() + 'User/GetById',
	//        type: 'GET',
	//        data: {
	//            id: id
	//        },
	//        success: callback,
	//        error: function(error) {
	//            console.error(error);
	//        }
	//    });
	//};

    return new User();
});