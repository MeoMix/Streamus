define(['playlistItem'], function(PlaylistItem) {
    describe('The PlaylistItem', function() {
        it("should be able to be instantiated without paramaters and have the correct default values", function() {
            var playlistItem = new PlaylistItem();
            expect(playlistItem).not.toEqual(null);
            expect(playlistItem.isNew()).toEqual(true);
            expect(playlistItem.get('id') === null);
            expect(playlistItem.get('playlistId') === null);
            expect(playlistItem.get('songId') === null);
            expect(playlistItem.get('videoId') === '');
            expect(playlistItem.get('title') === '');
            expect(playlistItem.get('selected') === false);
            expect(playlistItem.get('relatedVideos') === []);
        });
        
        it("should be able to be instantiated with paramaters", function () {
            var title = 'Test Title';
            var playlistItem = new PlaylistItem({
                title: title
            });
            expect(playlistItem).not.toEqual(null);
            expect(playlistItem.isNew()).toEqual(true);
            expect(playlistItem.get('title')).toEqual(title);
        });
        
        //TODO It should be able to be saved?
    });
});