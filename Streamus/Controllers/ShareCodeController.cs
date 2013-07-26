using log4net;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;
<<<<<<< HEAD
=======
using Streamus.Dto;
>>>>>>> origin/Development
using System;
using System.Reflection;
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class ShareCodeController : Controller
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
<<<<<<< HEAD
=======
        private static readonly ShareCodeManager ShareCodeManager = new ShareCodeManager();

>>>>>>> origin/Development
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

<<<<<<< HEAD
        //  TODO: GetShareCode should probably be implemented here not in other controllers.
        //[HttpGet]
        //public JsonResult GetShareCode(ShareableEntityType entityType, Guid playlistId)
        //{
        //    //var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, VideoDao, ShareCodeDao);
        //    //string shareCode = playlistManager.GetShareCode(playlistId);

        //    //return Json(shareCode, JsonRequestBehavior.AllowGet);
        //}
=======
        [HttpGet]
        public JsonResult GetShareCode(ShareableEntityType entityType, Guid entityId)
        {
            ShareCode shareCode = ShareCodeManager.GetShareCode(entityType, entityId);
            ShareCodeDto shareCodeDto = ShareCodeDto.Create(shareCode);

            return new JsonDataContractActionResult(shareCodeDto);
        }
>>>>>>> origin/Development
    }
}
