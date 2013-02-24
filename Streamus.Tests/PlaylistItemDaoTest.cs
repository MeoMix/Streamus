using System.Linq;
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
        private IUserDao UserDao { get; set; }
        private IPlaylistDao PlaylistDao { get; set; }
        private IVideoDao VideoDao { get; set; }
        private IPlaylistItemDao PlaylistItemDao { get; set; }
        private IPlaylistCollectionDao PlaylistCollectionDao { get; set; }
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
            try
            {
                UserDao = new UserDao();
                PlaylistDao = new PlaylistDao();
                PlaylistItemDao = new PlaylistItemDao();
                PlaylistCollectionDao = new PlaylistCollectionDao();
                VideoDao = new VideoDao();
            }
            catch (TypeInitializationException exception)
            {
                throw exception.InnerException;
            }

            User = new UserManager(UserDao, PlaylistCollectionDao).CreateUser();
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
            PlaylistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, PlaylistCollectionDao, VideoDao);

            var playlistCollection = User.PlaylistCollections.First();

            //  Make a new Playlist object each time to ensure no side-effects from previous test case.
            Playlist = playlistCollection.CreatePlaylist();
            
            PlaylistManager.Save(Playlist);
        }

        [Test]
        public void Updates()
        {
            //  Usually created client-side, but for testing it is OK to create server-side.
            Guid playlistItemId = Guid.NewGuid();
            var playlistItem = new PlaylistItem(Playlist.Id, playlistItemId, Video.Title, Video.Id);

            Playlist.AddItem(playlistItem);
            PlaylistManager.UpdatePlaylistItem(playlistItem);

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
            var firstItem = new PlaylistItem(Playlist.Id, firstItemId, Video.Title, Video.Id);

            Playlist.AddItem(firstItem);
            PlaylistManager.UpdatePlaylistItem(firstItem);

            //  Usually created client-side, but for testing it is OK to create server-side.
            Guid secondItemId = Guid.NewGuid();
            var secondItem = new PlaylistItem(Playlist.Id, secondItemId, Video.Title, Video.Id);

            Playlist.AddItem(secondItem);
            PlaylistManager.UpdatePlaylistItem(secondItem);

            PlaylistManager.DeleteItem(firstItem.Id, firstItem.PlaylistId);
                
            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            PlaylistItem deletedPlaylistItem = PlaylistItemDao.Get(firstItem.PlaylistId, firstItem.Id);
            Assert.IsNull(deletedPlaylistItem);

            // Remove entity from NHibernate cache to make sure getting data from DB.
            NHibernateSessionManager.Instance.Clear();

            PlaylistItem updatedPlaylistItem = PlaylistItemDao.Get(secondItem.PlaylistId, secondItem.Id);

            //  TODO: Not sure if this is right. Only works if the playlist only had 2 items in it.
            Assert.AreEqual(updatedPlaylistItem.Id, updatedPlaylistItem.PreviousItemId);
            Assert.AreEqual(updatedPlaylistItem.Id, updatedPlaylistItem.NextItemId);
        } 
    }
}
