using System;
using System.Collections.Generic;
using System.Linq;
using NUnit.Framework;
using Streamus.Controllers;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;
using Streamus.Dto;

namespace Streamus.Tests.Controller_Tests
{
    [TestFixture]
    public class UserControllerTest : AbstractTest
    {
        private static readonly UserManager UserManager = new UserManager();
        private static readonly PlaylistItemController PlaylistItemController = new PlaylistItemController();
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
        public void GetUserWithBulkPlaylistItemsInFolder_UserCreatedWithLotsOfItems_UserHasOneFolderOnePlaylist()
        {
            User user = UserManager.CreateUser();

            const int numItemsToCreate = 2000;

            Guid playlistId = user.Folders.First().Playlists.First().Id;
            List<PlaylistItemDto> playlistItemDtos = Helpers.CreatePlaylistItemsDto(numItemsToCreate, playlistId);
            PlaylistItemController.CreateMultiple(playlistItemDtos);

            NHibernateSessionManager.Instance.Clear();

            User userFromDatabase = UserDao.Get(user.Id);

            Assert.That(userFromDatabase.Folders.Count == user.Folders.Count);
            Assert.That(userFromDatabase.Folders.First().Playlists.Count == user.Folders.First().Playlists.Count);
            Assert.That(userFromDatabase.Folders.First().Playlists.First().Items.Count() == numItemsToCreate);
            Assert.That(userFromDatabase.Folders.First().Playlists.First().Items.Count() == user.Folders.First().Playlists.First().Items.Count());
        }
    }
}
