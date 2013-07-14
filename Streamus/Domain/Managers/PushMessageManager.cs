using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web.Script.Serialization;

namespace Streamus.Domain.Managers
{
    public class PushMessageManager
    {
        private static readonly List<UserChannel> UserChannels = new List<UserChannel>();
        private static string AccessToken { get; set; }

        public void SetAccessToken(string accessToken)
        {
            AccessToken = accessToken;
        }

        public UserChannel TryGetExistingUserChannel(Guid userId)
        {
            return UserChannels.FirstOrDefault(uc => uc.UserId == userId);
        }

        public void AddUserChannel(Guid userId, string channelId)
        {
            var userChannel = new UserChannel(userId, new List<string> { channelId });
            UserChannels.Add(userChannel);
        }

        public void SendPushMessage(Guid userId, string payload)
        {
            UserChannel userChannel = UserChannels.First(uc => uc.UserId == userId);

            foreach (string channelId in userChannel.ChannelIds)
            {
                const string requestUri = "https://www.googleapis.com/gcm_for_chrome/v1/messages";
                var httpWebRequest = (HttpWebRequest)WebRequest.Create(requestUri);
                httpWebRequest.ContentType = "application/json; charset=utf-8";
                httpWebRequest.Method = "POST";
                httpWebRequest.Headers.Add("Authorization", "OAuth " + AccessToken);

                using (var streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
                {
                    string json = new JavaScriptSerializer().Serialize(new
                    {
                        channelId = channelId,
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
                        string streamResult = streamReader.ReadToEnd();
                    }
                }
            }

        }
    }
}