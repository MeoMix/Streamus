define(function(){
    'use strict';
    var enableRadioModeCheckBox = $('#EnableRadioModeCheckBox');

    var isRadioModeEnabled = JSON.parse(localStorage.getItem('isRadioModeEnabled')) || false;
    enableRadioModeCheckBox.prop('checked', isRadioModeEnabled);

    enableRadioModeCheckBox.change(function () {
        localStorage.setItem('isRadioModeEnabled', this.checked);
    }).trigger('change');

    var ohi = chrome.extension.getBackgroundPage().$('#MusicHolder');

    //var trolol = $('<video>', {
    //    'class': 'video-stream html5-main-video',
    //    'x-webkit-airplay': 'allow',
    //    'data-youtube-id': 'mI2L7U5n0LI',
    //    src: "http://r3---sn-nwj7knle.c.youtube.com/videoplayback?ip=71.93.50.16&key=yt1&mv=m&upn=uLDsgiy-sw4&source=youtube&sparams=cp%2Cgcr%2Cid%2Cip%2Cipbits%2Citag%2Cratebypass%2Csource%2Cupn%2Cexpire&mt=1361772731&ipbits=8&ratebypass=yes&gcr=us&itag=43&id=988d8bed4e67d0b2&expire=1361798637&ms=au&fexp=919358%2C916626%2C920704%2C912806%2C902000%2C922403%2C922405%2C929901%2C913605%2C925006%2C931202%2C908529%2C920201%2C930101%2C906834%2C901451&newshard=yes&cp=U0hVRldUVl9IUUNONV9PTlpHOlhteDFWbzN0OXNI&sver=3&cpn=oAqP0d2XDxPDfUBb&signature=45C83DCC7282938BD4950A05A7245520D0C067F8.7543CC2B480FD5F2E86DB383D57515CBF68EFA2C&ptk=k7_records&oid=4J4UVyjkquoPEpjkgKhcZg&ptchn=GoldDustM&pltype=content",
    //    width: '640px',
    //    height: '360px'
    //});

    //$('#SettingsContent').append(trolol);



    //trolol.get(0).play();


    //$('#SettingsContent').append(ohi);

});


// TODO: Move this somewhere.
		    // var xmlhttp = new XMLHttpRequest();
		    // xmlhttp.onreadystatechange = function() {
		    //     if (this.readyState == 4) {
		    //         var page = document.implementation.createHTMLDocument("");
		    //         page.documentElement.innerHTML = this.responseText;

		    //         var videoTitles = [];
		    //         $(page).find('.secondColumn a').each(function() {
		    //             videoTitles.push(this.title);
		    //         });

		    //         var onBeatportScrapeComplete = function(videos) {
		    //             addPlaylist("Beatport Top 100", videos);
		    //         };

		    //         var videoIndex = 0;
		    //         var processNext;
		    //         var beatportVideos = [];
		    //         (processNext = function() {
		    //             if (videoIndex < videoTitles.length) {
		    //                 var videoTitle = videoTitles[videoIndex];
		    //                 videoIndex++;
		    //                 ytHelper.search(videoTitle, function(videos) {
		    //                     if (videos[0]) {
		    //                         beatportVideos.push(videos[0]);
		    //                     }
		    //                     processNext();
		    //                 });
		    //             } else {
		    //                 onBeatportScrapeComplete(beatportVideos);
		    //             }
		    //         })();
		    //     }
		    // };

		    // xmlhttp.open("GET", "http://www.beatport.com/top-100", true);
		    // xmlhttp.send();