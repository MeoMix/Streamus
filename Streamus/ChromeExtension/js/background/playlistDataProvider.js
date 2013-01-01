//Provides playlist data from various sources such as from defaults, BeatPort, etc..
define(function() {
    'use strict';

    var defaultPlaylistConfigs = [{
            id: "d6103404-1568-4d18-922b-058656302b22",
            title: "GRiZ",
            selected: true,
            shuffledItems: [{
                "id": "4696c63f-8dae-4803-8e19-2b89c339f478",
                "videoId": "CI-p4OkT3qE", "url": "http://youtu.be/CI-p4OkT3qE",
                "title": "Griz - Smash The Funk | Mad Liberation (2/12)",
                "duration": "411"
            }, {
                "id": "2ef29e04-d038-44f9-b3a4-ad163bbec459",
                "videoId": "G5w7MIKwSO0", "url": "http://youtu.be/G5w7MIKwSO0",
                "title": "GRiZ - Vision of Happiness [HD]",
                "duration": "198"
            }, {
                "id": "27492b00-8230-48c4-90b9-237be3f07502",
                "videoId": "xvtNnCs6EFY", "url": "http://youtu.be/xvtNnCs6EFY",
                "title": "GRiZ - Wheres The Love?",
                "duration": "374"
            }, {
                "id": "c278ea8e-6877-4658-a017-0a6ea5ccbff3",
                "videoId": "0Gz96ACc45U", "url": "http://youtu.be/0Gz96ACc45U",
                "title": "Griz - Mr. B (feat. Dominic Lalli) | Mad Liberation (7/12)",
                "duration": "349"
            }],
            history: [],
            items: [{
                "id": "a207502e-e68e-40e2-a5b1-a94e638a731b",
                "videoId": "3AXu6l3GOYE", "url": "http://youtu.be/3AXu6l3GOYE",
                "title": "Griz - Blastaa | Mad Liberation (4/12)", "duration": "269"
            }, {
                "id": "4696c63f-8dae-4803-8e19-2b89c339f478",
                "videoId": "CI-p4OkT3qE", "url": "http://youtu.be/CI-p4OkT3qE",
                "title": "Griz - Smash The Funk | Mad Liberation (2/12)", "duration": "411"
            }, {
                "id": "c278ea8e-6877-4658-a017-0a6ea5ccbff3",
                "videoId": "0Gz96ACc45U", "url": "http://youtu.be/0Gz96ACc45U",
                "title": "Griz - Mr. B (feat. Dominic Lalli) | Mad Liberation (7/12)", "duration": "349"
            }, {
                "id": "27492b00-8230-48c4-90b9-237be3f07502",
                "videoId": "xvtNnCs6EFY", "url": "http://youtu.be/xvtNnCs6EFY",
                "title": "GRiZ - Wheres The Love?", "duration": "374"
            }, {
                "id": "2ef29e04-d038-44f9-b3a4-ad163bbec459",
                "videoId": "G5w7MIKwSO0", "url": "http://youtu.be/G5w7MIKwSO0",
                "title": "GRiZ - Vision of Happiness [HD]", "duration": "198"
            }]
        }, {
            id: "73cf71cc-f776-4d89-a9ae-bae57be3cda9",
            title: "Gramatik",
            selected: false,
            shuffledItems: [{
                "id": "83c8be7a-0205-423d-ba90-306084bbc128",
                "videoId": "C56h08hMLnM",
                "url": "http://youtu.be/C56h08hMLnM",
                "title": "Gramatik - So Much For Love - Official Music Video",
                "duration": "204"
            }, {
                "id": "fa7289b9-9a39-43b8-be49-d8d00d8853a0",
                "videoId": "motWUD3jwoA",
                "url": "http://youtu.be/motWUD3jwoA",
                "title": "Gramatik vs. Queen-Princes Of The Glitch Universe [DOWNLOAD LINK IN DESCRIPTION]",
                "duration": "355"
            }, {
                "id": "1f821fd0-371f-4a4c-b8f1-b1a2e6048cb8",
                "videoId": "bI8Gp6Imlho",
                "url": "http://youtu.be/bI8Gp6Imlho",
                "title": "Gramatik - Dungeon Sound",
                "duration": "238"
            }, {
                "id": "1a0b9270-2f2b-4371-8f90-d1d2f8d5bf28",
                "videoId": "FHPg-bQneMY",
                "url": "http://youtu.be/FHPg-bQneMY",
                "title": "Gramatik vs. The Beatles - Don't Let Me Down (2012) [HD]",
                "duration": "327"
            }],
            history: [],
            items: [{
                "id": "a680be30-86c3-4cc5-85c8-1944bbdda16f",
                "videoId": "Lxdog1B1H-Y", "url": "http://youtu.be/Lxdog1B1H-Y",
                "title": "Gramatik - Just Jammin'",
                "duration": "399"
            }, {
                "id": "1a0b9270-2f2b-4371-8f90-d1d2f8d5bf28",
                "videoId": "FHPg-bQneMY", "url": "http://youtu.be/FHPg-bQneMY",
                "title": "Gramatik vs. The Beatles - Don't Let Me Down (2012) [HD]",
                "duration": "327"
            }, {
                "id": "1f821fd0-371f-4a4c-b8f1-b1a2e6048cb8",
                "videoId": "bI8Gp6Imlho", "url": "http://youtu.be/bI8Gp6Imlho",
                "title": "Gramatik - Dungeon Sound",
                "duration": "238"
            }, {
                "id": "83c8be7a-0205-423d-ba90-306084bbc128",
                "videoId": "C56h08hMLnM", "url": "http://youtu.be/C56h08hMLnM",
                "title": "Gramatik - So Much For Love - Official Music Video",
                "duration": "204"
            }, {
                "id": "fa7289b9-9a39-43b8-be49-d8d00d8853a0",
                "videoId": "motWUD3jwoA", "url": "http://youtu.be/motWUD3jwoA",
                "title": "Gramatik vs. Queen-Princes Of The Glitch Universe [DOWNLOAD LINK IN DESCRIPTION]",
                "duration": "355"
            }]
        }
    ];

    return {
        getDefaultPlaylistConfigs: function() {
            return defaultPlaylistConfigs;
        }
    };
});