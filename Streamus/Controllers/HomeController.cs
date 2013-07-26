using System.IO;
using System.Net;
using System.Text;
using System.Web.Mvc;
using System.Web.Script.Serialization;
<<<<<<< HEAD
=======
using Streamus.Domain.Managers;
>>>>>>> origin/Development

namespace Streamus.Controllers
{
    //  Scope: https://www.googleapis.com/auth/gcm_for_chrome
    //  Request URL: https://www.googleapis.com/gcm_for_chrome/v1/messages
    public class HomeController : Controller
    {
<<<<<<< HEAD
        private const string GoogleClientId = "346456917689-kmkvbtmhafoak5glon55do0ukqppsh6l.apps.googleusercontent.com";
        private const string GoogleSecret = "VfOFLGVHO58dNQ3qVPqkah0H";
        private const string ReturnUrl = "http://localhost:61975/Home/UserAuthorizationResponse";

        public ActionResult Index()
        {
            string googleOAuthUrl = GetGoogleOAuthUrl();
=======
        private static readonly PushMessageManager PushMessageManager = new PushMessageManager();

        private const string GoogleClientId = "346456917689-3upp3fcan7lb3e93truv9vk2lr8vnu80.apps.googleusercontent.com";
        private const string GoogleSecret = "DhgVWzC2mCBO8BMLpHTVog9o";
        private const string ReturnUrl = "http://test.streamus.com:61975/Home/UserAuthorizationResponse";

        public ActionResult Index()
        {
            //string googleOAuthUrl = GetGoogleOAuthUrl();
>>>>>>> origin/Development

            //return Redirect(googleOAuthUrl);
            return View();
        }

        private static string GetGoogleOAuthUrl()
        {
            //  NOTE: Key piece here access_type=offline forces a refresh token to be issued
            const string url = "https://accounts.google.com/o/oauth2/auth?scope={0}&redirect_uri={1}&response_type={2}&client_id={3}&state={4}&access_type=offline&approval_prompt=force";
            string scope = UrlEncodeForGoogle("https://www.googleapis.com/auth/gcm_for_chrome");
            string redirectUriEncode = UrlEncodeForGoogle(ReturnUrl);
            const string responseType = "code";
            string state = string.Empty;
<<<<<<< HEAD

            return string.Format(url, scope, redirectUriEncode, responseType, GoogleClientId, state);
        }

        private static string UrlEncodeForGoogle(string url)
        {
            const string unreservedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~";
            var result = new StringBuilder();

            foreach (char symbol in url)
            {
                if (unreservedChars.IndexOf(symbol) != -1)
                {
                    result.Append(symbol);
                }
                else
                {
                    result.Append('%' + string.Format("{0:X2}", (int) symbol));
                }
            }

            return result.ToString();
        }

        private class GoogleTokenData
        {
            public string Access_Token { get; set; }
            public string Refresh_Token { get; set; }
            public string Expires_In { get; set; }
            public string Token_Type { get; set; }
        }

        public ActionResult UserAuthorizationResponse(string code, bool? remove)
        {
            if (remove.HasValue && remove.Value)
            {
                Session["GoogleAPIToken"] = null;
                return HttpNotFound();
            }

            if (string.IsNullOrEmpty(code)) return Content("Missing code");

            const string url = "https://accounts.google.com/o/oauth2/token";
            const string grantType = "authorization_code";
            string redirectUriEncode = UrlEncodeForGoogle(ReturnUrl);
            const string data = "code={0}&client_id={1}&client_secret={2}&redirect_uri={3}&grant_type={4}";

            var request = (HttpWebRequest)WebRequest.Create(url);

            request.Method = "POST";
            request.KeepAlive = true;
            request.ContentType = "application/x-www-form-urlencoded";
            string param = string.Format(data, code, GoogleClientId, GoogleSecret, redirectUriEncode, grantType);

            byte[] bs = Encoding.UTF8.GetBytes(param);
            using (Stream reqStream = request.GetRequestStream())
            {
                reqStream.Write(bs, 0, bs.Length);
            }

            string result;
            using (WebResponse response = request.GetResponse())
            {
                var sr = new StreamReader(response.GetResponseStream());
                result = sr.ReadToEnd();
                sr.Close();
            }

            var jsonSerializer = new JavaScriptSerializer();
            var tokenData = jsonSerializer.Deserialize<GoogleTokenData>(result);
            Session["GoogleOAuth2AccessToken"] = tokenData.Access_Token;

            SendPushMessage();

            return new EmptyResult();
        }

        private void SendPushMessage()
        {

            var httpWebRequest = (HttpWebRequest)WebRequest.Create("https://www.googleapis.com/gcm_for_chrome/v1/messages");
            httpWebRequest.ContentType = "application/json; charset=utf-8";
            httpWebRequest.Method = "POST";
            httpWebRequest.Headers.Add("Authorization", "OAuth " + Session["GoogleOAuth2AccessToken"]);
=======
>>>>>>> origin/Development

            return string.Format(url, scope, redirectUriEncode, responseType, GoogleClientId, state);
        }

        private static string UrlEncodeForGoogle(string url)
        {
            const string unreservedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~";
            var result = new StringBuilder();

            foreach (char symbol in url)
            {
<<<<<<< HEAD
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
                    //  Success response from writing out push message -- empty is OK.
                    var streamResult = streamReader.ReadToEnd();
                }
            }
=======
                if (unreservedChars.IndexOf(symbol) != -1)
                {
                    result.Append(symbol);
                }
                else
                {
                    result.Append('%' + string.Format("{0:X2}", (int) symbol));
                }
            }

            return result.ToString();
        }

        private class GoogleTokenData
        {
            public string Access_Token { get; set; }
            public string Refresh_Token { get; set; }
            public string Expires_In { get; set; }
            public string Token_Type { get; set; }
        }

        public ActionResult UserAuthorizationResponse(string code, bool? remove)
        {
            if (remove.HasValue && remove.Value)
            {
                Session["GoogleAPIToken"] = null;
                return HttpNotFound();
            }

            if (string.IsNullOrEmpty(code)) return Content("Missing code");

            const string url = "https://accounts.google.com/o/oauth2/token";
            const string grantType = "authorization_code";
            string redirectUriEncode = UrlEncodeForGoogle(ReturnUrl);
            const string data = "code={0}&client_id={1}&client_secret={2}&redirect_uri={3}&grant_type={4}";

            var request = (HttpWebRequest)WebRequest.Create(url);

            request.Method = "POST";
            request.KeepAlive = true;
            request.ContentType = "application/x-www-form-urlencoded";
            string param = string.Format(data, code, GoogleClientId, GoogleSecret, redirectUriEncode, grantType);

            byte[] bs = Encoding.UTF8.GetBytes(param);
            using (Stream reqStream = request.GetRequestStream())
            {
                reqStream.Write(bs, 0, bs.Length);
            }

            string result;
            using (WebResponse response = request.GetResponse())
            {
                var sr = new StreamReader(response.GetResponseStream());
                result = sr.ReadToEnd();
                sr.Close();
            }

            var jsonSerializer = new JavaScriptSerializer();
            var tokenData = jsonSerializer.Deserialize<GoogleTokenData>(result);
            PushMessageManager.SetAccessToken(tokenData.Access_Token);

            return new EmptyResult();
>>>>>>> origin/Development
        }
    }
}
