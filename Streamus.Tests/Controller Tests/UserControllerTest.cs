using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NUnit.Framework;
using Streamus.Domain;

namespace Streamus.Tests.Controller_Tests
{
    [TestFixture]
    public class UserControllerTest
    {
        /// <summary>
        /// A StackOverflowException will occur if mappings don't contain fetch="join." Ensure this rule is in place.
        /// </summary>
        [Test]
        public void GetUserWithBulkPlaylistItemsInStream_UserCreatedWithLotsOfItems_UserHasOneStreamOnePlaylist()
        {
            User user = new User();
            Stream stream = Helpers.CreateSavedStreamWithPlaylist();

            //const int iterations = 2;
            //const int numItemsToCreate = 2142;
            //Guid playlistId = default(Guid);

            ////  Starting at 1 because I want to use currentIteration to be used in math and makes more sense as 1.
            //for (int currentIteration = 1; currentIteration <= iterations; currentIteration++)
            //{
            //    List<PlaylistItemDto> playlistItemDtos = Helpers.CreatePlaylistItemsDto(numItemsToCreate, playlistId);

            //    var result = PlaylistItemController.CreateMultiple(playlistItemDtos);

            //    var createdPlaylistItemDtos = (List<PlaylistItemDto>)result.Data;

            //    //  Make sure we actually get the list back from the Controller.
            //    Assert.NotNull(createdPlaylistItemDtos);
            //    Assert.That(createdPlaylistItemDtos.Count == numItemsToCreate);

            //    NHibernateSessionManager.Instance.Clear();

            //    Playlist playlist = PlaylistDao.Get(playlistItemDtos.First().PlaylistId);
            //    playlistId = playlist.Id;

            //    //  Make sure that the created playlistItem was cascade added to the Playlist
            //    Assert.That(playlist.Items.Count == numItemsToCreate * currentIteration);
            //}
        }
    }
}
