using log4net;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class PlaylistItemController : Controller
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private readonly IPlaylistDao PlaylistDao;
        private readonly IPlaylistItemDao PlaylistItemDao;
        private readonly IStreamDao StreamDao;
        private readonly IVideoDao VideoDao;

        public PlaylistItemController()
        {
            try
            {
                PlaylistDao = new PlaylistDao();
                PlaylistItemDao = new PlaylistItemDao();
                StreamDao = new StreamDao();
                VideoDao = new VideoDao();
            }
            catch (TypeInitializationException exception)
            {
                Logger.Error(exception.InnerException);
                throw exception.InnerException;
            }
        }

        [HttpPut]
        public ActionResult Update(PlaylistItem playlistItem)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, StreamDao, VideoDao);
            playlistManager.UpdatePlaylistItem(playlistItem);

            return new JsonDataContractActionResult(playlistItem);
        }

        [HttpPut]
        public ActionResult UpdateMultiple(IEnumerable<PlaylistItem> playlistItems)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, StreamDao, VideoDao);
            playlistManager.UpdatePlaylistItems(playlistItems);

            return new JsonDataContractActionResult(playlistItems);
        }

        [HttpDelete]
        public EmptyResult Delete(Guid id, Guid playlistId)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, StreamDao, VideoDao);
            playlistManager.DeleteItem(id, playlistId);

            return new EmptyResult();
        }
    }
}
