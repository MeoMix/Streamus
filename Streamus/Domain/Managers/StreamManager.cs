using Streamus.Dao;
using Streamus.Domain.Interfaces;
using System;

namespace Streamus.Domain.Managers
{
    public class StreamManager : AbstractManager
    {
        private IStreamDao StreamDao { get; set; }

        public StreamManager()
        {
            StreamDao = DaoFactory.GetStreamDao();
        }

        public void Save(Stream stream)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                stream.ValidateAndThrow();
                StreamDao.Save(stream);

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