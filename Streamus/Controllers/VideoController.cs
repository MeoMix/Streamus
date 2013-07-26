using Streamus.Domain;
using Streamus.Domain.Managers;
<<<<<<< HEAD
=======
using Streamus.Dto;
using System;
>>>>>>> origin/Development
using System.Collections.Generic;
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class VideoController : Controller
    {
<<<<<<< HEAD
        private static readonly VideoManager VideoManager = new VideoManager();
=======
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        private static readonly VideoManager VideoManager = new VideoManager();
        private readonly IVideoDao VideoDao;

        public VideoController()
        {
            try
            {
                VideoDao = new VideoDao();
            }
            catch (TypeInitializationException exception)
            {
                Logger.Error(exception.InnerException);
                throw exception.InnerException;
            }
        }
>>>>>>> origin/Development

        /// <summary>
        ///     Save's a Video. It's a PUT because the video's ID will already
        ///     exist when coming from the client. Still need to decide whether
        ///     the item should be saved or updated, though.
        /// </summary>
        [HttpPut]
        public ActionResult Update(VideoDto videoDto)
        {
<<<<<<< HEAD
            VideoManager.Save(video);
            return new JsonDataContractActionResult(video);
=======
            Video video = Video.Create(videoDto);

            VideoManager.Save(video);

            VideoDto savedVideoDto = VideoDto.Create(video);

            return new JsonDataContractActionResult(savedVideoDto);
>>>>>>> origin/Development
        }

        [HttpGet]
        public ActionResult Get(string id)
        {
<<<<<<< HEAD
            Video video = VideoManager.Get(id);
            return new JsonDataContractActionResult(video);
=======
            Video video = VideoDao.Get(id);
            VideoDto videoDto = VideoDto.Create(video);

            return new JsonDataContractActionResult(videoDto);
>>>>>>> origin/Development
        }

        [HttpPost]
        public ActionResult SaveVideos(List<VideoDto> videoDtos)
        {
<<<<<<< HEAD
=======
            List<Video> videos = Video.Create(videoDtos);

>>>>>>> origin/Development
            VideoManager.Save(videos);
            return new JsonDataContractActionResult(videos);
        }

        [HttpGet]
        public ActionResult GetByIds(List<string> ids)
        {
            var videoDtos = new List<VideoDto>();

            //  The default model binder doesn't support passing an empty array as JSON to MVC controller, so check null.
            if (ids != null)
            {
<<<<<<< HEAD
                videos = VideoManager.Get(ids);
=======
                IList<Video> videos = VideoDao.Get(ids);
                videoDtos = VideoDto.Create(videos);
>>>>>>> origin/Development
            }

            return new JsonDataContractActionResult(videoDtos);
        }
    }
}
