using System.IO;
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
        private static readonly PlaylistManager PlaylistManager = new PlaylistManager();

        /// <summary>
        /// There's only an Update for PlaylistItems because their ID is generated client-side
        /// </summary>
        [HttpPut]
        public ActionResult Update(PlaylistItem playlistItem)
        {
            PlaylistManager.UpdatePlaylistItem(playlistItem);

            SendPushMessage("update playlistItem:" + playlistItem.Id);

            return new JsonDataContractActionResult(playlistItem);
        }

        [HttpPut]
        public ActionResult UpdateMultiple(IEnumerable<PlaylistItem> playlistItems)
        {
            PlaylistManager.UpdatePlaylistItems(playlistItems);

            return new JsonDataContractActionResult(playlistItems);
        }

        [HttpDelete]
        public JsonResult Delete(Guid id, Guid playlistId)
        {
            PlaylistManager.DeleteItem(id, playlistId);

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
