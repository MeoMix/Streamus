using NUnit.Framework;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;
using System;

namespace Streamus.Tests.Manager_Tests
{
    [TestFixture]
    public class UserManagerTest : AbstractTest
    {
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
            Assert.IsNotEmpty(userFromDatabase.Folders);
        }
    }
}
