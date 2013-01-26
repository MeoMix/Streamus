using System;
using System.Collections.Generic;
using System.Reflection;
using NHibernate.Exceptions;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain.DataInterfaces;
using log4net;

namespace Streamus.Backend.Domain.Managers
{
    public class VideoManager
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private IVideoDao VideoDao { get; set; }

        public VideoManager(IVideoDao videoDao)
        {
            VideoDao = videoDao;
        }

        public void SaveVideo(Video video)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                video.ValidateAndThrow();
                VideoDao.SaveOrUpdate(video);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }

        public void SaveVideos(List<Video> videos)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                foreach (Video video in videos)
                {
                    video.ValidateAndThrow();
                    VideoDao.SaveOrUpdate(video);
                }

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }

        //  Videos won't be deleted very often. No one user is able to do it -- so doesn't take a userId. Needs to be an admin.
        public void DeleteVideoById(string id)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                Video video = VideoDao.GetById(id);
                VideoDao.Delete(video);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }

        public Video GetById(string id)
        {
            try
            {
                Video video = VideoDao.GetById(id);
                return video;
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }

        public IList<Video> GetByIds(List<string> ids)
        {
            try
            {
                IList<Video> videos = VideoDao.GetByIds(ids);
                return videos;
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                throw;
            }
        }
    }
}