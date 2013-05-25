using Streamus.Domain;
using Streamus.Domain.Managers;
using System;
using System.Collections.Generic;
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class PlaylistItemController : Controller
    {
        private static readonly PlaylistManager PlaylistManager = new PlaylistManager();

        [HttpPut]
        public ActionResult Update(PlaylistItem playlistItem)
        {
            PlaylistManager.UpdatePlaylistItem(playlistItem);

            return new JsonDataContractActionResult(playlistItem);
        }

        [HttpPut]
        public ActionResult UpdateMultiple(IEnumerable<PlaylistItem> playlistItems)
        {
            PlaylistManager.UpdatePlaylistItems(playlistItems);

            return new JsonDataContractActionResult(playlistItems);
        }

        [HttpDelete]
        public JsonResult Delete(Guid id, Guid playlistId)
        {
            PlaylistManager.DeleteItem(id, playlistId);

            return Json(new
            {
                success = true
            });
        }
    }
}
