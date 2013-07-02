using System;
using System.Reflection;
using NHibernate;
using Streamus.Domain;
using Streamus.Domain.Interfaces;
using log4net;

namespace Streamus.Dao
{
    public class UserDao : AbstractNHibernateDao<User>, IUserDao
    {
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        public User Get(Guid id)
        {
            User user = null;

            if (id != default(Guid))
            {
                try
                {
                    user = (User) NHibernateSession.Load(typeof (User), id);
                }
                catch (ObjectNotFoundException exception)
                {
                    Logger.Error(exception);
                    throw;
                }
            }

            return user;
        }
    }
}