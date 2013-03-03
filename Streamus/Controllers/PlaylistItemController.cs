using System;
using System.Collections.Generic;
using System.Reflection;
using System.Web.Mvc;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;
using Streamus.Backend.Domain.Managers;
using log4net;

namespace Streamus.Controllers
{
    public class PlaylistItemController : Controller
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private readonly IPlaylistDao PlaylistDao;
        private readonly IPlaylistItemDao PlaylistItemDao;
        private readonly IStreamDao _streamDao;
        private readonly IVideoDao VideoDao;

        public PlaylistItemController()
        {
            try
            {
                PlaylistDao = new PlaylistDao();
                PlaylistItemDao = new PlaylistItemDao();
                _streamDao = new StreamDao();
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
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, _streamDao, VideoDao);
            playlistManager.UpdatePlaylistItem(playlistItem);

            return new JsonDataContractActionResult(playlistItem);
        }

        [HttpPut]
        public ActionResult UpdateMultiple(IEnumerable<PlaylistItem> playlistItems)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, _streamDao, VideoDao);
            playlistManager.UpdatePlaylistItems(playlistItems);

            return new JsonDataContractActionResult(playlistItems);
        }

        [HttpDelete]
        public EmptyResult Delete(Guid id, Guid playlistId)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, _streamDao, VideoDao);
            playlistManager.DeleteItem(id, playlistId);

            return new EmptyResult();
        }
    }
}
