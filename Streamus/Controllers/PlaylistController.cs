using System;
using System.Reflection;
using System.Web.Mvc;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;
using Streamus.Dto;
using log4net;

namespace Streamus.Controllers
{
    public class PlaylistController : Controller
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private static readonly PlaylistManager PlaylistManager = new PlaylistManager();

        private readonly IPlaylistDao PlaylistDao;
<<<<<<< HEAD
        private readonly IStreamDao StreamDao;
=======
        private readonly IFolderDao FolderDao;
>>>>>>> origin/Development
        private readonly IShareCodeDao ShareCodeDao;

        public PlaylistController()
        {
            try
            {
                PlaylistDao = new PlaylistDao();
<<<<<<< HEAD
                StreamDao = new StreamDao();
=======
                FolderDao = new FolderDao();
>>>>>>> origin/Development
                ShareCodeDao = new ShareCodeDao();
            }
            catch (TypeInitializationException exception)
            {
                Logger.Error(exception.InnerException);
                throw exception.InnerException;
            }
        }

        [HttpPost]
        public ActionResult Create(PlaylistDto playlistDto)
        {
<<<<<<< HEAD
            playlist.Stream.AddPlaylist(playlist);
            StreamDao.Save(playlist.Stream);

            PlaylistManager.Save(playlist);
=======
            Playlist playlist = Playlist.Create(playlistDto);
            playlist.Folder.AddPlaylist(playlist);

            //  Make sure the playlist has been setup properly before it is cascade-saved through the Folder.
            playlist.ValidateAndThrow();

            PlaylistManager.Save(playlist);

            PlaylistDto savedPlaylistDto = PlaylistDto.Create(playlist);
>>>>>>> origin/Development

            return new JsonDataContractActionResult(savedPlaylistDto);
        }

        [HttpPut]
        public ActionResult Update(PlaylistDto playlistDto)
        {
<<<<<<< HEAD
=======
            Playlist playlist = Playlist.Create(playlistDto);
>>>>>>> origin/Development
            PlaylistManager.Update(playlist);

            PlaylistDto updatedPlaylistDto = PlaylistDto.Create(playlist);
            return new JsonDataContractActionResult(updatedPlaylistDto);
        }

        [HttpGet]
        public ActionResult Get(Guid id)
        {
            Playlist playlist = PlaylistDao.Get(id);
            PlaylistDto playlistDto = PlaylistDto.Create(playlist);

            return new JsonDataContractActionResult(playlistDto);
        }

        [HttpDelete]
        public JsonResult Delete(Guid id)
        {
<<<<<<< HEAD
            PlaylistManager.DeletePlaylistById(id);
=======
            PlaylistManager.Delete(id);
>>>>>>> origin/Development

            return Json(new
                {
                    success = true
                });
        }

        [HttpPost]
        public JsonResult UpdateTitle(Guid playlistId, string title)
        {
            PlaylistManager.UpdateTitle(playlistId, title);

            return Json(new
                {
                    success = true
                });
        }

        [HttpPost]
        public JsonResult UpdateFirstItem(Guid playlistId, Guid firstItemId)
        {
<<<<<<< HEAD
            PlaylistManager.UpdateFirstItemId(playlistId, firstItemId);
=======
            PlaylistManager.UpdateFirstItem(playlistId, firstItemId);
>>>>>>> origin/Development

            return Json(new
                {
                    success = true
                });
        }

        /// <summary>
        ///     Retrieves a ShareCode relating to a Playlist, create a copy of the Playlist referenced by the ShareCode,
        ///     and return the copied Playlist.
        /// </summary>
        [HttpGet]
        public JsonResult CreateCopyByShareCode(string shareCodeShortId, string urlFriendlyEntityTitle, Guid folderId)
        {
            ShareCode shareCode = ShareCodeDao.GetByShortIdAndEntityTitle(shareCodeShortId, urlFriendlyEntityTitle);

            if (shareCode == null)
            {
                throw new ApplicationException("Unable to locate shareCode in database.");
            }

            if (shareCode.EntityType != ShareableEntityType.Playlist)
            {
                throw new ApplicationException("Expected shareCode to have entityType of Playlist");
            }

            //  Never return the sharecode's playlist reference. Make a copy of it to give out so people can't modify the original.
            Playlist playlistToCopy = PlaylistDao.Get(shareCode.EntityId);

            Folder folder = FolderDao.Get(folderId);

            var playlistCopy = new Playlist(playlistToCopy);
            folder.AddPlaylist(playlistCopy);

            PlaylistManager.Save(playlistCopy);

            PlaylistDto playlistDto = PlaylistDto.Create(playlistCopy);
            return new JsonDataContractActionResult(playlistDto);
        }

        [HttpGet]
        public JsonResult GetShareCode(Guid playlistId)
        {
            ShareCode shareCode = PlaylistManager.GetShareCode(playlistId);

            return new JsonDataContractActionResult(shareCode);
        }

        [HttpGet]
        public JsonResult CreateAndGetCopyByShareCode(string shareCodeShortId, string urlFriendlyEntityTitle, Guid streamId)
        {
            ShareCode shareCode = ShareCodeDao.GetByShortIdAndEntityTitle(shareCodeShortId, urlFriendlyEntityTitle);

            if (shareCode == null)
            {
                throw new ApplicationException("Unable to locate shareCode in database.");
            }

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
