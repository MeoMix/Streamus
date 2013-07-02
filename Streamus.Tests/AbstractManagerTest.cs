using Autofac;
using NUnit.Framework;
using Streamus.Dao;
using Streamus.Domain.Interfaces;

namespace Streamus.Tests
{
    public abstract class AbstractManagerTest
    {
        protected ILifetimeScope Scope { get; set; }
        protected IDaoFactory DaoFactory { get; set; }

        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            AutofacRegistrations.RegisterDaoFactory();
            Scope = AutofacRegistrations.Container.BeginLifetimeScope();
            DaoFactory = Scope.Resolve<IDaoFactory>();
        }
    }
}
