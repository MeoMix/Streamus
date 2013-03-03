using System;
using System.Reflection;
using NHibernate;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;
using log4net;

namespace Streamus.Backend.Dao
{
    public class StreamDao : AbstractNHibernateDao<Stream>, IStreamDao
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        public Stream Get(Guid id)
        {
            Stream stream = null;

            try
            {
                stream = (Stream)NHibernateSession.Load(typeof(Stream), id);
            }
            catch (ObjectNotFoundException exception)
            {
                //  Consume error and return null.
                Logger.Error(exception);
            }

            return stream;
        }
    }
}