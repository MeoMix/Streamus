using Streamus.Domain;
using Streamus.Domain.Managers;
using System;

namespace Streamus.Tests
{
    /// <summary>
    ///     Stores common methods used by tests. Just useful for keeping things DRY between test cases.
    /// </summary>
    public static class Helpers
    {
        private static readonly PlaylistItemManager PlaylistItemManager = new PlaylistItemManager();

        /// <summary>
        ///     Creates a new Video and PlaylistItem, puts item in the database and then returns
        ///     the item. Just a nice utility method to keep things DRY.
        /// </summary>
        public static PlaylistItem CreateItemInPlaylist(Playlist playlist)
        {
            //  Create a random video ID to ensure the Video doesn't exist in the database currently.
            string randomVideoId = Guid.NewGuid().ToString().Substring(0, 11);
            var videoNotInDatabase = new Video(randomVideoId, "Video", 999, "Author");

            //  Create a new PlaylistItem and write it to the database.
            string title = videoNotInDatabase.Title;
            var playlistItem = new PlaylistItem(title, videoNotInDatabase);

            playlist.AddItem(playlistItem);
            PlaylistItemManager.Save(playlistItem);

            return playlistItem;
        }
    }
}
