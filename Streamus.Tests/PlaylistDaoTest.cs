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
    public class PlaylistDaoTest
    {
        private IPlaylistDao PlaylistDao { get; set; }
        private IPlaylistItemDao PlaylistItemDao { get; set; }
        private User User { get; set; }
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
                PlaylistDao = new PlaylistDao();
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

        [Test]
        public void Updates()
        {
            var stream = User.Streams.First();
            var playlist = stream.CreatePlaylist();

            PlaylistManager.Save(playlist);

            PlaylistManager.UpdateTitle(playlist.Id, "Existing Playlist 001");

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            Playlist playlistFromDatabase = PlaylistDao.Get(playlist.Id);
            //  Test that the product was successfully inserted
            Assert.IsNotNull(playlistFromDatabase);
            Assert.AreEqual(playlist.Title, playlistFromDatabase.Title);
        }

        [Test]
        public void Deletes()
        {
            var stream = User.Streams.First();
            var playlist = stream.CreatePlaylist();

            PlaylistManager.Save(playlist);

            var playlistItem = new PlaylistItem(Video.Title, Video);

            playlist.AddItem(playlistItem);
            PlaylistManager.UpdatePlaylistItem(playlistItem);

            stream.RemovePlaylist(playlist);
            PlaylistManager.DeletePlaylistById(playlist.Id);

            NHibernateSessionManager.Instance.Clear();

            Playlist playlistFromDatabase = PlaylistDao.Get(playlist.Id);
            //  Test that the product was successfully inserted
            Assert.IsNull(playlistFromDatabase);

            PlaylistItem playlistItemFromDatabase = PlaylistItemDao.Get(playlistItem.Id);
            Assert.IsNull(playlistItemFromDatabase);
        }
    }
}
