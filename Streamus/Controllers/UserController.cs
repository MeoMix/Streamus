using System;
using System.Web.Mvc;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;
using Streamus.Backend.Domain.Managers;

namespace Streamus.Controllers
{
    public class UserController : Controller
    {
        private readonly IUserDao UserDao = new UserDao();
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();

        /// <summary>
        ///     Creates a new User object and writes it to the database.
        /// </summary>
        /// <returns>The newly created User</returns>
        [HttpPost]
        public ActionResult Create()
        {
            var userManager = new UserManager(UserDao, PlaylistDao);
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
