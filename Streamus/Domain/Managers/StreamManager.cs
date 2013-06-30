using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Autofac;
using Streamus.Dao;
using Streamus.Domain.Interfaces;
using log4net;

namespace Streamus.Domain.Managers
{
    public class StreamManager
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private readonly ILifetimeScope Scope;
        private readonly IDaoFactory DaoFactory;

        private IStreamDao StreamDao { get; set; }

        public StreamManager()
        {
            Scope = AutofacRegistrations.Container.BeginLifetimeScope();
            DaoFactory = Scope.Resolve<IDaoFactory>();

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