using System;
using NHibernate.Cfg;
using NHibernate.Tool.hbm2ddl;
using NUnit.Framework;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;
using Streamus.Backend.Domain.Managers;

namespace Streamus.Tests
{
    [TestFixture]
    public class UserDaoTest
    {
        private Configuration Configuration { get; set; }
        private IUserDao UserDao { get; set; }
        private IPlaylistDao PlaylistDao { get; set; }
        private UserManager UserManager { get; set; }

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
            }
            catch (TypeInitializationException exception)
            {
                throw exception.InnerException;
            }

            //  Run this bit of code to have the UserDaoTest create the StreamusTest tables.
            //  Disable this again immediately after. It'll mess up tests and makes everything run slower.
            const bool needSetupDatabase = true;

            if (needSetupDatabase)
            {
                Configuration = new Configuration();
                Configuration.Configure();

                new SchemaExport(Configuration).Execute(false, true, false);
            }
        }

        /// <summary>
        ///     This code runs before every test.
        /// </summary>
        [SetUp]
        public void SetupContext()
        {
            //  Create managers here because every client request will require new managers.
            UserManager = new UserManager(UserDao, PlaylistDao);
        }

        [Test]
        public void Creates()
        {
            User user = UserManager.CreateUser();

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            User userFromDatabase = UserDao.Get(user.Id);
            //  Test that the product was successfully inserted
            Assert.IsNotNull(userFromDatabase);
            Assert.AreNotSame(user, userFromDatabase);
        }
    }
}
