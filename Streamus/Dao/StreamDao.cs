using log4net;
using NHibernate;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using System;
using System.Reflection;

namespace Streamus.Dao
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