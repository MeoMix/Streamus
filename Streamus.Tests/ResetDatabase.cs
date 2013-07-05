using NHibernate.Cfg;
using NHibernate.Tool.hbm2ddl;
using NUnit.Framework;

namespace Streamus.Tests
{
    /// <summary>
    ///     This isn't a test, but is grouped with testing because of how useful it is.
    ///     Running this 'test' will analyze the hbm.xml NHibernate files, determine a database schema
    ///     derived from those files and reset the test database such that it reflects the current NHibernate schema.
    ///     You can then use a DbDiff tool to propagate the changes to a production database.
    ///     Inconclusive means it was ran successfully. If it errors out, try running again.
    /// </summary>
    [TestFixture]
    public class ResetDatabase
    {
        private Configuration Configuration { get; set; }

        /// <summary>
        ///     This code is only ran once for the given TestFixture.
        /// </summary>
        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            Configuration = new Configuration();
            Configuration.Configure();

            new SchemaExport(Configuration).Execute(false, true, false);
        }
    }
}
