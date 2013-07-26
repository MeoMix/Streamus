using System;
using System.Collections.Generic;
using System.Linq;
using NUnit.Framework;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;

namespace Streamus.Tests.Manager_Tests
{
    [TestFixture]
    public class VideoManagerTest : AbstractTest
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

        /// <summary>
        ///     A video not in the database should save without hesitation.
        /// </summary>
        [Test]
        public void SaveVideo_NotInDatabase_VideoSaved()
        {
            Video video = Helpers.CreateUnsavedVideoWithId();
            VideoManager.Save(video);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            Video videoFromDatabase = VideoDao.Get(video.Id);

            //  Test that the video was successfully inserted
            Assert.IsNotNull(videoFromDatabase);
            Assert.AreEqual(video.Title, videoFromDatabase.Title);
        }

        /// <summary>
        ///     Video's properties cannot change once inserted into the database.
        /// </summary>
        [Test]
        public void TryUpdateVideoTitle_VideoImmutable_TitleNotUpdated()
        {
            //  Save the first video.
            Video video = Helpers.CreateUnsavedVideoWithId();
            VideoManager.Save(video);

            string originalVideoTitle = video.Title;
            video.Title = "Video's new title";

            VideoManager.Save(video);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            Video videoFromDatabase = VideoDao.Get(video.Id);

            //  Ensure video title hasn't changed.
            Assert.AreEqual(videoFromDatabase.Title, originalVideoTitle);
        }

        /// <summary>
        ///     Make sure multiple Video entities can be saved in one transaction.
        /// </summary>
        [Test]
        public void SaveVideos_VideosDontShareIDs_VideosSaved()
        {
            var videos = new List<Video>
                {
                    Helpers.CreateUnsavedVideoWithId(),
                    Helpers.CreateUnsavedVideoWithId()
                };

            VideoManager.Save(videos);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            //  Make sure multiple videos were able to be saved.
            videos.Select(v => VideoDao.Get(v.Id)).ToList().ForEach(Assert.IsNotNull);
        }

        /// <summary>
        ///     Multiples videos with the same ID can be saved at once, but shouldn't have an effect on the database
        ///     for any which already exist.
        /// </summary>
        [Test]
        public void SaveVideos_VideosShareIDs_VideosSaved()
        {
            Video video = Helpers.CreateUnsavedVideoWithId();

            var videos = new List<Video>
                {
                    video,
                    Helpers.CreateUnsavedVideoWithId(video.Id)
                };

            VideoManager.Save(videos);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            //  Make sure multiple videos were able to be saved.
            videos.Select(v => VideoDao.Get(v.Id)).ToList().ForEach(Assert.IsNotNull);
        }
    }
}
