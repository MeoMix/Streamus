using System;
using System.Linq;
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
        private IPlaylistDao PlaylistDao { get; set; }
        private IPlaylistItemDao PlaylistItemDao { get; set; }
        private IStreamDao _streamDao { get; set; }
        private IVideoDao VideoDao { get; set; }
        private User User { get; set; }
        private Video Video { get; set; }
        private PlaylistManager PlaylistManager { get; set;}

        /// <summary>
        ///     This code is only ran once for the given TestFixture.
        /// </summary>
        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            try
            {
                PlaylistDao = new PlaylistDao();
                PlaylistItemDao = new PlaylistItemDao();
                _streamDao = new StreamDao();
                VideoDao = new VideoDao();
            }
            catch (TypeInitializationException exception)
            {
                throw exception.InnerException;
            }

            User = new UserManager(new UserDao(), _streamDao).CreateUser();

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
            PlaylistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, _streamDao, VideoDao);
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

            //  Usually created client-side, but for testing it is OK to create server-side.
            Guid firstItemId = Guid.NewGuid();
            var playlistItem = new PlaylistItem(playlist.Id, firstItemId, Video.Title, Video.Id);

            playlist.AddItem(playlistItem);
            PlaylistManager.UpdatePlaylistItem(playlistItem);

            stream.RemovePlaylist(playlist);
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
