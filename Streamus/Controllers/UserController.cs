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
        private readonly IUserDao UserDao;
        private readonly IStreamDao StreamDao;
        private readonly IPlaylistDao PlaylistDao;
        private readonly IPlaylistItemDao PlaylistItemDao;
        private readonly IVideoDao VideoDao;

        private readonly PlaylistManager PlaylistManager;

        public UserController()
        {
            try
            {
                UserDao = new UserDao();
                StreamDao = new StreamDao();
                PlaylistDao = new PlaylistDao();
                PlaylistItemDao = new PlaylistItemDao();
                VideoDao = new VideoDao();

                PlaylistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, StreamDao, VideoDao);
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
            var userManager = new UserManager(UserDao, StreamDao);
            User user = userManager.CreateUser();

            

            return new JsonDataContractActionResult(user);
        }

        [HttpGet]
        public ActionResult Get(Guid id)
        {
            User user = UserDao.Get(id);

            //  Sanity check to make sure the playlists aren't broken.
            foreach (Stream stream in user.Streams.Where(s => s.Playlists.Any()))
            {
                foreach (Playlist playlist in stream.Playlists.Where(p => p.Items.Any()))
                {
                    PlaylistItem firstItem = playlist.Items.FirstOrDefault(i => i.Id == playlist.FirstItemId) ??
                                             playlist.Items[0];

                    //  Go through every item in the playlist and make sure they're connected.
                    PlaylistItem forwardNextItem = playlist.Items.FirstOrDefault(i => i.Id == firstItem.NextItemId);
                    PlaylistItem forwardPreviousItem = playlist.Items.FirstOrDefault(i => i.Id == firstItem.NextItemId);;

                    while (forwardNextItem != null && forwardNextItem.Id != firstItem.Id)
                    {
                        forwardPreviousItem = forwardNextItem;
                        forwardNextItem = playlist.Items.FirstOrDefault(i => i.Id == forwardNextItem.NextItemId);
                    }

                    if (forwardNextItem == null)
                    {
                        if(forwardPreviousItem == null)
                        {
                            Logger.ErrorFormat("Shouldn't be here. Forward is null in playlist {0}", playlist.Id);
                            break;
                        }

                        //  Go backwards from firstItem to find the other end of the broken chain and connect the two.
                        //  TODO: Could be more robust.. assumes only 1 broken link in chain, all songs in between are ditched.

                        PlaylistItem backwardNextItem = playlist.Items.FirstOrDefault(i => i.Id == firstItem.PreviousItemId);
                        PlaylistItem backwardPreviousItem = playlist.Items.FirstOrDefault(i => i.Id == firstItem.PreviousItemId); ;

                        while (backwardNextItem != null && backwardNextItem.Id != firstItem.Id && backwardNextItem.Id != forwardPreviousItem.Id)
                        {
                            backwardPreviousItem = backwardNextItem;
                            backwardNextItem = playlist.Items.FirstOrDefault(i => i.Id == backwardNextItem.PreviousItemId);
                        }


                        if (backwardNextItem == null)
                        {
                            if (backwardPreviousItem == null)
                            {
                                Logger.ErrorFormat("Shouldn't be here. Backwards is null in playlist {0}", playlist.Id);
                                break;
                            }

                            backwardPreviousItem.PreviousItemId = forwardPreviousItem.Id;
                            forwardPreviousItem.NextItemId = backwardPreviousItem.Id;
                            playlist.FirstItemId = firstItem.Id;

                            PlaylistManager.Save(playlist);
                            Logger.DebugFormat("Successfully recovered playlist title: {0} and id: {1}", playlist.Title, playlist.Id);
                        }
                        else if (backwardNextItem.Id == forwardPreviousItem.Id)
                        {
                            if (backwardPreviousItem == null)
                            {
                                Logger.ErrorFormat("Shouldn't be here. Backwards is null in playlist {0}", playlist.Id);
                                break;
                            }

                            //  Trust the backwards playlist.
                            forwardPreviousItem.NextItemId = backwardPreviousItem.Id;
                            playlist.FirstItemId = firstItem.Id;
                            PlaylistManager.Save(playlist);
                            Logger.DebugFormat("Successfully recovered playlist title: {0} and id: {1}", playlist.Title, playlist.Id);
                        }
                        else
                        {
                            // Da fuq? buhhh we just went forward and there was clearly a break.
                            Logger.ErrorFormat("Recover method broken!");
                        }

                    }
                    
                }
            }


            return new JsonDataContractActionResult(user);
        }
    }
}
