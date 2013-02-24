using System;
using System.Reflection;
using System.Web.Mvc;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;
using Streamus.Backend.Domain.Managers;
using log4net;

namespace Streamus.Controllers
{
    public class UserController : Controller
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private readonly IUserDao UserDao;
        private readonly IPlaylistCollectionDao PlaylistCollectionDao;

        public UserController()
        {
            try
            {
                UserDao = new UserDao();
                PlaylistCollectionDao = new PlaylistCollectionDao();
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
            var userManager = new UserManager(UserDao, PlaylistCollectionDao);
            User user = userManager.CreateUser();

            return new JsonDataContractActionResult(user);
        }

        [HttpGet]
        public ActionResult Get(Guid id)
        {
            User user = UserDao.Get(id);

            return new JsonDataContractActionResult(user);
        }
    }
}
