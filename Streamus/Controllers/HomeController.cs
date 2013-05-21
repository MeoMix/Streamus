using System.IO;
using System.Net;
using System.Net.Http;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web.Script.Serialization;
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
            httpWebRequest.Headers.Add("Authorization", "OAuth ya29.AHES6ZSOGZnMyX7CVcKt2te70ky7WC43o1pUPB0Y_36_vy4ZOfZtJw");

            var provider = new NativeApplicationClient(GoogleAuthenticationServer.Description)
            {
                ClientIdentifier = "346456917689-kmkvbtmhafoak5glon55do0ukqppsh6l.apps.googleusercontent.com",
                ClientSecret = "VfOFLGVHO58dNQ3qVPqkah0H"
            };
            var auth = new OAuth2Authenticator<NativeApplicationClient>(provider, GetAuthorization);

            using (var streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
            {
                string json = new JavaScriptSerializer().Serialize(new
                    {
                        channelId = "15312359557864779180/jbnkffmindojffecdhbbmekbmkkfpmjd",
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
