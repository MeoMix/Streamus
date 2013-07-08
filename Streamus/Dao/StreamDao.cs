using Streamus.Domain;
using Streamus.Domain.Interfaces;
using System;

namespace Streamus.Dao
{
    public class StreamDao : AbstractNHibernateDao<Stream>, IStreamDao
    {
        public Stream Get(Guid id)
        {
            Stream stream = null;

            if (id != default(Guid))
            {
                stream = NHibernateSession.Get<Stream>(id);
            }

            return stream;
        }
    }
}