using log4net;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;
using Streamus.Backend.Domain.Managers;
using System;
using System.Reflection;
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class ErrorController : Controller
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private readonly IErrorDao ErrorDao;

        public ErrorController()
        {
            try
            {
                ErrorDao = new ErrorDao();
            }
            catch (TypeInitializationException exception)
            {
                Logger.Error(exception.InnerException);
                throw exception.InnerException;
            }
        }

        [HttpPost, Throttle(Name="ClientErrorThrottle", Message = "You must wait {n} seconds before accessing logging another error.", Seconds = 60)]
        public ActionResult Create(Error error)
        {
            var playlistManager = new ErrorManager(ErrorDao);
            playlistManager.Save(error);

            return new JsonDataContractActionResult(error);
        }
    }
}
