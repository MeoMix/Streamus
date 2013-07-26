using Streamus.Domain;
using Streamus.Domain.Managers;
using System;
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class PushMessageController : Controller
    {
        private static readonly PushMessageManager PushMessageManager = new PushMessageManager();

        /// <summary>
        ///     Record a user's extension's channelId. This is for pushMessaging so that
        ///     the extension can receive updates from the user's other instances of the extension.
        ///     This will keep all the extensions in-sync if the user has more than 1 instance of Streamus running.
        /// </summary>
        [HttpPost]
        public ActionResult AddChannelId(Guid userId, string channelId)
        {
            UserChannel existingUserChannel = PushMessageManager.TryGetExistingUserChannel(userId);

            if (existingUserChannel == null)
            {
                PushMessageManager.AddUserChannel(userId, channelId);
            }
            else
            {
                if (!existingUserChannel.ChannelIds.Contains(channelId))
                {
                    existingUserChannel.ChannelIds.Add(channelId);
                }
            }

            return Json(new
            {
                success = true
            });
        }


    }
}
