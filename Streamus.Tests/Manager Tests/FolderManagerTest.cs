using System;
using NHibernate;
using NUnit.Framework;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;

namespace Streamus.Tests.Manager_Tests
{
    [TestFixture]
    public class FolderManagerTest : AbstractTest
    {
        private IFolderDao FolderDao { get; set; }
        private User User { get; set; }
        private static readonly FolderManager FolderManager = new FolderManager();

        /// <summary>
        ///     This code is only ran once for the given TestFixture.
        /// </summary>
        [TestFixtureSetUp]
        public new void TestFixtureSetUp()
        {
            try
            {
                FolderDao = DaoFactory.GetFolderDao();
            }
            catch (TypeInitializationException exception)
            {
                throw exception.InnerException;
            }

            User = new UserManager().CreateUser();
        }

        /// <summary>
        ///     This code runs before every test.
        /// </summary>
        [SetUp]
        public void SetupContext()
        {

        }

        [Test]
        public void SaveFolder_FolderDoesNotExist_FolderCreated()
        {
            Folder folder = new Folder();
            FolderManager.Save(folder);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            Folder folderFromDatabase = FolderDao.Get(folder.Id);

            Assert.IsNotNull(folderFromDatabase);
        }

        /// <summary>
        ///     Verifies that a Folder can be deleted properly. The Folder
        ///     has no playlists underneath it and the User is assumed to not have any additional Folders.
        /// </summary>
        [Test]
        public void DeleteFolder()
        {
            //  Create a new Folder and write it to the database.
            Folder folder = User.CreateAndAddFolder();
            FolderManager.Save(folder);

            //  Now delete the created Playlist and ensure it is removed.
            FolderManager.Delete(folder.Id);

            //  Remove entity from NHibernate cache to force DB query to ensure actually created.
            NHibernateSessionManager.Instance.Clear();

            Folder deletedFolder = FolderDao.Get(folder.Id);

            bool objectNotFoundExceptionEncountered = false;
            try
            {
                //  Evaluating a lazyily-loaded entity which isn't in the database will throw an ONF exception.
                Assert.IsNull(deletedFolder);
            }
            catch (ObjectNotFoundException)
            {
                objectNotFoundExceptionEncountered = true;
            }

            Assert.IsTrue(objectNotFoundExceptionEncountered);

        }
    }
}
