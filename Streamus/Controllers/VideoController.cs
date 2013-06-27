using System.Collections.Generic;
using System.Web.Mvc;
using Streamus.Domain;
using Streamus.Domain.Managers;

namespace Streamus.Controllers
{
    public class VideoController : Controller
    {
        private static readonly VideoManager VideoManager = new VideoManager();

        /// <summary>
        ///     Save's a Video. It's a PUT because the video's ID will already
        ///     exist when coming from the client. Still need to decide whether
        ///     the item should be saved or updated, though.
        /// </summary>
        [HttpPut]
        public ActionResult Update(Video video)
        {
            VideoManager.Save(video);
            return new JsonDataContractActionResult(video);
        }

        [HttpGet]
        public ActionResult Get(string id)
        {
            Video video = VideoManager.Get(id);
            return new JsonDataContractActionResult(video);
        }

        [HttpPost]
        public ActionResult SaveVideos(List<Video> videos)
        {
            VideoManager.Save(videos);
            return new JsonDataContractActionResult(videos);
        }

        [HttpGet]
        public ActionResult GetByIds(List<string> ids)
        {
            IList<Video> videos = new List<Video>();

            //  The default model binder doesn't support passing an empty array as JSON to MVC controller, so check null.
            if (ids != null)
            {
                videos = VideoManager.Get(ids);
            }

            return new JsonDataContractActionResult(videos);
        }
    }
}
