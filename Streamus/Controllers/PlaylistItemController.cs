using Streamus.Domain;
using Streamus.Domain.Managers;
using Streamus.Dto;
using System;
using System.Collections.Generic;
<<<<<<< HEAD
=======
using System.Linq;
>>>>>>> origin/Development
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class PlaylistItemController : Controller
    {
<<<<<<< HEAD
        private static readonly PlaylistManager PlaylistManager = new PlaylistManager();
=======
        private static readonly PlaylistItemManager PlaylistItemManager = new PlaylistItemManager();
        private static readonly PushMessageManager PushMessageManager = new PushMessageManager();

        [HttpPost]
        public JsonDataContractActionResult Create(PlaylistItemDto playlistItemDto)
        {
            PlaylistItem playlistItem = PlaylistItem.Create(playlistItemDto);

            playlistItem.Playlist.AddItem(playlistItem);

            PlaylistItemManager.Save(playlistItem);
            
            PlaylistItemDto savedPlaylistItemDto = PlaylistItemDto.Create(playlistItem);

            PushMessageDto pushMessageDto = new PushMessageDto(savedPlaylistItemDto);
            PushMessageManager.SendPushMessage(playlistItem.Playlist.Folder.User.Id, pushMessageDto.ToJson());

            return new JsonDataContractActionResult(savedPlaylistItemDto);
        }

        [HttpPost]
        public JsonDataContractActionResult CreateMultiple(List<PlaylistItemDto> playlistItemDtos)
        {
            List<PlaylistItem> playlistItems = PlaylistItem.Create(playlistItemDtos);

            //  Split items into their respective playlists and then save on each.
            foreach (var playlistGrouping in playlistItems.GroupBy(i => i.Playlist))
            {
                List<PlaylistItem> groupingItems = playlistGrouping.ToList();

                Playlist playlist = groupingItems.First().Playlist;
                playlist.AddItems(groupingItems);
      
                PlaylistItemManager.Save(groupingItems);
            }

            List<PlaylistItemDto> savedPlaylistItemDtos = PlaylistItemDto.Create(playlistItems);

            return new JsonDataContractActionResult(savedPlaylistItemDtos);
        }
>>>>>>> origin/Development

        [HttpPut]
        public ActionResult Update(PlaylistItemDto playlistItemDto)
        {
<<<<<<< HEAD
            PlaylistManager.UpdatePlaylistItem(playlistItem);
=======
            PlaylistItem playlistItem = PlaylistItem.Create(playlistItemDto);
            PlaylistItemManager.Update(playlistItem);
>>>>>>> origin/Development

            PlaylistItemDto updatedPlaylistItemDto = PlaylistItemDto.Create(playlistItem);

            return new JsonDataContractActionResult(updatedPlaylistItemDto);
        }

        [HttpPut]
        public ActionResult UpdateMultiple(List<PlaylistItemDto> playlistItemDtos)
        {
<<<<<<< HEAD
            PlaylistManager.UpdatePlaylistItems(playlistItems);
=======
            List<PlaylistItem> playlistItems = PlaylistItem.Create(playlistItemDtos);

            PlaylistItemManager.Update(playlistItems);
>>>>>>> origin/Development

            List<PlaylistItemDto> savedPlaylistItemDtos = PlaylistItemDto.Create(playlistItems);

            return new JsonDataContractActionResult(savedPlaylistItemDtos);
        }

        [HttpDelete]
        public JsonResult Delete(Guid id)
        {
<<<<<<< HEAD
            PlaylistManager.DeleteItem(id, playlistId);
=======
            PlaylistItemManager.Delete(id);
>>>>>>> origin/Development

            return Json(new
                {
                    success = true
                });
        }
    }
}
