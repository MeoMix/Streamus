define(['skipButton'], function(skipButton){
    'use strict';
    var enableRadioModeCheckBox = $('#EnableRadioModeCheckBox');

    var isRadioModeEnabled = JSON.parse(localStorage.getItem('isRadioModeEnabled')) || false;
    enableRadioModeCheckBox.prop('checked', isRadioModeEnabled);

    enableRadioModeCheckBox.change(function () {
        console.log("setting checked:", this.checked);
        localStorage.setItem('isRadioModeEnabled', this.checked);
        skipButton.refresh();
    }).trigger('change');
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
		    //             console.log("creating beatport list", videos);
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