using System;
using NUnit.Framework;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;
using Streamus.Backend.Domain.Managers;

namespace Streamus.Tests
{
    [TestFixture]
    public class PlaylistDaoTest
    {
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();
        private readonly IPlaylistItemDao PlaylistItemDao = new PlaylistItemDao();
        private readonly IVideoDao VideoDao = new VideoDao();
        private User User;
        private Video Video;
        private PlaylistManager PlaylistManager;

        /// <summary>
        ///     This code is only ran once for the given TestFixture.
        /// </summary>
        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            User = new UserManager(new UserDao(), new PlaylistDao()).CreateUser();

            Video = new Video("s91jgcmQoB0", "Tristam - Chairs", 219);
            new VideoManager(VideoDao).Save(Video);
        }

        /// <summary>
        ///     This code runs before every test.
        /// </summary>
        [SetUp]
        public void SetupContext()
        {
            //  Create managers here because every client request will require new managers.
            PlaylistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
        }

        [Test]
        public void Updates()
        {
            var playlist = new Playlist(User.Id, "New Playlist 001", PlaylistDao.GetAll().Count);
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
            var playlist = new Playlist(User.Id, "New Playlist 001", PlaylistDao.GetAll().Count);
            PlaylistManager.Save(playlist);

            //  Usually created client-side, but for testing it is OK to create server-side.
            Guid firstItemId = Guid.NewGuid();
            var playlistItem = new PlaylistItem(playlist.Id, firstItemId, playlist.Items.Count, Video.Title, Video.Id);
            PlaylistManager.CreatePlaylistItem(playlistItem);

            //  Only add after successfully saving.
            playlist.Items.Add(playlistItem);
            PlaylistManager.DeletePlaylistById(playlist.Id);

            NHibernateSessionManager.Instance.Clear();

            Playlist playlistFromDatabase = PlaylistDao.Get(playlist.Id);
            //  Test that the product was successfully inserted
            Assert.IsNull(playlistFromDatabase);

            PlaylistItem playlistItemFromDatabase = PlaylistItemDao.Get(playlistItem.PlaylistId, playlistItem.Id);
            Assert.IsNull(playlistItemFromDatabase);
        }
    }
}
