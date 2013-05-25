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
        private static readonly PlaylistManager PlaylistManager = new PlaylistManager();

        private readonly IPlaylistDao PlaylistDao;
        private readonly IStreamDao StreamDao;
        private readonly IShareCodeDao ShareCodeDao;

        public PlaylistController()
        {
            try
            {
                PlaylistDao = new PlaylistDao();
                StreamDao = new StreamDao();
                ShareCodeDao = new ShareCodeDao();
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
            playlist.Stream.AddPlaylist(playlist);
            StreamDao.Save(playlist.Stream);

            PlaylistManager.Save(playlist);

            return new JsonDataContractActionResult(playlist);
        }

        [HttpPut]
        public ActionResult Update(Playlist playlist)
        {
            PlaylistManager.Update(playlist);

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
            PlaylistManager.DeletePlaylistById(id);

            return Json(new
            {
                success = true
            });
        }

        [HttpPost]
        public JsonResult UpdateTitle(Guid playlistId, string title)
        {
            PlaylistManager.UpdateTitle(playlistId, title);

            return Json(new{
                success = true
            });
        }

        [HttpPost]
        public JsonResult UpdateFirstItemId(Guid playlistId, Guid firstItemId)
        {
            PlaylistManager.UpdateFirstItemId(playlistId, firstItemId);

            return Json(new
            {
                success = true
            });
        }

        [HttpGet]
        public JsonResult GetShareCode(Guid playlistId)
        {
            string shareCode = PlaylistManager.GetShareCode(playlistId);

            return Json(shareCode, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult CreateAndGetCopyByShareCode(Guid shareCodeId, Guid streamId)
        {
            ShareCode shareCode = ShareCodeDao.Get(shareCodeId);

            if (shareCode.EntityType != ShareableEntityType.Playlist)
            {
                throw new ApplicationException("Expected shareCode to have entityType of Playlist");
            }

            //  Never return the sharecode's playlist reference. Make a copy of it to give out so people can't modify the original.
            Playlist copyablePlaylist = PlaylistDao.Get(shareCode.EntityId);

            Stream stream = StreamDao.Get(streamId);

            Playlist playlist = new Playlist();
            stream.AddPlaylist(playlist);
            StreamDao.Save(stream);

            //  TODO: I think I have to call save on my playlist before calling copy to add items to it because it expects the playlist to have an ID already
            PlaylistDao.Save(playlist);

            playlist.Copy(copyablePlaylist);

            PlaylistManager.Save(playlist);

            return new JsonDataContractActionResult(playlist);
        }
    }
}
