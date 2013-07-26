using System;
using System.Collections.Generic;
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

            var result = PlaylistItemController.Create(playlistItemDto);

            var createdPlaylistItemDto = (PlaylistItemDto) result.Data;

            //  Make sure we actually get a PlaylistItem DTO back from the Controller.
            Assert.NotNull(createdPlaylistItemDto);

            NHibernateSessionManager.Instance.Clear();

            Playlist playlist = PlaylistDao.Get(createdPlaylistItemDto.PlaylistId);

            //  Make sure that the created playlistItem was cascade added to the Playlist
            Assert.That(playlist.Items.Count(i => i.Id == createdPlaylistItemDto.Id) == 1);
        }

        /// <summary>
        /// 50 PlaylistItems is the largest chunk expected to be saved in one burst because
        /// the YouTube API maxes out at 50 return items.
        /// </summary>
        [Test]
        public void Create50PlaylistItems_PlaylistEmpty_AllItemsCreated()
        {
            const int numItemsToCreate = 50;
            List<PlaylistItemDto> playlistItemDtos = Helpers.CreatePlaylistItemsDto(numItemsToCreate);
            
            var result = PlaylistItemController.CreateMultiple(playlistItemDtos);

            var createdPlaylistItemDtos = (List<PlaylistItemDto>)result.Data;

            //  Make sure we actually get the list back from the Controller.
            Assert.NotNull(createdPlaylistItemDtos);
            Assert.That(createdPlaylistItemDtos.Count == numItemsToCreate);

            NHibernateSessionManager.Instance.Clear();

            Playlist playlist = PlaylistDao.Get(playlistItemDtos.First().PlaylistId);

            //  Make sure that the created playlistItem was cascade added to the Playlist
            Assert.That(playlist.Items.Count == numItemsToCreate);
        }

        /// <summary>
        /// A StackOverflowException will occur if mappings don't contain fetch="join." Ensure this rule is in place.
        /// </summary>
        [Test]
        public void CreatePlaylistItemsRepeatedly_PlaylistEmpty_NoStackOverflowException()
        {
            const int iterations = 2;
            const int numItemsToCreate = 2142;
            Guid playlistId = default(Guid);

            //  Starting at 1 because I want to use currentIteration to be used in math and makes more sense as 1.
            for (int currentIteration = 1; currentIteration <= iterations; currentIteration++)
            {
                List<PlaylistItemDto> playlistItemDtos = Helpers.CreatePlaylistItemsDto(numItemsToCreate, playlistId);

                var result = PlaylistItemController.CreateMultiple(playlistItemDtos);

                var createdPlaylistItemDtos = (List<PlaylistItemDto>)result.Data;

                //  Make sure we actually get the list back from the Controller.
                Assert.NotNull(createdPlaylistItemDtos);
                Assert.That(createdPlaylistItemDtos.Count == numItemsToCreate);

                NHibernateSessionManager.Instance.Clear();

                Playlist playlist = PlaylistDao.Get(playlistItemDtos.First().PlaylistId);
                playlistId = playlist.Id;

                //  Make sure that the created playlistItem was cascade added to the Playlist
                Assert.That(playlist.Items.Count == numItemsToCreate * currentIteration);
            }
        }
    }
}
