using log4net;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;
using System;
using System.Reflection;
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class ShareCodeController : Controller
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
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
        public ActionResult Get(Guid id)
        {
            ShareCode shareCode = ShareCodeDao.Get(id);

            return new JsonDataContractActionResult(shareCode);
        }

        //  TODO: GetShareCode should probably be implemented here not in other controllers.
        //[HttpGet]
        //public JsonResult GetShareCode(ShareableEntityType entityType, Guid playlistId)
        //{


        //    //var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao, VideoDao, ShareCodeDao);
        //    //string shareCode = playlistManager.GetShareCode(playlistId);

        //    //return Json(shareCode, JsonRequestBehavior.AllowGet);
        //}
    }
}
