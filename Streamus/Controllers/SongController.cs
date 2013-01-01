using System;
using System.Collections.Generic;
using System.Web.Mvc;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.DataInterfaces;
using Streamus.Backend.Domain.Managers;

namespace Streamus.Controllers
{
    public class SongController : Controller
    {
        private readonly ISongDao SongDao = new SongDao();
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();
        private readonly IPlaylistItemDao PlaylistItemDao = new PlaylistItemDao();

        [HttpPost]
        public ActionResult SaveSong(Song song)
        {
            var songManager = new SongManager(SongDao, PlaylistDao, PlaylistItemDao);
            songManager.SaveSong(song);
            return new JsonDataContractActionResult(song);
        }

        [HttpPost]
        public ActionResult SaveSongs(List<Song> songs)
        {
            var songManager = new SongManager(SongDao, PlaylistDao, PlaylistItemDao);
            songManager.SaveSongs(songs);
            return new JsonDataContractActionResult(songs);
        }

        [HttpGet]
        public ActionResult GetById(Guid songId)
        {
            var songManager = new SongManager(SongDao, PlaylistDao, PlaylistItemDao);
            Song song = songManager.GetById(songId);
            return new JsonDataContractActionResult(song);
        }

        [HttpGet]
        public ActionResult GetByIds(List<Guid> songIds)
        {
            IList<Song> songs = new List<Song>();
            //The default model binder doesn't support passing an empty array as JSON to MVC controller, so check null.
            if (songIds != null)
            {
                var songManager = new SongManager(SongDao, PlaylistDao, PlaylistItemDao);
                songs = songManager.GetByIds(songIds);
            }

            return new JsonDataContractActionResult(songs);
        }


        //[HttpPost]
        //public EmptyResult DeleteById(Guid id, Guid userId)
        //{
        //    SongManager songManager = new SongManager(SongDao, PlaylistDao, PlaylistItemDao);
        //    songManager.DeleteSongById(id);
        //    return new EmptyResult();
        //}
    }
}
