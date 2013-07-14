using Streamus.Domain;
using Streamus.Domain.Managers;
using Streamus.Dto;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace Streamus.Controllers
{
    public class PlaylistItemController : Controller
    {
        private static readonly PlaylistItemManager PlaylistItemManager = new PlaylistItemManager();

        [HttpPost]
        public JsonDataContractActionResult Create(PlaylistItemDto playlistItemDto)
        {
            PlaylistItem playlistItem = PlaylistItem.Create(playlistItemDto);

            playlistItem.Playlist.AddItem(playlistItem);

            PlaylistItemManager.Save(playlistItem);

            PlaylistItemDto savedPlaylistItemDto = PlaylistItemDto.Create(playlistItem);

            PushMessageDto pushMessageDto = new PushMessageDto(savedPlaylistItemDto);

            //SendPushMessage(pushMessageDto);

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

        [HttpPut]
        public ActionResult Update(PlaylistItemDto playlistItemDto)
        {
            PlaylistItem playlistItem = PlaylistItem.Create(playlistItemDto);
            PlaylistItemManager.Update(playlistItem);

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

        private void SendPushMessage(PushMessageDto pushMessageDto)
        {
            const string requestUri = "https://www.googleapis.com/gcm_for_chrome/v1/messages";
            var httpWebRequest = (HttpWebRequest)WebRequest.Create(requestUri);
            httpWebRequest.ContentType = "application/json; charset=utf-8";
            httpWebRequest.Method = "POST";
            httpWebRequest.Headers.Add("Authorization", "OAuth " + Session["GoogleOAuth2AccessToken"]);

            using (var streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
            {
                string json = new JavaScriptSerializer().Serialize(new
                    {
                        channelId = "15312359557864779180/jbnkffmindojffecdhbbmekbmkkfpmjd",
                        subchannelId = "0",
                        payload = pushMessageDto.ToJson()
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
