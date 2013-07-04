using Autofac;
using NUnit.Framework;
using Streamus.Dao;
using Streamus.Domain.Interfaces;

namespace Streamus.Tests
{
    public abstract class AbstractTest
    {
        protected ILifetimeScope Scope { get; set; }
        protected IDaoFactory DaoFactory { get; set; }

        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            //  Initialize Autofac for dependency injection.
            AutofacRegistrations.RegisterDaoFactory();
            Scope = AutofacRegistrations.Container.BeginLifetimeScope();
            DaoFactory = Scope.Resolve<IDaoFactory>();

            //  Initialize AutoMapper with Streamus' server mappings.
            WebApiApplication.CreateAutoMapperMaps();
        }
    }
}
