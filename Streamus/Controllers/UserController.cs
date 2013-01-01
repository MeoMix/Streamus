using System;
using System.Web.Mvc;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.DataInterfaces;
using Streamus.Backend.Domain.Managers;

namespace Streamus.Controllers
{
    public class UserController : Controller
    {
        private readonly IUserDao UserDao = new UserDao();
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();

        public ActionResult Create()
        {
            var userManager = new UserManager(UserDao, PlaylistDao);
            User user = userManager.CreateUser();

            return new JsonDataContractActionResult(user);
        }

        public ActionResult GetById(Guid id)
        {
            User user = UserDao.GetById(id);

            return new JsonDataContractActionResult(user);
        }
    }
}
