using System.Collections.Generic;
using AutoMapper;
using Streamus.Dto;
using log4net;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;
using System;
using System.Linq;
using System.Reflection;
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class UserController : Controller
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private static readonly PlaylistManager PlaylistManager = new PlaylistManager();
        private static readonly UserManager UserManager = new UserManager();
        //  TODO: Consider creating a class for this if it gets any more complicated.
        private static Dictionary<Guid, List<string>> UsersChannelList = new Dictionary<Guid, List<string>>();  

        private readonly IUserDao UserDao;

        public UserController()
        {
            try
            {
                UserDao = new UserDao();
                UsersChannelList = new Dictionary<Guid, List<string>>();
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
            UserDto userDto = Mapper.Map<User, UserDto>(user);

            return new JsonDataContractActionResult(userDto);
        }

        [HttpGet]
        public ActionResult Get(Guid id)
        {
            User user = UserDao.Get(id);

            //  Sanity check to make sure the playlists aren't broken.
            //foreach (Stream stream in user.Streams.Where(s => s.Playlists.Any()))
            //{
            //    foreach (Playlist playlist in stream.Playlists.Where(p => p.Items.Any()))
            //    {
            //        PlaylistItem firstItem = playlist.FirstItem ?? playlist.Items[0];

            //        //  Go through every item in the playlist and make sure they're connected.
            //        PlaylistItem forwardNextItem = playlist.Items.FirstOrDefault(i => i.Id == firstItem.NextItemId);
            //        PlaylistItem forwardPreviousItem = playlist.Items.FirstOrDefault(i => i.Id == firstItem.NextItemId);;

            //        while (forwardNextItem != null && forwardNextItem.Id != firstItem.Id)
            //        {
            //            forwardPreviousItem = forwardNextItem;
            //            forwardNextItem = playlist.Items.FirstOrDefault(i => i.Id == forwardNextItem.NextItemId);
            //        }

            //        if (forwardNextItem == null)
            //        {
            //            if(forwardPreviousItem == null)
            //            {
            //                Logger.ErrorFormat("Shouldn't be here. Forward is null in playlist {0}", playlist.Id);
            //                break;
            //            }

            //            //  Go backwards from firstItem to find the other end of the broken chain and connect the two.
            //            //  TODO: Could be more robust.. assumes only 1 broken link in chain, all songs in between are ditched.

            //            PlaylistItem backwardNextItem = playlist.Items.FirstOrDefault(i => i.Id == firstItem.PreviousItemId);
            //            PlaylistItem backwardPreviousItem = playlist.Items.FirstOrDefault(i => i.Id == firstItem.PreviousItemId); ;

            //            while (backwardNextItem != null && backwardNextItem.Id != firstItem.Id && backwardNextItem.Id != forwardPreviousItem.Id)
            //            {
            //                backwardPreviousItem = backwardNextItem;
            //                backwardNextItem = playlist.Items.FirstOrDefault(i => i.Id == backwardNextItem.PreviousItemId);
            //            }


            //            if (backwardNextItem == null)
            //            {
            //                if (backwardPreviousItem == null)
            //                {
            //                    Logger.ErrorFormat("Shouldn't be here. Backwards is null in playlist {0}", playlist.Id);
            //                    break;
            //                }

            //                backwardPreviousItem.PreviousItemId = forwardPreviousItem.Id;
            //                forwardPreviousItem.NextItemId = backwardPreviousItem.Id;
            //                playlist.FirstItem = firstItem;

            //                PlaylistManager.Save(playlist);
            //                Logger.DebugFormat("Successfully recovered playlist title: {0} and id: {1}", playlist.Title, playlist.Id);
            //            }
            //            else if (backwardNextItem.Id == forwardPreviousItem.Id)
            //            {
            //                if (backwardPreviousItem == null)
            //                {
            //                    Logger.ErrorFormat("Shouldn't be here. Backwards is null in playlist {0}", playlist.Id);
            //                    break;
            //                }

            //                //  Trust the backwards playlist.
            //                forwardPreviousItem.NextItemId = backwardPreviousItem.Id;
            //                playlist.FirstItem = firstItem;
            //                PlaylistManager.Save(playlist);
            //                Logger.DebugFormat("Successfully recovered playlist title: {0} and id: {1}", playlist.Title, playlist.Id);
            //            }
            //            else
            //            {
            //                // Da fuq? buhhh we just went forward and there was clearly a break.
            //                Logger.ErrorFormat("Recover method broken!");
            //            }

            //        }
                    
            //    }
            //}

            UserDto userDto = Mapper.Map<User, UserDto>(user);

            return new JsonDataContractActionResult(userDto);
        }

        /// <summary>
        /// Record a user's extension's channelId. This is for pushMessaging so that
        /// the extension can receive updates from the user's other instances of the extension.
        /// This will keep all the extensions in-sync if the user has more than 1 instance of Streamus running.
        /// </summary>
        [HttpPost]
        public ActionResult AddChannelId(Guid userId, string channelId)
        {
            if (UsersChannelList.ContainsKey(userId))
            {
                List<string> userChannelList = UsersChannelList[userId];

                if (!userChannelList.Contains(channelId))
                {
                    userChannelList.Add(channelId);
                }

            }
            else
            {
                UsersChannelList.Add(userId, new List<string>{ channelId });
            }

            return Json(new
            {
                success = true
            });
        }
    }
}
