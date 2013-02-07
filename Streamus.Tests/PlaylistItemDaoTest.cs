using NUnit.Framework;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;
using Streamus.Backend.Domain.Managers;
using System;

namespace Streamus.Tests
{
    [TestFixture]
    public class PlaylistItemDaoTest
    {
        private readonly IUserDao UserDao = new UserDao();
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();
        private readonly IVideoDao VideoDao = new VideoDao();
        private readonly IPlaylistItemDao PlaylistItemDao = new PlaylistItemDao();
        private User User;
        private Playlist Playlist;
        private Video Video;
        private PlaylistManager PlaylistManager;

        /// <summary>
        ///     This code is only ran once for the given TestFixture.
        /// </summary>
        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            User = new UserManager(UserDao, PlaylistDao).CreateUser();
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

            //  Make a new Playlist object each time to ensure no side-effects from previous test case.
            Playlist = new Playlist(User.Id, "New Playlist 001", PlaylistDao.GetAll().Count);
            PlaylistManager.Save(Playlist);
        }

        [Test]
        public void Updates()
        {
            //  Usually created client-side, but for testing it is OK to create server-side.
            Guid playlistItemId = Guid.NewGuid();
            var playlistItem = new PlaylistItem(Playlist.Id, playlistItemId, Playlist.Items.Count, Video.Title, Video.Id);
            PlaylistManager.CreatePlaylistItem(playlistItem);

            //  Only add after successfully saving.
            Playlist.Items.Add(playlistItem);

            playlistItem.Title = "New Title 001";
            PlaylistManager.UpdatePlaylistItem(playlistItem);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            PlaylistItem playlistItemFromDatabase = PlaylistItemDao.Get(playlistItem.PlaylistId, playlistItem.Id);

            //  Test that the playlitItem was successfully inserted
            Assert.IsNotNull(playlistItemFromDatabase);
            Assert.AreEqual(playlistItemFromDatabase.Title, playlistItem.Title);
        }

        [Test]
        public void Deletes()
        {
            //  Usually created client-side, but for testing it is OK to create server-side.
            Guid firstItemId = Guid.NewGuid();
            var firstItem = new PlaylistItem(Playlist.Id, firstItemId, Playlist.Items.Count, Video.Title, Video.Id);
            PlaylistManager.CreatePlaylistItem(firstItem);

            //  Only add after successfully saving.
            Playlist.Items.Add(firstItem);

            //  Usually created client-side, but for testing it is OK to create server-side.
            Guid secondItemId = Guid.NewGuid();
            var secondItem = new PlaylistItem(Playlist.Id, secondItemId, Playlist.Items.Count, Video.Title, Video.Id);
            PlaylistManager.CreatePlaylistItem(secondItem);

            //  Only add after successfully saving.
            Playlist.Items.Add(secondItem);

            PlaylistManager.DeleteItem(firstItem.PlaylistId, firstItem.Id, Playlist.UserId);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            PlaylistItem deletedPlaylistItem = PlaylistItemDao.Get(firstItem.PlaylistId, firstItem.Id);
            Assert.IsNull(deletedPlaylistItem);

            // Remove entity from NHibernate cache to ensure position was updated.
            NHibernateSessionManager.Instance.Clear();

            PlaylistItem updatedPlaylistItem = PlaylistItemDao.Get(secondItem.PlaylistId, secondItem.Id);

            Assert.AreEqual(updatedPlaylistItem.Position, 0);
        } 
    }
}
