using System;
using NHibernate.Cfg;
using NHibernate.Tool.hbm2ddl;
using NUnit.Framework;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;

namespace Streamus.Tests
{
    [TestFixture]
    public class UserManagerTest : AbstractManagerTest
    {
        private Configuration Configuration { get; set; }
        private IUserDao UserDao { get; set; }
        private static readonly UserManager UserManager = new UserManager();

        /// <summary>
        ///     This code is only ran once for the given TestFixture.
        /// </summary>
        [TestFixtureSetUp]
        public new void TestFixtureSetUp()
        {
            try
            {
                UserDao = DaoFactory.GetUserDao();
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

        [Test]
        public void CreateUser_UserDoesntExist_UserCreated()
        {
            User user = UserManager.CreateUser();

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            User userFromDatabase = UserDao.Get(user.Id);
            //  Test that the product was successfully inserted
            Assert.AreNotSame(user, userFromDatabase);

            Assert.IsNotNull(userFromDatabase);
            Assert.IsNotEmpty(userFromDatabase.Streams);
        }
    }
}
