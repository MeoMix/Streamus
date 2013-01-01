using NHibernate.Cfg;
using NHibernate.Tool.hbm2ddl;
using NUnit.Framework;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.DataInterfaces;
using Streamus.Backend.Domain.Managers;

namespace Streamus.Tests
{
    [TestFixture]
    public class UserDaoTest
    {
        private Configuration Configuration { get; set; }
        private IUserDao UserDao { get; set; }
        private IPlaylistDao PlaylistDao { get; set; }

        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            Configuration = new Configuration();
            Configuration.Configure();
            UserDao = new UserDao();
            PlaylistDao = new PlaylistDao();
        }

        [SetUp]
        public void SetupContext()
        {
            //To keep our test methods side effect free we re-create our database schema before the execution of each test method. 
            new SchemaExport(Configuration).Execute(false, true, false);
        }

        [Test]
        public void CanCreateUser()
        {
            var userManager = new UserManager(UserDao, PlaylistDao);
            User user = userManager.CreateUser();

            //Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Evict(user);

            User userFromDatabase = UserDao.GetById(user.Id);
            // Test that the product was successfully inserted
            Assert.IsNotNull(userFromDatabase);
            Assert.AreNotSame(user, userFromDatabase);
        }
    }
}
