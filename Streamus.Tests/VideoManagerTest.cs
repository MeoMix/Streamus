using NUnit.Framework;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;
using System;
using System.Collections.Generic;

namespace Streamus.Tests
{
    [TestFixture]
    public class VideoManagerTest : AbstractManagerTest
    {
        private IVideoDao VideoDao { get; set; }
        private static readonly VideoManager VideoManager = new VideoManager();

        /// <summary>
        ///     This code is only ran once for the given TestFixture.
        /// </summary>
        [TestFixtureSetUp]
        public new void TestFixtureSetUp()
        {
            try
            {
                VideoDao = DaoFactory.GetVideoDao();
            }
            catch (TypeInitializationException exception)
            {
                throw exception.InnerException;
            }

            new UserManager().CreateUser();
        }

        [Test]
        public void Saves()
        {
            var video = new Video("s91jgcmQoB0", "Tristam - Chairs", 219, "MeoMix");
            VideoManager.Save(video);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            Video videoFromDatabase = VideoDao.Get(video.Id);

            //  Test that the video was successfully inserted
            Assert.IsNotNull(videoFromDatabase);
            Assert.AreEqual(video.Title, videoFromDatabase.Title);
        }

        /// <summary>
        ///     Ensure that the DAO can return multiple Video objects in one
        ///     SQL query.
        /// </summary>
        [Test]
        public void GetsByIds()
        {
            VideoManager.Save(new Video("s91jgcmQoB0", "Tristam - Chairs", 219, "MeoMix"));
            VideoManager.Save(new Video("M5USD-Smthk", "Flosstradamus - Roll Up (Baauer Remix)", 195, "McMouse"));

            IList<Video> videos = VideoDao.Get(new List<string> {"s91jgcmQoB0", "M5USD-Smthk"});

            //  Expect 2 videos to be returned since we saved 2 videos.
            Assert.AreEqual(videos.Count, 2);
        }
    }
}
