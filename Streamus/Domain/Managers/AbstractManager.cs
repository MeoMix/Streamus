using System.Reflection;
using Autofac;
using Streamus.Dao;
using Streamus.Domain.Interfaces;
using log4net;

namespace Streamus.Domain.Managers
{
    public abstract class AbstractManager
    {
        protected static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        protected readonly ILifetimeScope Scope;
        protected readonly IDaoFactory DaoFactory;

        protected AbstractManager()
        {
            AutofacRegistrations.RegisterDaoFactory();
            Scope = AutofacRegistrations.Container.BeginLifetimeScope();
            DaoFactory = Scope.Resolve<IDaoFactory>();
        }

    }
}