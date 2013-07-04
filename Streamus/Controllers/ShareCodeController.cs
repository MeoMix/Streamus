using log4net;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;
using Streamus.Dto;
using System;
using System.Reflection;
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class ShareCodeController : Controller
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private static readonly ShareCodeManager ShareCodeManager = new ShareCodeManager();

        private readonly IShareCodeDao ShareCodeDao;

        public ShareCodeController()
        {
            try
            {
                ShareCodeDao = new ShareCodeDao();
            }
            catch (TypeInitializationException exception)
            {
                Logger.Error(exception.InnerException);
                throw exception.InnerException;
            }
        }

        [HttpGet]
        public JsonResult GetShareCode(ShareableEntityType entityType, Guid entityId)
        {
            ShareCode shareCode = ShareCodeManager.GetShareCode(entityType, entityId);
            ShareCodeDto shareCodeDto = ShareCodeDto.Create(shareCode);

            return new JsonDataContractActionResult(shareCodeDto);
        }
    }
}
