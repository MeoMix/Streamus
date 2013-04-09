using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using NHibernate;
using NHibernate.Cfg;
using NHibernate.Dialect;
using NHibernate.Driver;
using NHibernate.Tool.hbm2ddl;
using Environment = NHibernate.Cfg.Environment;

namespace Streamus.Tests
{
    /// <summary>
    /// http://ayende.com/blog/3983/nhibernate-unit-testing
    /// </summary>
    public class InMemoryDatabaseTest : IDisposable
    {
        private static Configuration Configuration;
        private static ISessionFactory SessionFactory;
        protected ISession session;

        public InMemoryDatabaseTest(Assembly assemblyContainingMapping)
        {
            if (Configuration == null)
            {
                Configuration = new Configuration()
                    .SetProperty(Environment.ReleaseConnections, "on_close")
                    .SetProperty(Environment.Dialect, typeof(SQLiteDialect).AssemblyQualifiedName)
                    .SetProperty(Environment.ConnectionDriver, typeof(SQLite20Driver).AssemblyQualifiedName)
                    .SetProperty(Environment.ConnectionString, "data source=:memory:")
                    .AddAssembly(assemblyContainingMapping);

                SessionFactory = Configuration.BuildSessionFactory();
            }

            session = SessionFactory.OpenSession();

            new SchemaExport(Configuration).Execute(false, true, false);
        }

        public void Dispose()
        {
            session.Dispose();
        }
    }
}
