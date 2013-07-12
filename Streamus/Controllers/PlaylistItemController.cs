using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using Streamus.Domain;
using Streamus.Domain.Managers;
using Streamus.Dto;

namespace Streamus.Controllers
{
    public class PlaylistItemController : Controller
    {
        private static readonly PlaylistItemManager PlaylistItemManager = new PlaylistItemManager();
        private static readonly PlaylistManager PlaylistManager = new PlaylistManager();

        [HttpPost]
        public JsonDataContractActionResult Create(PlaylistItemDto playlistItemDto)
        {
            PlaylistItem playlistItem = PlaylistItem.Create(playlistItemDto);

            playlistItem.Playlist.AddItem(playlistItem);

            //  Make sure the playlistItem has been setup properly before it is cascade-saved through the Playlist.
            playlistItem.ValidateAndThrow();

            PlaylistItemManager.Save(playlistItem);

            PlaylistItemDto savedPlaylistItemDto = PlaylistItemDto.Create(playlistItem);

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
                groupingItems.ForEach(i => i.ValidateAndThrow());

                //  TODO: Should I be called PlaylistItemmanager save here?
                PlaylistManager.Save(playlist);
            }

            List<PlaylistItemDto> savedPlaylistItemDtos = PlaylistItemDto.Create(playlistItems);

            return new JsonDataContractActionResult(savedPlaylistItemDtos);
        }

        [HttpPut]
        public ActionResult Update(PlaylistItemDto playlistItemDto)
        {
            PlaylistItem playlistItem = PlaylistItem.Create(playlistItemDto);
            PlaylistItemManager.Update(playlistItem);

            //SendPushMessage("update playlistItem:" + playlistItem.Id);

            PlaylistItemDto updatedPlaylistItemDto = PlaylistItemDto.Create(playlistItem);

            return new JsonDataContractActionResult(updatedPlaylistItemDto);
        }

        [HttpPut]
        public ActionResult UpdateMultiple(List<PlaylistItemDto> playlistItemDtos)
        {
            List<PlaylistItem> playlistItems = PlaylistItem.Create(playlistItemDtos);

            PlaylistItemManager.Update(playlistItems);

            List<PlaylistItemDto> savedPlaylistItemDtos = PlaylistItemDto.Create(playlistItems);

            return new JsonDataContractActionResult(savedPlaylistItemDtos);
        }

        [HttpDelete]
        public JsonResult Delete(Guid id)
        {
            PlaylistItemManager.Delete(id);

            return Json(new
                {
                    success = true
                });
        }

        private void SendPushMessage(string payload)
        {
            var httpWebRequest =
                (HttpWebRequest) WebRequest.Create("https://www.googleapis.com/gcm_for_chrome/v1/messages");
            httpWebRequest.ContentType = "application/json; charset=utf-8";
            httpWebRequest.Method = "POST";
            httpWebRequest.Headers.Add("Authorization", "OAuth " + Session["GoogleOAuth2AccessToken"]);

            using (var streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
            {
                string json = new JavaScriptSerializer().Serialize(new
                    {
                        channelId = "15312359557864779180/jbnkffmindojffecdhbbmekbmkkfpmjd",
                        subchannelId = "0",
                        payload
                    });

                streamWriter.Write(json);
                streamWriter.Flush();
                streamWriter.Close();

                var httpResponse = (HttpWebResponse) httpWebRequest.GetResponse();
                using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
                {
                    //  Success response from writing out push message -- empty is OK.
                    string streamResult = streamReader.ReadToEnd();
                }
            }
        }
    }
}
