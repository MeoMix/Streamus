using Streamus.Domain;
using Streamus.Domain.Managers;
<<<<<<< HEAD
=======
using Streamus.Dto;
>>>>>>> origin/Development
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class ErrorController : Controller
    {
        private static readonly ErrorManager ErrorManager = new ErrorManager();
<<<<<<< HEAD

        [HttpPost, Throttle(Name="ClientErrorThrottle", Message = "You must wait {n} seconds before accessing logging another error.", Seconds = 60)]
        public ActionResult Create(Error error)
        {
            ErrorManager.Save(error);
=======

        [HttpPost, Throttle(Name = "ClientErrorThrottle", Message = "You must wait {n} seconds before accessing logging another error.", Seconds = 60)]
        public ActionResult Create(ErrorDto errorDto)
        {
            Error error = Error.Create(errorDto);
            ErrorManager.Save(error);

            ErrorDto savedErrorDto = ErrorDto.Create(error);
>>>>>>> origin/Development

            return new JsonDataContractActionResult(savedErrorDto);
        }
    }
}
