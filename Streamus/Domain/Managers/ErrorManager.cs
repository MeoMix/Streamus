using Streamus.Dao;
using Streamus.Domain.Interfaces;
using System;

namespace Streamus.Domain.Managers
{
    /// <summary>
    ///     Provides a common spot for methods against Errors which require transactions (Creating, Updating, Deleting)
    /// </summary>
    public class ErrorManager : AbstractManager
    {
        private IErrorDao ErrorDao { get; set; }

        public ErrorManager()
        {
            ErrorDao = DaoFactory.GetErrorDao();
        }

        public void Save(Error error)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                error.ValidateAndThrow();
                ErrorDao.Save(error);

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