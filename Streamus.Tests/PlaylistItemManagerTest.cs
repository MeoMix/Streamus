using FluentValidation;
using NUnit.Framework;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;
using System;
using System.Linq;

namespace Streamus.Tests
{
    [TestFixture]
    public class PlaylistItemManagerTest : AbstractManagerTest
    {
        private IPlaylistItemDao PlaylistItemDao { get; set; }
        private IVideoDao VideoDao { get; set; }
        private User User { get; set; }
        private Playlist Playlist { get; set; }

        private PlaylistManager PlaylistManager { get; set; }
        private VideoManager VideoManager { get; set; }

        /// <summary>
        ///     This code is only ran once for the given TestFixture.
        /// </summary>
        [TestFixtureSetUp]
        public new void TestFixtureSetUp()
        {
            PlaylistManager = new PlaylistManager();
            VideoManager = new VideoManager();

            try
            {
                PlaylistItemDao = DaoFactory.GetPlaylistItemDao();
                VideoDao = DaoFactory.GetVideoDao();
            }
            catch (TypeInitializationException exception)
            {
                throw exception.InnerException;
            }

            //  Ensure that a User exists.
            User = new UserManager().CreateUser();
        }

        /// <summary>
        ///     This code runs before every test.
        /// </summary>
        [SetUp]
        public void SetupContext()
        {
            Stream stream = User.Streams.First();

            //  Make a new Playlist object each time to ensure no side-effects from previous test case.
            Playlist = stream.CreateAndAddPlaylist();

            PlaylistManager.Save(Playlist);
        }

        /// <summary>
        ///     Create a new PlaylistItem with a Video whose ID is not in the database currently.
        /// </summary>
        [Test]
        public void CreateItem_NoVideoExists_VideoAndItemCreated()
        {
            PlaylistItem playlistItem = Helpers.CreateItemInPlaylist(Playlist);

            //  Ensure that the Video was created.
            Video videoFromDatabase = VideoDao.Get(playlistItem.Video.Id);
            Assert.NotNull(videoFromDatabase);

            //  Ensure that the PlaylistItem was created.
            PlaylistItem itemFromDatabase = PlaylistItemDao.Get(playlistItem.Id);
            Assert.NotNull(itemFromDatabase);

            //  Pointers should be self-referential with only one item in the Playlist.
            Assert.AreEqual(itemFromDatabase.NextItem, itemFromDatabase);
            Assert.AreEqual(itemFromDatabase.PreviousItem, itemFromDatabase);
        }

        /// <summary>
        ///     Create a new PlaylistItem with a Video whose ID is in the database.
        ///     No update should happen to the Video as it is immutable.
        /// </summary>
        [Test]
        public void CreateItem_VideoAlreadyExists_ItemCreatedVideoNotUpdated()
        {
            //  Save this Video before continuining so that it exists before adding the PlaylistItem.
            string randomVideoId = Guid.NewGuid().ToString().Substring(0, 11);
            var videoNotInDatabase = new Video(randomVideoId, "Video", 999, "Author");
            VideoManager.Save(videoNotInDatabase);

            //  Change the title for videoInDatabase to check that cascade-update does not affect title. Videos are immutable.
            const string videoTitle = "A video title";
            var videoInDatabase = new Video(randomVideoId, videoTitle, 999, "Author");

            //  Create a new PlaylistItem and write it to the database.
            string title = videoInDatabase.Title;
            var playlistItem = new PlaylistItem(title, videoInDatabase);

            Playlist.AddItem(playlistItem);
            PlaylistManager.SavePlaylistItem(playlistItem);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            //  Ensure that the Video was NOT updated by comparing the new title to the old one.
            Video videoFromDatabase = VideoDao.Get(randomVideoId);
            Assert.AreNotEqual(videoFromDatabase.Title, videoTitle);

            //  Ensure that the PlaylistItem was created.
            PlaylistItem itemFromDatabase = PlaylistItemDao.Get(playlistItem.Id);
            Assert.NotNull(itemFromDatabase);

            //  Pointers should be self-referential with only one item in the Playlist.
            Assert.AreEqual(itemFromDatabase.NextItem, itemFromDatabase);
            Assert.AreEqual(itemFromDatabase.PreviousItem, itemFromDatabase);
        }

