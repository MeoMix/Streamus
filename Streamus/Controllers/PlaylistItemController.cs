using System.IO;
using System.Linq;
using System.Net;
using System.Web.Script.Serialization;
using Streamus.Domain;
using Streamus.Domain.Managers;
using System;
using System.Collections.Generic;
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class PlaylistItemController : Controller
    {
        private static readonly PlaylistItemManager PlaylistItemManager = new PlaylistItemManager();
        private static readonly PlaylistManager PlaylistManager = new PlaylistManager();

        [HttpPost]
        public ActionResult Create(PlaylistItem playlistItem)
        {
            playlistItem.Playlist.AddItem(playlistItem);

            //  Make sure the playlistItem has been setup properly before it is cascade-saved through the Playlist.
            playlistItem.ValidateAndThrow();

            PlaylistManager.Save(playlistItem.Playlist);

            return new JsonDataContractActionResult(playlistItem);
        }

        [HttpPost]
        public ActionResult CreateMultiple(List<PlaylistItem> playlistItems)
        {
            //  Split items into their respective playlists and then save on each.
            foreach (var playlistGrouping in playlistItems.GroupBy(i => i.Playlist))
            {
                List<PlaylistItem> groupingItems = playlistGrouping.ToList();

                Playlist playlist = groupingItems.First().Playlist;

                playlist.AddItems(groupingItems);
                groupingItems.ForEach(i => i.ValidateAndThrow());

                PlaylistManager.Save(playlist);
            }

            return new JsonDataContractActionResult(playlistItems);
        }

        [HttpPut]
        public ActionResult Update(PlaylistItem playlistItem)
        {
            PlaylistItemManager.Update(playlistItem);

            //SendPushMessage("update playlistItem:" + playlistItem.Id);

            return new JsonDataContractActionResult(playlistItem);
        }

        [HttpPut]
        public ActionResult UpdateMultiple(IEnumerable<PlaylistItem> playlistItems)
        {
            PlaylistItemManager.Update(playlistItems);

            return new JsonDataContractActionResult(playlistItems);
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
