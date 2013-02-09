//http://www.geoplugin.net/javascript.gp
//Needed to figure out GeoLocation to filter out some video suggestions.
//  TODO: I'm tempted to implement this with my server so I don't have to request more permissions... not sure if its worth it, though.
define(function() {
    'use strict';
    var countryCode = 'US';

    //Cross-Origin Resource Sharing unavailable from file://
    if (window.location.protocol !== 'file:') {
        if (window.location.protocol === 'chrome-extension:') {
            $.ajax({
                url: 'http://www.geoplugin.net/json.gp',
                success: function(result) {
                    var geoplugin = JSON.parse(result.replace(/^[^\{]+/, '').replace(/\);?$/, ''));
                    countryCode = geoplugin.geoplugin_countryCode;
                }
            });
        } else {
            $.ajax({
                url: 'http://www.geoplugin.net/json.gp',
                dataType: 'jsonp',
                jsonp: 'jsoncallback',
                success: function(result) {
                    countryCode = result.geoplugin_countryCode;
                }
            });
        }
    }

    return {
        get countryCode() {
            return countryCode;
        }
    };
});