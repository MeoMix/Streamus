using System.IO;
using System.Net;
using System.Net.Http;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web.Script.Serialization;
using DotNetOpenAuth.OAuth2;
using Google.Apis.Authentication.OAuth2;
using Google.Apis.Authentication.OAuth2.DotNetOpenAuth;
using Google.Apis.Services;
using Google.Apis.Tasks.v1;
using Google.Apis.Tasks.v1.Data;
using System;
using System.Web.Mvc;

namespace Streamus.Controllers
{
    //  Scope: https://www.googleapis.com/auth/gcm_for_chrome
    //  Request URL: https://www.googleapis.com/gcm_for_chrome/v1/messages
    public class HomeController : Controller
    {
        /// <summary>
        /// There's no website, but this is needed just to show a 'Server is Running' page.
        /// </summary>
        public ActionResult Index()
        {
            var httpWebRequest = (HttpWebRequest)WebRequest.Create("https://www.googleapis.com/gcm_for_chrome/v1/messages");
            httpWebRequest.ContentType = "application/json; charset=utf-8";
            httpWebRequest.Method = "POST";
            httpWebRequest.Headers.Add("Authorization", "OAuth ya29.AHES6ZSUPGy2h4MlxcnIu83IcxTvzeLsDoY9fzJvBr2SZA");

            using (var streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
            {
                string json = new JavaScriptSerializer().Serialize(new
                    {
                        channelId = "15312359557864779180/bdgchhpopfleappenolmfpfmklcmhmbf",
                        subchannelId = "0",
                        payload = "Hello World!"
                    });

                streamWriter.Write(json);
                streamWriter.Flush();
                streamWriter.Close();

                var httpResponse = (HttpWebResponse)httpWebRequest.GetResponse();
                using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
                {
                    var result = streamReader.ReadToEnd();
                }
            }

            return View();
        }
    }
}
