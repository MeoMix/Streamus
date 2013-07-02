using NUnit.Framework;
using Streamus.Domain.Interfaces;
using System;

namespace Streamus.Tests
{
    [TestFixture]
    public class StreamManagerTest : AbstractManagerTest
    {
        private IStreamDao StreamDao { get; set; }

        /// <summary>
        ///     This code is only ran once for the given TestFixture.
        /// </summary>
        [TestFixtureSetUp]
        public new void TestFixtureSetUp()
        {
            try
            {
                StreamDao = DaoFactory.GetStreamDao();
            }
            catch (TypeInitializationException exception)
            {
                throw exception.InnerException;
            }
        }

        /// <summary>
        ///     This code runs before every test.
        /// </summary>
        [SetUp]
        public void SetupContext()
        {
                    
        }
    }
}
