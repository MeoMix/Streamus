using log4net;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;
using Streamus.Backend.Domain.Managers;
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
        private readonly IStreamDao _streamDao;
        private readonly IVideoDao VideoDao;

        public PlaylistController()
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

        [HttpPost]
        public ActionResult Create(Playlist playlist)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, _streamDao, VideoDao);
            playlistManager.Save(playlist);

            return new JsonDataContractActionResult(playlist);
        }

        [HttpPut]
        public ActionResult Update(Playlist playlist)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, _streamDao, VideoDao);
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
        public EmptyResult Delete(Guid id)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, _streamDao, VideoDao);
            playlistManager.DeletePlaylistById(id);

            return new EmptyResult();
        }

        [HttpPost]
        public EmptyResult UpdateTitle(Guid playlistId, string title)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, _streamDao, VideoDao);
            playlistManager.UpdateTitle(playlistId, title);

            return new EmptyResult();
        }

        [HttpPost]
        public EmptyResult UpdateFirstItemId(Guid playlistId, Guid firstItemId)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, _streamDao, VideoDao);
            playlistManager.UpdateFirstItemId(playlistId, firstItemId);

            return new EmptyResult();
        }
    }
}
