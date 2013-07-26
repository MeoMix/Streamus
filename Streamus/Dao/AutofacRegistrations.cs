using Autofac;
using Streamus.Domain.Interfaces;

namespace Streamus.Dao
{
    public class AutofacRegistrations
    {
        public static IContainer Container { get; private set; }

        public static void RegisterDaoFactory()
        {
<<<<<<< HEAD
            ContainerBuilder containerBuilder = new ContainerBuilder();
=======
            var containerBuilder = new ContainerBuilder();
>>>>>>> origin/Development
            containerBuilder.RegisterType<NHibernateDaoFactory>().As<IDaoFactory>();

            Container = containerBuilder.Build();
        }
    }
}