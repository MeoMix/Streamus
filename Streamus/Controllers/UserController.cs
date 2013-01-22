using System;
using System.Web.Mvc;
using NHibernate;
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
            User user = UserDao.GetById(id);

            if (user == null)
            {
                string message = string.Format("Failed to find user with id {0}", id);
                throw new ApplicationException(message);
            }

            return new JsonDataContractActionResult(user);
        }
    }
}
