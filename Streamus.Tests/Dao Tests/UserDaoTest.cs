using System;
using NUnit.Framework;
using Streamus.Domain.Interfaces;

namespace Streamus.Tests.Dao_Tests
{
    [TestFixture]
    public class UserDaoTest : AbstractTest
    {
        private IUserDao UserDao { get; set; }

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
        public void GetUser_UserExists_UserRetrieved()
        {
        }
    }
}
