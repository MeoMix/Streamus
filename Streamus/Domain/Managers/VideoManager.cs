using Autofac;
using log4net;
using Streamus.Dao;
using Streamus.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Reflection;

namespace Streamus.Domain.Managers
{
    public class VideoManager
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private readonly ILifetimeScope Scope;
        private readonly IDaoFactory DaoFactory;
        private IVideoDao VideoDao { get; set; }

        public VideoManager()
        {
            Scope = AutofacRegistrations.Container.BeginLifetimeScope();
            DaoFactory = Scope.Resolve<IDaoFactory>();

            VideoDao = DaoFactory.GetVideoDao();
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