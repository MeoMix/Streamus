using Autofac;
using Streamus.Domain.Interfaces;

namespace Streamus.Dao
{
    public class AutofacRegistrations
    {
        public static IContainer Container { get; private set; }

        public static void RegisterDaoFactory()
        {
            var containerBuilder = new ContainerBuilder();
            containerBuilder.RegisterType<NHibernateDaoFactory>().As<IDaoFactory>();

            Container = containerBuilder.Build();
        }
    }
}