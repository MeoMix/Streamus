using System;
using System.Collections.Generic;
using System.Reflection;
using Streamus.Dao;
using Streamus.Domain.Interfaces;
using log4net;

namespace Streamus.Domain.Managers
{
    public class VideoManager
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private IVideoDao VideoDao { get; set; }

        public VideoManager(IVideoDao videoDao)
        {
            VideoDao = videoDao;
        }

        public void Save(Video video)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                video.ValidateAndThrow();

                //  TODO: Is this hitting the database? Surely it's not.
                Video videoInSession = VideoDao.Get(video.Id);

                if (videoInSession == null)
                {
                    VideoDao.Save(video);
                }

                //  TODO: Currently no mechanism in place to UPDATE a saved Video object.
                //  I think this is OK because Video objects should only be created or deleted.

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public void Save(IEnumerable<Video> videos)
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
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public Video Get(string id)
        {
            try
            {
                Video video = VideoDao.Get(id);
                return video;
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public IList<Video> Get(List<string> ids)
        {
            try
            {
                IList<Video> videos = VideoDao.Get(ids);
                return videos;
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }
    }
}