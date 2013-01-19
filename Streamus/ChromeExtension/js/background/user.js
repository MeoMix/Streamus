define(['programState'
       ], function (programState) {
    'use strict';
    //User data will be loaded either from cache or server.
    var user = {};
    var userIdKey = 'UserId';

	var events = {
	    userLoaded: 'userLoaded'
	};

	//First check localStorage for the user's key. If it is not found, check storage.sync.
    //if still not found, generate a new key.
	var userId = localStorage.getItem(userIdKey);
    //  TODO: Allow multiple users at some point.
	userId = '3137f79d-9604-4e2f-aa57-9b12cc65ba45';
	if (userId) {
	    getUserById(userId, function (foundUser) {
	        user = foundUser;
	        chrome.storage.sync.set({ userIdKey: user.id });
	        localStorage.setItem(userIdKey, user.id);
	        $(document).trigger(events.userLoaded);
	    });
	} else {
	    //Sync storage returns found items through a callback, it is async.
	    chrome.storage.sync.get(userIdKey, function (data) {
	        var foundUserId = data[userIdKey];
	        if (foundUserId) {
			    getUserById(foundUserId, function(foundUser) {
			        user = foundUser;
			        localStorage.setItem(userIdKey, user.id);
			        $(document).trigger(events.userLoaded);
			    });
			}
			else{				
			    //No stored ID found -- create a new user and save the returned identity.
	            $.ajax({
	                url: programState.getBaseUrl() + 'User/Create',
	                type: 'GET',
	                success: function(createdUser) {
	                    user = createdUser;
	                    localStorage.setItem(userIdKey, user.id);
	                    chrome.storage.sync.set({ userIdKey: user.id });
	                    $(document).trigger(events.userLoaded);
	                },
	                error: function(error) {
	                    console.error(error);
	                }
	            });
	        }
		});
	}
    
	function getUserById(id, callback) {
	    $.ajax({
	        url: programState.getBaseUrl() + 'User/GetById',
	        type: 'GET',
	        data: {
	            id: id
	        },
	        success: callback,
	        error: function(error) {
	            console.error(error);
	        }
	    });
	};

	return {
	    onLoaded: function (event) {
	        $(document).on(events.userLoaded, event);
	    },
        get id() {
            return user.id;
        },
        set id(value) {
            user.id = value;
        },
        get loaded(){
        	return user.loaded;
        }
	};
});