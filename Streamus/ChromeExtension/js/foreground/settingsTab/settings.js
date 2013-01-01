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

		    //         var songTitles = [];
		    //         $(page).find('.secondColumn a').each(function() {
		    //             songTitles.push(this.title);
		    //         });

		    //         var onBeatportScrapeComplete = function(songs) {
		    //             console.log("creating beatport list", songs);
		    //             addPlaylist("Beatport Top 100", songs);
		    //         };

		    //         var songIndex = 0;
		    //         var processNext;
		    //         var beatportSongs = [];
		    //         (processNext = function() {
		    //             if (songIndex < songTitles.length) {
		    //                 var songTitle = songTitles[songIndex];
		    //                 songIndex++;
		    //                 ytHelper.search(songTitle, function(videos) {
		    //                     if (videos[0]) {
		    //                         beatportSongs.push(videos[0]);
		    //                     }
		    //                     processNext();
		    //                 });
		    //             } else {
		    //                 onBeatportScrapeComplete(beatportSongs);
		    //             }
		    //         })();
		    //     }
		    // };

		    // xmlhttp.open("GET", "http://www.beatport.com/top-100", true);
		    // xmlhttp.send();