using Streamus.Domain;
using Streamus.Domain.Managers;
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class ErrorController : Controller
    {
        private static readonly ErrorManager ErrorManager = new ErrorManager();

        [HttpPost, Throttle(Name="ClientErrorThrottle", Message = "You must wait {n} seconds before accessing logging another error.", Seconds = 60)]
        public ActionResult Create(Error error)
        {
            ErrorManager.Save(error);

            return new JsonDataContractActionResult(error);
        }
    }
}
