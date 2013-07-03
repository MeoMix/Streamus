using System.IO;
using System.Linq;
using System.Net;
using System.Web.Script.Serialization;
using AutoMapper;
using Streamus.Domain;
using Streamus.Domain.Managers;
using System;
using System.Collections.Generic;
using System.Web.Mvc;
using Streamus.Dto;

namespace Streamus.Controllers
{
    public class PlaylistItemController : Controller
    {
        private static readonly PlaylistItemManager PlaylistItemManager = new PlaylistItemManager();
        private static readonly PlaylistManager PlaylistManager = new PlaylistManager();

        [HttpPost]
        public ActionResult Create(PlaylistItemDto playlistItemDto)
        {
            PlaylistItem playlistItem = Mapper.Map<PlaylistItemDto, PlaylistItem>(playlistItemDto);

            playlistItem.Playlist.AddItem(playlistItem);

            //  Make sure the playlistItem has been setup properly before it is cascade-saved through the Playlist.
            playlistItem.ValidateAndThrow();

            //  TODO: Why am I saving playlist here and not playlistItem???
            PlaylistManager.Save(playlistItem.Playlist);

            PlaylistItemDto savedPlaylistItemDto = Mapper.Map<PlaylistItem, PlaylistItemDto>(playlistItem);

            return new JsonDataContractActionResult(savedPlaylistItemDto);
        }

        [HttpPost]
        public ActionResult CreateMultiple(List<PlaylistItemDto> playlistItemDtos)
        {
            List<PlaylistItem> playlistItems = Mapper.Map<List<PlaylistItemDto>, List<PlaylistItem>>(playlistItemDtos);

            //  Split items into their respective playlists and then save on each.
            foreach (var playlistGrouping in playlistItems.GroupBy(i => i.Playlist))
            {
                List<PlaylistItem> groupingItems = playlistGrouping.ToList();

                Playlist playlist = groupingItems.First().Playlist;

                playlist.AddItems(groupingItems);
                groupingItems.ForEach(i => i.ValidateAndThrow());

                PlaylistManager.Save(playlist);
            }

            List<PlaylistItemDto> savedPlaylistItemDtos = Mapper.Map<List<PlaylistItem>, List<PlaylistItemDto>>(playlistItems);

            return new JsonDataContractActionResult(savedPlaylistItemDtos);
        }

        [HttpPut]
        public ActionResult Update(PlaylistItemDto playlistItemDto)
        {
            PlaylistItem playlistItem = Mapper.Map<PlaylistItemDto, PlaylistItem>(playlistItemDto);
            PlaylistItemManager.Update(playlistItem);

            //SendPushMessage("update playlistItem:" + playlistItem.Id);

            PlaylistItemDto updatedPlaylistItemDto = Mapper.Map<PlaylistItem, PlaylistItemDto>(playlistItem);

            return new JsonDataContractActionResult(updatedPlaylistItemDto);
        }

        [HttpPut]
        public ActionResult UpdateMultiple(List<PlaylistItemDto> playlistItemDtos)
        {
            List<PlaylistItem> playlistItems = Mapper.Map<List<PlaylistItemDto>, List<PlaylistItem>>(playlistItemDtos);

            PlaylistItemManager.Update(playlistItems);

            List<PlaylistItemDto> savedPlaylistItemDtos = Mapper.Map<List<PlaylistItem>, List<PlaylistItemDto>>(playlistItems);

            return new JsonDataContractActionResult(savedPlaylistItemDtos);
        }

        [HttpDelete]
        public JsonResult Delete(Guid id, Guid playlistId)
        {
            PlaylistItemManager.Delete(id, playlistId);

            return Json(new
            {
                success = true
            });
        }

        private void SendPushMessage(string payload)
        {
            var httpWebRequest = (HttpWebRequest)WebRequest.Create("https://www.googleapis.com/gcm_for_chrome/v1/messages");
            httpWebRequest.ContentType = "application/json; charset=utf-8";
            httpWebRequest.Method = "POST";
            httpWebRequest.Headers.Add("Authorization", "OAuth " + Session["GoogleOAuth2AccessToken"]);

            using (var streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
            {
                string json = new JavaScriptSerializer().Serialize(new
                {
                    channelId = "15312359557864779180/jbnkffmindojffecdhbbmekbmkkfpmjd",
                    subchannelId = "0",
                    payload = payload
                });

                streamWriter.Write(json);
                streamWriter.Flush();
                streamWriter.Close();

                var httpResponse = (HttpWebResponse)httpWebRequest.GetResponse();
                using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
                {
                    //  Success response from writing out push message -- empty is OK.
                    var streamResult = streamReader.ReadToEnd();
                }
            }
        }
    }
}
