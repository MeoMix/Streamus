using NHibernate.Cfg;
using NHibernate.Tool.hbm2ddl;
using NUnit.Framework;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.DataInterfaces;
using Streamus.Backend.Domain.Managers;

namespace Streamus.Tests
{
    [TestFixture]
    public class PlaylistItemDaoTest
    {
        private Configuration Configuration;
        private IUserDao UserDao;
        private IPlaylistDao PlaylistDao;
        private ISongDao SongDao;
        private IPlaylistItemDao PlaylistItemDao;
        private User User;
        private Playlist Playlist;
        private Song Song;

        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            Configuration = new Configuration();
            Configuration.Configure();
            UserDao = new UserDao();
            PlaylistDao = new PlaylistDao();
            PlaylistItemDao = new PlaylistItemDao();
            SongDao = new SongDao();
        }

        [SetUp]
        public void SetupContext()
        {
            //To keep our test methods side effect free we re-create our database schema before the execution of each test method. 
            new SchemaExport(Configuration).Execute(false, true, false);

            User = new UserManager(UserDao, PlaylistDao).CreateUser();

            Song = new Song("s91jgcmQoB0", "Tristam - Chairs", 219);
            new SongManager(SongDao).SaveSong(Song);
        }

        [Test]
        public void CanUpdatePlaylistItem()
        {
            Playlist = new Playlist(User.Id, "New Playlist 001", PlaylistDao.GetAll().Count);
            new PlaylistManager(PlaylistDao, PlaylistItemDao).CreatePlaylist(Playlist);

            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);

            var playlistItem = new PlaylistItem(Playlist.Id, Playlist.Items.Count, Song.Title, Song.VideoId);
            playlistManager.CreatePlaylistItem(playlistItem);
            //Only add after successfully saving.
            Playlist.Items.Add(playlistItem);

            playlistItem.Title = "New Title 001";
            playlistManager.UpdatePlaylistItem(playlistItem);

            //Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Evict(playlistItem);

            PlaylistItem playlistItemFromDatabase = PlaylistItemDao.GetByPosition(playlistItem.PlaylistId, playlistItem.Position);
            // Test that the playlitItem was successfully inserted
            Assert.IsNotNull(playlistItemFromDatabase);
            Assert.AreEqual(playlistItemFromDatabase.Title, playlistItem.Title);
        }

        [Test]
        public void CanDeletePlaylistItem()
        {
            Playlist = new Playlist(User.Id, "New Playlist 001", PlaylistDao.GetAll().Count);
            new PlaylistManager(PlaylistDao, PlaylistItemDao).CreatePlaylist(Playlist);

            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);

            var playlistItem = new PlaylistItem(Playlist.Id, Playlist.Items.Count, Song.Title, Song.VideoId);
            playlistManager.CreatePlaylistItem(playlistItem);
            //Only add after successfully saving.
            Playlist.Items.Add(playlistItem);

            playlistManager.DeleteItemByPosition(playlistItem.PlaylistId, playlistItem.Position, Playlist.UserId);

            //Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Evict(playlistItem);

            PlaylistItem afterDelete = PlaylistItemDao.GetByPosition(playlistItem.PlaylistId, playlistItem.Position);
            Assert.IsNull(afterDelete);
        }
    }
}
