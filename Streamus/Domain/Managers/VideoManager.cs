using Streamus.Dao;
using Streamus.Domain.Interfaces;
using System;
using System.Collections.Generic;

namespace Streamus.Domain.Managers
{
    public class VideoManager : AbstractManager
    {
        private IVideoDao VideoDao { get; set; }

        public VideoManager()
        {
            VideoDao = DaoFactory.GetVideoDao();
        }

        public void Save(Video video)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                video.ValidateAndThrow();

                //  Merge instead of SaveOrUpdate because Video's ID is assigned, but the same Video
                //  entity can be referenced by many different Playlists. As such, it is common to have the entity
                //  loaded into the cache.
                VideoDao.Merge(video);

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
    }
}