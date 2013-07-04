using System;
using System.Linq;
using NUnit.Framework;
using Streamus.Controllers;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Dto;

namespace Streamus.Tests.Controller_Tests
{
    [TestFixture]
    public class PlaylistItemControllerTest : AbstractTest
    {
        private static readonly PlaylistItemController PlaylistItemController = new PlaylistItemController();
        private IPlaylistDao PlaylistDao { get; set; }

        /// <summary>
        ///     This code is only ran once for the given TestFixture.
        /// </summary>
        [TestFixtureSetUp]
        public new void TestFixtureSetUp()
        {
            try
            {
                PlaylistDao = DaoFactory.GetPlaylistDao();
            }
            catch (TypeInitializationException exception)
            {
                throw exception.InnerException;
            }
        }

        [Test]
        public void CreatePlaylistItem_PlaylistItemDoesntExist_PlaylistItemCreated()
        {
            PlaylistItemDto playlistItemDto = Helpers.CreatePlaylistItemDto();

            var result = (JsonDataContractActionResult) PlaylistItemController.Create(playlistItemDto);

            var createdPlaylistItemDto = (PlaylistItemDto) result.Data;

            //  Make sure we actually get a PlaylistItem DTO back from the Controller.
            Assert.NotNull(createdPlaylistItemDto);

            NHibernateSessionManager.Instance.Clear();

            Playlist playlist = PlaylistDao.Get(createdPlaylistItemDto.PlaylistId);

            //  Make sure that the created playlistItem was cascade added to the Playlist
            Assert.That(playlist.Items.Count(i => i.Id == createdPlaylistItemDto.Id) == 1);
        }
    }
}
