define(function(){
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
	userId = '3340883B-87BC-4118-BB4A-8FC29248CF88';
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
			    $.getJSON('http://localhost:61975/User/Create', function (createdUser) {
			        user = createdUser;
			        localStorage.setItem(userIdKey, user.id);
			        chrome.storage.sync.set({ userIdKey: user.id });
			        $(document).trigger(events.userLoaded);
			    });
			}
		});
	}
    
	function getUserById(id, callback) {
	    $.getJSON('http://localhost:61975/User/GetById', { id: id }, function (foundUser) {
	        callback(foundUser);
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