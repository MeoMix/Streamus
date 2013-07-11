using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NUnit.Framework;
using Streamus.Controllers;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Dto;

namespace Streamus.Tests.Controller_Tests
{
    [TestFixture]
    public class UserControllerTest : AbstractTest
    {
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
        public void GetUserWithBulkPlaylistItemsInStream_UserCreatedWithLotsOfItems_UserHasOneStreamOnePlaylist()
        {
            User user = Helpers.CreateSavedUserWithPlaylist();

            const int numItemsToCreate = 2000;

            List<PlaylistItemDto> playlistItemDtos = Helpers.CreatePlaylistItemsDto(numItemsToCreate, user.Streams.First().Playlists.First().Id);
            PlaylistItemController.CreateMultiple(playlistItemDtos);

            NHibernateSessionManager.Instance.Clear();

            User userFromDatabase = UserDao.Get(user.Id);

            Assert.That(userFromDatabase.Streams.Count == user.Streams.Count);
            Assert.That(userFromDatabase.Streams.First().Playlists.Count == user.Streams.First().Playlists.Count);
            Assert.That(userFromDatabase.Streams.First().Playlists.First().Items.Count() == numItemsToCreate); 
            Assert.That(userFromDatabase.Streams.First().Playlists.First().Items.Count() == user.Streams.First().Playlists.First().Items.Count());
        }
    }
}
