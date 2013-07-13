using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web.Mvc;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;
using Streamus.Dto;
using log4net;

namespace Streamus.Controllers
{
    public class UserController : Controller
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private static readonly UserManager UserManager = new UserManager();

        private static List<UserChannel> UserChannels = new List<UserChannel>();

        private readonly IUserDao UserDao;

        public UserController()
        {
            try
            {
                UserDao = new UserDao();
                UserChannels = new List<UserChannel>();
            }
            catch (TypeInitializationException exception)
            {
                Logger.Error(exception.InnerException);
                throw exception.InnerException;
            }
        }

        /// <summary>
        ///     Creates a new User object and writes it to the database.
        /// </summary>
        /// <returns>The newly created User</returns>
        [HttpPost]
        public ActionResult Create()
        {
            User user = UserManager.CreateUser();
            UserDto userDto = UserDto.Create(user);

            return new JsonDataContractActionResult(userDto);
        }

        [HttpGet]
        public ActionResult Get(Guid id)
        {
            User user = UserDao.Get(id);
            UserDto userDto = UserDto.Create(user);

            return new JsonDataContractActionResult(userDto);
        }

        /// <summary>
        ///     Record a user's extension's channelId. This is for pushMessaging so that
        ///     the extension can receive updates from the user's other instances of the extension.
        ///     This will keep all the extensions in-sync if the user has more than 1 instance of Streamus running.
        /// </summary>
        [HttpPost]
        public ActionResult AddChannelId(Guid userId, string channelId)
        {
            UserChannel existingUserChannel = UserChannels.FirstOrDefault(uc => uc.UserId == userId);

            if (existingUserChannel == null)
            {
                var userChannel = new UserChannel(userId, new List<string> {channelId});
                UserChannels.Add(userChannel);
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
