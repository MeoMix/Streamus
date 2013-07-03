using System.Web.Mvc;
using AutoMapper;
using Streamus.Domain;
using Streamus.Domain.Managers;
using Streamus.Dto;

namespace Streamus.Controllers
{
    public class ErrorController : Controller
    {
        private static readonly ErrorManager ErrorManager = new ErrorManager();

        [HttpPost, Throttle(Name = "ClientErrorThrottle", Message = "You must wait {n} seconds before accessing logging another error.", Seconds = 60)]
        public ActionResult Create(ErrorDto errorDto)
        {
            Error error = Mapper.Map<ErrorDto, Error>(errorDto);
            ErrorManager.Save(error);

            ErrorDto savedErrorDto = Mapper.Map<Error, ErrorDto>(error);

            return new JsonDataContractActionResult(savedErrorDto);
        }
    }
}
