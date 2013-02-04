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
        private readonly IUserDao UserDao = new UserDao();
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();
        private UserManager UserManager;

        /// <summary>
        ///     This code is only ran once for the given TestFixture.
        /// </summary>
        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            Configuration = new Configuration();
            Configuration.Configure();

            //  Recreate database schema before execution of tests. 
            new SchemaExport(Configuration).Execute(false, true, false);
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
            NHibernateSessionManager.Instance.Evict(user);

            User userFromDatabase = UserDao.Get(user.Id);
            //  Test that the product was successfully inserted
            Assert.IsNotNull(userFromDatabase);
            Assert.AreNotSame(user, userFromDatabase);
        }
    }
}
