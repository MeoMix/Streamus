using System;
using System.Collections.Generic;
using NUnit.Framework;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;
using Streamus.Backend.Domain.Managers;

namespace Streamus.Tests
{
    [TestFixture]
    public class VideoDaoTest
    {
        private IVideoDao VideoDao { get; set; }
        private VideoManager VideoManager { get; set; }

        /// <summary>
        ///     This code is only ran once for the given TestFixture.
        /// </summary>
        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            try
            {
                VideoDao = new VideoDao();
            }
            catch (TypeInitializationException exception)
            {
                throw exception.InnerException;
            }

            new UserManager(new UserDao(), new PlaylistCollectionDao()).CreateUser();
        }

        /// <summary>
        ///     This code runs before every test.
        /// </summary>
        [SetUp]
        public void SetupContext()
        {
            //  Create managers here because every Client request will require new managers.
            VideoManager = new VideoManager(VideoDao);
        }

        [Test]
        public void Saves()
        {
            var video = new Video("s91jgcmQoB0", "Tristam - Chairs", 219);
            VideoManager.Save(video);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            Video videoFromDatabase = VideoDao.Get(video.Id);

            //  Test that the video was successfully inserted
            Assert.IsNotNull(videoFromDatabase);
            Assert.AreEqual(video.Title, videoFromDatabase.Title);
        }

        [Test]
        public void Deletes()
        {
            const string videoId = "s91jgcmQoB0";
            VideoManager.Delete(videoId);

            Video videoFromDatabase = VideoDao.Get(videoId);
            //  Test that the video was successfully deleted
            Assert.IsNull(videoFromDatabase);
        }

        /// <summary>
        ///     Ensure that the DAO can return multiple Video objects in one
        ///     SQL query.
        /// </summary>
        [Test]
        public void GetsByIds()
        {
            VideoManager.Save(new Video("s91jgcmQoB0", "Tristam - Chairs", 219));
            VideoManager.Save(new Video("M5USD-Smthk", "Flosstradamus - Roll Up (Baauer Remix)", 195));

            IList<Video> videos = VideoDao.Get(new List<string> {"s91jgcmQoB0", "M5USD-Smthk"});

            //  Expect 2 videos to be returned since we saved 2 videos.
            Assert.AreEqual(videos.Count, 2);
        }
    }
}
