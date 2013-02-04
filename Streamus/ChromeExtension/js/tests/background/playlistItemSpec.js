define(['playlistItem'], function(PlaylistItem) {
    describe('The PlaylistItem', function() {
        it("instantiates without paramaters", function() {
            var playlistItem = new PlaylistItem();
            expect(playlistItem).not.toEqual(null);
            //  PlaylistItem's already have an ID when created client-side, intentional. 
            expect(playlistItem.isNew()).toEqual(false);
            expect(playlistItem.get('id') === null);
            expect(playlistItem.get('playlistId') === null);
            expect(playlistItem.get('videoId') === '');
            expect(playlistItem.get('title') === '');
            expect(playlistItem.get('selected') === false);
            expect(playlistItem.get('relatedVideos') === []);
        });

        it("instantiates with paramaters", function() {
            var title = 'Test Title';
            var playlistItem = new PlaylistItem({
                title: title
            });
            expect(playlistItem).not.toEqual(null);
            expect(playlistItem.isNew()).toEqual(false);
            expect(playlistItem.get('title')).toEqual(title);
        });
        
        //  TODO: Should playlistItem be responsible for testing is savability, or the playlist itself?
        //  I need a playlist ID to be able to test this successfully, so hard to say
        //it("saves", function() {
        //    var playlistItem = null;
        //    var title = 'Test Title';
        //    var videoId = 'C8aBuRCcfSY';
        //    var playlistItemSaved = false;

        //    runs(function() {
        //        playlistItem = new PlaylistItem({
        //            title: title,
        //            videoId: videoId
        //        });

        //        playlistItem.save({
        //            success: function() {
        //                playlistItemSaved = true;
        //            }
        //        });
        //    });

        //    waitsFor(function() {
        //        return playlistItemSaved;
        //    });

        //    runs(function() {
        //        expect(playlistItem.get('videoId')).toEqual(videoId);
        //        expect(playlistItem.get('title')).toEqual(title);
        //    });
        //});
    });
});