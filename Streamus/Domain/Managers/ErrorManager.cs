<<<<<<< HEAD
﻿using System;
using System.Reflection;
using Autofac;
using Streamus.Dao;
=======
﻿using Streamus.Dao;
>>>>>>> origin/Development
using Streamus.Domain.Interfaces;
using System;

namespace Streamus.Domain.Managers
{
    /// <summary>
    ///     Provides a common spot for methods against Errors which require transactions (Creating, Updating, Deleting)
    /// </summary>
    public class ErrorManager : AbstractManager
    {
<<<<<<< HEAD
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private readonly ILifetimeScope Scope;
        private readonly IDaoFactory DaoFactory;

=======
>>>>>>> origin/Development
        private IErrorDao ErrorDao { get; set; }

        public ErrorManager()
        {
<<<<<<< HEAD
            Scope = AutofacRegistrations.Container.BeginLifetimeScope();
            DaoFactory = Scope.Resolve<IDaoFactory>();
=======
>>>>>>> origin/Development
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