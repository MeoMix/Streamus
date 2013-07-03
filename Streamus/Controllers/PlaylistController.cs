using System;
using System.Reflection;
using System.Web.Mvc;
using AutoMapper;
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
        private static readonly StreamManager StreamManager = new StreamManager();

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
        public ActionResult Create(PlaylistDto playlistDto)
        {
            Playlist playlist = Mapper.Map<PlaylistDto, Playlist>(playlistDto);
            playlist.Stream.AddPlaylist(playlist);

            //  Make sure the playlist has been setup properly before it is cascade-saved through the Stream.
            playlist.ValidateAndThrow();

            //  TODO: Why am I saving Stream and not playlist?!
            StreamManager.Save(playlist.Stream);

            PlaylistDto savedPlaylistDto = Mapper.Map<Playlist, PlaylistDto>(playlist);

            return new JsonDataContractActionResult(savedPlaylistDto);
        }

        [HttpPut]
        public ActionResult Update(PlaylistDto playlistDto)
        {
            Playlist playlist = Mapper.Map<PlaylistDto, Playlist>(playlistDto);
            PlaylistManager.Update(playlist);

            PlaylistDto updatedPlaylistDto = Mapper.Map<Playlist, PlaylistDto>(playlist);
            return new JsonDataContractActionResult(updatedPlaylistDto);
        }

        [HttpGet]
        public ActionResult Get(Guid id)
        {
            Playlist playlist = PlaylistDao.Get(id);
            PlaylistDto playlistDto = Mapper.Map<Playlist, PlaylistDto>(playlist);

            return new JsonDataContractActionResult(playlistDto);
        }

        [HttpDelete]
        public JsonResult Delete(Guid id)
        {
            PlaylistManager.Delete(id);

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
            PlaylistManager.UpdateFirstItem(playlistId, firstItemId);

            return Json(new
                {
                    success = true
                });
        }

        //  TODO: Move this to ShareCodeController
        [HttpGet]
        public JsonResult GetShareCode(Guid playlistId)
        {
            ShareCode shareCode = PlaylistManager.GetShareCode(playlistId);
            ShareCodeDto shareCodeDto = Mapper.Map<ShareCode, ShareCodeDto>(shareCode);

            return new JsonDataContractActionResult(shareCodeDto);
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

            var playlist = new Playlist();
            stream.AddPlaylist(playlist);
            StreamDao.Save(stream);

            //  TODO: I think I have to call save on my playlist before calling copy to add items to it because it expects the playlist to have an ID already
            PlaylistDao.Save(playlist);

            playlist.Copy(copyablePlaylist);

            PlaylistManager.Save(playlist);

            PlaylistDto playlistDto = Mapper.Map<Playlist, PlaylistDto>(playlist);

            return new JsonDataContractActionResult(playlistDto);
        }
    }
}
