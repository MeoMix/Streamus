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
    public class PlaylistItemDaoTest
    {
        private IPlaylistItemDao PlaylistItemDao { get; set; }
        private User User { get; set; }
        private Playlist Playlist { get; set; }
        private Video Video { get; set; }
        private PlaylistManager PlaylistManager { get; set; }

        /// <summary>
        ///     This code is only ran once for the given TestFixture.
        /// </summary>
        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            AutofacRegistrations.RegisterDaoFactory();
            PlaylistManager = new PlaylistManager();

            try
            {
                PlaylistItemDao = new PlaylistItemDao();
            }
            catch (TypeInitializationException exception)
            {
                throw exception.InnerException;
            }

            User = new UserManager().CreateUser();
            Video = new Video("s91jgcmQoB0", "Tristam - Chairs", 219, "MeoMix");
            new VideoManager().Save(Video);
        }

        /// <summary>
        ///     This code runs before every test.
        /// </summary>
        [SetUp]
        public void SetupContext()
        {
            Stream stream = User.Streams.First();

            //  Make a new Playlist object each time to ensure no side-effects from previous test case.
            Playlist = stream.CreatePlaylist();

            PlaylistManager.Save(Playlist);
        }

        [Test]
        public void Updates()
        {
            var playlistItem = new PlaylistItem(Video.Title, Video);

            Playlist.AddItem(playlistItem);

            //  Make sure the playlistItem has been setup properly before it is cascade-saved through the Playlist.
            playlistItem.ValidateAndThrow();

            PlaylistManager.Save(Playlist);

            playlistItem.Title = "New Title 001";
            PlaylistManager.UpdatePlaylistItem(playlistItem);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            PlaylistItem playlistItemFromDatabase = PlaylistItemDao.Get(playlistItem.Id);

            //  Test that the playlitItem was successfully inserted
            Assert.IsNotNull(playlistItemFromDatabase);
            Assert.AreEqual(playlistItemFromDatabase.Title, playlistItem.Title);
        }

        [Test]
        public void Deletes()
        {
            PlaylistItem firstItem = new PlaylistItem(Video.Title, Video);

            Playlist.AddItem(firstItem);
            PlaylistManager.CreatePlaylistItem(firstItem);

            PlaylistItem secondItem = new PlaylistItem(Video.Title, Video);

            Playlist.AddItem(secondItem);
            PlaylistManager.CreatePlaylistItem(secondItem);

            PlaylistManager.DeleteItem(firstItem.Id, firstItem.Playlist.Id);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            PlaylistItem deletedPlaylistItem = PlaylistItemDao.Get(firstItem.Id);
            Assert.IsNull(deletedPlaylistItem);

            // Remove entity from NHibernate cache to make sure getting data from DB.
            NHibernateSessionManager.Instance.Clear();

            PlaylistItem updatedPlaylistItem = PlaylistItemDao.Get(secondItem.Id);

            //  TODO: Not sure if this is right. Only works if the playlist only had 2 items in it.
            Assert.AreEqual(updatedPlaylistItem, updatedPlaylistItem.PreviousItem);
            Assert.AreEqual(updatedPlaylistItem, updatedPlaylistItem.NextItem);
        }
    }
}
