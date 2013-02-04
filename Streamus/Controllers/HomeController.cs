using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class HomeController : Controller
    {
        /// <summary>
        /// There's no website, but this is needed just to show a 'Server is Running' page.
        /// </summary>
        public ActionResult Index()
        {
            return View();
        }
    }
}
