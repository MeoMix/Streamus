using System;
using System.Reflection;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain.Interfaces;
using log4net;

namespace Streamus.Backend.Domain.Managers
{
    /// <summary>
    ///     Provides a common spot for methods against Errors which require transactions (Creating, Updating, Deleting)
    /// </summary>
    public class ErrorManager
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private IErrorDao ErrorDao { get; set; }

        public ErrorManager(IErrorDao errorDao)
        {
            ErrorDao = errorDao;
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