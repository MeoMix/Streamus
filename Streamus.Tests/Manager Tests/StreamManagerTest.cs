using System;
using NUnit.Framework;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;

namespace Streamus.Tests.Manager_Tests
{
    [TestFixture]
    public class StreamManagerTest : AbstractTest
    {
        private IStreamDao StreamDao { get; set; }
        private static readonly StreamManager StreamManager = new StreamManager();

        /// <summary>
        ///     This code is only ran once for the given TestFixture.
        /// </summary>
        [TestFixtureSetUp]
        public new void TestFixtureSetUp()
        {
            try
            {
                StreamDao = DaoFactory.GetStreamDao();
            }
            catch (TypeInitializationException exception)
            {
                throw exception.InnerException;
            }
        }

        /// <summary>
        ///     This code runs before every test.
        /// </summary>
        [SetUp]
        public void SetupContext()
        {

        }

        [Test]
        public void SaveStream_StreamDoesNotExist_StreamCreated()
        {
            var stream = new Stream();
            StreamManager.Save(stream);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            Stream streamFromDatabase = StreamDao.Get(stream.Id);

            Assert.IsNotNull(streamFromDatabase);
        }
    }
}
