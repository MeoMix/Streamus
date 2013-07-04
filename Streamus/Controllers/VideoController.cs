using log4net;
using Streamus.Dao;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using Streamus.Domain.Managers;
using Streamus.Dto;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Web.Mvc;

namespace Streamus.Controllers
{
    public class VideoController : Controller
    {
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

        /// <summary>
        ///     Save's a Video. It's a PUT because the video's ID will already
        ///     exist when coming from the client. Still need to decide whether
        ///     the item should be saved or updated, though.
        /// </summary>
        [HttpPut]
        public ActionResult Update(VideoDto videoDto)
        {
            Video video = Video.Create(videoDto);

            VideoManager.Save(video);

            VideoDto savedVideoDto = VideoDto.Create(video);

            return new JsonDataContractActionResult(savedVideoDto);
        }

        [HttpGet]
        public ActionResult Get(string id)
        {
            Video video = VideoDao.Get(id);
            VideoDto videoDto = VideoDto.Create(video);

            return new JsonDataContractActionResult(videoDto);
        }

        [HttpPost]
        public ActionResult SaveVideos(List<VideoDto> videoDtos)
        {
            List<Video> videos = Video.Create(videoDtos);

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
                IList<Video> videos = VideoDao.Get(ids);
                videoDtos = VideoDto.Create(videos);
            }

            return new JsonDataContractActionResult(videoDtos);
        }
    }
}
