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
    public class SongDaoTest
    {
        private Configuration Configuration;
        private ISongDao SongDao;
        private IPlaylistDao PlaylistDao;
        private IPlaylistItemDao PlaylistItemDao;
        private User User;
        private Playlist Playlist;

        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            Configuration = new Configuration();
            Configuration.Configure();
            SongDao = new SongDao();
            PlaylistDao = new PlaylistDao();
            PlaylistItemDao = new PlaylistItemDao();
        }

        [SetUp]
        public void SetupContext()
        {
            //To keep our test methods side effect free we re-create our database schema before the execution of each test method. 
            new SchemaExport(Configuration).Execute(false, true, false);

            User = new UserManager(new UserDao(), new PlaylistDao()).CreateUser();
            Playlist = new Playlist(User.Id, "New Playlist 001", PlaylistDao.GetAll().Count);
            new PlaylistManager(PlaylistDao, PlaylistItemDao).CreatePlaylist(Playlist);
        }

        [Test]
        public void CanSaveSong()
        {
            var song = new Song("s91jgcmQoB0", "Tristam - Chairs", 219);

            var songManager = new SongManager(SongDao);
            songManager.SaveSong(song);

            song.Title = "New title 002";
            songManager.SaveSong(song);

            //Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Evict(song);

            Song songFromDatabase = SongDao.GetByVideoId(song.VideoId);
            // Test that the song was successfully inserted
            Assert.IsNotNull(songFromDatabase);
            Assert.AreEqual(song.Title, songFromDatabase.Title);
        }

        [Test]
        public void CanDeleteSong()
        {
            var song = new Song
                {
                    VideoId = "s91jgcmQoB0",
                    Title = "Tristam - Chairs",
                    Duration = 219
                };

            var songManager = new SongManager(SongDao);
            songManager.SaveSong(song);
            songManager.DeleteSongByVideoId(song.VideoId);

            //Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Evict(song);

            Song songFromDatabase = SongDao.GetByVideoId(song.VideoId);
            // Test that the song was successfully deleted
            Assert.IsNull(songFromDatabase);
        }
    }
}
