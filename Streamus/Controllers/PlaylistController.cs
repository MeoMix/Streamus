using log4net;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;
using System;
using System.Reflection;
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class PlaylistController : Controller
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private readonly IPlaylistDao PlaylistDao;
        private readonly IPlaylistItemDao PlaylistItemDao;
        private readonly IStreamDao StreamDao;
        private readonly IVideoDao VideoDao;

        public PlaylistController()
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

        [HttpPost]
        public ActionResult Create(Playlist playlist)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, VideoDao);

            playlist.Stream.AddPlaylist(playlist);

            playlist.ValidateAndThrow();
            PlaylistDao.Save(playlist);

            StreamDao.Save(playlist.Stream);

            playlistManager.Save(playlist);

            return new JsonDataContractActionResult(playlist);
        }

        [HttpPut]
        public ActionResult Update(Playlist playlist)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, VideoDao);
            playlistManager.Update(playlist);

            return new JsonDataContractActionResult(playlist);
        }

        [HttpGet]
        public ActionResult Get(Guid id)
        {
            Playlist playlist = PlaylistDao.Get(id);

            return new JsonDataContractActionResult(playlist);
        }

        [HttpDelete]
        public JsonResult Delete(Guid id)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, VideoDao);
            playlistManager.DeletePlaylistById(id);

            return Json(new
            {
                success = true
            });
        }

        [HttpPost]
        public JsonResult UpdateTitle(Guid playlistId, string title)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, VideoDao);
            playlistManager.UpdateTitle(playlistId, title);

            return Json(new{
                success = true
            });
        }

        [HttpPost]
        public JsonResult UpdateFirstItemId(Guid playlistId, Guid firstItemId)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, VideoDao);
            playlistManager.UpdateFirstItemId(playlistId, firstItemId);

            return Json(new
            {
                success = true
            });
        }
    }
}
