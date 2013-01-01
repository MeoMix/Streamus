//When the foreground is loaded it will load uiElements which in turn loads each ui element.
//Whenever the foreground receives a response from the background, it refreshes its UI.
//I tried refreshing specific UI elements based on specific background messages, but it was just too messy and seemed like a premature optimization.
define(['uiElements'], function (uiElements) {
    'use strict';
    //Background's player object will notify the foreground whenever its state changes.
    chrome.extension.onConnect.addListener(function (port) {
        port.onMessage.addListener(uiElements.refresh);
    });

    chrome.extension.getBackgroundPage().YoutubePlayer.connect();
});