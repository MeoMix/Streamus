using System;
using System.Collections.Generic;
using System.Web.Mvc;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.DataInterfaces;
using Streamus.Backend.Domain.Managers;

namespace Streamus.Controllers
{
    public class VideoController : Controller
    {
        private readonly IVideoDao VideoDao = new VideoDao();

        [HttpPost]
        public ActionResult SaveVideo(Video video)
        {
            VideoManager videoManager = new VideoManager(VideoDao);
            videoManager.SaveVideo(video);
            return new JsonDataContractActionResult(video);
        }

        [HttpPost]
        public ActionResult SaveVideos(List<Video> videos)
        {
            VideoManager videoManager = new VideoManager(VideoDao);
            videoManager.SaveVideos(videos);
            return new JsonDataContractActionResult(videos);
        }

        [HttpGet]
        public ActionResult GetById(string id)
        {
            VideoManager videoManager = new VideoManager(VideoDao);
            Video video = videoManager.GetById(id);
            return new JsonDataContractActionResult(video);
        }

        [HttpGet]
        public ActionResult GetByVideoIds(List<string> videoIds)
        {
            IList<Video> videos = new List<Video>();

            //  The default model binder doesn't support passing an empty array as JSON to MVC controller, so check null.
            if (videoIds != null)
            {
                VideoManager videoManager = new VideoManager(VideoDao);
                videos = videoManager.GetByIds(videoIds);
            }

            return new JsonDataContractActionResult(videos);
        }

        //[HttpPost]
        //public EmptyResult DeleteById(string id)
        //{
        //    VideoManager videoManager = new VideoManager(VideoDao);
        //    videoManager.DeleteVideoById(id);
        //    return new EmptyResult();
        //}
    }
}
