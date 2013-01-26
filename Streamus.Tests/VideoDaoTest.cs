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
    public class VideoDaoTest
    {
        private Configuration Configuration;
        private IVideoDao VideoDao;
        private IPlaylistDao PlaylistDao;
        private IPlaylistItemDao PlaylistItemDao;
        private User User;
        private Playlist Playlist;

        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            Configuration = new Configuration();
            Configuration.Configure();
            VideoDao = new VideoDao();
            PlaylistDao = new PlaylistDao();
            PlaylistItemDao = new PlaylistItemDao();
        }

        [SetUp]
        public void SetupContext()
        {
            //  To keep our test methods side effect free we re-create our database schema before the execution of each test method. 
            new SchemaExport(Configuration).Execute(false, true, false);

            User = new UserManager(new UserDao(), new PlaylistDao()).CreateUser();
            Playlist = new Playlist(User.Id, "New Playlist 001", PlaylistDao.GetAll().Count);
            new PlaylistManager(PlaylistDao, PlaylistItemDao).CreatePlaylist(Playlist);
        }

        [Test]
        public void CanSaveVideo()
        {
            Video video = new Video("s91jgcmQoB0", "Tristam - Chairs", 219);

            VideoManager videoManager = new VideoManager(VideoDao);
            videoManager.SaveVideo(video);

            video.Title = "New title 002";
            videoManager.SaveVideo(video);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Evict(video);

            Video videoFromDatabase = VideoDao.GetById(video.Id);

            //  Test that the video was successfully inserted
            Assert.IsNotNull(videoFromDatabase);
            Assert.AreEqual(video.Title, videoFromDatabase.Title);
        }

        [Test]
        public void CanDeleteVideo()
        {
            Video video = new Video
                {
                    Id = "s91jgcmQoB0",
                    Title = "Tristam - Chairs",
                    Duration = 219
                };

            VideoManager videoManager = new VideoManager(VideoDao);
            videoManager.SaveVideo(video);
            videoManager.DeleteVideoById(video.Id);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Evict(video);

            Video videoFromDatabase = VideoDao.GetById(video.Id);
            //  Test that the video was successfully deleted
            Assert.IsNull(videoFromDatabase);
        }
    }
}
