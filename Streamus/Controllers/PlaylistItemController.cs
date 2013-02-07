using System;
using System.Web.Mvc;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;
using Streamus.Backend.Domain.Managers;

namespace Streamus.Controllers
{
    public class PlaylistItemController : Controller
    {
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();
        private readonly IPlaylistItemDao PlaylistItemDao = new PlaylistItemDao();

        [HttpPost]
        public ActionResult Create(PlaylistItem playlistItem)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
            playlistManager.CreatePlaylistItem(playlistItem);

            return new JsonDataContractActionResult(playlistItem);
        }

        [HttpPut]
        public ActionResult Update(PlaylistItem playlistItem)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
            playlistManager.UpdatePlaylistItem(playlistItem);

            return new JsonDataContractActionResult(playlistItem);
        }

        [HttpDelete]
        public EmptyResult Delete(Guid id, Guid playlistId, Guid userId)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
            playlistManager.DeleteItem(id, playlistId, userId);

            return new EmptyResult();
        }
    }
}
