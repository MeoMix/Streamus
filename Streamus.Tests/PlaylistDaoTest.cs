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
    public class PlaylistDaoTest
    {
        private Configuration Configuration;
        private IPlaylistDao PlaylistDao;
        private IPlaylistItemDao PlaylistItemDao;
        private User User;

        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            Configuration = new Configuration();
            Configuration.Configure();
            PlaylistDao = new PlaylistDao();
            PlaylistItemDao = new PlaylistItemDao();
        }

        [SetUp]
        public void SetupContext()
        {
            //To keep our test methods side effect free we re-create our database schema before the execution of each test method. 
            new SchemaExport(Configuration).Execute(false, true, false);

            User = new UserManager(new UserDao(), new PlaylistDao()).CreateUser();
        }

        //[Test]
        //public void CanUpdatePlaylist()
        //{
        //    var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
        //    var playlist = new Playlist(User.Id, "New Playlist 001", PlaylistDao.GetAll().Count);
        //    playlistManager.CreatePlaylist(playlist);

        //    playlist.Title = "Existing Playlist 001";
        //    playlistManager.UpdatePlaylist(playlist);

        //    //Remove entity from NHibernate cache to force DB query to ensure actually created.
        //    NHibernateSessionManager.Instance.Evict(playlist);

        //    Playlist playlistFromDatabase = PlaylistDao.GetById(playlist.Id);
        //    // Test that the product was successfully inserted
        //    Assert.IsNotNull(playlistFromDatabase);
        //    Assert.AreEqual(playlist.Title, playlistFromDatabase.Title);
        //}
    }
}