        [Test]
        public void CreateItem_NotAddedToPlaylistBeforeSave_ItemNotAdded()
        {
            //  Create a random video ID to ensure the Video doesn't exist in the database currently.
            string randomVideoId = Guid.NewGuid().ToString().Substring(0, 11);
            var videoNotInDatabase = new Video(randomVideoId, "Video", 999, "Author");

            //  Create a new PlaylistItem and write it to the database.
            string title = videoNotInDatabase.Title;
            var playlistItem = new PlaylistItem(title, videoNotInDatabase);

            bool validationExceptionEncountered = false;

            try
            {
                //  Try to save the item without adding to Playlist. This should fail.
                PlaylistManager.SavePlaylistItem(playlistItem);
            }
            catch (ValidationException)
            {
                validationExceptionEncountered = true;
            }

            Assert.IsTrue(validationExceptionEncountered);
        }

        //  TODO: There are more 'create' edge cases depending on how many items are in the Playlist. Consider creating
        //  in the middle, at the end, at the front and bulk-create in one transaction.

        [Test]
        public void UpdateItemTitle_ItemExistsInDatabase_ItemTitleUpdated()
        {
            //  Create and save a playlistItem to the database.
            PlaylistItem playlistItem = Helpers.CreateItemInPlaylist(Playlist);

            //  Change the item's title.
            const string updatedItemTitle = "Updated PlaylistItem title";
            playlistItem.Title = updatedItemTitle;

            PlaylistManager.UpdatePlaylistItem(playlistItem);

            //  Check the title of the item from the database -- make sure it updated.
            PlaylistItem itemFromDatabase = PlaylistItemDao.Get(playlistItem.Id);
            Assert.AreEqual(itemFromDatabase.Title, updatedItemTitle);
        }

        /// <summary>
        ///     Test deleting a single PlaylistItem. The Playlist itself should not have any items in it.
        /// </summary>
        [Test]
        public void DeletePlaylistItem_NoOtherItems_MakesPlaylistEmpty()
        {
            PlaylistItem playlistItem = Helpers.CreateItemInPlaylist(Playlist);

            //  Now delete the created PlaylistItem and ensure it is removed.
            PlaylistManager.DeleteItem(playlistItem.Id, playlistItem.Playlist.Id);

            PlaylistItem deletedPlaylistItem = PlaylistItemDao.Get(playlistItem.Id);
            Assert.IsNull(deletedPlaylistItem);
        }

        /// <summary>
        ///     Remove the first PlaylistItem from a Playlist which has two items in it after adds.
        ///     Leave the second item, but adjust linked list pointers to accomodate.
        /// </summary>
        [Test]
        public void DeleteFirstPlaylistItem_OneOtherItemInPlaylist_LeaveSecondItemAndUpdatePointers()
        {
            //  Create the first PlaylistItem and write it to the database.
            PlaylistItem firstItem = Helpers.CreateItemInPlaylist(Playlist);

            //  Create the second PlaylistItem and write it to the database.
            PlaylistItem secondItem = Helpers.CreateItemInPlaylist(Playlist);

            //  Now delete the first PlaylistItem and ensure it is removed.
            PlaylistManager.DeleteItem(firstItem.Id, firstItem.Playlist.Id);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            PlaylistItem deletedPlaylistItem = PlaylistItemDao.Get(firstItem.Id);
            Assert.IsNull(deletedPlaylistItem);

            PlaylistItem updatedPlaylistItem = PlaylistItemDao.Get(secondItem.Id);

            //  The second item's pointers should be self-referencing with only 1 item in the Playlist.
            Assert.AreEqual(updatedPlaylistItem, updatedPlaylistItem.PreviousItem);
            Assert.AreEqual(updatedPlaylistItem, updatedPlaylistItem.NextItem);
        }

        //  TODO: Test case where there are 2 PlaylistItems in the Playlist before deleting.
        //  Consider deletes from the middle of the LinkedList as well as both ends of the linked list.

        //  TODO: Test bulk-delete in one transaction.
    }
}
