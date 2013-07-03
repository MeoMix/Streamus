using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NUnit.Framework;
using Streamus.Domain;
using Streamus.Domain.Interfaces;

namespace Streamus.Tests
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
            //  Test getting a user, observe fails, fix.
        }
    }
}
