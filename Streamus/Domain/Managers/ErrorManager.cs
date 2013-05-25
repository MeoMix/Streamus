using System;
using System.Reflection;
using Autofac;
using Streamus.Dao;
using Streamus.Domain.Interfaces;
using log4net;

namespace Streamus.Domain.Managers
{
    /// <summary>
    ///     Provides a common spot for methods against Errors which require transactions (Creating, Updating, Deleting)
    /// </summary>
    public class ErrorManager
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private readonly ILifetimeScope Scope;
        private readonly IDaoFactory DaoFactory;

        private IErrorDao ErrorDao { get; set; }

        public ErrorManager()
        {
            Scope = AutofacRegistrations.Container.BeginLifetimeScope();
            DaoFactory = Scope.Resolve<IDaoFactory>();
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