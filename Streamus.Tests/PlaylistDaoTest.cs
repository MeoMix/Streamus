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
        private Stream Stream { get; set; }
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
            Stream = User.Streams.First();

            Video = new Video("s91jgcmQoB0", "Tristam - Chairs", 219, "MeoMix");
            new VideoManager().Save(Video);
        }

        /// <summary>
        /// Make sure that when the first PlaylistItem is added to a Playlist that the 
        /// Playlist's FirstItem field is appropriately set in the database.
        /// </summary>
        [Test]
        public void AddItem_NoItemsInPlaylist_FirstItemIdSet()
        {
            Playlist playlist = Stream.CreateAndAddPlaylist();
            PlaylistManager.Save(playlist);

            PlaylistItem playlistItem = Helpers.CreateItemInPlaylist(playlist);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            Playlist playlistFromDatabase = PlaylistDao.Get(playlist.Id);
            Assert.AreEqual(playlistFromDatabase.FirstItem, playlistItem);
        }

        [Test]
        public void Updates()
        {
            var playlist = Stream.CreateAndAddPlaylist();

            PlaylistManager.Save(playlist);

            PlaylistManager.UpdateTitle(playlist.Id, "Existing Playlist 001");

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            Playlist playlistFromDatabase = PlaylistDao.Get(playlist.Id);
            //  Test that the product was successfully inserted
            Assert.IsNotNull(playlistFromDatabase);
            Assert.AreEqual(playlist.Title, playlistFromDatabase.Title);
        }

        /// <summary>
        /// Verifies that a Playlist can be deleted properly. The Playlist
        /// has no items underneath it and the Stream is assumed to not have any additional Playlists.
        /// </summary>
        [Test]
        public void DeletePlaylist()
        {
            //  Create a new Playlist and write it to the database.
            string title = string.Format("New Playlist {0:D4}", Stream.Playlists.Count);
            Playlist playlist = new Playlist(title);

            Stream.AddPlaylist(playlist);
            PlaylistManager.Save(playlist);

            //  Now delete the created Playlist and ensure it is removed.
            PlaylistManager.Delete(playlist.Id);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            Playlist deletedPlaylist = PlaylistDao.Get(playlist.Id);
            Assert.IsNull(deletedPlaylist);
        }


        //[Test]
        //public void Deletes()
        //{
        //    //  Create a new Playlist and write it to the database.
        //    string title = string.Format("New Playlist {0:D4}", Stream.Playlists.Count);
        //    Playlist playlist = new Playlist(title);

        //    Stream.AddPlaylist(playlist);
        //    PlaylistManager.Save(playlist);

        //    var playlistItem = new PlaylistItem(Video.Title, Video);

        //    playlist.AddItem(playlistItem);
        //    PlaylistManager.UpdatePlaylistItem(playlistItem);

        //    Stream.RemovePlaylist(playlist);
        //    PlaylistManager.Delete(playlist.Id);

        //    NHibernateSessionManager.Instance.Clear();

        //    Playlist playlistFromDatabase = PlaylistDao.Get(playlist.Id);
        //    //  Test that the product was successfully inserted
        //    Assert.IsNull(playlistFromDatabase);

        //    PlaylistItem playlistItemFromDatabase = PlaylistItemDao.Get(playlistItem.Id);
        //    Assert.IsNull(playlistItemFromDatabase);
        //}
    }
}
