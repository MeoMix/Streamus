using System;
using System.Collections.Generic;
using System.Web.Mvc;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.DataInterfaces;
using Streamus.Backend.Domain.Managers;

namespace Streamus.Controllers
{
    public class PlaylistController : Controller
    {
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();
        private readonly IPlaylistItemDao PlaylistItemDao = new PlaylistItemDao();

        [HttpPost]
        public ActionResult SavePlaylist(Playlist playlist)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
            playlistManager.SavePlaylist(playlist);

            return new JsonDataContractActionResult(playlist);
        }

        [HttpGet]
        public ActionResult GetPlaylistById(Guid id, Guid userId)
        {
            Playlist playlist = PlaylistDao.GetById(id);

            if (playlist.UserId != userId)
            {
                const string errorMessage = "The specified playlist is not for the given user.";
                throw new ApplicationException(errorMessage);
            }

            return new JsonDataContractActionResult(playlist);
        }

        [HttpGet]
        public ActionResult GetPlaylistsByUserId(Guid userId)
        {
            IList<Playlist> playlists = PlaylistDao.GetByUserId(userId);

            return new JsonDataContractActionResult(playlists);
        }

        [HttpPost]
        public EmptyResult DeletePlaylistById(Guid id, Guid userId)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
            playlistManager.DeletePlaylistById(id, userId);

            return new EmptyResult();
        }

        [HttpPost]
        public EmptyResult DeleteItemByPosition(Guid playlistId, int position, Guid userId)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
            playlistManager.DeleteItemByPosition(playlistId, position, userId);

            return new EmptyResult();
        }

        [HttpPost]
        public ActionResult SaveItem(PlaylistItem playlistItem)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
            playlistManager.SavePlaylistItem(playlistItem);

            return new JsonDataContractActionResult(playlistItem);
        }
    }
}
