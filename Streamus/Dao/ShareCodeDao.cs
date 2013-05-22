using log4net;
using NHibernate;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using System;
using System.Reflection;

namespace Streamus.Dao
{
    public class ShareCodeDao : AbstractNHibernateDao<ShareCode>, IShareCodeDao
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        public ShareCode Get(Guid id)
        {
            ShareCode shareCode;

            try
            {
                shareCode = (ShareCode)NHibernateSession.Load(typeof(ShareCode), id);
            }
            catch (ObjectNotFoundException exception)
            {
                Logger.Error(exception);
                throw;
            }

            return shareCode;
        }
    }
}