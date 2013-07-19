using System;
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
    }
}
